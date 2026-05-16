import Task from '../models/Task.js';
import User from '../models/User.js';
import { sendTaskAssignmentEmail } from '../config/emailService.js';

export const createTask = async (req, res, next) => {
  try {
    const { title, description, status, dueDate, priority, tags } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      dueDate,
      priority,
      tags,
      user: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req, res, next) => {
  try {
    const { status, priority, sort } = req.query;

    let query = {};

    if (req.user.role === 'user') {
      query.user = req.user.id;
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    let sortOptions = {};
    if (sort === 'dueDate') {
      sortOptions.dueDate = 1;
    } else if (sort === 'priority') {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      sortOptions.priority = 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const tasks = await Task.find(query)
      .populate('user', 'username email')
      .populate('assignedBy', 'username email')
      .sort(sortOptions);

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('user', 'username email')
      .populate('assignedBy', 'username email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'user' && task.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this task' });
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'user' && task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const { title, description, status, dueDate, priority, tags } = req.body;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (dueDate) task.dueDate = dueDate;
    if (priority) task.priority = priority;
    if (tags) task.tags = tags;

    await task.save();

    res.json({
      success: true,
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'user' && task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const assignTask = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const taskId = req.params.id;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    task.user = userId;
    task.assignedBy = req.user.id;
    await task.save();

    try {
      await sendTaskAssignmentEmail(
        targetUser.email,
        targetUser.username,
        task.title,
        req.user.username
      );
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    const populatedTask = await Task.findById(taskId)
      .populate('user', 'username email')
      .populate('assignedBy', 'username email');

    res.json({
      success: true,
      message: 'Task assigned successfully',
      task: populatedTask
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskStats = async (req, res, next) => {
  try {
    let matchStage = {};
    
    if (req.user.role === 'user') {
      matchStage.user = req.user._id;
    }

    const stats = await Task.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalTasks = await Task.countDocuments(matchStage);
    const overdueTasks = await Task.countDocuments({
      ...matchStage,
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' }
    });

    res.json({
      success: true,
      stats: {
        total: totalTasks,
        overdue: overdueTasks,
        byStatus: stats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    next(error);
  }
};