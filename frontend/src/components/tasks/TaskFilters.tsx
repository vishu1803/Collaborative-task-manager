'use client';

import { useState } from 'react';
import { TaskStatus, TaskPriority } from '@/types';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';


interface TaskFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  currentFilters: FilterState;
}

interface FilterState {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: string;
  creatorId?: string;
  overdue?: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export function TaskFilters({ onFilterChange, onClearFilters, currentFilters }: TaskFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: TaskStatus.TODO, label: 'To Do' },
    { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
    { value: TaskStatus.REVIEW, label: 'Review' },
    { value: TaskStatus.COMPLETED, label: 'Completed' },
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: TaskPriority.LOW, label: 'Low' },
    { value: TaskPriority.MEDIUM, label: 'Medium' },
    { value: TaskPriority.HIGH, label: 'High' },
    { value: TaskPriority.URGENT, label: 'Urgent' },
  ];

  const sortByOptions = [
    { value: 'createdAt', label: 'Created Date' },
    { value: 'updatedAt', label: 'Updated Date' },
    { value: 'dueDate', label: 'Due Date' },
    { value: 'title', label: 'Title' },
    { value: 'priority', label: 'Priority' },
    { value: 'status', label: 'Status' },
  ];

  const sortOrderOptions = [
    { value: 'desc', label: 'Descending' },
    { value: 'asc', label: 'Ascending' },
  ];

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = {
      ...currentFilters,
      [key]: value === '' ? undefined : value,
    };
    onFilterChange(newFilters);
  };

  const hasActiveFilters = Object.keys(currentFilters).some(key => {
    const value = currentFilters[key as keyof FilterState];
    return value !== undefined && value !== '' && 
           !(key === 'sortBy' && value === 'createdAt') && 
           !(key === 'sortOrder' && value === 'desc');
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">Filters & Sorting</h3>
        <div className="flex items-center space-x-3">
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="cursor-pointer"
            >
              Clear Filters
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="cursor-pointer"
          >
            {isExpanded ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          size="sm"
          variant={currentFilters.overdue ? 'primary' : 'outline'}
          onClick={() => handleFilterChange('overdue', !currentFilters.overdue)}
          className="cursor-pointer transition-transform hover:scale-105"
        >
          Overdue Tasks
        </Button>
        <Button
          size="sm"
          variant={currentFilters.status === TaskStatus.TODO ? 'primary' : 'outline'}
          onClick={() => handleFilterChange('status', 
            currentFilters.status === TaskStatus.TODO ? '' : TaskStatus.TODO
          )}
          className="cursor-pointer transition-transform hover:scale-105"
        >
          To Do
        </Button>
        <Button
          size="sm"
          variant={currentFilters.status === TaskStatus.IN_PROGRESS ? 'primary' : 'outline'}
          onClick={() => handleFilterChange('status', 
            currentFilters.status === TaskStatus.IN_PROGRESS ? '' : TaskStatus.IN_PROGRESS
          )}
          className="cursor-pointer transition-transform hover:scale-105"
        >
          In Progress
        </Button>
        <Button
          size="sm"
          variant={currentFilters.priority === TaskPriority.URGENT ? 'primary' : 'outline'}
          onClick={() => handleFilterChange('priority', 
            currentFilters.priority === TaskPriority.URGENT ? '' : TaskPriority.URGENT
          )}
          className="cursor-pointer transition-transform hover:scale-105"
        >
          Urgent
        </Button>
      </div>

      {/* Detailed Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          <Select
            label="Status"
            value={currentFilters.status || ''}
            options={statusOptions}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="cursor-pointer"
          />

          <Select
            label="Priority"
            value={currentFilters.priority || ''}
            options={priorityOptions}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="cursor-pointer"
          />

          <Select
            label="Sort By"
            value={currentFilters.sortBy}
            options={sortByOptions}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="cursor-pointer"
          />

          <Select
            label="Sort Order"
            value={currentFilters.sortOrder}
            options={sortOrderOptions}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            className="cursor-pointer"
          />
        </div>
      )}
    </div>
  );
}
