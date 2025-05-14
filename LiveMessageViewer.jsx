import React, { useState, useEffect, useRef } from 'react';
import { useMessage } from '../../context/MessageContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FaComments, FaEye, FaCircle } from 'react-icons/fa';

const LiveMessageViewer = () => {
  const { getLiveDiscussions, fetchMessages, setActiveConversation } = useMessage();
  const [liveDiscussions, setLiveDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [messages, setMessages] = useState([]);
  const messageContainerRef = useRef(null);
  const navigate = useNavigate();
  
  // Fetch active discussions on mount
  useEffect(() => {
    const fetchLiveDiscussions = async () => {
      setLoading(true);
      try {
        const discussions = await getLiveDiscussions();
        setLiveDiscussions(discussions);
      } catch (error) {
        console.error('Error fetching live discussions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLiveDiscussions();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchLiveDiscussions, 30000);
    
    return () => clearInterval(interval);
  }, [getLiveDiscussions]);
  
  // Fetch messages when a discussion is selected
  useEffect(() => {
    if (selectedDiscussion) {
      const fetchDiscussionMessages = async () => {
        try {
          const response = await fetch(`/api/messages/live/${selectedDiscussion.id}`);
          const data = await response.json();
          setMessages(data.messages);
        } catch (error) {
          console.error('Error fetching discussion messages:', error);
        }
      };
      
      fetchDiscussionMessages();
      
      // Refresh messages every 5 seconds
      const interval = setInterval(fetchDiscussionMessages, 5000);
      
      return () => clearInterval(interval);
    }
  }, [selectedDiscussion]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleJoinConversation = (discussion) => {
    navigate(`/messenger/${discussion.orderId}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-6 pb-20">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">লাইভ মেসেজ</h1>
      
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : liveDiscussions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
            <FaComments className="text-3xl text-gray-400" />
          </div>
          <h3 className="
