import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useMessage } from '../../context/MessageContext';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { FaPaperPlane, FaImage, FaSmile, FaArrowLeft } from 'react-icons/fa';

const ConversationList = ({ conversations, activeConversationId, onSelectConversation }) => {
  return (
    <div className="bg-white border-r h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">মেসেজ</h2>
      </div>
      
      <div className="overflow-y-auto h-[calc(100%-60px)]">
        {conversations.length > 0 ? (
          conversations.map(conversation => (
            <div 
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={`flex items-center p-3 cursor-pointer border-b ${activeConversationId === conversation.id ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mr-3">
                {conversation.profileImage ? (
                  <img 
                    src={conversation.profileImage} 
                    alt={conversation.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-200 text-indigo-500">
                    {conversation.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-800 truncate">
                    {conversation.name}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {format(new Date(conversation.timestamp), 'HH:mm')}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <p className="text-xs text-gray-500 truncate">
                    {conversation.lastMessage}
                  </p>
                  
                  {conversation.unread > 0 && (
                    <span className="ml-2 bg-indigo-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {conversation.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            কোনো কথোপকথন নেই
          </div>
        )}
      </div>
    </div>
  );
};

const MessageView = ({ conversation, messages, onSendMessage, loading }) => {
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(conversation.id, message);
      setMessage('');
    }
  };
  
  // If no conversation selected
  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-medium text-gray-700 mb-2">আপনার মেসেজ</h2>
          <p className="text-gray-500">কথোপকথন শুরু করতে বাম দিক থেকে একজন ব্যবহারকারী নির্বাচন করুন</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center">
        <button className="md:hidden mr-2 text-gray-600">
          <FaArrowLeft />
        </button>
        
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 mr-3">
          {conversation.profileImage ? (
            <img 
              src={conversation.profileImage} 
              alt={conversation.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-indigo-200 text-indigo-500">
              {conversation.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div>
          <h2 className="font-medium text-gray-800">{conversation.name}</h2>
          {/* Can show online status here */}
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-3">
            {messages.map(msg => (
              <div 
                key={msg.id}
                className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                    msg.senderId === user.id 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p>{msg.content}</p>
                  <div 
                    className={`text-xs mt-1 ${
                      msg.senderId === user.id ? 'text-indigo-200' : 'text-gray-500'
                    }`}
                  >
                    {format(new Date(msg.timestamp), 'HH:mm')}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="text-center p-8 text-gray-500">
            কথোপকথন শুরু করুন
          </div>
        )}
      </div>
      
      {/* Message Input */}
      <div className="bg-white border-t p-3">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <button 
            type="button"
            className="text-gray-500 hover:text-indigo-600 p-2 rounded-full"
          >
            <FaSmile />
          </button>
          
          <button 
            type="button"
            className="text-gray-500 hover:text-indigo-600 p-2 rounded-full"
          >
            <FaImage />
          </button>
          
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="মেসেজ লিখুন..."
            className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          
          <button 
            type="submit"
            disabled={!message.trim()}
            className={`bg-indigo-600 text-white p-2 rounded-full ${
              !message.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
            }`}
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
};

const Messenger = () => {
  const { userId } = useParams();
  const { 
    conversations, 
    messages, 
    activeConversation, 
    loading, 
    fetchConversations, 
    fetchMessages, 
    sendMessage, 
    setActiveConversation 
  } = useMessage();
  const [isMobileView, setIsMobileView] = useState(false);
  const [showMessages, setShowMessages] = useState(!!userId);
  
  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);
  
  // Fetch messages if userId provided
  useEffect(() => {
    if (userId) {
      fetchMessages(userId);
      setShowMessages(true);
    }
  }, [userId, fetchMessages]);
  
  const handleSelectConversation = (conversation) => {
    fetchMessages(conversation.id);
    setActiveConversation(conversation);
    setShowMessages(true);
  };
  
  const handleSendMessage = (receiverId, content) => {
    sendMessage(receiverId, content);
  };
  
  return (
    <div className="container mx-auto h-[calc(100vh-132px)] overflow-hidden">
      <div className="h-full bg-white shadow-md rounded-md overflow-hidden flex">
        {/* Conversation List */}
        {(!isMobileView || !showMessages) && (
          <div className="w-full md:w-1/3 h-full">
            <ConversationList 
              conversations={conversations} 
              activeConversationId={activeConversation?.id}
              onSelectConversation={handleSelectConversation}
            />
          </div>
        )}
        
        {/* Message View */}
        {(!isMobileView || showMessages) && (
          <div className="w-full md:w-2/3 h-full">
            <MessageView 
              conversation={activeConversation}
              messages={messages}
              onSendMessage={handleSendMessage}
              loading={loading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Messenger;
