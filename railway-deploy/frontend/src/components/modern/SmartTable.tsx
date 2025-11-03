"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
} from "lucide-react";

interface Column<T> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  format?: (value: any, row: T) => React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
}

interface SmartTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  pagination?: {
    enabled: boolean;
    pageSize?: number;
  };
  actions?: {
    view?: (row: T) => void;
    edit?: (row: T) => void;
    delete?: (row: T) => void;
  };
  onRowClick?: (row: T) => void;
  emptyState?: {
    title: string;
    description: string;
    icon?: React.ReactNode;
  };
  className?: string;
}

export function SmartTable<T extends { id?: string | number }>({
  data,
  columns,
  loading = false,
  searchable = true,
  filterable = true,
  sortable = true,
  pagination = { enabled: true, pageSize: 10 },
  actions,
  onRowClick,
  emptyState,
  className = ""
}: SmartTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Filtrer et trier les données
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Recherche
    if (searchTerm) {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filtres
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(row =>
          row[key as keyof T]?.toString().toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    // Tri
    if (sortColumn) {
      filtered.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        let comparison = 0;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal;
        } else {
          comparison = aVal.toString().localeCompare(bVal.toString());
        }
        
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [data, searchTerm, filters, sortColumn, sortDirection]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (!pagination.enabled) return processedData;
    
    const startIndex = (currentPage - 1) * (pagination.pageSize || 10);
    const endIndex = startIndex + (pagination.pageSize || 10);
    return processedData.slice(startIndex, endIndex);
  }, [processedData, currentPage, pagination]);

  const totalPages = Math.ceil(processedData.length / (pagination.pageSize || 10));

  const handleSort = (column: keyof T) => {
    if (!sortable) return;
    
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleFilter = (column: keyof T, value: string) => {
    setFilters(prev => ({
      ...prev,
      [column as string]: value
    }));
  };

  const getCellValue = (row: T, column: Column<T>) => {
    const value = row[column.key];
    return column.format ? column.format(value, row) : value?.toString() || "-";
  };

  const getAlignClass = (align?: string) => {
    switch (align) {
      case "center": return "text-center";
      case "right": return "text-right";
      default: return "text-left";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}
    >
      {/* Header avec recherche et filtres */}
      {(searchable || filterable) && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            {searchable && (
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
            
            {filterable && (
              <div className="flex gap-2">
                {columns.filter(col => col.filterable).map(column => (
                  <input
                    key={column.key as string}
                    type="text"
                    placeholder={`Filtrer ${column.title}`}
                    value={filters[column.key as string] || ""}
                    onChange={(e) => handleFilter(column.key, e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ))}
              </div>
            )}
            
            <div className="flex gap-2">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tableau */}
      <div className="overflow-x-auto">
        {paginatedData.length === 0 ? (
          <div className="p-12 text-center">
            {emptyState?.icon || <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4"></div>}
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {emptyState?.title || "Aucune donnée"}
            </h3>
            <p className="text-gray-600">
              {emptyState?.description || "Aucun résultat trouvé"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key as string}
                    className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${getAlignClass(column.align)} ${
                      column.sortable ? "cursor-pointer hover:bg-gray-100" : ""
                    }`}
                    style={{ width: column.width }}
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.title}
                      {column.sortable && sortColumn === column.key && (
                        sortDirection === "asc" ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      }
                    </div>
                  </th>
                ))}
                {actions && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.map((row, index) => (
                <motion.tr
                  key={row.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`hover:bg-gray-50 cursor-pointer ${onRowClick ? "cursor-pointer" : ""}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key as string}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${getAlignClass(column.align)}`}
                    >
                      {getCellValue(row, column)}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {actions.view && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              actions.view?.(row);
                            }}
                            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {actions.edit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              actions.edit?.(row);
                            }}
                            className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {actions.delete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              actions.delete?.(row);
                            }}
                            className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.enabled && totalPages > 1 && (
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Affichage de {(currentPage - 1) * (pagination.pageSize || 10) + 1} à{" "}
              {Math.min(currentPage * (pagination.pageSize || 10), processedData.length)} sur{" "}
              {processedData.length} résultats
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 text-sm border rounded-lg ${
                    currentPage === i + 1
                      ? "bg-blue-500 text-white border-blue-500"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
