// Backend Controller Updates (Fix 24-hour cooldown logic)

import UserTaskProgress from '../models/UserTaskProgress.model.js';
import Task from '../models/task.model.js';
import Earnings from '../models/earning.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';

export const getTaskForUser = async (req, res) => {
  try {
    const { taskId, userId } = req.params;

    const lastCompletion = await UserTaskProgress.findOne({
      taskId,
      userId,
      status: 'completed'
    }).sort({ completedAt: -1 });

    if (lastCompletion && Date.now() - new Date(lastCompletion.completedAt).getTime() < 24 * 60 * 60 * 1000) {
      return res.status(200).json({
        message: 'Task already completed recently',
        isCompleted: true,
        nextAvailable: new Date(lastCompletion.completedAt.getTime() + 24 * 60 * 60 * 1000)
      });
    }

    const task = await Task.findById(taskId).populate('planId');
    if (!task) return res.status(404).json({ message: 'Task not found' });

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

export const getUserTaskStatuses = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const taskStatuses = await UserTaskProgress.find({ userId })
      .select('taskId status completedAt')
      .populate('taskId', 'type price url')
      .lean();

    const formattedStatuses = taskStatuses.map(status => {
      const cooldownEnd = new Date(status.completedAt).getTime() + 24 * 60 * 60 * 1000;
      const isOnCooldown = status.status === 'completed' && Date.now() < cooldownEnd;
      return {
        taskId: status.taskId._id,
        taskType: status.taskId.type,
        taskPrice: status.taskId.price,
        taskUrl: status.taskId.url,
        status: status.status,
        completedAt: status.completedAt,
        isCompleted: status.status === 'completed',
        isOnCooldown,
        nextAvailable: isOnCooldown ? new Date(cooldownEnd) : null
      };
    });

    res.status(200).json(formattedStatuses);
  } catch (error) {
    console.error('Error fetching task statuses:', error);
    res.status(500).json({ 
      message: 'Server error while fetching task statuses',
      error: error.message 
    });
  }
};

export const submitTaskAnswer = async (req, res) => {
  try {
    const { taskId, userId } = req.params;
    const { answer, correctAnswer, taskPrice } = req.body;

    if (parseInt(answer) !== parseInt(correctAnswer)) {
      return res.status(400).json({ message: 'Incorrect answer' });
    }

    const existingCompletion = await UserTaskProgress.findOne({
      taskId,
      userId,
      status: 'completed'
    }).sort({ completedAt: -1 });

    if (existingCompletion && Date.now() - new Date(existingCompletion.completedAt).getTime() < 24 * 60 * 60 * 1000) {
      return res.status(400).json({
        message: 'Task already completed recently',
        nextAvailable: new Date(existingCompletion.completedAt.getTime() + 24 * 60 * 60 * 1000)
      });
    }

    await UserTaskProgress.findOneAndUpdate(
      { taskId, userId },
      {
        status: 'completed',
        mathQuestionAnswer: answer,
        completedAt: new Date()
      },
      { upsert: true, new: true }
    );

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    let earnings = await Earnings.findOne({ userId });
    if (!earnings) {
      earnings = new Earnings({
        userId,
        totalEarnings: taskPrice,
        dailyEarnings: [{ date: currentDate, amount: taskPrice }]
      });
    } else {
      earnings.totalEarnings += taskPrice;
      const todayEarning = earnings.dailyEarnings.find(e => e.date.getTime() === currentDate.getTime());
      if (todayEarning) {
        todayEarning.amount += taskPrice;
      } else {
        earnings.dailyEarnings.push({ date: currentDate, amount: taskPrice });
      }
    }

    await earnings.save();

    await User.findByIdAndUpdate(userId, { $inc: { balance: taskPrice } });

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

