"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle, XCircle } from "lucide-react";

type AlertType = "info" | "success" | "warning" | "error" | "critical";

interface SmartAlertProps {
  type: AlertType;
  title: string;
  message?: string;
  description?: string;
  dismissible?: boolean;
  autoClose?: boolean;
  duration?: number;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "danger";
  }[];
  icon?: React.ReactNode;
  className?: string;
}

const alertConfig = {
  info: {
    icon: Info,
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    iconColor: "text-blue-600",
    titleColor: "text-blue-900"
  },
  success: {
    icon: CheckCircle,
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800",
    iconColor: "text-green-600",
    titleColor: "text-green-900"
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    iconColor: "text-amber-600",
    titleColor: "text-amber-900"
  },
  error: {
    icon: XCircle,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    iconColor: "text-red-600",
    titleColor: "text-red-900"
  },
  critical: {
    icon: AlertCircle,
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-800",
    iconColor: "text-rose-600",
    titleColor: "text-rose-900"
  }
};

export function SmartAlert({
  type,
  title,
  message,
  description,
  dismissible = true,
  autoClose = false,
  duration = 5000,
  actions = [],
  icon,
  className = ""
}: SmartAlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const config = alertConfig[type];
  const IconComponent = config.icon;

  useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, isVisible]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className={`${config.bg} ${config.border} border rounded-xl p-4 ${className} ${
          isClosing ? "opacity-0 scale-95" : ""
        }`}
      >
        <div className="flex">
          <div className="flex-shrink-0">
            {icon || <IconComponent className={`w-5 h-5 ${config.iconColor}`} />}
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium ${config.titleColor}`}>
              {title}
            </h3>
            {(message || description) && (
              <div className={`mt-2 text-sm ${config.text}`}>
                {message || description}
              </div>
            )}
            
            {actions.length > 0 && (
              <div className="mt-4 flex gap-2">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      action.variant === "primary"
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : action.variant === "danger"
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {dismissible && (
            <div className="ml-auto pl-3">
              <button
                onClick={handleClose}
                className={`inline-flex ${config.text} hover:opacity-75 transition-opacity`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook pour gérer les alerts globales
export function useSmartAlert() {
  const [alerts, setAlerts] = useState<Array<SmartAlertProps & { id: string }>>([]);

  const addAlert = (alert: Omit<SmartAlertProps, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setAlerts(prev => [...prev, { ...alert, id }]);
    return id;
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const clearAll = () => {
    setAlerts([]);
  };

  // Méthodes pratiques
  const showSuccess = (title: string, message?: string) => {
    return addAlert({ type: "success", title, message });
  };

  const showError = (title: string, message?: string) => {
    return addAlert({ type: "error", title, message });
  };

  const showWarning = (title: string, message?: string) => {
    return addAlert({ type: "warning", title, message });
  };

  const showInfo = (title: string, message?: string) => {
    return addAlert({ type: "info", title, message });
  };

  const showCritical = (title: string, message?: string, actions?: SmartAlertProps["actions"]) => {
    return addAlert({ 
      type: "critical", 
      title, 
      message, 
      autoClose: false, 
      dismissible: false,
      actions 
    });
  };

  return {
    alerts,
    addAlert,
    removeAlert,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showCritical
  };
}

// Composant pour afficher les alerts globales
export function SmartAlertContainer() {
  const { alerts, removeAlert } = useSmartAlert();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      <AnimatePresence>
        {alerts.map((alert) => (
          <SmartAlert
            key={alert.id}
            {...alert}
            dismissible={alert.dismissible !== false}
            onClose={() => removeAlert(alert.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
