'use client';

import React, { useState, useEffect } from 'react';
import { Task, TaskStatus } from '@/types';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useTask } from '@/contexts/TaskContext';
import { taskAPI } from '@/lib/api';

interface FilterState {
  status?: TaskStatus;
  priority?: any;
  assignedToId?: string;
  creatorId?: string;
  overdue?: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

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
    refreshTasks,
  } = useTask();

  const [stats, setStats] = useState({
    total: 0,
    byStatus: { todo: 0, inProgress: 0, review: 0, completed: 0 },
    overdue: 0,
    completionRate: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await taskAPI.getTaskStatistics();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [tasks]); // Refetch stats when tasks change

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const handleCreateTask = async (taskData: any) => {
    setActionLoading(true);
    try {
      await createTask(taskData);
      setIsCreateModalOpen(false);
    } catch (error) {
      // Error is handled in the context
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsEditModalOpen(true);
  };

  const handleUpdateTask = async (taskData: any) => {
    if (!taskToEdit) return;

    setActionLoading(true);
    try {
      await updateTask(taskToEdit._id, taskData);
      setIsEditModalOpen(false);
      setTaskToEdit(null);
    } catch (error) {
      // Error is handled in the context
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTask = async (task: Task) => {
    if (!window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      return;
    }

    try {
      await deleteTask(task._id);
    } catch (error) {
      // Error is handled in the context
    }
  };

  const handleStatusChange = async (task: Task, status: TaskStatus) => {
    try {
      await updateTask(task._id, { status });
    } catch (error) {
      // Error is handled in the context
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
              loading={actionLoading}
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
                loading={actionLoading}
              />
            )}
          </Modal>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
