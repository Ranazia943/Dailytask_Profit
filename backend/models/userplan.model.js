import mongoose from 'mongoose';

const userPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you're referencing the User model
    required: true,
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan', // Reference to the Plan model
    required: true,
  },
  state: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending',
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  dailyProfit: {
    type: Number,
    required: true,
  },
  totalProfit: {
    type: Number,
    required: true,
  },
  paymentGateway: {
    type: String,
    required: true,
  },
  paymentScreenshot: {
    type: String, // URL or path to the payment screenshot
    required: true,
  },
  taxId: {
    type: String,
    required: true,
    unique: true,
    
  },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task', // Reference to Task model
  }],
});

export default mongoose.model('UserPlan', userPlanSchema);
