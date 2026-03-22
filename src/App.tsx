import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { UserProfile } from './types';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { LeadPipeline } from './components/LeadPipeline';
import { LeadList } from './components/LeadList';
import { ActivityLogs } from './components/ActivityLogs';
import { LogIn, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'pipeline' | 'leads' | 'logs'>('dashboard');

  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem('crm_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async () => {
    try {
      const response = await fetch('/api/auth/mock', { method: 'POST' });
      const data = await response.json();
      setUser(data);
      localStorage.setItem('crm_user', JSON.stringify(data));
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('crm_user');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-zinc-200"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">RB</span>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">ResoBrand CRM</h1>
            <p className="text-zinc-500 mt-2">Sign in to manage your business operations</p>
          </div>
          
          <button
            onClick={login}
            className="w-full flex items-center justify-center gap-3 bg-white border border-zinc-200 text-zinc-700 font-medium py-3 px-4 rounded-xl hover:bg-zinc-50 transition-colors shadow-sm cursor-pointer"
          >
            <LogIn className="w-5 h-5" />
            Continue with Google
          </button>
          
          <p className="text-xs text-center text-zinc-400 mt-8">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      <Layout currentView={view} setView={(v: any) => setView(v)}>
        <AnimatePresence mode="wait">
          {view === 'dashboard' && <Dashboard key="dashboard" />}
          {view === 'pipeline' && <LeadPipeline key="pipeline" />}
          {view === 'leads' && <LeadList key="leads" />}
          {view === 'logs' && <ActivityLogs key="logs" />}
        </AnimatePresence>
      </Layout>
    </AuthContext.Provider>
  );
}
