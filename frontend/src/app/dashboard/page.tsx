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

// Use the unified context that wraps SWR
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
  } = useTask(); // This now uses SWR internally

  // Use SWR hook directly for stats
  const { stats, loading: statsLoading } = useTaskStatistics();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

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
    if (!window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      return;
    }

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
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Manage your tasks and track progress</p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Create Task
            </Button>
          </div>

          {/* Stats Cards */}
          <StatsCards stats={stats} loading={statsLoading} />

          {/* Dashboard Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              {/* Recent Tasks Preview */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Recent Tasks</h3>
                  <Button variant="ghost" size="sm">
                    View all
                  </Button>
                </div>
                <div className="space-y-3">
                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="animate-pulse">
                          <div className="h-16 bg-gray-200 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    tasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {task.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {task.status} • {task.priority}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditTask(task)}
                        >
                          Edit
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <OverdueTasks onEditTask={handleEditTask} />
            </div>
          </div>

          {/* Filters */}
          <TaskFilters
            currentFilters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />

          {/* Task List */}
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

          {/* Create Task Modal */}
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
                loading={loading}
              />
            )}
          </Modal>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
