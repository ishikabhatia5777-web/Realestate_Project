import React, { useState, useEffect } from 'react';
import { fetchChatInbox, sendChatMessage, markThreadRead } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { MessageSquare, Send, User, Building2, CheckCheck, Clock, RefreshCw } from 'lucide-react';

const InboxPanel = ({ activeChatRequest }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadInbox = async () => {
    try {
      const res = await fetchChatInbox();
      if (res.data && res.data.success) {
        setThreads(res.data.threads);
        if (res.data.threads.length > 0 && !activeThread) {
          setActiveThread(res.data.threads[0]);
        } else if (activeThread) {
          // preserve selected thread
          const updated = res.data.threads.find(t => t.threadId === activeThread.threadId);
          if (updated) setActiveThread(updated);
        }
      }
    } catch (err) {
      console.error('Error loading inbox:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInbox();
    const interval = setInterval(loadInbox, 5000); // fallback auto refresh every 5s

    if (socket) {
      const handleReceive = () => {
        loadInbox();
      };
      socket.on('receive_message', handleReceive);
      return () => {
        clearInterval(interval);
        socket.off('receive_message', handleReceive);
      };
    }

    return () => clearInterval(interval);
  }, [socket]);

  useEffect(() => {
    if (activeChatRequest && threads.length > 0) {
      const targetThreadId = `${activeChatRequest.buyerId}_${activeChatRequest.propertyId || 'general'}`;
      const targetThread = threads.find(t => t.threadId === targetThreadId || String(t.otherUser?._id) === String(activeChatRequest.buyerId));
      if (targetThread && activeThread?.threadId !== targetThread.threadId) {
        handleSelectThread(targetThread);
      }
    }
  }, [activeChatRequest, threads]);

  const handleSelectThread = async (thread) => {
    setActiveThread(thread);
    if (thread.unreadCount > 0) {
      try {
        await markThreadRead(thread.otherUser._id);
        setThreads(prev => prev.map(t => t.threadId === thread.threadId ? { ...t, unreadCount: 0 } : t));
      } catch (e) {}
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThread || sending) return;

    setSending(true);
    try {
      const res = await sendChatMessage({
        receiverId: activeThread.otherUser._id,
        propertyId: activeThread.property?._id,
        text: replyText.trim()
      });

      if (res.data && res.data.success) {
        const newMsg = res.data.message;
        setReplyText('');
        if (socket) {
          socket.emit('send_message', newMsg);
        }
        await loadInbox();
      }
    } catch (err) {
      console.error('Error sending reply:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 flex items-center justify-center space-x-2">
        <RefreshCw className="w-5 h-5 animate-spin text-sky-500" />
        <span>Loading your messages...</span>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[550px]">
      
      {/* Threads Sidebar */}
      <div className="border-r border-slate-200/80 bg-slate-50/40 flex flex-col">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-sky-500" />
            <h3 className="font-bold text-slate-900 text-base">Conversations</h3>
          </div>
          <button 
            onClick={loadInbox} 
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
            title="Refresh messages"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-800/60 overflow-y-auto flex-1 max-h-[500px]">
          {threads.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No conversations yet. When buyers message you, their chats will appear here.
            </div>
          ) : (
            threads.map((thread) => {
              const isSelected = activeThread?.threadId === thread.threadId;
              return (
                <button
                  key={thread.threadId}
                  onClick={() => handleSelectThread(thread)}
                  className={`w-full p-4 text-left transition-colors flex items-start space-x-3 ${
                    isSelected ? 'bg-sky-500/10 border-l-4 border-sky-500' : 'hover:bg-white/60'
                  }`}
                >
                  <img
                    src={thread.otherUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                    alt={thread.otherUser?.name || 'User'}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{thread.otherUser?.name || 'User'}</h4>
                      {thread.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                    {thread.property && (
                      <p className="text-[11px] text-sky-500 font-semibold truncate flex items-center space-x-1 mt-0.5">
                        <Building2 className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{thread.property.title}</span>
                      </p>
                    )}
                    <p className="text-xs text-slate-500 truncate mt-1">
                      {thread.lastMessage?.text}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Active Conversation Detail Panel */}
      <div className="md:col-span-2 flex flex-col bg-white/30">
        {activeThread ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={activeThread.otherUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                  alt={activeThread.otherUser?.name}
                  className="w-10 h-10 rounded-xl object-cover border border-sky-500/40"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{activeThread.otherUser?.name}</h4>
                  <p className="text-xs text-slate-500 capitalize">{activeThread.otherUser?.role} • {activeThread.otherUser?.email}</p>
                </div>
              </div>
              {activeThread.property && (
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Property</span>
                  <span className="text-xs font-semibold text-sky-500 block truncate max-w-[200px]">
                    {activeThread.property.title}
                  </span>
                </div>
              )}
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[400px]">
              {[...activeThread.messages].slice().reverse().map((msg) => {
                const sObj = typeof msg.senderId === 'object' ? msg.senderId : null;
                const sId = String(sObj?._id || msg.senderId);
                const myId = String(user?._id);
                const isMe = sId === myId;

                const senderName = isMe
                  ? `${user?.name || 'You'} (You)`
                  : (activeThread.otherUser?.name || sObj?.name || 'Buyer');

                const senderRole = isMe
                  ? (user?.role === 'seller' ? '🏠 SELLER (YOU)' : user?.role === 'agent' ? '👩‍💼 AGENT (YOU)' : 'YOU')
                  : (activeThread.otherUser?.role ? `🔑 ${activeThread.otherUser.role.toUpperCase()}` : '🔑 BUYER');

                return (
                  <div key={msg._id || Math.random()} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs shadow-lg ${
                        isMe
                          ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-slate-950 font-medium rounded-tr-none shadow-sky-500/10'
                          : 'bg-white text-slate-100 border border-cyan-500/30 rounded-tl-none'
                      }`}
                    >
                      {/* Sender Role & Name Badge Header */}
                      <div className="flex items-center justify-between space-x-3 mb-1 pb-1 border-b border-black/10">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${isMe ? 'text-slate-950 font-extrabold' : 'text-cyan-400 font-extrabold'}`}>
                          {senderRole}
                        </span>
                        <span className={`text-[9px] font-semibold ${isMe ? 'text-slate-900' : 'text-slate-500'}`}>
                          {senderName}
                        </span>
                      </div>

                      <p className="whitespace-pre-line leading-relaxed text-xs">{msg.text}</p>
                      
                      <span className={`text-[9px] block mt-1.5 text-right font-medium ${isMe ? 'text-slate-900' : 'text-slate-500'}`}>
                        {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Box */}
            <form onSubmit={handleSendReply} className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center space-x-3">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${activeThread.otherUser?.name}...`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={sending || !replyText.trim()}
                className="px-4 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs hover:bg-sky-400 disabled:opacity-50 transition-all flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sending ? 'Sending...' : 'Send'}</span>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-500 text-sm">
            <MessageSquare className="w-12 h-12 text-slate-700 mb-3 stroke-[1.5]" />
            <p>Select a conversation from the left sidebar to start responding.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default InboxPanel;
