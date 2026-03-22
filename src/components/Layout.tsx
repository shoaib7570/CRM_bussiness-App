import { ReactNode } from 'react';
import { useAuth } from '../App';
import { LayoutDashboard, Kanban, Users, History, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';

interface LayoutProps {
  children: ReactNode;
  currentView: string;
  setView: (view: 'dashboard' | 'pipeline' | 'leads' | 'logs') => void;
}

export function Layout({ children, currentView, setView }: LayoutProps) {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pipeline', label: 'Sales Pipeline', icon: Kanban },
    { id: 'leads', label: 'Leads & Customers', icon: Users },
    { id: 'logs', label: 'Activity Logs', icon: History, roles: ['admin', 'manager'] },
  ];

  const filteredNavItems = navItems.filter(item => !item.roles || item.roles.includes(user?.role || ''));

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-zinc-200 transition-all duration-300 flex flex-col`}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RB</span>
              </div>
              <span className="font-bold text-zinc-900">ResoBrand</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">RB</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {filteredNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                currentView === item.id 
                  ? 'bg-zinc-900 text-white' 
                  : 'text-zinc-500 hover:bg-zinc-100'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <div className={`flex items-center gap-3 ${isSidebarOpen ? 'px-2' : 'justify-center'}`}>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 truncate">{user?.displayName}</p>
                <p className="text-xs text-zinc-500 capitalize">{user?.role}</p>
              </div>
            )}
            <button 
              onClick={logout}
              className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-bottom border-zinc-200 flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-zinc-900 capitalize">
            {currentView.replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
