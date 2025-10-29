'use client';

import React, { useState } from 'react';
import { Task, TaskStatus } from '@/types';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';

// Use SWR hooks directly for My Tasks since they're different from the main task list
import { useMyTasks, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';

type TaskType = 'all' | 'assigned' | 'created';

export default function MyTasksPage() {
  const [taskType, setTaskType] = useState<TaskType>('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Use SWR hooks for data fetching
  const { tasks, total, loading, error, refresh } = useMyTasks(taskType);
  const { trigger: updateTask, isMutating: isUpdating } = useUpdateTask();
  const { trigger: deleteTask, isMutating: isDeleting } = useDeleteTask();

  const handleTaskTypeChange = (type: TaskType) => {
    setTaskType(type);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsEditModalOpen(true);
  };

  const handleUpdateTask = async (taskData: any) => {
    if (!taskToEdit) return;

    try {
      await updateTask({ id: taskToEdit.id, data: taskData });
      setIsEditModalOpen(false);
      setTaskToEdit(null);
      // Refresh the tasks list
      refresh();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (task: Task) => {
    if (!window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      return;
    }

    try {
      await deleteTask(task.id);
      // Refresh the tasks list
      refresh();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleStatusChange = async (task: Task, status: TaskStatus) => {
    try {
      await updateTask({ id: task.id, data: { status } });
      // Refresh the tasks list
      refresh();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const taskTypeOptions = [
    { value: 'all', label: 'All My Tasks' },
    { value: 'assigned', label: 'Assigned to Me' },
    { value: 'created', label: 'Created by Me' },
  ];

  // Filter tasks by status for summary
  const tasksByStatus = {
    todo: tasks.filter(task => task.status === TaskStatus.TODO).length,
    inProgress: tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length,
    review: tasks.filter(task => task.status === TaskStatus.REVIEW).length,
    completed: tasks.filter(task => task.status === TaskStatus.COMPLETED).length,
  };

  const overdueTasks = tasks.filter(task => 
    new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETED
  ).length;

  const actionLoading = isUpdating || isDeleting;

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">My Tasks</h1>
              <p className="text-gray-600">View and manage your personal tasks</p>
            </div>
          </div>

          {/* Task Type Filter and Stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="mb-4 sm:mb-0">
                <Select
                  value={taskType}
                  options={taskTypeOptions}
                  onChange={(e) => handleTaskTypeChange(e.target.value as TaskType)}
                  className="min-w-[200px]"
                />
              </div>
              
              <div className="text-sm text-gray-600">
                Total: <span className="font-medium text-gray-900">{total}</span> tasks
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold text-gray-900">{tasksByStatus.todo}</div>
                <div className="text-xs text-gray-500">To Do</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-semibold text-blue-600">{tasksByStatus.inProgress}</div>
                <div className="text-xs text-gray-500">In Progress</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-semibold text-purple-600">{tasksByStatus.review}</div>
                <div className="text-xs text-gray-500">Review</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-semibold text-green-600">{tasksByStatus.completed}</div>
                <div className="text-xs text-gray-500">Completed</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-semibold text-red-600">{overdueTasks}</div>
                <div className="text-xs text-gray-500">Overdue</div>
              </div>
            </div>
          </div>

          {/* Task List */}
          <TaskList
            tasks={tasks}
            loading={loading}
            error={error}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />

          {/* Edit Task Modal */}
          <Modal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setTaskToEdit(null);
            }}
            title="Edit Task"
            size="lg"
          >
            {taskToEdit && (
              <TaskForm
                task={taskToEdit}
                onSubmit={handleUpdateTask}
                onCancel={() => {
                  setIsEditModalOpen(false);
                  setTaskToEdit(null);
                }}
                loading={actionLoading}
              />
            )}
          </Modal>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
