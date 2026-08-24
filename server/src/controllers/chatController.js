const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Message = require('../models/Message');
const Property = require('../models/Property');
const ContactRequest = require('../models/ContactRequest');
const { sampleProperties } = require('../utils/seedData');

const dataDir = path.join(__dirname, '..', '..', 'data');
const messagesFilePath = path.join(dataDir, 'messages.json');
const usersFilePath = path.join(dataDir, 'users.json');

const getLocalMessages = () => {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(messagesFilePath)) {
      fs.writeFileSync(messagesFilePath, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(messagesFilePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    return [];
  }
};

const saveLocalMessages = (messages) => {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2));
  } catch (err) {
    console.error('Failed to write local messages file:', err);
  }
};

const getLocalUsers = () => {
  try {
    if (!fs.existsSync(usersFilePath)) return [];
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (e) {
    return [];
  }
};

const mockProperties = sampleProperties.map((p, idx) => ({
  ...p,
  _id: `507f1f77bcf86cd79943900${idx}`
}));

const populateUser = (userId) => {
  if (!userId) return null;
  if (typeof userId === 'object' && userId.name) return userId;
  const targetId = String(userId._id || userId);
  const users = getLocalUsers();
  const found = users.find(u => String(u._id) === targetId);
  if (found) {
    return {
      _id: found._id,
      name: found.name,
      avatar: found.avatar,
      email: found.email,
      role: found.role
    };
  }
  return {
    _id: targetId,
    name: 'User',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    role: 'buyer'
  };
};

const hashCode = (str) => {
  let hash = 0;
  if (!str) return 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
};

const populateProperty = async (propId) => {
  if (!propId) return null;
  if (typeof propId === 'object' && propId.title && (propId.features || propId.amenities || propId.description)) {
    return propId;
  }
  const targetId = String(propId._id || propId);

  // 1. Query MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      const dbProp = await Property.findById(targetId).lean();
      if (dbProp) {
        return {
          ...dbProp,
          _id: dbProp._id,
          title: dbProp.title,
          propertyType: dbProp.propertyType || 'Residence',
          listingType: dbProp.listingType || 'Sale',
          price: dbProp.price,
          pricePeriod: dbProp.pricePeriod,
          bedrooms: dbProp.bedrooms,
          bathrooms: dbProp.bathrooms,
          parkingSpaces: dbProp.parkingSpaces,
          landArea: dbProp.landArea || dbProp.floorArea,
          address: dbProp.address,
          suburb: dbProp.address?.suburb || dbProp.suburb || 'Sydney CBD',
          city: dbProp.address?.city || dbProp.city || 'Sydney',
          state: dbProp.address?.state || dbProp.state || 'NSW',
          amenities: dbProp.amenities || ['Luxury Finishes', 'Harbour Views', 'Secure Parking'],
          features: dbProp.features || ['Open Plan Living', 'Designer Kitchen', 'High Ceilings'],
          description: dbProp.description || '',
          images: dbProp.images || []
        };
      }
    } catch (err) {
      console.log('populateProperty DB lookup error:', err.message);
    }
  }

  // 2. Query mockProperties
  const found = mockProperties.find(p => String(p._id) === targetId);
  if (found) {
    return {
      _id: found._id,
      title: found.title,
      propertyType: found.propertyType,
      listingType: found.listingType,
      price: found.price,
      pricePeriod: found.pricePeriod,
      bedrooms: found.bedrooms,
      bathrooms: found.bathrooms,
      parkingSpaces: found.parkingSpaces,
      landArea: found.landArea || found.floorArea,
      address: found.address,
      suburb: found.address?.suburb || found.suburb,
      city: found.address?.city || found.city,
      state: found.address?.state || found.state,
      amenities: found.amenities || [],
      features: found.features || [],
      description: found.description || '',
      images: found.images || []
    };
  }

  // 3. Fallback to sample property by index
  const sampleIdx = Math.abs(hashCode(targetId)) % sampleProperties.length;
  const sampleP = sampleProperties[sampleIdx] || sampleProperties[0];
  return {
    _id: targetId,
    title: sampleP.title || 'Executive Residence',
    propertyType: sampleP.propertyType || 'Penthouse',
    listingType: sampleP.listingType || 'Sale',
    price: sampleP.price || 12500000,
    bedrooms: sampleP.bedrooms || 4,
    bathrooms: sampleP.bathrooms || 3,
    suburb: sampleP.address?.suburb || 'Barangaroo',
    city: sampleP.address?.city || 'Sydney',
    state: sampleP.address?.state || 'NSW',
    amenities: sampleP.amenities || ['Harbour Views', 'Concierge Service', 'Private Terrace', 'Gym & Spa'],
    features: sampleP.features || ['High Floor View', 'Executive Living', 'Miele Appliances'],
    description: sampleP.description || 'A stunning luxury residence offering unmatched city and harbour views.',
    images: sampleP.images || ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200']
  };
};

