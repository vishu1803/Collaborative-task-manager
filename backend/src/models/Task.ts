import mongoose, { Schema } from 'mongoose';
import { ITask, TaskStatus, TaskPriority } from '../types';

const TaskSchema = new Schema<ITask>({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [100, 'Task title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    maxlength: [1000, 'Task description cannot exceed 1000 characters']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
    validate: {
      validator: function(value: Date) {
        return value > new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  priority: {
    type: String,
    enum: Object.values(TaskPriority),
    required: [true, 'Priority is required'],
    default: TaskPriority.MEDIUM
  },
  status: {
    type: String,
    enum: Object.values(TaskStatus),
    required: [true, 'Status is required'],
    default: TaskStatus.TODO
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator ID is required']
  },
  assignedToId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned user ID is required']
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for better query performance
TaskSchema.index({ creatorId: 1 });
TaskSchema.index({ assignedToId: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ dueDate: 1 });

// Compound indexes for common queries
TaskSchema.index({ assignedToId: 1, status: 1 });
TaskSchema.index({ creatorId: 1, status: 1 });

export const Task = mongoose.model<ITask>('Task', TaskSchema);
