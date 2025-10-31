'use client';

import { useState, useEffect } from 'react';
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
  // ✅ Fix 1: Initialize with empty array to prevent undefined
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);
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
      // ✅ Fix 2: Safe access to assignedToId
      assignedToId: typeof task.assignedToId === 'string' 
        ? task.assignedToId 
        : task.assignedToId?.id || '',
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
          // ✅ Fix 3: Handle different response structures
          const userData = response.data.users || response.data;
          setUsers(Array.isArray(userData) ? userData : []);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
        // ✅ Fix 4: Set empty array on error
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const handleFormSubmit = async (data: CreateTaskFormData | UpdateTaskFormData) => {
  try {
    // ✅ Debug logging - let's see what's actually being sent
    console.log('🔍 DEBUG - Form data being submitted:', {
      assignedToId: data.assignedToId,
      assignedToIdType: typeof data.assignedToId,
      assignedToIdLength: data.assignedToId?.length,
      rawData: data
    });
    
    await onSubmit(data);
    if (!isEditing) reset();
  } catch (error) {
    console.error('❌ TaskForm submission error:', error);
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

  // ✅ Fix 5: Safe mapping with fallback
  const userOptions = (users || []).map(user => ({
    value: user.id,
    label: `${user.name} (${user.email})`,
  }));

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 gap-6">
        {/* Task Basic Info Section */}
        <div className="space-y-6 rounded-lg bg-gray-50 p-4">
          <Input
            {...register('title')}
            label="Task Title"
            placeholder="Enter task title"
            error={errors.title?.message || ''}
            className="bg-white"
          />

          <Textarea
            {...register('description')}
            label="Description"
            placeholder="Describe the task in detail"
            rows={4}
            error={errors.description?.message || ''}
            className="bg-white"
          />
        </div>

        {/* Task Details Section */}
        <div className="space-y-6 rounded-lg bg-gray-50 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              {...register('dueDate')}
              label="Due Date"
              type="datetime-local"
              error={errors.dueDate?.message || ''}
              className="bg-white"
            />

            <Select
              {...register('priority')}
              label="Priority"
              options={priorityOptions}
              error={errors.priority?.message || ''}
              className="bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              {...register('assignedToId')}
              label="Assign To"
              options={userOptions}
              placeholder={loadingUsers ? 'Loading users...' : 'Select a user'}
              disabled={loadingUsers}
              error={errors.assignedToId?.message || ''}
              className={`bg-white ${loadingUsers ? 'animate-pulse' : ''}`}
            />

            {isEditing && (
              <Select
                {...register('status')}
                label="Status"
                options={statusOptions}
                error={(errors as any).status?.message || ''}
                className="bg-white"
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="w-full sm:w-auto transition-transform hover:scale-105 cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
          className="w-full sm:w-auto transition-transform hover:scale-105 cursor-pointer"
        >
          {isEditing ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
