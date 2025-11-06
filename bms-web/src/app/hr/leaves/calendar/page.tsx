'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLeaves } from '@/hooks/useLeaves';
import { LeaveStatusBadge } from '@/components/hr/LeaveStatusBadge';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

const COMPANY_ID = 'e611a153-8dd5-41dd-bb8e-9434766a0dfd';

export default function LeaveCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { leaves, loading } = useLeaves({ companyId: COMPANY_ID });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getLeavesForDay = (day: Date) => {
    return leaves.filter((leave) => {
      const leaveStart = new Date(leave.startDate);
      const leaveEnd = new Date(leave.endDate);
      return isWithinInterval(day, { start: leaveStart, end: leaveEnd });
    });
  };

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/hr/leaves" className="btn-secondary">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendrier des Congés</h1>
            <p className="text-gray-600 mt-1">Vue mensuelle des absences</p>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={previousMonth} className="btn-secondary p-2">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </h2>
          <button onClick={nextMonth} className="btn-secondary p-2">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Week Days Header */}
          {weekDays.map((day) => (
            <div key={day} className="text-center font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}

          {/* Empty cells for days before month start */}
          {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Calendar Days */}
          {daysInMonth.map((day) => {
            const dayLeaves = getLeavesForDay(day);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={`aspect-square border rounded-lg p-2 ${
                  isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                } ${!isSameMonth(day, currentDate) ? 'opacity-50' : ''}`}
              >
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayLeaves.slice(0, 2).map((leave) => (
                    <Link
                      key={leave.id}
                      href={`/hr/leaves/${leave.id}`}
                      className="block"
                    >
                      <div className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded truncate hover:bg-blue-200">
                        {leave.employee.firstName} {leave.employee.lastName.charAt(0)}.
                      </div>
                    </Link>
                  ))}
                  {dayLeaves.length > 2 && (
                    <div className="text-xs text-gray-500 px-1">
                      +{dayLeaves.length - 2} autre{dayLeaves.length - 2 > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Légende</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 rounded"></div>
            <span className="text-sm text-gray-600">Congé en cours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Aujourd'hui</span>
          </div>
        </div>
      </div>

      {/* Upcoming Leaves */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Congés à venir</h3>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {leaves
              .filter((leave) => new Date(leave.startDate) >= new Date() && leave.status === 'approved')
              .slice(0, 5)
              .map((leave) => (
                <Link
                  key={leave.id}
                  href={`/hr/leaves/${leave.id}`}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {leave.employee.firstName} {leave.employee.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(leave.startDate), 'dd MMM', { locale: fr })} -{' '}
                      {format(new Date(leave.endDate), 'dd MMM yyyy', { locale: fr })}
                    </p>
                  </div>
                  <LeaveStatusBadge status={leave.status} />
                </Link>
              ))}
            {leaves.filter((leave) => new Date(leave.startDate) >= new Date() && leave.status === 'approved').length === 0 && (
              <p className="text-gray-500 text-center py-4">Aucun congé à venir</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
