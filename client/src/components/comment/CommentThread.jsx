import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageSquare, Clock, User, Reply, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../services/api';
import usePlayerStore from '../../store/playerStore';
import useAudioEngine from '../../hooks/useAudioEngine';
import formatTime from '../../utils/formatTime';

const CommentThread = ({ projectId }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [useTimestamp, setUseTimestamp] = useState(false);
  const { currentTime } = usePlayerStore();
  const { seekTo } = useAudioEngine();
  const scrollRef = useRef(null);

  const fetchComments = useCallback(async () => {
    try {
      const res = await api.get(`/projects/${projectId}/comments`);
      if (res.data.success) {
        setComments(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  }, [projectId]);

  useEffect(() => {
    (async () => {
      await fetchComments();
    })();
  }, [fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const res = await api.post(`/projects/${projectId}/comments`, {
        text,
        timestampRef: useTimestamp ? currentTime : null
      });

      if (res.data.success) {
        setText('');
        setUseTimestamp(false);
        fetchComments();
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  return (
    <div className="flex flex-col h-full glass-panel rounded-2xl overflow-hidden border border-white/5">
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/10">
        <h3 className="font-space font-bold flex items-center gap-2">
           <MessageSquare size={18} className="text-[var(--accent-violet)]" /> 
           <span>Project Feed</span>
        </h3>
        <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--accent-violet)]">Live</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 max-h-[400px] lg:max-h-[600px] custom-scrollbar" ref={scrollRef}>
        {comments.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
             <MessageSquare size={32} className="text-white/10 mb-4" />
             <p className="text-xs text-[var(--text-secondary)] italic">Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map(comment => (
            <CommentItem 
              key={comment._id} 
              comment={comment} 
              onSeek={seekTo} 
              onReply={() => fetchComments()}
            />
          ))
        )}
      </div>

      <div className="p-4 bg-black/20 border-t border-white/5">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative group">
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What do you think? Use @ to mention..."
              className="w-full bg-black/20 border border-white/10 focus:border-[var(--accent-violet)] rounded-xl p-3 text-sm focus:outline-none transition-all resize-none h-20"
            />
            {useTimestamp && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-0.5 bg-[var(--accent-violet)]/20 text-[var(--accent-violet)] rounded-full text-[9px] font-bold border border-[var(--accent-violet)]/20 animate-pulse">
                 <Clock size={10} /> {formatTime(currentTime)}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button 
              type="button"
              onClick={() => setUseTimestamp(!useTimestamp)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${useTimestamp ? 'bg-[var(--accent-violet)] text-white' : 'text-[var(--text-secondary)] hover:bg-white/5'}`}
            >
              <Clock size={14} /> 
              {useTimestamp ? 'Using Time' : 'Add Time'}
            </button>

            <button 
              type="submit"
              disabled={!text.trim()}
              className="bg-[var(--accent-violet)] hover:bg-opacity-90 disabled:opacity-50 text-white p-2.5 rounded-xl shadow-lg transition-transform transform active:scale-95"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CommentItem = ({ comment, onSeek, onReply }) => {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');

  const submitReply = async () => {
    if (!replyText.trim()) return;
    try {
      const res = await api.post(`/comments/${comment._id}/reply`, { text: replyText });
      if (res.data.success) {
        setReplyText('');
        setShowReply(false);
        onReply();
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-4 animate-fade-in">
       <div className="flex gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shadow-sm overflow-hidden flex-shrink-0">
             {comment.author?.profilePicUrl ? (
               <img src={comment.author.profilePicUrl} alt={comment.author.username} className="w-full h-full object-cover" />
             ) : (
               <User size={14} className="text-[var(--text-secondary)]" />
             )}
          </div>

          <div className="flex-1 space-y-1">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <span className="text-xs font-bold text-[var(--text-primary)] hover:underline cursor-pointer">{comment.author?.username}</span>
                   <span className="text-[9px] text-[var(--text-secondary)]">{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
                {comment.timestampRef !== null && (
                   <button 
                    onClick={() => onSeek(comment.timestampRef)}
                    className="flex items-center gap-1 px-1.5 py-0.5 bg-[var(--accent-amber)]/10 text-[var(--accent-amber)] rounded-md text-[9px] font-bold border border-[var(--accent-amber)]/20 hover:bg-[var(--accent-amber)]/20 transition-all active:scale-95"
                   >
                     <Clock size={10} /> {formatTime(comment.timestampRef)}
                   </button>
                )}
             </div>
             <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{comment.text}</p>
             
             <div className="flex items-center gap-4 pt-1">
                <button 
                  onClick={() => setShowReply(!showReply)}
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--accent-violet)] transition-colors"
                >
                  <Reply size={12}/> Reply
                </button>
             </div>
          </div>
       </div>

       {showReply && (
         <div className="ml-11 flex gap-2 animate-fade-in-down">
            <input 
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[var(--accent-violet)]"
            />
            <button 
              onClick={submitReply}
              className="bg-[var(--accent-violet)] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-opacity-90"
            >
              Post
            </button>
         </div>
       )}

       {comment.replies?.length > 0 && (
         <div className="ml-11 space-y-4 border-l border-white/5 pl-4">
            {comment.replies.map(reply => (
              <div key={reply._id} className="flex gap-3">
                 <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                    <User size={10} className="text-[var(--text-secondary)]" />
                 </div>
                 <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                       <span className="text-[10px] font-bold text-[var(--text-primary)]">{reply.author?.username}</span>
                       <span className="text-[8px] text-[var(--text-secondary)]">{new Date(reply.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">{reply.text}</p>
                 </div>
              </div>
            ))}
         </div>
       )}
    </div>
  );
};

export default CommentThread;
