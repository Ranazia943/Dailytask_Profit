import WithdrawalRequest from '../models/WithdrawalRequest.js';
import Earnings from '../models/earning.model.js';
import moment from 'moment';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';  // Import the notification model

// User sends a withdrawal request
export const sendWithdrawalRequest = async (req, res) => {
  try {
    const { amount, paymentGateway, gatewayAccountName, gatewayAccountNumber } = req.body;
    const userId = req.params.userid;

    // Fetch user's earnings
    const userEarnings = await Earnings.findOne({ userId });
    if (!userEarnings) {
      return res.status(400).json({ message: 'User earnings not found' });
    }

    const userBalance = userEarnings.totalEarnings;

    if (userBalance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const lastRequest = await WithdrawalRequest.findOne({
      userId,
      requestDate: { $gte: moment().subtract(7, 'days').startOf('day').toDate() },
    });

    if (lastRequest) {
      return res.status(400).json({ message: 'You can only send one withdrawal request per week' });
    }

    const newRequest = new WithdrawalRequest({
      userId,
      amount,
      balanceBeforeRequest: userBalance,
      paymentGateway,
      gatewayAccountName,
      gatewayAccountNumber,
    });

    await newRequest.save();

    // Create notification for the user about the withdrawal request
    const notificationMessage = `Your withdrawal request of ${amount} is created successfully. Awaiting approval.`;
    const notification = new Notification({
      userId,
      message: notificationMessage,
    });
    await notification.save();

    res.status(201).json({ message: 'Withdrawal request created', data: newRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const respondToWithdrawalRequest = async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { status, adminSummary, adminScreenshot, approvedAmount } = req.body;

    // Ensure status is valid
    if (!['in-progress', 'completed', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Find the withdrawal request
    const withdrawalRequest = await WithdrawalRequest.findById(withdrawalId);
    if (!withdrawalRequest) {
      return res.status(404).json({ message: 'Withdrawal request not found' });
    }

    // Find the user's earnings
    const userEarnings = await Earnings.findOne({ userId: withdrawalRequest.userId });
    if (!userEarnings) {
      return res.status(404).json({ message: 'User earnings not found' });
    }

    // If the status is completed, ensure approvedAmount is provided and valid
    if (status === 'completed') {
      if (approvedAmount == null || approvedAmount <= 0) {
        return res.status(400).json({ message: 'Approved amount must be greater than zero' });
      }

      if (approvedAmount > withdrawalRequest.amount) {
        return res.status(400).json({
          message: 'Approved amount cannot exceed the requested amount',
        });
      }

      if (approvedAmount > userEarnings.totalEarnings) {
        return res.status(400).json({ message: 'Insufficient balance in user earnings' });
      }

      // Update user's total earnings balance
      userEarnings.totalEarnings -= approvedAmount;
      await userEarnings.save();
    }

    // Update the withdrawal request fields
    withdrawalRequest.status = status;
    withdrawalRequest.adminSummary = adminSummary || withdrawalRequest.adminSummary;
    withdrawalRequest.adminScreenshot = adminScreenshot || withdrawalRequest.adminScreenshot;
    
    if (status === 'completed') {
      withdrawalRequest.processedDate = new Date();
      withdrawalRequest.approvedAmount = approvedAmount; // Save the approved amount
    }

    if (status === 'rejected') {
      withdrawalRequest.processedDate = new Date();
    }

    // Save the updated withdrawal request
    await withdrawalRequest.save();

    // Create a notification for the user based on the status of the withdrawal request
    const notificationMessage = status === 'completed'
      ? `Your withdrawal request of ${approvedAmount} has been approved.`
      : `Your withdrawal request has been ${status}.`;

    const notification = new Notification({
      userId: withdrawalRequest.userId,
      message: notificationMessage,
      title: `Withdrawal Request ${status === 'completed' ? 'Approved' : 'Status Update'}`,
      type: status === 'completed' ? 'success' : 'alert',
    });
    await notification.save();

    res.status(200).json({
      message: 'Withdrawal request updated successfully',
      data: withdrawalRequest,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

  export const getNotifications = async (req, res) => {
    try {
      const userId = req.params.userId;
  
      // Fetch notifications for the user
      const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
  
      res.status(200).json({ notifications });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
export const fetchAllWithdrawalRequests = async (req, res) => {
  try {
    const withdrawalRequests = await WithdrawalRequest.find()
      .sort({ requestDate: -1 })
      .populate('userId', 'username'); // Populate username field from the User model

    res.status(200).json({ data: withdrawalRequests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
export const fetchWithdrawalRequestByUserId = async (req, res) => {
  try {
    const { userId } = req.params; // Extract userId from URL parameters


    // Fetch user's earnings
    const userEarnings = await Earnings.findOne({ userId });
    if (!userEarnings) {
      return res.status(404).json({ message: 'User earnings not found' });
    }

    // Fetch all withdrawal requests for the user
    const withdrawalRequests = await WithdrawalRequest.find({ userId });

    if (!withdrawalRequests || withdrawalRequests.length === 0) {
      return res.status(404).json({ message: 'No withdrawal requests found for this user' });
    }

    // Calculate total withdrawn amount (sum of all completed withdrawal requests)
    const totalWithdrawn = withdrawalRequests
      .filter(req => req.status === 'completed') // Only include completed withdrawals
      .reduce((sum, req) => sum + (req.amount || 0), 0); // Summing the approved amounts

    // Calculate remaining balance
    const remainingBalance = userEarnings.totalEarnings - totalWithdrawn; // Subtract total withdrawn from total earnings

    res.status(200).json({
      data: withdrawalRequests,
      totalWithdrawn,
      remainingBalance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Delete a notification by its ID
export const deleteNotificationById = async (req, res) => {
  try {
    const { notificationId } = req.params; // Extract notificationId from URL parameters

    // Find and delete the notification by its ID
    const deletedNotification = await Notification.findByIdAndDelete(notificationId);

    // If no notification is found
    if (!deletedNotification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification deleted successfully', data: deletedNotification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
