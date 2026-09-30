import mongoose from 'mongoose';
import Expense from '../models/Expense.js';

// Starter demo data for fallback when MongoDB Atlas is not yet connected
let inMemoryExpenses = [
  {
    _id: '65f1a2b3c4d5e6f7a8b9c001',
    title: 'Whole Foods Groceries',
    amount: 85.5,
    category: 'Food',
    date: '2026-09-29',
    description: 'Fresh fruits, vegetables, and weekly pantry staples',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c002',
    title: 'Metro Transit Monthly Pass',
    amount: 45.0,
    category: 'Transport',
    date: '2026-09-28',
    description: 'City subway and express bus card reload',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c003',
    title: 'Electric & Utility Bill',
    amount: 112.4,
    category: 'Bills',
    date: '2026-09-27',
    description: 'Monthly residential power and water consumption',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c004',
    title: 'Running Shoes & Sports Gear',
    amount: 129.99,
    category: 'Shopping',
    date: '2026-09-26',
    description: 'Trail running sneakers and breathable socks',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    updatedAt: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c005',
    title: 'Cinema & Popcorn Night',
    amount: 34.0,
    category: 'Entertainment',
    date: '2026-09-25',
    description: 'Weekend movie tickets and snacks with friends',
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    updatedAt: new Date(Date.now() - 432000000).toISOString(),
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c006',
    title: 'Web Development Masterclass',
    amount: 65.0,
    category: 'Education',
    date: '2026-09-24',
    description: 'Full-stack course subscription and design resources',
    createdAt: new Date(Date.now() - 518400000).toISOString(),
    updatedAt: new Date(Date.now() - 518400000).toISOString(),
  },
];

// Helper to check if Mongoose is actively connected
const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * @desc   Get all expenses (sorted by date descending)
 * @route  GET /api/expenses
 */
export const getExpenses = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const expenses = await Expense.find().sort({ date: -1, createdAt: -1 });
      return res.status(200).json({
        success: true,
        source: 'mongodb',
        count: expenses.length,
        data: expenses,
      });
    }

    // Fallback: in-memory store
    const sorted = [...inMemoryExpenses].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return res.status(200).json({
      success: true,
      source: 'memory',
      count: sorted.length,
      data: sorted,
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching expenses. Please try again.',
      error: error.message,
    });
  }
};

/**
 * @desc   Create a new expense
 * @route  POST /api/expenses
 */
export const createExpense = async (req, res) => {
  try {
    const { title, amount, category, date, description } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a title for the expense.',
      });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid amount greater than 0.',
      });
    }

    const validCategories = [
      'Food',
      'Transport',
      'Shopping',
      'Bills',
      'Entertainment',
      'Health',
      'Education',
      'Other',
    ];
    const finalCategory = validCategories.includes(category) ? category : 'Other';
    const finalDate = date || new Date().toISOString().split('T')[0];
    const finalDescription = (description || '').trim();

    if (isMongoConnected()) {
      const newExpense = await Expense.create({
        title: title.trim(),
        amount: parsedAmount,
        category: finalCategory,
        date: finalDate,
        description: finalDescription,
      });

      return res.status(201).json({
        success: true,
        message: 'Expense added successfully!',
        data: newExpense,
      });
    }

    // Fallback: in-memory store
    const newId = new mongoose.Types.ObjectId().toString();
    const newExpense = {
      _id: newId,
      title: title.trim(),
      amount: parsedAmount,
      category: finalCategory,
      date: finalDate,
      description: finalDescription,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryExpenses.unshift(newExpense);

    return res.status(201).json({
      success: true,
      message: 'Expense added successfully!',
      data: newExpense,
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while creating the expense. Please try again.',
      error: error.message,
    });
  }
};

/**
 * @desc   Update an expense
 * @route  PUT /api/expenses/:id
 */
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, category, date, description } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Expense ID is required.',
      });
    }

    const updateData = {};
    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Title cannot be empty.',
        });
      }
      updateData.title = title.trim();
    }

    if (amount !== undefined) {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid amount greater than 0.',
        });
      }
      updateData.amount = parsedAmount;
    }

    if (category !== undefined) {
      updateData.category = category;
    }

    if (date !== undefined) {
      updateData.date = date;
    }

    if (description !== undefined) {
      updateData.description = description.trim();
    }

    if (isMongoConnected()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid expense ID.',
        });
      }

      const updatedExpense = await Expense.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!updatedExpense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Expense updated successfully!',
        data: updatedExpense,
      });
    }

    // Fallback: in-memory store
    const index = inMemoryExpenses.findIndex((item) => item._id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found.',
      });
    }

    inMemoryExpenses[index] = {
      ...inMemoryExpenses[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    return res.status(200).json({
      success: true,
      message: 'Expense updated successfully!',
      data: inMemoryExpenses[index],
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while updating the expense. Please try again.',
      error: error.message,
    });
  }
};

/**
 * @desc   Delete an expense
 * @route  DELETE /api/expenses/:id
 */
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Expense ID is required.',
      });
    }

    if (isMongoConnected()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid expense ID.',
        });
      }

      const deleted = await Expense.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Expense deleted successfully!',
        data: { id },
      });
    }

    // Fallback: in-memory store
    const index = inMemoryExpenses.findIndex((item) => item._id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found.',
      });
    }

    const deletedItem = inMemoryExpenses.splice(index, 1)[0];

    return res.status(200).json({
      success: true,
      message: 'Expense deleted successfully!',
      data: deletedItem,
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while deleting the expense. Please try again.',
      error: error.message,
    });
  }
};
