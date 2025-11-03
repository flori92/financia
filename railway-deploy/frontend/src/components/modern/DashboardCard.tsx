"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  color?: "blue" | "green" | "red" | "purple" | "orange" | "amber";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children?: ReactNode;
  onClick?: () => void;
}

const colorClasses = {
  blue: {
    bg: "bg-gradient-to-br from-blue-50 to-blue-100",
    icon: "text-blue-600",
    border: "border-blue-200",
    trend: "text-blue-600"
  },
  green: {
    bg: "bg-gradient-to-br from-green-50 to-green-100",
    icon: "text-green-600",
    border: "border-green-200",
    trend: "text-green-600"
  },
  red: {
    bg: "bg-gradient-to-br from-red-50 to-red-100",
    icon: "text-red-600",
    border: "border-red-200",
    trend: "text-red-600"
  },
  purple: {
    bg: "bg-gradient-to-br from-purple-50 to-purple-100",
    icon: "text-purple-600",
    border: "border-purple-200",
    trend: "text-purple-600"
  },
  orange: {
    bg: "bg-gradient-to-br from-orange-50 to-orange-100",
    icon: "text-orange-600",
    border: "border-orange-200",
    trend: "text-orange-600"
  },
  amber: {
    bg: "bg-gradient-to-br from-amber-50 to-amber-100",
    icon: "text-amber-600",
    border: "border-amber-200",
    trend: "text-amber-600"
  }
};

const sizeClasses = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8"
};

export function DashboardCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  color = "blue",
  size = "md",
  loading = false,
  children,
  onClick
}: DashboardCardProps) {
  const colors = colorClasses[color];
  const sizeClass = sizeClasses[size];

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${colors.bg} border ${colors.border} rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${sizeClass}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          {loading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse w-32"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          )}
          
          {trend && !loading && (
            <div className={`flex items-center mt-2 ${colors.trend}`}>
              {trend.isPositive ? (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
              <span className="text-sm font-medium">
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            </div>
          )}
          
          {description && !loading && (
            <p className="text-xs text-gray-500 mt-2">{description}</p>
          )}
        </div>
        
        <div className={`p-3 rounded-lg ${colors.bg}`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
      </div>
      
      {children && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </motion.div>
  );
}
