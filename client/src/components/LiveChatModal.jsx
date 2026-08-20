import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Send, Loader2, Sparkles, ExternalLink, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchChatMessages, sendChatMessage } from '../services/api';
import { useSocket } from '../context/SocketContext';

const LiveChatModal = ({ agent, property, isOpen, onClose }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentJoined, setAgentJoined] = useState(false);
  const [showPendingWaitMsg, setShowPendingWaitMsg] = useState(false);
  const connectionTimeoutRef = useRef(null);
  const agentTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  const recipient = agent || property?.agentId || property?.ownerId;
  const receiverId = recipient?._id || recipient;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isOpen || !receiverId) return;

    const loadHistory = async () => {
      try {
        const res = await fetchChatMessages(receiverId, property?._id);
        if (res.data && res.data.success) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadHistory();

    if (socket) {
      const handleReceive = (msg) => {
        const msgSender = msg.senderId?._id || msg.senderId;
        const msgReceiver = msg.receiverId?._id || msg.receiverId;
        const msgProperty = msg.propertyId?._id || msg.propertyId;

        const isRelevant =
          (msgSender === receiverId || msgReceiver === receiverId) &&
          (!property?._id || !msgProperty || msgProperty === property._id);

        if (isRelevant) {
          // If the agent is sending (msgSender === receiverId), mark as human-joined
          // BUT ensure it's not just the AI auto-reply echoing back
          if (String(msgSender) === String(receiverId) && !msg.isAiReply) {
            setAgentJoined(true);
            setIsTyping(false);
            setShowPendingWaitMsg(false);
            if (connectionTimeoutRef.current) {
              clearTimeout(connectionTimeoutRef.current);
            }
            if (agentTimeoutRef.current) {
              clearTimeout(agentTimeoutRef.current);
            }
          }
          setMessages((prev) => {
            if (prev.some((m) => m._id === msg._id)) return prev;
            return [...prev, msg];
          });
        }
      };

      socket.on('receive_message', handleReceive);
      return () => {
        socket.off('receive_message', handleReceive);
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
        }
        if (agentTimeoutRef.current) {
          clearTimeout(agentTimeoutRef.current);
        }
      };
    }
  }, [isOpen, receiverId, property, socket]);

  if (!isOpen || !recipient) return null;

  const handleSendMessage = async (textCustom) => {
    const textToSend = typeof textCustom === 'string' ? textCustom : input;
    if (!textToSend.trim() || !user || !receiverId) return;

    if (typeof textCustom !== 'string') setInput('');

    const tempUserMsg = {
      _id: `temp-${Date.now()}`,
      senderId: user._id,
      receiverId,
      propertyId: property?._id,
      text: textToSend,
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setIsTyping(true);

    // Check for expert connection request keywords
    const isExpertReq = ['connect', 'expert', 'agent', 'speak', 'call', 'contact', 'talk', 'phone', 'reach', 'callback'].some(
      kw => textToSend.toLowerCase().includes(kw)
    );

    if (isExpertReq) {
      if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
      if (agentTimeoutRef.current) clearTimeout(agentTimeoutRef.current);

      // Show "Please wait..." after 0.5s
      connectionTimeoutRef.current = setTimeout(() => {
        setShowPendingWaitMsg(true);
      }, 500);

      // 2 minute timeout for agent joining
      agentTimeoutRef.current = setTimeout(() => {
        setShowPendingWaitMsg(false);
        const fallbackMsg = {
          _id: `timeout-${Date.now()}`,
          senderId: receiverId,
          receiverId: user._id,
          text: "It looks like the agent is currently away or unavailable to join the chat. Don't worry though—I am still here! You can continue asking me questions, or the agent will follow up with you via email shortly.",
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }, 120000);
    }

    try {
      const res = await sendChatMessage({
        receiverId,
        propertyId: property?._id,
        text: textToSend
      });

      if (res.data && res.data.success) {
        const newMsg = res.data.message;
        const supportReply = res.data.supportReply;
        const tookOver = res.data.agentTookOver;

        if (tookOver) {
          setAgentJoined(true);
          setIsTyping(false);
          setShowPendingWaitMsg(false);
          if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
          if (agentTimeoutRef.current) clearTimeout(agentTimeoutRef.current);
        }

        setMessages((prev) => {
          const filtered = prev.filter((m) => m._id !== tempUserMsg._id);
          return [...filtered, newMsg];
        });

        if (socket) {
          socket.emit('send_message', newMsg);
        }

        if (supportReply) {
          setTimeout(() => {
            setIsTyping(false);
            setMessages((prev) => {
              if (prev.some((m) => m._id === supportReply._id)) return prev;
              return [...prev, supportReply];
            });
            if (socket) socket.emit('send_message', supportReply);
          }, 600);
        } else {
          setIsTyping(false);
        }
      } else {
        setIsTyping(false);
      }
    } catch (err) {
      console.error(err);
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleLinkClick = (url) => {
    onClose();
    if (url.startsWith('http')) {
      window.location.href = url;
    } else {
      navigate(url);
    }
  };

  const renderFormattedContent = (content) => {
    if (!content) return null;

    const lines = content.split('\n');

    return (
      <div className="space-y-1 text-xs leading-relaxed">
        {lines.map((line, lineIdx) => {
          const linkRegex = /\[(?:\*\*)?(.*?)(?:\*\*)?\]\((.*?)\)/g;
          const parts = [];
          let lastIndex = 0;
          let match;

          while ((match = linkRegex.exec(line)) !== null) {
            const [fullMatch, titleText, targetUrl] = match;
            const matchIndex = match.index;

            if (matchIndex > lastIndex) {
              parts.push(renderBoldText(line.substring(lastIndex, matchIndex), `line-${lineIdx}-txt-${lastIndex}`));
            }

            parts.push(
              <button
                key={`line-${lineIdx}-link-${matchIndex}`}
                type="button"
                onClick={() => handleLinkClick(targetUrl)}
                className="inline-flex items-center space-x-1 font-bold text-amber-300 hover:text-amber-200 underline bg-sky-500/10 hover:bg-sky-500/20 px-1.5 py-0.5 rounded border border-sky-500/30 transition-all cursor-pointer mx-1 my-0.5 shadow-sm"
              >
                <span>🏡 {titleText}</span>
                <ExternalLink className="w-3 h-3 text-sky-500 shrink-0" />
              </button>
            );

            lastIndex = matchIndex + fullMatch.length;
          }

          if (lastIndex < line.length) {
            parts.push(renderBoldText(line.substring(lastIndex), `line-${lineIdx}-txt-${lastIndex}`));
          }

          return (
            <p key={`line-${lineIdx}`} className="min-h-[1.1rem]">
              {parts}
            </p>
          );
        })}
      </div>
    );
  };

  const renderBoldText = (text, keyPrefix) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <strong key={`${keyPrefix}-b-${match.index}`} className="font-bold text-slate-900">
          {match[1]}
        </strong>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return <span key={keyPrefix}>{parts}</span>;
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-[560px]">
        
        {/* Header */}
        <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={recipient.avatar || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400'}
                alt={recipient.name}
                className="w-10 h-10 rounded-full object-cover border border-sky-500/40"
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                <span>{recipient.name}</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  24/7 SUPPORT ACTIVE
                </span>
              </h3>
              <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-sky-500">
                <span>{recipient.role === 'seller' || recipient.role === 'owner' ? 'Property Owner' : 'Real Estate Specialist'}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
          {messages.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
                <Sparkles className="w-6 h-6 animate-pulse text-sky-500" />
              </div>
              <p className="text-slate-600 font-semibold">Start chat with {recipient.name}</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Get instant responses regarding property price, inspection times, recommendations, and buying steps!
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const senderIdStr = String(msg.senderId?._id || msg.senderId || '');
              const recipientIdStr = String(recipient?._id || recipient || '');
              const currentUserIdStr = user ? String(user._id || '') : '';

              // Message is from Agent if sender matches recipient ID or role is agent/admin/agency
              const isFromAgent = (senderIdStr && senderIdStr === recipientIdStr) ||
                                  (msg.senderId?.role && ['agent', 'agency', 'admin', 'super_admin', 'seller'].includes(msg.senderId.role) && senderIdStr !== currentUserIdStr);

              // User/Buyer messages are positioned on the RIGHT side
              const isMe = !isFromAgent;

              const buyerDisplayName = user?.name || 'Buyer';
              const senderBadge = isMe
                ? '🔑 BUYER'
                : `👩‍💼 ${recipient.name.toUpperCase()}`;

              return (
                <div key={msg._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed shadow-lg ${
                    isMe
                      ? 'bg-sky-500 text-slate-950 font-medium rounded-tr-none shadow-sky-500/10'
                      : 'bg-white border border-cyan-500/30 text-slate-700 rounded-tl-none'
                  }`}>
                    <div className="flex items-center justify-between space-x-2 mb-1 pb-1 border-b border-black/10 text-[9px] font-black tracking-wider">
                      <span className={isMe ? 'text-slate-950 font-extrabold' : 'text-cyan-400 flex items-center space-x-1'}>
                        <span>{senderBadge}</span>
                      </span>
                      {!isMe && (
                        <span className="text-slate-500">
                          {recipient.name}
                        </span>
                      )}
                    </div>
                    {renderFormattedContent(msg.text)}
                  </div>
                </div>
              );
            })
          )}

          {/* Agent Joined Banner */}
          {agentJoined && (
            <div className="flex justify-center my-2">
              <div className="flex items-center space-x-2 bg-emerald-900/40 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold px-4 py-2 rounded-full shadow-sm shadow-emerald-500/10">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>✅ {recipient.name} has joined — you're now chatting with a real person!</span>
              </div>
            </div>
          )}

          {/* Pending Wait Message */}
          {showPendingWaitMsg && !agentJoined && (
            <div className="flex justify-center my-2">
              <div className="flex items-center space-x-2 bg-rose-900/40 border border-rose-500/40 text-rose-300 text-[11px] font-bold px-4 py-2 rounded-full shadow-sm shadow-rose-500/10 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 text-rose-400 animate-spin" />
                <span>Please wait... We are connecting you with the agent.</span>
              </div>
            </div>
          )}

          {isTyping && !agentJoined && (
            <div className="flex justify-start">
              <div className="p-3 rounded-2xl bg-white border border-cyan-500/30 text-slate-600 rounded-tl-none flex items-center space-x-2">
                <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span className="text-[11px] font-medium text-cyan-300">{recipient.name} is typing...</span>
                <div className="flex space-x-1 items-center">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleFormSubmit} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${recipient.name}...`}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
          />
          <button type="submit" className="p-2.5 rounded-xl bg-sky-500 text-slate-950 font-bold hover:bg-sky-400">
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};

export default LiveChatModal;
