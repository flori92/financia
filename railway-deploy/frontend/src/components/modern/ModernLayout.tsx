"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Wallet, 
  Target, 
  MessageSquare, 
  Users, 
  Settings, 
  Menu, 
  X,
  TrendingUp,
  FileText,
  CreditCard,
  Building,
  Bell,
  Search,
  User
} from "lucide-react";

interface ModernLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  href: string;
  badge?: number;
  active?: boolean;
}

const navigationItems: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/accountant/modern-dashboard"
  },
  {
    id: "treasury",
    label: "Trésorerie",
    icon: Wallet,
    href: "/treasury/modern-treasury"
  },
  {
    id: "budget",
    label: "Budget",
    icon: Target,
    href: "/budget/modern-budget"
  },
  {
    id: "communications",
    label: "Communications",
    icon: MessageSquare,
    href: "/communications/modern-communications"
  },
  {
    id: "accounting",
    label: "Comptabilité",
    icon: FileText,
    href: "/accountant"
  },
  {
    id: "sales",
    label: "Ventes",
    icon: TrendingUp,
    href: "/sales"
  },
  {
    id: "hr",
    label: "RH",
    icon: Users,
    href: "/hr"
  },
  {
    id: "banking",
    label: "Banque",
    icon: CreditCard,
    href: "/accountant/bank"
  }
];

export function ModernLayout({ children, title, subtitle }: ModernLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(3);

  useEffect(() => {
    // Détecter la page active basée sur l'URL
    const currentPath = window.location.pathname;
    const activeNav = navigationItems.find(item => 
      currentPath.includes(item.href.split('/').pop() || '')
    );
    if (activeNav) {
      setActiveItem(activeNav.id);
    }
  }, []);

  const handleNavigation = (item: NavigationItem) => {
    setActiveItem(item.id);
    window.location.href = item.href;
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -288 }}
        className="fixed left-0 top-0 z-50 w-72 h-screen bg-white shadow-xl border-r border-gray-200"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">BMS</h1>
                <p className="text-xs text-gray-600">Modern</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-500"}`} />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Paramètres</span>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        />
      )}

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Top Bar */}
        <motion.header
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30"
        >
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div>
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-600">{subtitle}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* User Menu */}
              <button className="flex items-center gap-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </button>
            </div>
          </div>
        </motion.header>

        {/* Page Content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
