import mongoose from 'mongoose';

const userTaskProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    mathQuestionAnswer: {
      type: Number, // Store user's answer for validation
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending', // Task status (completed or still pending)
    },
    progress: {
      type: Number,
      default: 0, // Progress from 0 to 100%
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const UserTaskProgress = mongoose.model('UserTaskProgress', userTaskProgressSchema);

export default UserTaskProgress;
