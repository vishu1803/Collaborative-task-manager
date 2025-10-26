'use client';

import React from 'react';
import { Task } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { useOverdueTasks } from '@/hooks/useTasks';

interface OverdueTasksProps {
  onEditTask: (task: Task) => void;
}

export function OverdueTasks({ onEditTask }: OverdueTasksProps) {
  const { tasks: overdueTasks, loading, error } = useOverdueTasks();
  
  // Show only first 5 tasks
  const displayTasks = overdueTasks.slice(0, 5);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Overdue Tasks</h3>
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Overdue Tasks</h3>
        <div className="text-center py-4 text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Overdue Tasks</h3>
        {displayTasks.length > 0 && (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {overdueTasks.length}
          </span>
        )}
      </div>

      {displayTasks.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-4xl mb-2">🎉</div>
          <p className="text-sm text-gray-500">No overdue tasks!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayTasks.map((task) => (
            <div
              key={task._id}
              className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {task.title}
                </h4>
                <p className="text-xs text-gray-500">
                  Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEditTask(task)}
                className="ml-3"
              >
                Update
              </Button>
            </div>
          ))}
          
          {overdueTasks.length > 5 && (
            <div className="text-center pt-2">
              <Button variant="ghost" size="sm">
                View all {overdueTasks.length} overdue tasks
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
