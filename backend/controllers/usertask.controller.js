
import UserTaskProgress from '../models/UserTaskProgress.model.js';
import Task from '../models/task.model.js';
import Earnings from '../models/earning.model.js';
import User from '../models/user.model.js';
// Fetch task details for the user with completion check
export const getTaskForUser = async (req, res) => {
  try {
    const { taskId, userId } = req.params;

    // Check if task was completed in last 24 hours
    const lastCompletion = await UserTaskProgress.findOne({
      taskId,
      userId,
      status: 'completed',
      completedAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (lastCompletion) {
      return res.status(200).json({
        message: 'Task already completed recently',
        isCompleted: true,
        nextAvailable: new Date(lastCompletion.completedAt.getTime() + 24 * 60 * 60 * 1000)
      });
    }

    // Fetch the task details
    const task = await Task.findById(taskId).populate('planId');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Generate math question
    const number1 = Math.floor(Math.random() * 10) + 1;
    const number2 = Math.floor(Math.random() * 10) + 1;

    return res.status(200).json({
      message: 'Task available',
      isCompleted: false,
      taskUrl: task.url,
      planId: task.planId?._id,
      planName: task.planId?.name,
      mathQuestion: {
        question: `${number1} + ${number2}`,
        correctAnswer: number1 + number2
      },
      taskId: task._id,
      taskPrice: task.price
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const submitTaskAnswer = async (req, res) => {
  try {
    const { taskId, userId } = req.params;
    const { answer, correctAnswer, taskPrice } = req.body;

    // Validate answer
    if (parseInt(answer) !== parseInt(correctAnswer)) {
      return res.status(400).json({ message: 'Incorrect answer' });
    }

    // Check if task was already completed in last 24 hours
    const existingCompletion = await UserTaskProgress.findOne({
      taskId,
      userId,
      status: 'completed',
      completedAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (existingCompletion) {
      return res.status(400).json({
        message: 'Task already completed recently',
        nextAvailable: new Date(existingCompletion.completedAt.getTime() + 24 * 60 * 60 * 1000)
      });
    }

    // Record task completion
    await UserTaskProgress.findOneAndUpdate(
      { taskId, userId },
      {
        status: 'completed',
        mathQuestionAnswer: answer,
        completedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Get current date without time for daily earnings tracking
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Update or create earnings record
    let earnings = await Earnings.findOne({ userId });
    
    if (!earnings) {
      // Create new earnings record if doesn't exist
      earnings = new Earnings({
        userId,
        totalEarnings: taskPrice,
        dailyEarnings: [{
          date: currentDate,
          amount: taskPrice
        }]
      });
    } else {
      // Update existing earnings record
      earnings.totalEarnings += taskPrice;
      
      // Check if daily earnings entry exists for today
      const todayEarning = earnings.dailyEarnings.find(e => 
        e.date.getTime() === currentDate.getTime()
      );
      
      if (todayEarning) {
        todayEarning.amount += taskPrice;
      } else {
        earnings.dailyEarnings.push({
          date: currentDate,
          amount: taskPrice
        });
      }
    }

    await earnings.save();

    // Update user's balance
    await User.findByIdAndUpdate(
      userId,
      { $inc: { balance: taskPrice } }
    );

    return res.status(200).json({ 
      message: 'Task completed successfully!',
      earnings: taskPrice,
      newBalance: earnings.totalEarnings
    });
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

