const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Admin dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const { role } = req.user;
    
    // Check if admin
    if (role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'এডমিন প্যানেলে আপনার অ্যাকসেস নেই'
      });
    }
    
    // Get total users
    const totalUsers = await prisma.user.count();
    const todayUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });
    
    // Users by country
    const usersByCountry = await prisma.user.groupBy({
      by: ['country'],
      _count: {
        id: true
      }
    });
    
    // Users by role
    const workerCount = await prisma.user.count({
      where: { role: 'WORKER' }
    });
    
    const orderGiverCount = await prisma.user.count({
      where: { role: 'ORDER_GIVER' }
    });
    
    // Active vs inactive users
    const activeUsers = await prisma.user.count({
      where: {
        isCompleteProfile: true
      }
    });
    
    const inactiveUsers = totalUsers - activeUsers;
    
    // Order stats
    const totalOrders = await prisma.order.count();
    const activeOrders = await prisma.order.count({
      where: { status: 'ACTIVE' }
    });
    
    const ordersLast24Hours = await prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });
    
    // Financial stats
    const orders = await prisma.order.findMany({
      where: {
        status: 'COMPLETED'
      }
    });
    
    // Calculate profits
    const totalIncome = orders.reduce((sum, order) => sum + order.totalBudget, 0);
    const totalExpense = orders.reduce((sum, order) => sum + (order.ratePerWorker * order.workerCount), 0);
    const totalProfit = totalIncome - totalExpense;
    
    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          today: todayUsers,
          byCountry: usersByCountry,
          workerCount,
          orderGiverCount,
          activeUsers,
          inactiveUsers
        },
        orders: {
          total: totalOrders,
          active: activeOrders,
          last24Hours: ordersLast24Hours
        },
        financial: {
          totalIncome,
          totalExpense,
          totalProfit
        }
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'স্ট্যাটিস্টিক্স লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Approve order
exports.approveOrder = async (req, res) => {
  try {
    const { role } = req.user;
    const { orderId } = req.params;
    
    // Check if admin
    if (role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'এডমিন প্যানেলে আপনার অ্যাকসেস নেই'
      });
    }
    
    // Find order
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'অর্ডার পাওয়া যায়নি'
      });
    }
    
    if (order.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'এই অর্ডার ইতিমধ্যে প্রক্রিয়া করা হয়েছে'
      });
    }
    
    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'ACTIVE' }
    });
    
    // Notify order creator
    await prisma.notification.create({
      data: {
        userId: order.creatorId,
        type: 'NEW_ORDER',
        message: `আপনার অর্ডার অনুমোদিত হয়েছে: ${order.title}`,
        link: `/orders/${orderId}`
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'অর্ডার সফলভাবে অনুমোদিত হয়েছে',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Approve order error:', error);
    res.status(500).json({
      success: false,
      message: 'অর্ডার অনুমোদন করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Get all pending withdraw requests
exports.getWithdrawRequests = async (req, res) => {
  try {
    const { role } = req.user;
    const { status, skip = 0, take = 20 } = req.query;
    
    // Check if admin
    if (role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'এডমিন প্যানেলে আপনার অ্যাকসেস নেই'
      });
    }
    
    let whereClause = {};
    if (status) {
      whereClause.status = status;
    }
    
    const withdrawRequests = await prisma.withdrawRequest.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: parseInt(skip),
      take: parseInt(take)
    });
    
    const total = await prisma.withdrawRequest.count({
      where: whereClause
    });
    
    res.status(200).json({
      success: true,
      withdrawRequests,
      total,
      hasMore: total > parseInt(skip) + parseInt(take)
    });
  } catch (error) {
    console.error('Get withdraw requests error:', error);
    res.status(500).json({
      success: false,
      message: 'উত্তোলন অনুরোধ লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Process withdraw request
exports.processWithdrawRequest = async (req, res) => {
  try {
    const { role } = req.user;
    const { requestId } = req.params;
    const { status, notes } = req.body;
    
    // Check if admin
    if (role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'এডমিন প্যানেলে আপনার অ্যাকসেস নেই'
      });
    }
    
    // Find withdraw request
    const withdrawRequest = await prisma.withdrawRequest.findUnique({
      where: { id: requestId },
      include: {
        user: true
      }
    });
    
    if (!withdrawRequest) {
      return res.status(404).json({
        success: false,
        message: 'উত্তোলন অনুরোধ পাওয়া যায়নি'
      });
    }
    
    if (withdrawRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'এই উত্তোলন অনুরোধ ইতিমধ্যে প্রক্রিয়া করা হয়েছে'
      });
    }
    
    let notificationMessage = '';
    let earningUpdate = {};
    
    if (status === 'APPROVED') {
      // Update user earnings
      earningUpdate = {
        pendingBalance: { decrement: withdrawRequest.amount },
        withdrawnAmount: { increment: withdrawRequest.amount }
      };
      
      notificationMessage = `আপনার ${withdrawRequest.amount}৳ উত্তোলন অনুরোধ অনুমোদিত হয়েছে।`;
    } else if (status === 'REJECTED') {
      // Return funds to available balance
      earningUpdate = {
        pendingBalance: { decrement: withdrawRequest.amount },
        approvedBalance: { increment: withdrawRequest.amount }
      };
      
      notificationMessage = `আপনার ${withdrawRequest.amount}৳ উত্তোলন অনুরোধ প্রত্যাখ্যাত হয়েছে।`;
      
      if (notes) {
        notificationMessage += ` কারণ: ${notes}`;
      }
    }
    
    // Update withdraw request
    const updatedRequest = await prisma.withdrawRequest.update({
      where: { id: requestId },
      data: { 
        status,
        updatedAt: new Date()
      }
    });
    
    // Update user's earnings if needed
    if (Object.keys(earningUpdate).length > 0) {
      await prisma.earning.update({
        where: { userId: withdrawRequest.userId },
        data: earningUpdate
      });
    }
    
    // Create notification
    await prisma.notification.create({
      data: {
        userId: withdrawRequest.userId,
        type: 'WITHDRAW_STATUS',
        message: notificationMessage,
        link: '/profile/earnings'
      }
    });
    
    res.status(200).json({
      success: true,
      message: status === 'APPROVED' ? 'উত্তোলন অনুরোধ অনুমোদিত হয়েছে' : 'উত্তোলন অনুরোধ প্রত্যাখ্যাত হয়েছে',
      withdrawRequest: updatedRequest
    });
  } catch (error) {
    console.error('Process withdraw request error:', error);
    res.status(500).json({
      success: false,
      message: 'উত্তোলন অনুরোধ প্রক্রিয়া করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Send global notification
exports.sendGlobalNotification = async (req, res) => {
  try {
    const { role } = req.user;
    const { title, message, type, userRole } = req.body;
    
    // Check if admin
    if (role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'এডমিন প্যানেলে আপনার অ্যাকসেস নেই'
      });
    }
    
    let whereClause = {};
    if (userRole) {
      whereClause.role = userRole;
    }
    
    // Get all users matching criteria
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true
      }
    });
    
    // Create notifications for all users
    const notificationsData = users.map(user => ({
      userId: user.id,
      type: type || 'URGENT_NOTICE',
      message: `${title}: ${message}`,
      link: '/notifications'
    }));
    
    await prisma.notification.createMany({
      data: notificationsData
    });
    
    res.status(200).json({
      success: true,
      message: `${users.length} ইউজারকে নোটিফিকেশন পাঠানো হয়েছে`,
      userCount: users.length
    });
  } catch (error) {
    console.error('Send global notification error:', error);
    res.status(500).json({
      success: false,
      message: 'নোটিফিকেশন পাঠাতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};
