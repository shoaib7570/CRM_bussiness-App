import { useState, useEffect } from 'react';
import { Lead, LeadStatus } from '../types';
import { Plus, MoreVertical, DollarSign, User, X, Loader2, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../App';

const STATUS_COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'new', label: 'New', color: 'bg-blue-500' },
  { id: 'contacted', label: 'Contacted', color: 'bg-emerald-500' },
  { id: 'qualified', label: 'Qualified', color: 'bg-indigo-500' },
  { id: 'proposal', label: 'Proposal', color: 'bg-amber-500' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-orange-500' },
  { id: 'closed-won', label: 'Closed Won', color: 'bg-violet-500' },
  { id: 'closed-lost', label: 'Closed Lost', color: 'bg-rose-500' },
];

export function LeadPipeline() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLead, setNewLead] = useState<Partial<Lead>>({
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'new',
    value: 0,
    notes: '',
  });

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

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      // Log activity
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user?.uid,
          action: `Moved lead to ${newStatus}`,
          entityId: leadId,
        }),
      });

      fetchLeads();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const leadData = {
        ...newLead,
        assignedTo: user?.uid,
      };
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });
      const createdLead = await response.json();
      
      // Log activity
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user?.uid,
          action: `Created new lead: ${newLead.name}`,
          entityId: createdLead.id,
        }),
      });

      setIsModalOpen(false);
      setNewLead({
        name: '',
        company: '',
        email: '',
        phone: '',
        status: 'new',
        value: 0,
        notes: '',
      });
      fetchLeads();
    } catch (error) {
      console.error('Error creating lead:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-zinc-500 text-sm font-medium">Visual Sales Pipeline</h3>
          <p className="text-zinc-900 font-bold text-2xl">Manage your deals</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-xl font-medium hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Add Lead
        </button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 h-full min-w-max">
          {STATUS_COLUMNS.map((column) => (
            <div key={column.id} className="w-80 flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${column.color}`} />
                  <h4 className="font-semibold text-zinc-900">{column.label}</h4>
                  <span className="text-xs font-medium text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
                    {leads.filter(l => l.status === column.id).length}
                  </span>
                </div>
                <button className="p-1 text-zinc-400 hover:text-zinc-900 rounded-lg transition-colors cursor-pointer">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 bg-zinc-100/50 rounded-2xl p-3 space-y-3 overflow-y-auto">
                {leads
                  .filter(l => l.status === column.id)
                  .map((lead) => (
                    <motion.div
                      layoutId={lead.id}
                      key={lead.id}
                      className="bg-white p-4 rounded-xl shadow-sm border border-zinc-200 cursor-grab active:cursor-grabbing group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                          {lead.company || 'No Company'}
                        </span>
                        <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
                          <DollarSign className="w-3 h-3" />
                          {lead.value.toLocaleString()}
                        </div>
                      </div>
                      <h5 className="font-bold text-zinc-900 mb-3 group-hover:text-indigo-600 transition-colors">
                        {lead.name}
                      </h5>
                      
                      <div className="space-y-2 mb-4">
                        {lead.phone && (
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </div>
                        )}
                        {lead.email && (
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-zinc-100 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-zinc-400" />
                          </div>
                          <span className="text-[10px] text-zinc-400 font-medium">Assigned</span>
                        </div>
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                          className="text-[10px] font-bold text-zinc-500 bg-zinc-50 border-none rounded-lg px-2 py-1 cursor-pointer focus:ring-0"
                        >
                          {STATUS_COLUMNS.map(col => (
                            <option key={col.id} value={col.id}>{col.label}</option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Lead Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-zinc-900">Add New Lead</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-zinc-400 hover:text-zinc-900 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateLead} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Lead Name</label>
                    <input
                      required
                      type="text"
                      value={newLead.name}
                      onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Company</label>
                    <input
                      type="text"
                      value={newLead.company}
                      onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none"
                      placeholder="Acme Corp"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Email</label>
                    <input
                      type="email"
                      value={newLead.email}
                      onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Phone</label>
                    <input
                      type="tel"
                      value={newLead.phone}
                      onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none"
                      placeholder="+1 234 567 890"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Value ($)</label>
                    <input
                      required
                      type="number"
                      value={newLead.value}
                      onChange={(e) => setNewLead({ ...newLead, value: Number(e.target.value) })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Initial Status</label>
                    <select
                      value={newLead.status}
                      onChange={(e) => setNewLead({ ...newLead, status: e.target.value as LeadStatus })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none"
                    >
                      {STATUS_COLUMNS.map(col => (
                        <option key={col.id} value={col.id}>{col.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Notes</label>
                  <textarea
                    value={newLead.notes}
                    onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none h-24 resize-none"
                    placeholder="Add any initial context..."
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-zinc-100 text-zinc-700 font-bold py-3 rounded-xl hover:bg-zinc-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-zinc-900 text-white font-bold py-3 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    Create Lead
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
