"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface SmartChartProps {
  data: any[];
  type: "line" | "area" | "bar" | "pie";
  title?: string;
  subtitle?: string;
  height?: number;
  colors?: string[];
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  animated?: boolean;
  formatY?: (value: number) => string;
  formatX?: (value: string | number) => string;
  onDataPointClick?: (data: any) => void;
}

const defaultColors = [
  "#3B82F6", // blue-500
  "#10B981", // emerald-500  
  "#F59E0B", // amber-500
  "#EF4444", // red-500
  "#8B5CF6", // violet-500
  "#EC4899", // pink-500
  "#6366F1", // indigo-500
  "#14B8A6", // teal-500
];

const CustomTooltip = ({ active, payload, label, formatY }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatY ? formatY(entry.value) : entry.value.toLocaleString('fr-FR')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function SmartChart({
  data,
  type,
  title,
  subtitle,
  height = 300,
  colors = defaultColors,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  animated = true,
  formatY = (value) => value.toLocaleString('fr-FR'),
  formatX = (value) => value.toString(),
  onDataPointClick
}: SmartChartProps) {
  const [chartData, setChartData] = useState(data);
  const [selectedDataPoint, setSelectedDataPoint] = useState<any>(null);

  useEffect(() => {
    setChartData(data);
  }, [data]);

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (type) {
      case "line":
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              tickFormatter={formatX}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={formatY}
            />
            {showTooltip && <Tooltip content={<CustomTooltip formatY={formatY} />} />}
            {showLegend && <Legend />}
            {Object.keys(chartData[0] || {})
              .filter(key => key !== 'name')
              .map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ fill: colors[index % colors.length], r: 4 }}
                  activeDot={{ r: 6, onClick: onDataPointClick }}
                  animationDuration={animated ? 1500 : 0}
                />
              ))}
          </LineChart>
        );

      case "area":
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              tickFormatter={formatX}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={formatY}
            />
            {showTooltip && <Tooltip content={<CustomTooltip formatY={formatY} />} />}
            {showLegend && <Legend />}
            {Object.keys(chartData[0] || {})
              .filter(key => key !== 'name')
              .map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.3}
                  strokeWidth={2}
                  animationDuration={animated ? 1500 : 0}
                />
              ))}
          </AreaChart>
        );

      case "bar":
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              tickFormatter={formatX}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={formatY}
            />
            {showTooltip && <Tooltip content={<CustomTooltip formatY={formatY} />} />}
            {showLegend && <Legend />}
            {Object.keys(chartData[0] || {})
              .filter(key => key !== 'name')
              .map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={colors[index % colors.length]}
                  animationDuration={animated ? 1500 : 0}
                  onClick={onDataPointClick}
                />
              ))}
          </BarChart>
        );

      case "pie":
        return (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              animationDuration={animated ? 1500 : 0}
              onClick={onDataPointClick}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
      
      {selectedDataPoint && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
        >
          <p className="text-sm font-medium text-blue-900">
            Point sélectionné: {JSON.stringify(selectedDataPoint, null, 2)}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
