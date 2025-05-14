const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get conversations list
exports.getConversations = async (req, res) => {
  try {
    const { id: userId } = req.user;
    
    // Get unique conversations by finding the most recent message for each conversation
    const sentMessages = await prisma.message.findMany({
      where: {
        senderId: userId
      },
      orderBy: {
        timestamp: 'desc'
      },
      distinct: ['receiverId'],
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        }
      }
    });
    
    const receivedMessages = await prisma.message.findMany({
      where: {
        receiverId: userId
      },
      orderBy: {
        timestamp: 'desc'
      },
      distinct: ['senderId'],
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        }
      }
    });
    
    // Combine and deduplicate
    const senderConversations = sentMessages.map(message => ({
      userId: message.receiver.id,
      name: message.receiver.name,
      email: message.receiver.email,
      profileImage: message.receiver.profileImage,
      lastMessage: message.content,
      timestamp: message.timestamp,
      isRead: message.read
    }));
    
    const receiverConversations = receivedMessages.map(message => ({
      userId: message.sender.id,
      name: message.sender.name,
      email: message.sender.email,
      profileImage: message.sender.profileImage,
      lastMessage: message.content,
      timestamp: message.timestamp,
      isRead: message.read
    }));
    
    // Combine and remove duplicates
    const allConversations = [...senderConversations, ...receiverConversations];
    const uniqueConversations = [];
    const seen = new Set();
    
    allConversations.forEach(conversation => {
      if (!seen.has(conversation.userId)) {
        seen.add(conversation.userId);
        uniqueConversations.push(conversation);
      }
    });
    
    // Sort by most recent
    uniqueConversations.sort((a, b) => b.timestamp - a.timestamp);
    
    res.status(200).json({
      success: true,
      conversations: uniqueConversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'কথোপকথন লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Get messages with a specific user
exports.getMessages = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { targetUserId } = req.params;
    const { skip = 0, take = 50 } = req.query;
    
    // Validate target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true
      }
    });
    
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'ইউজার পাওয়া যায়নি'
      });
    }
    
    // Get messages between the two users
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: userId,
            receiverId: targetUserId
          },
          {
            senderId: targetUserId,
            receiverId: userId
          }
        ]
      },
      orderBy: {
        timestamp: 'desc'
      },
      skip: parseInt(skip),
      take: parseInt(take)
    });
    
    // Mark received messages as read
    await prisma.message.updateMany({
      where: {
        senderId: targetUserId,
        receiverId: userId,
        read: false
      },
      data: {
        read: true
      }
    });
    
    // Get total count
    const total = await prisma.message.count({
      where: {
        OR: [
          {
            senderId: userId,
            receiverId: targetUserId
          },
          {
            senderId: targetUserId,
            receiverId: userId
          }
        ]
      }
    });
    
    res.status(200).json({
      success: true,
      messages: messages.reverse(), // Reverse to show oldest first
      user: targetUser,
      total,
      hasMore: total > parseInt(skip) + parseInt(take)
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'মেসেজ লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { id: senderId } = req.user;
    const { receiverId, content } = req.body;
    
    // Validate receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    });
    
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'মেসেজ প্রাপক পাওয়া যায়নি'
      });
    }
    
    // Create message
    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
        timestamp: new Date()
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'মেসেজ পাঠানো হয়েছে',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'মেসেজ পাঠাতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};
