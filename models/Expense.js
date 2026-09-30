import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an expense title'],
      trim: true,
      maxlength: [60, 'Title cannot exceed 60 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an amount'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Food',
        'Transport',
        'Shopping',
        'Bills',
        'Entertainment',
        'Health',
        'Education',
        'Other',
      ],
      default: 'Food',
    },
    date: {
      type: String,
      required: [true, 'Please select a date'],
      default: () => new Date().toISOString().split('T')[0],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// If the model is already compiled (e.g. during serverless reloads), use it, otherwise compile it
const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);

export default Expense;