// @desc    Get chat messages between 2 users
// @route   GET /api/chat/:receiverId
const getMessages = async (req, res, next) => {
  try {
    const { receiverId } = req.params;
    const { propertyId } = req.query;
    const currentUserId = String(req.user._id);
    const targetUserId = String(receiverId);

    let messages = null;

    if (mongoose.connection.readyState === 1) {
      try {
        const query = {
          $or: [
            { senderId: currentUserId, receiverId: targetUserId },
            { senderId: targetUserId, receiverId: currentUserId }
          ]
        };
        if (propertyId) query.propertyId = propertyId;

        messages = await Message.find(query)
          .populate('senderId', 'name avatar role')
          .populate('receiverId', 'name avatar role')
          .sort({ createdAt: 1 });
      } catch (dbErr) {}
    }

    if (!messages) {
      const localMsgs = getLocalMessages();
      messages = localMsgs.filter(m => {
        const mSender = String(m.senderId._id || m.senderId);
        const mReceiver = String(m.receiverId._id || m.receiverId);
        const mProp = m.propertyId ? String(m.propertyId._id || m.propertyId) : null;

        const matchUser = (mSender === currentUserId && mReceiver === targetUserId) ||
                          (mSender === targetUserId && mReceiver === currentUserId) ||
                          (req.user.role !== 'buyer' && (mSender === targetUserId || mReceiver === targetUserId));
        const matchProp = !propertyId || (mProp === String(propertyId));

        return matchUser && matchProp;
      }).map(m => ({
        ...m,
        senderId: populateUser(m.senderId),
        receiverId: populateUser(m.receiverId),
        propertyId: m.propertyId ? populateProperty(m.propertyId) : null
      })).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    res.json({ success: true, count: messages.length, messages });
  } catch (error) {
    next(error);
  }
};

const { generateSupportAgentReply } = require('../utils/aiEngine');
const { sendExpertConnectionAlert } = require('../services/emailService');
const { sendExpertConnectionSMS } = require('../services/smsService');

// ─── Agent Takeover Session Tracker ───────────────────────────────────────────
// Tracks threads where a human agent has manually replied.
// Once an agent replies, the AI auto-reply is DISABLED for that thread.
// Key format: sorted([buyerId, agentId]).join('_') + '_' + propertyId
const agentTookOverThreads = new Set();

const getThreadKey = (idA, idB, propId = '') => {
  const sorted = [String(idA), String(idB)].sort();
  return `${sorted[0]}_${sorted[1]}_${propId}`;
};


// @desc    Send chat message via REST API
// @route   POST /api/chat
const sendMessage = async (req, res, next) => {
  try {
    let { receiverId, propertyId, text } = req.body;
    
    if (!receiverId || receiverId === 'default') {
      if (mongoose.connection.readyState === 1) {
        const User = require('../models/User');
        const agentUser = await User.findOne({ email: 'ruhibhatia0022@gmail.com' }) || await User.findOne({ role: 'agent' });
        if (agentUser) receiverId = String(agentUser._id);
      } else {
        const agentUser = getLocalUsers().find(u => u.role === 'agent');
        if (agentUser) receiverId = String(agentUser._id);
      }
      if (!receiverId || receiverId === 'default') {
        return res.status(400).json({ success: false, message: 'Please provide receiverId' });
      }
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide message text' });
    }

    const senderId = req.user._id;

    // Prevent sending a message to yourself
    if (String(senderId) === String(receiverId)) {
      return res.status(400).json({ success: false, message: 'Cannot send a message to yourself' });
    }

    let messageObj = null;

    if (mongoose.connection.readyState === 1) {
      try {
        const message = await Message.create({
          senderId,
          receiverId,
          propertyId,
          text
        });

        messageObj = await Message.findById(message._id)
          .populate('senderId', 'name avatar role email')
          .populate('receiverId', 'name avatar role email')
          .populate('propertyId', 'title address images');
      } catch (dbErr) {
        console.log('MongoDB error on sendMessage, using local fallback:', dbErr.message);
      }
    }

    if (!messageObj) {
      const localMsgs = getLocalMessages();
      const newMsg = {
        _id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        senderId: String(senderId),
        receiverId: String(receiverId),
        propertyId: propertyId ? String(propertyId) : null,
        text,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      localMsgs.push(newMsg);
      saveLocalMessages(localMsgs);

      messageObj = {
        ...newMsg,
        senderId: populateUser(senderId),
        receiverId: populateUser(receiverId),
        propertyId: propertyId ? await populateProperty(propertyId) : null
      };
    }

    // ─── 24/7 Supporting Agent Chat Fallback ──────────────────────────────────
    // ONLY fire AI auto-reply when:
    //   1. The BUYER is sending (not an agent/seller/admin)
    //   2. The thread has NOT been taken over by a human agent yet
    const senderRole = req.user?.role || 'buyer';
    const isBuyerSending = senderRole === 'buyer';
    const threadKey = getThreadKey(senderId, receiverId, String(propertyId || ''));

    // ── If agent/seller is sending: mark thread as human-taken-over ──────────
    if (!isBuyerSending) {
      agentTookOverThreads.add(threadKey);
      console.log(`✋ Agent took over thread [${threadKey}] — AI auto-reply disabled for this conversation.`);
    }

    const isAgentControlling = agentTookOverThreads.has(threadKey);

    let supportReplyObj = null;
    if (isBuyerSending && !isAgentControlling) try {
      const receiverUser = populateUser(receiverId);
      const propertyObj = await populateProperty(propertyId);

      let allPublished = mockProperties;
      if (mongoose.connection.readyState === 1) {
        try {
          const dbProps = await Property.find({ status: 'Published' }).lean();
          if (dbProps && dbProps.length > 0) allPublished = dbProps;
        } catch (e) {}
      }

      // ─── Expert Connection Check — skip AI reply, fire notifications only ──
      const expertKeywordsEarly = ['connect', 'expert', 'speak to agent', 'talk to agent', 'reach agent', 'callback', 'meet', 'consultation'];
      const isExpertRequest = expertKeywordsEarly.some(kw => text.toLowerCase().includes(kw)) ||
        (['call','speak','talk','contact'].some(kw => text.toLowerCase().includes(kw)) &&
         ['agent','human','person','real'].some(kw => text.toLowerCase().includes(kw)));

      if (isExpertRequest) {
        // ── Fire notifications silently, NO AI reply message shown ────────────
        const agentEmailAddr = receiverUser?.email || null;
        const agentPhoneNum  = receiverUser?.phone  || null;
        const propTitle       = propertyObj?.title || 'a property on AuraEstates';
        const propId          = String(propertyObj?._id || propertyId || '');
        const buyerEmailAddr  = req.user?.email || null;
        const buyerDisplayName = req.user?.name || 'A Buyer';

        if (agentEmailAddr) {
          sendExpertConnectionAlert({
            agentEmail: agentEmailAddr, agentName: receiverUser?.name || 'Agent',
            buyerName: buyerDisplayName, buyerEmail: buyerEmailAddr,
            propertyTitle: propTitle, propertyId: propId, buyerMessage: text
          }).catch(e => console.error('Expert connection email error:', e.message));
        }

        if (agentPhoneNum) {
          sendExpertConnectionSMS({
            agentPhone: agentPhoneNum, agentName: receiverUser?.name || 'Agent',
            buyerName: buyerDisplayName, propertyTitle: propTitle, buyerEmail: buyerEmailAddr
          }).catch(e => console.error('Expert connection SMS error:', e.message));
        }

        if (mongoose.connection.readyState === 1) {
          try {
            await ContactRequest.create({
              buyerName: buyerDisplayName, buyerEmail: buyerEmailAddr || '',
              buyerId: req.user?._id || null, agentId: receiverId || null,
              agentName: receiverUser?.name || '', propertyId: propertyId || null,
              propertyTitle: propTitle, buyerMessage: text
            });
          } catch (crErr) { console.error('ContactRequest DB save error:', crErr.message); }
        }

        console.log(`🔔 Expert connection requested by ${buyerDisplayName} for "${propTitle}" — Agent notified silently.`);
        // supportReplyObj stays null → no AI message sent to buyer

      } else {
        // ── Normal message: generate AI reply ────────────────────────────────
        const supportResponseText = await generateSupportAgentReply({
          buyerMessage: text,
          buyerName: req.user?.name || 'Buyer',
          agent: receiverUser,
          property: propertyObj,
          allProperties: allPublished
        });

        if (mongoose.connection.readyState === 1) {
          try {
            const aiMsg = await Message.create({
              senderId: receiverId, receiverId: senderId, propertyId, text: supportResponseText
            });
            let dbSupportReply = await Message.findById(aiMsg._id)
              .populate('senderId', 'name avatar role email')
              .populate('receiverId', 'name avatar role email')
              .populate('propertyId', 'title address images');
            supportReplyObj = dbSupportReply ? dbSupportReply.toObject() : null;
            if (supportReplyObj) supportReplyObj.isAiReply = true;
          } catch (e) {}
        }

        if (!supportReplyObj) {
          const localMsgs = getLocalMessages();
          const newSupportMsg = {
            _id: `msg_${Date.now() + 10}_${Math.random().toString(36).substr(2, 5)}`,
            senderId: String(receiverId), receiverId: String(senderId),
            propertyId: propertyId ? String(propertyId) : null,
            text: supportResponseText, isRead: false,
            createdAt: new Date(Date.now() + 500).toISOString()
          };
          localMsgs.push(newSupportMsg);
          saveLocalMessages(localMsgs);
          supportReplyObj = {
            ...newSupportMsg,
            senderId: populateUser(receiverId),
            receiverId: populateUser(senderId),
            propertyId: propertyId ? await populateProperty(propertyId) : null,
            isAiReply: true
          };
        }
      }
    } catch (supportErr) {
      console.error('Failed to generate supporting agent reply:', supportErr);
    }

    res.status(201).json({
      success: true,
      message: messageObj,
      supportReply: supportReplyObj,
      agentTookOver: !isBuyerSending ? true : isAgentControlling
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inbox — all conversation threads for logged-in user
// @route   GET /api/chat/inbox
const getInbox = async (req, res, next) => {
  try {
    const currentUserId = String(req.user._id);
    const currentUserRole = req.user.role;

    let allMessages = null;

    if (mongoose.connection.readyState === 1) {
      try {
        let query = {};
        if (currentUserRole === 'admin' || currentUserRole === 'super_admin') {
          // Admins can oversee all chats
          query = {};
        } else {
          // Buyers, Sellers, Agents, Agencies — only see their own direct messages
          query = {
            $or: [
              { senderId: req.user._id },
              { receiverId: req.user._id }
            ]
          };
        }

        allMessages = await Message.find(query)
          .populate('senderId', 'name avatar role email')
          .populate('receiverId', 'name avatar role email')
          .populate('propertyId', 'title address images ownerId agentId')
          .sort({ createdAt: -1 });
      } catch (dbErr) {}
    }

    if (!allMessages) {
      const localMsgs = getLocalMessages();
      allMessages = localMsgs.filter(m => {
        const mSender = String(m.senderId._id || m.senderId);
        const mReceiver = String(m.receiverId._id || m.receiverId);

        if (currentUserRole === 'admin' || currentUserRole === 'super_admin') {
          return true;
        } else {
          return mSender === currentUserId || mReceiver === currentUserId;
        }
      }).map(m => ({
        ...m,
        senderId: populateUser(m.senderId),
        receiverId: populateUser(m.receiverId),
        propertyId: m.propertyId ? populateProperty(m.propertyId) : null
      })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Group by thread: "other party" + property combination
    const threadsMap = {};
    for (const msg of allMessages) {
      if (!msg.senderId || !msg.receiverId) continue;

      const mSenderId = String(msg.senderId._id || msg.senderId);
      const mReceiverId = String(msg.receiverId._id || msg.receiverId);

      const isMeSender = mSenderId === currentUserId;
      const isMeReceiver = mReceiverId === currentUserId;

      let otherUser;
      if (isMeSender) {
        otherUser = msg.receiverId;
      } else if (isMeReceiver) {
        otherUser = msg.senderId;
      } else {
        // If current user is an Agent/Seller viewing a buyer inquiry thread
        otherUser = msg.senderId.role === 'buyer' ? msg.senderId : msg.receiverId;
      }

      const otherId = String(otherUser._id || otherUser);
      const propId = msg.propertyId ? String(msg.propertyId._id || msg.propertyId) : 'general';
      const threadKey = `${otherId}_${propId}`;

      if (!threadsMap[threadKey]) {
        threadsMap[threadKey] = {
          threadId: threadKey,
          otherUser,
          property: msg.propertyId || null,
          lastMessage: msg,
          messages: [],
          unreadCount: 0
        };
      }
      threadsMap[threadKey].messages.push(msg);

      if (mReceiverId === currentUserId && !msg.isRead) {
        threadsMap[threadKey].unreadCount++;
      }
    }

    const threads = Object.values(threadsMap);
    res.json({ success: true, count: threads.length, threads });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark messages in a thread as read
// @route   PATCH /api/chat/read/:senderId
const markThreadRead = async (req, res, next) => {
  try {
    const { senderId } = req.params;
    const currentUserId = String(req.user._id);

    if (mongoose.connection.readyState === 1) {
      try {
        await Message.updateMany(
          { senderId, receiverId: req.user._id, isRead: false },
          { $set: { isRead: true } }
        );
      } catch (e) {}
    }

    const localMsgs = getLocalMessages();
    let updated = false;
    localMsgs.forEach(m => {
      if (String(m.senderId._id || m.senderId) === String(senderId) && String(m.receiverId._id || m.receiverId) === currentUserId) {
        m.isRead = true;
        updated = true;
      }
    });
    if (updated) saveLocalMessages(localMsgs);

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all expert connection requests for the logged-in agent
// @route GET /api/chat/expert-requests
const getExpertRequests = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, requests: [], count: 0 });
    }
    const filter = {};
    if (req.user.role === 'agent' || req.user.role === 'seller') {
      filter.agentId = req.user._id;
    }
    const requests = await ContactRequest.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('buyerId', 'name email avatar')
      .populate('propertyId', 'title images address');

    const unreadCount = requests.filter(r => !r.isRead).length;
    res.json({ success: true, count: requests.length, unreadCount, requests });
  } catch (error) {
    next(error);
  }
};

// @desc  Mark an expert connection request as read
// @route PATCH /api/chat/expert-requests/:id/read
const markExpertRequestRead = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(500).json({ success: false, message: 'Invalid ID format' });
    }
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true });
    }
    await ContactRequest.findByIdAndUpdate(req.params.id, { isRead: true, status: 'contacted' });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

const sendGuestMessage = async (req, res, next) => {
  try {
    let { receiverId, propertyId, text, guestName, guestEmail, guestPhone } = req.body;
    
    if (!receiverId || receiverId === 'default') {
      if (mongoose.connection.readyState === 1) {
        const User = require('../models/User');
        const agentUser = await User.findOne({ email: 'ruhibhatia0022@gmail.com' }) || await User.findOne({ role: 'agent' });
        if (agentUser) receiverId = String(agentUser._id);
      } else {
        const agentUser = getLocalUsers().find(u => u.role === 'agent');
        if (agentUser) receiverId = String(agentUser._id);
      }
    }
    
    if (!receiverId || receiverId === 'default' || !text || !guestEmail) {
      return res.status(400).json({ success: false, message: 'Missing required fields (receiverId, text, guestEmail) or Agent not found' });
    }

    let user = null;
    if (mongoose.connection.readyState === 1) {
      const User = require('../models/User');
      user = await User.findOne({ email: guestEmail.toLowerCase() });
      if (!user) {
        user = await User.create({
          name: guestName || 'Guest User',
          email: guestEmail.toLowerCase(),
          phone: guestPhone || '',
          password: Math.random().toString(36).slice(-10),
          role: 'buyer'
        });
      }
    } else {
      user = { _id: 'guest123', name: guestName, email: guestEmail, role: 'buyer' };
    }

    const senderId = user._id;

    if (String(senderId) === String(receiverId)) {
      return res.status(400).json({ success: false, message: 'Cannot send a message to yourself' });
    }

    let newMessage;
    if (mongoose.connection.readyState === 1) {
      const msgDoc = await Message.create({
        senderId,
        receiverId,
        propertyId,
        text
      });
      newMessage = await msgDoc.populate([
        { path: 'senderId', select: 'name avatar role isOnline lastSeen' },
        { path: 'receiverId', select: 'name avatar role' }
      ]);
    } else {
      newMessage = {
        _id: `msg-${Date.now()}`,
        senderId: populateUser(senderId),
        receiverId: populateUser(receiverId),
        propertyId: propertyId ? populateProperty(propertyId) : null,
        text,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      getLocalMessages().push(newMessage);
    }

    const propertyObj = propertyId ? await populateProperty(propertyId) : null;
    let supportReply = null;
    const threadKey = getThreadKey(senderId, receiverId, propertyId);

    if (!agentTookOverThreads.has(threadKey)) {
      const aiResponseText = await generateSupportAgentReply(text, propertyObj);
      if (mongoose.connection.readyState === 1) {
        const supportMsg = await Message.create({
          senderId: receiverId,
          receiverId: senderId,
          propertyId,
          text: aiResponseText,
          isAiReply: true
        });
        supportReply = await supportMsg.populate([
          { path: 'senderId', select: 'name avatar role' },
          { path: 'receiverId', select: 'name avatar role' }
        ]);
      } else {
        supportReply = {
          _id: `ai-${Date.now()}`,
          senderId: populateUser(receiverId),
          receiverId: populateUser(senderId),
          propertyId: propertyId ? populateProperty(propertyId) : null,
          text: aiResponseText,
          isRead: false,
          isAiReply: true,
          createdAt: new Date().toISOString()
        };
        getLocalMessages().push(supportReply);
      }
    }

    // Attempt to notify the agent via socket
    try {
      const io = require('../server').io;
      if (io) {
        io.emit('receive_message', newMessage);
        if (supportReply) {
          setTimeout(() => io.emit('receive_message', supportReply), 800);
        }
      }
    } catch (e) {}

    res.status(201).json({
      success: true,
      message: newMessage,
      supportReply,
      agentTookOver: agentTookOverThreads.has(threadKey)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMessages,
  sendMessage,
  sendGuestMessage,
  getInbox,
  markThreadRead,
  getExpertRequests,
  markExpertRequestRead
};
