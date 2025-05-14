const { PrismaClient } = require('@prisma/client');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const prisma = new PrismaClient();

// Create payment intent for order
exports.createPaymentIntent = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { orderId, paymentMethod } = req.body;
    
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
    
    if (order.creatorId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'এই অর্ডারের পেমেন্ট করার অনুমতি নেই'
      });
    }
    
    let paymentResponse;
    
    // Process based on payment method
    if (paymentMethod === 'stripe') {
      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.totalBudget * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          orderId: order.id,
          userId
        }
      });
      
      paymentResponse = {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'অবৈধ পেমেন্ট পদ্ধতি'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'পেমেন্ট ইনটেন্ট তৈরি করা হয়েছে',
      paymentMethod,
      paymentData: paymentResponse
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'পেমেন্ট ইনটেন্ট তৈরি করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Handle Stripe webhook
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
  
  try {
    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.orderId;
      const userId = paymentIntent.metadata.userId;
      
      // Update order status
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'ACTIVE' }
      });
      
      // Create notification for order creator
      await prisma.notification.create({
        data: {
          userId,
          type: 'PAYMENT_UPDATE',
          message: 'আপনার পেমেন্ট সফল হয়েছে এবং অর্ডার অ্যাকটিভ করা হয়েছে',
          link: `/orders/${orderId}`
        }
      });
      
      // Create notification for admin
      await prisma.notification.create({
        data: {
          userId: 'ADMIN_ID_HERE', // Replace with actual admin ID
          type: 'PAYMENT_UPDATE',
          message: `নতুন পেমেন্ট: Order ID ${orderId}`,
          link: `/admin/orders/${orderId}`
        }
      });
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe webhook processing error:', error);
    res.status(500).json({ received: false, error: error.message });
  }
};

// Request withdraw
exports.requestWithdraw = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { amount, method, accountInfo } = req.body;
    
    // Check user's earnings
    const earnings = await prisma.earning.findUnique({
      where: { userId }
    });
    
    if (!earnings) {
      return res.status(404).json({
        success: false,
        message: 'ইউজারের আয় সম্পর্কিত তথ্য পাওয়া যায়নি'
      });
    }
    
    if (earnings.approvedBalance < amount) {
      return res.status(400).json({
        success: false,
        message: 'আপনার ব্যালেন্সে পর্যাপ্ত অর্থ নেই'
      });
    }
    
    // Create withdraw request
    const withdrawRequest = await prisma.withdrawRequest.create({
      data: {
        userId,
        amount,
        method,
        accountInfo,
        status: 'PENDING'
      }
    });
    
    // Update user's earnings
    await prisma.earning.update({
      where: { userId },
      data: {
        approvedBalance: { decrement: amount },
        pendingBalance: { increment: amount }
      }
    });
    
    // Create notification for admin
    await prisma.notification.create({
      data: {
        userId: 'ADMIN_ID_HERE', // Replace with actual admin ID
        type: 'ADMIN_NOTIFICATION',
        message: `নতুন উত্তোলন অনুরোধ: ${amount}৳ from ${userId}`,
        link: `/admin/withdraw-requests`
      }
    });
    
    // Create notification for user
    await prisma.notification.create({
      data: {
        userId,
        type: 'WITHDRAW_STATUS',
        message: `আপনার ${amount}৳ উত্তোলন অনুরোধ পেন্ডিং আছে`,
        link: '/profile/earnings'
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'উত্তোলন অনুরোধ সফলভাবে জমা দেওয়া হয়েছে',
      withdrawRequest
    });
  } catch (error) {
    console.error('Withdraw request error:', error);
    res.status(500).json({
      success: false,
      message: 'উত্তোলন অনুরোধ করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};
