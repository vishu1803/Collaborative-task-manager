'use client';

import { useState } from 'react';
import { Task, TaskStatus } from '@/types';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
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
        <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 leading-tight">
                My Tasks
              </h1>
              <p className="text-gray-600 mt-1">View and manage your personal tasks</p>
            </div>
          </div>

          {/* Task Type Filter and Stats */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="w-full sm:w-auto">
                <Select
                  value={taskType}
                  options={taskTypeOptions}
                  onChange={(e) => handleTaskTypeChange(e.target.value as TaskType)}
                  className="w-full sm:min-w-[200px]"
                />
              </div>
              
              <div className="text-sm text-gray-600 whitespace-nowrap">
                Total: <span className="font-medium text-gray-900">{total}</span> tasks
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'To Do', value: tasksByStatus.todo, color: 'gray' },
                { label: 'In Progress', value: tasksByStatus.inProgress, color: 'blue' },
                { label: 'Review', value: tasksByStatus.review, color: 'purple' },
                { label: 'Completed', value: tasksByStatus.completed, color: 'green' },
                { label: 'Overdue', value: overdueTasks, color: 'red' }
              ].map(({ label, value, color }) => (
                <div 
                  key={label}
                  className={`text-center p-4 bg-${color}-50 rounded-lg hover:bg-${color}-100 transition-colors duration-200 cursor-default`}
                >
                  <div className={`text-lg font-semibold text-${color}-${color === 'gray' ? '900' : '600'}`}>
                    {loading ? (
                      <div className="h-6 w-12 bg-gray-200 rounded animate-pulse mx-auto" />
                    ) : value}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Task List with loading state */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <TaskList
              tasks={tasks}
              loading={loading}
              error={error}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          </div>

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
