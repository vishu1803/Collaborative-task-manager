'use client';

import React from 'react';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETED;
  const dueDate = new Date(task.dueDate);

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return 'bg-red-100 text-red-800 border-red-200';
      case TaskPriority.HIGH:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case TaskPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case TaskPriority.LOW:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'bg-gray-100 text-gray-800';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case TaskStatus.REVIEW:
        return 'bg-purple-100 text-purple-800';
      case TaskStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (currentStatus: TaskStatus): TaskStatus | null => {
    switch (currentStatus) {
      case TaskStatus.TODO:
        return TaskStatus.IN_PROGRESS;
      case TaskStatus.IN_PROGRESS:
        return TaskStatus.REVIEW;
      case TaskStatus.REVIEW:
        return TaskStatus.COMPLETED;
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus(task.status);

  return (
    <div className={clsx(
      'bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow',
      isOverdue && 'border-red-300 bg-red-50'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {task.title}
          </h3>
          <div className="flex items-center space-x-2 mt-2">
            <span className={clsx(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
              getPriorityColor(task.priority)
            )}>
              {task.priority}
            </span>
            <span className={clsx(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              getStatusColor(task.status)
            )}>
              {task.status}
            </span>
            {isOverdue && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Overdue
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {task.description}
      </p>

      {/* Task Details */}
      <div className="space-y-2 text-sm text-gray-500 mb-4">
        <div className="flex justify-between">
          <span>Assigned to:</span>
          <span className="font-medium text-gray-900">
            {task.assignedToId.name}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Created by:</span>
          <span className="font-medium text-gray-900">
            {task.creatorId.name}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Due date:</span>
          <span className={clsx(
            'font-medium',
            isOverdue ? 'text-red-600' : 'text-gray-900'
          )}>
            {dueDate.toLocaleDateString()} at {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Created:</span>
          <span>{formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(task)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(task)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Delete
          </Button>
        </div>

        {nextStatus && (
          <Button
            size="sm"
            onClick={() => onStatusChange(task, nextStatus)}
          >
            Move to {nextStatus}
          </Button>
        )}
      </div>
    </div>
  );
}
