import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Search } from 'lucide-react';
import { useSelector } from 'react-redux';
import { messageService } from '../../services/medicalService';
import { useToast } from '../../hooks/useToast';
import { getInitials, timeAgo, cn } from '../../lib/utils';
import EmptyState from '../../components/shared/EmptyState';

const MessagesPage = () => {
  const { user } = useSelector((s) => s.auth);
  const toast = useToast();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    const loadConvs = async () => {
      try {
        const res = await messageService.getConversations();
        setConversations(res.data?.data?.conversations || []);
      } catch { } finally { setLoading(false); }
    };
    loadConvs();
  }, []);

  useEffect(() => {
    if (activeConv) {
      const loadMsgs = async () => {
        try {
          const res = await messageService.getConversation(activeConv.user._id, { limit: 50 });
          setMessages(res.data?.data || []);
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch { }
      };
      loadMsgs();
    }
  }, [activeConv]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !activeConv) return;
    setSending(true);
    try {
      const res = await messageService.sendMessage({ receiverId: activeConv.user._id, content: newMsg });
      setMessages((m) => [...m, res.data?.data?.message]);
      setNewMsg('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      setConversations((c) => c.map((conv) => conv.conversationId === activeConv.conversationId
        ? { ...conv, lastMessage: { ...conv.lastMessage, content: newMsg } } : conv
      ));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send'); }
    finally { setSending(false); }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 flex flex-col shadow-card overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input placeholder="Search..." className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="flex gap-3"><div className="skeleton w-10 h-10 rounded-full" /><div className="flex-1"><div className="skeleton h-3 w-24 mb-1.5" /><div className="skeleton h-2.5 w-32" /></div></div>)}</div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">No conversations</div>
          ) : conversations.map((conv) => (
            <button key={conv.conversationId} onClick={() => setActiveConv(conv)}
              className={cn('w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors',
                activeConv?.conversationId === conv.conversationId && 'bg-primary-50 dark:bg-primary-900/10'
              )}>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {conv.user?.profilePicture?.url ? <img src={conv.user.profilePicture.url} alt="" className="w-full h-full object-cover rounded-full" /> : getInitials(conv.user?.firstName, conv.user?.lastName)}
                </div>
                {conv.unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-bold">{conv.unreadCount}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-800 dark:text-white truncate">{conv.user?.firstName} {conv.user?.lastName}</p>
                <p className="text-xs text-slate-400 truncate">{conv.lastMessage?.content}</p>
              </div>
              <p className="text-xs text-slate-400 flex-shrink-0">{timeAgo(conv.lastMessage?.createdAt)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 flex flex-col shadow-card overflow-hidden">
        {!activeConv ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState icon={MessageSquare} title="Select a conversation" description="Choose a conversation from the left to start messaging" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-slate-700">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                {activeConv.user?.profilePicture?.url ? <img src={activeConv.user.profilePicture.url} alt="" className="w-full h-full object-cover" /> : getInitials(activeConv.user?.firstName, activeConv.user?.lastName)}
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-white">{activeConv.user?.firstName} {activeConv.user?.lastName}</p>
                <p className="text-xs text-slate-400 capitalize">{activeConv.user?.role}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence>
                {messages.map((msg, i) => {
                  const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
                  return (
                    <motion.div key={msg._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                      <div className={cn('max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2.5 rounded-2xl text-sm',
                        isMe ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-gray-100 dark:bg-slate-700 text-slate-800 dark:text-white rounded-bl-sm'
                      )}>
                        <p>{msg.content}</p>
                        <p className={cn('text-xs mt-1', isMe ? 'text-white/60' : 'text-slate-400')}>{timeAgo(msg.createdAt)}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-slate-700">
              <div className="flex gap-2">
                <input value={newMsg} onChange={(e) => setNewMsg(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Type a message..." className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
                <button onClick={sendMessage} disabled={!newMsg.trim() || sending}
                  className="w-10 h-10 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-xl flex items-center justify-center text-white transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default MessagesPage;
