import { useState, useEffect } from 'react';
import { Lead } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, Users, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch('/api/leads');
        const data = await response.json();
        setLeads(data);
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  const stats = [
    { label: 'Total Leads', value: leads.length, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Value', value: `$${leads.reduce((acc, lead) => acc + lead.value, 0).toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-500' },
    { label: 'Closed Won', value: leads.filter(l => l.status === 'closed-won').length, icon: CheckCircle, color: 'bg-indigo-500' },
    { label: 'Conversion Rate', value: `${leads.length ? Math.round((leads.filter(l => l.status === 'closed-won').length / leads.length) * 100) : 0}%`, icon: TrendingUp, color: 'bg-amber-500' },
  ];

  const statusData = [
    { name: 'New', value: leads.filter(l => l.status === 'new').length },
    { name: 'Contacted', value: leads.filter(l => l.status === 'contacted').length },
    { name: 'Qualified', value: leads.filter(l => l.status === 'qualified').length },
    { name: 'Proposal', value: leads.filter(l => l.status === 'proposal').length },
    { name: 'Negotiation', value: leads.filter(l => l.status === 'negotiation').length },
    { name: 'Closed Won', value: leads.filter(l => l.status === 'closed-won').length },
    { name: 'Closed Lost', value: leads.filter(l => l.status === 'closed-lost').length },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
            <div className="flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-xl text-white`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
                <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pipeline Status Chart */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200">
          <h3 className="text-lg font-semibold text-zinc-900 mb-6">Pipeline Status Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f4f4f5' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Value Distribution */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200">
          <h3 className="text-lg font-semibold text-zinc-900 mb-6">Lead Value Share</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {statusData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-xs text-zinc-500">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity (Mock for now) */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200">
        <h3 className="text-lg font-semibold text-zinc-900 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {leads.slice(0, 5).map((lead, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    Lead <span className="text-indigo-600">"{lead.name}"</span> updated to <span className="capitalize">{lead.status}</span>
                  </p>
                  <p className="text-xs text-zinc-500">{new Date(lead.updatedAt).toLocaleString()}</p>
                </div>
              </div>
              <span className="text-xs font-medium text-zinc-400">Just now</span>
            </div>
          ))}
          {leads.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
              <p className="text-zinc-500">No recent activity found</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
