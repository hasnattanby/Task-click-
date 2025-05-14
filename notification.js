const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get user notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { skip = 0, take = 20 } = req.query;
    
    const notifications = await prisma.notification.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: parseInt(skip),
      take: parseInt(take)
    });
    
    const total = await prisma.notification.count({
      where: {
        userId
      }
    });
    
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        read: false
      }
    });
    
    res.status(200).json({
      success: true,
      notifications,
      total,
      unreadCount,
      hasMore: total > parseInt(skip) + parseInt(take)
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'নোটিফিকেশন লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { notificationId } = req.params;
    
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'নোটিফিকেশন পাওয়া যায়নি'
      });
    }
    
    if (notification.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'এই নোটিফিকেশনে আপনার অ্যাকসেস নেই'
      });
    }
    
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });
    
    res.status(200).json({
      success: true,
      message: 'নোটিফিকেশন পঠিত হিসেবে চিহ্নিত করা হয়েছে',
      notification: updatedNotification
    });
  } catch (error) {
    console.error('Mark notification error:', error);
    res.status(500).json({
      success: false,
      message: 'নোটিফিকেশন আপডেট করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const { id: userId } = req.user;
    
    await prisma.notification.updateMany({
      where: {
        userId,
        read: false
      },
      data: {
        read: true
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'সব নোটিফিকেশন পঠিত হিসেবে চিহ্নিত করা হয়েছে'
    });
  } catch (error) {
    console.error('Mark all notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'নোটিফিকেশন আপডেট করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};
