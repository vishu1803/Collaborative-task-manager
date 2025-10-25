'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Task, TaskPriority, TaskStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { createTaskSchema, updateTaskSchema, CreateTaskFormData, UpdateTaskFormData } from '@/lib/validations';
import { userAPI } from '@/lib/api';

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: CreateTaskFormData | UpdateTaskFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function TaskForm({ task, onSubmit, onCancel, loading = false }: TaskFormProps) {
  const [users, setUsers] = useState<Array<{ _id: string; name: string; email: string }>>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const isEditing = !!task;

  const schema = isEditing ? updateTaskSchema : createTaskSchema;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTaskFormData | UpdateTaskFormData>({
    resolver: zodResolver(schema),
    defaultValues: task ? {
      title: task.title,
      description: task.description,
      dueDate: new Date(task.dueDate).toISOString().slice(0, 16),
      priority: task.priority,
      assignedToId: task.assignedToId._id,
      ...(isEditing && { status: task.status }),
    } : {
      priority: TaskPriority.MEDIUM,
    },
  });

  // Fetch users for assignment
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await userAPI.getUsers(true);
        if (response.success && response.data) {
          setUsers(response.data.users);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const handleFormSubmit = async (data: CreateTaskFormData | UpdateTaskFormData) => {
    try {
      await onSubmit(data);
      if (!isEditing) {
        reset();
      }
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const priorityOptions = [
    { value: TaskPriority.LOW, label: 'Low' },
    { value: TaskPriority.MEDIUM, label: 'Medium' },
    { value: TaskPriority.HIGH, label: 'High' },
    { value: TaskPriority.URGENT, label: 'Urgent' },
  ];

  const statusOptions = [
    { value: TaskStatus.TODO, label: 'To Do' },
    { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
    { value: TaskStatus.REVIEW, label: 'Review' },
    { value: TaskStatus.COMPLETED, label: 'Completed' },
  ];

  const userOptions = users.map(user => ({
    value: user._id,
    label: `${user.name} (${user.email})`,
  }));

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <Input
          {...register('title')}
          label="Task Title"
          placeholder="Enter task title"
          error={errors.title?.message}
        />

        <Textarea
          {...register('description')}
          label="Description"
          placeholder="Describe the task in detail"
          rows={4}
          error={errors.description?.message}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            {...register('dueDate')}
            label="Due Date"
            type="datetime-local"
            error={errors.dueDate?.message}
          />

          <Select
            {...register('priority')}
            label="Priority"
            options={priorityOptions}
            error={errors.priority?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            {...register('assignedToId')}
            label="Assign To"
            options={userOptions}
            placeholder={loadingUsers ? 'Loading users...' : 'Select a user'}
            disabled={loadingUsers}
            error={errors.assignedToId?.message}
          />

          {isEditing && (
            <Select
              {...register('status')}
              label="Status"
              options={statusOptions}
              error={errors.status?.message}
            />
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
        >
          {isEditing ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
