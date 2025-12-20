'use client';

import { useState } from 'react';
import { Task, TaskStatus } from '@/types';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { OverdueTasks } from '@/components/dashboard/OverdueTasks';
import { useTask } from '@/contexts/TaskContext';
import { useTaskStatistics } from '@/hooks/useTasks';

export default function DashboardPage() {
  const {
    tasks,
    loading,
    error,
    filters,
    pagination,
    createTask,
    updateTask,
    deleteTask,
    setFilters,
    setPage,
  } = useTask();

  const { stats, loading: statsLoading } = useTaskStatistics();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const handleFilterChange = (newFilters: any) => setFilters(newFilters);

  const handleClearFilters = () => {
    setFilters({
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      await createTask(taskData);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsEditModalOpen(true);
  };

  const handleUpdateTask = async (taskData: any) => {
    if (!taskToEdit) return;

    try {
      await updateTask(taskToEdit.id, taskData);
      setIsEditModalOpen(false);
      setTaskToEdit(null);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (task: Task) => {
    if (!window.confirm(`Are you sure you want to delete "${task.title}"?`)) return;
    try {
      await deleteTask(task.id);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleStatusChange = async (task: Task, status: TaskStatus) => {
    try {
      await updateTask(task.id, { status });
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 leading-tight">Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your tasks and track progress</p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full sm:w-auto transition-transform hover:scale-105 cursor-pointer"
            >
              Create Task
            </Button>
          </div>

          <StatsCards stats={stats} loading={statsLoading} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Recent Tasks</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    View all
                  </Button>
                </div>

                <div className="space-y-4">
                  {loading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="animate-pulse">
                          <div className="h-16 bg-gray-100 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    tasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer group"
                        onClick={() => handleEditTask(task)}
                      >
                        <div className="flex-1 min-w-0 mr-4">
                          <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
                            {task.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {task.status} • {task.priority}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTask(task);
                          }}
                          className="shrink-0 transition-transform hover:scale-105 cursor-pointer opacity-0 group-hover:opacity-100"
                        >
                          Edit
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <OverdueTasks onEditTask={handleEditTask} />
            </div>
          </div>

          <div className="space-y-6">
            <TaskFilters
              currentFilters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />

            <TaskList
              tasks={tasks}
              loading={loading}
              error={error}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
              pagination={pagination}
              onPageChange={setPage}
            />
          </div>

          <Modal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            title="Create New Task"
            size="lg"
          >
            <TaskForm
              onSubmit={handleCreateTask}
              onCancel={() => setIsCreateModalOpen(false)}
              loading={loading}
            />
          </Modal>

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
                loading={loading}
              />
            )}
          </Modal>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
