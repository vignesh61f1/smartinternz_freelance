import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import useSocket from '../../hooks/useSocket';
import projectService from '../../services/projectService';
import messageService from '../../services/messageService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ProjectChat = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const { emit, on, off } = useSocket();
  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const clientId = project?.client?._id ?? project?.client;
  const isClient = user && clientId && String(user._id) === String(clientId);
  const otherUser = project
    ? isClient
      ? (project.selectedFreelancer || project.freelancer)
      : (project.client || project.clientId)
    : null;
  const otherUserId = otherUser?._id ?? otherUser;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!projectId) return;

    const load = async () => {
      setLoading(true);
      try {
        const [projectRes, messagesRes] = await Promise.all([
          projectService.getProject(projectId),
          messageService.getProjectMessages(projectId),
        ]);
        const projectData = projectRes.data?.data ?? projectRes.data;
        const messagesData = messagesRes.data?.data ?? messagesRes.data;
        setProject(projectData);
        setMessages(Array.isArray(messagesData) ? messagesData : []);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load chat');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    emit('join_project', projectId);
    return () => {
      emit('leave_project', projectId);
    };
  }, [projectId, emit]);

  useEffect(() => {
    const handleNewMessage = (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };
    const handleUserTyping = (data) => {
      if (data.userId === user?._id) return;
      setTypingUser(data.name);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
    };
    const handleUserStopTyping = (data) => {
      if (data.userId === user?._id) return;
      setTypingUser(null);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };

    on('new_message', handleNewMessage);
    on('user_typing', handleUserTyping);
    on('user_stop_typing', handleUserStopTyping);

    return () => {
      off('new_message', handleNewMessage);
      off('user_typing', handleUserTyping);
      off('user_stop_typing', handleUserStopTyping);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [user?._id, on, off]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = content.trim();
    if (!text || !otherUserId || sending) return;

    setSending(true);
    try {
      const res = await messageService.sendMessage({
        project: projectId,
        receiver: otherUserId,
        content: text,
      });
      const savedMessage = res.data?.data ?? res.data;
      setMessages((prev) => [...prev, savedMessage]);
      setContent('');

      emit('send_message', {
        projectId,
        receiverId: otherUserId,
        message: savedMessage,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setContent(val);
    if (val.trim()) {
      emit('typing', { projectId });
    }
  };

  const handleBlur = () => {
    emit('stop_typing', { projectId });
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isOwnMessage = (msg) => {
    const senderId = msg.sender?._id ?? msg.sender;
    return senderId === user?._id;
  };

  if (loading) {
    return (
      <div className="chat-page" style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="chat-page" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
        Chat: {project?.title || 'Project'}
      </h1>

      <div
        className="chat-messages"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          marginBottom: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        {messages.map((msg) => {
          const own = isOwnMessage(msg);
          const senderName = msg.sender?.name ?? 'Unknown';
          return (
            <div
              key={msg._id}
              className={`message ${own ? 'message-own' : 'message-other'}`}
              style={{
                alignSelf: own ? 'flex-end' : 'flex-start',
                maxWidth: '75%',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                backgroundColor: own ? '#3b82f6' : 'white',
                color: own ? 'white' : '#1f2937',
                border: own ? 'none' : '1px solid #e5e7eb',
              }}
            >
              <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '0.25rem' }}>{senderName}</div>
              <div style={{ fontSize: '0.875rem' }}>{msg.content}</div>
              <div style={{ fontSize: '0.6875rem', opacity: 0.8, marginTop: '0.25rem' }}>{formatTime(msg.createdAt)}</div>
            </div>
          );
        })}
        {typingUser && (
          <div style={{ fontSize: '0.8125rem', color: '#6b7280', fontStyle: 'italic' }}>
            {typingUser} is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        className="chat-input"
        onSubmit={handleSend}
        style={{ display: 'flex', gap: '0.5rem' }}
      >
        <input
          type="text"
          placeholder="Type a message..."
          value={content}
          onChange={handleInputChange}
          onBlur={handleBlur}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '0.875rem',
          }}
        />
        <button
          type="submit"
          disabled={!content.trim() || sending}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: !content.trim() || sending ? 'not-allowed' : 'pointer',
            opacity: !content.trim() || sending ? 0.6 : 1,
          }}
        >
          <FiSend size={18} />
          Send
        </button>
      </form>
    </div>
  );
};

export default ProjectChat;
