import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';
import io from 'socket.io-client';

const MessageContext = createContext();

export const useMessage = () => useContext(MessageContext);

export const MessageProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const { user, token } = useAuth();
  
  // Initialize socket connection
  useEffect(() => {
    if (user && token) {
      const newSocket = io();
      setSocket(newSocket);
      
      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, token]);
  
  // Join socket room and listen for messages
  useEffect(() => {
    if (socket && user) {
      socket.emit('join', user.id);
      
      socket.on('newMessage', (message) => {
        // Add to messages if from active conversation
        if (activeConversation && 
           (message.senderId === activeConversation.id || 
            message.receiverId === activeConversation.id)) {
          setMessages((prev) => [...prev, message]);
        }
        
        // Update conversation list
        updateConversationWithNewMessage(message);
      });
      
      socket.on('messageSent', (message) => {
        // Add to messages
        setMessages((prev) => [...prev, message]);
        
        // Update conversation list
        updateConversationWithNewMessage(message);
      });
      
      return () => {
        socket.off('newMessage');
        socket.off('messageSent');
      };
    }
  }, [socket, user, activeConversation]);
  
  // Update conversation list with new message
  const updateConversationWithNewMessage = (message) => {
    const otherUserId = message.senderId === user.id ? message.receiverId : message.senderId;
    
    setConversations((prev) => {
      // Check if conversation exists
      const conversationIndex = prev.findIndex(
        (c) => c.id === otherUserId
      );
      
      if (conversationIndex !== -1) {
        // Update existing conversation
        const updatedConversations = [...prev];
        updatedConversations[conversationIndex] = {
          ...updatedConversations[conversationIndex],
          lastMessage: message.content,
          timestamp: message.timestamp,
          unread: message.senderId !== user.id ? 
            (updatedConversations[conversationIndex].unread || 0) + 1 : 0
        };
        
        // Sort conversations by latest message
        return sortConversationsByLatest(updatedConversations);
      } else {
        // Need to fetch user info for new conversation
        fetchUserInfo(otherUserId);
        return prev;
      }
    });
  };
  
  // Sort conversations by latest message
  const sortConversationsByLatest = (conversationsArray) => {
    return [...conversationsArray].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
  };
  
  // Fetch user info for new conversation
  const fetchUserInfo = async (userId) => {
    try {
      const res = await axios.get(`/api/users/${userId}`);
      const userData = res.data.user;
      
      setConversations((prev) => {
        // Check if conversation was added while fetching
        if (prev.some((c) => c.id === userId)) {
          return prev;
        }
        
        // Add new conversation
        const newConversation = {
          id: userData.id,
          name: userData.name,
          profileImage: userData.profileImage,
          lastMessage: 'New conversation',
          timestamp: new Date(),
          unread: 1
        };
        
        return sortConversationsByLatest([...prev, newConversation]);
      });
    } catch (err) {
      console.error('Error fetching user info:', err);
    }
  };
  
  // Fetch conversations
  const fetchConversations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const res = await axios.get('/api/messages/conversations');
      setConversations(res.data.conversations);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      toast.error('কথোপকথন লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch messages for a conversation
  const fetchMessages = async (userId) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/messages/${userId}`);
      setMessages(res.data.messages);
      
      // Update active conversation
      const conversation = conversations.find(c => c.id === userId);
      if (conversation) {
        setActiveConversation(conversation);
        
        // Mark as read if unread messages
        if (conversation.unread > 0) {
          markConversationAsRead(userId);
        }
      } else {
        // Fetch user info if not in conversations
        const userRes = await axios.get(`/api/users/${userId}`);
        setActiveConversation({
          id: userId,
          name: userRes.data.user.name,
          profileImage: userRes.data.user.profileImage
        });
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      toast.error('বার্তাগুলি লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };
  
  // Send message
  const sendMessage = async (receiverId, content) => {
    if (!socket || !user) return;
    
    try {
      // Emit to socket
      socket.emit('sendMessage', {
        senderId: user.id,
        receiverId,
        content
      });
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('বার্তা পাঠাতে সমস্যা হয়েছে');
    }
  };
  
  // Mark conversation as read
  const markConversationAsRead = async (userId) => {
    try {
      await axios.put(`/api/messages/${userId}/read`);
      
      // Update local state
      setConversations(prev => 
        prev.map(conversation => 
          conversation.id === userId 
            ? { ...conversation, unread: 0 } 
            : conversation
        )
      );
    } catch (err) {
      console.error('Error marking conversation as read:', err);
    }
  };
  
  // Get live discussions
  const getLiveDiscussions = async () => {
    try {
      const res = await axios.get('/api/messages/live-discussions');
      return res.data.discussions;
    } catch (err) {
      console.error('Error fetching live discussions:', err);
      toast.error('লাইভ আলোচনা লোড করতে সমস্যা হয়েছে');
      return [];
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);
  
  const value = {
    conversations,
    messages,
    activeConversation,
    loading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markConversationAsRead,
    setActiveConversation,
    getLiveDiscussions
  };
  
  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};
