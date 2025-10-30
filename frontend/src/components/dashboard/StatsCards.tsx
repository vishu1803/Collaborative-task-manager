'use client';


import { clsx } from 'clsx';

interface StatsCardsProps {
  stats: {
    total: number;
    byStatus: {
      todo: number;
      inProgress: number;
      review: number;
      completed: number;
    };
    overdue: number;
    completionRate: number;
  };
  loading?: boolean;
}

export function StatsCards({ stats, loading = false }: StatsCardsProps) {
  const cards = [
    {
      name: 'Total Tasks',
      value: stats.total,
      icon: '📋',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      name: 'Completed',
      value: stats.byStatus.completed,
      icon: '✅',
      color: 'bg-green-50 text-green-600',
    },
    {
      name: 'In Progress',
      value: stats.byStatus.inProgress,
      icon: '🔄',
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      name: 'Overdue',
      value: stats.overdue,
      icon: '⚠️',
      color: 'bg-red-50 text-red-600',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <div
          key={card.name}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{card.name}</p>
              <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
            </div>
            <div className={clsx('p-3 rounded-full text-2xl', card.color)}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}

      {/* Completion Rate Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow md:col-span-2 lg:col-span-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Completion Rate</h3>
          <span className="text-2xl font-semibold text-gray-900">
            {Math.round(stats.completionRate)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.round(stats.completionRate)}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>{stats.byStatus.completed} completed</span>
          <span>{stats.total - stats.byStatus.completed} remaining</span>
        </div>
      </div>
    </div>
  );
}
