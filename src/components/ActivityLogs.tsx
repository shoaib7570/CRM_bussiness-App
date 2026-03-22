import { useState, useEffect } from 'react';
import { ActivityLog } from '../types';
import { History, User, Clock, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';

export function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/logs');
        const data = await response.json();
        setLogs(data);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-900 text-white rounded-lg">
              <History className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Audit Trail</h3>
          </div>
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">Last 50 Actions</span>
        </div>

        <div className="divide-y divide-zinc-100">
          {logs.map((log, i) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              key={log.id}
              className="p-6 flex items-start gap-4 hover:bg-zinc-50/50 transition-colors"
            >
              <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 mb-1">
                  <p className="text-sm font-bold text-zinc-900">
                    User <span className="text-indigo-600 font-mono text-xs">{log.uid.slice(0, 8)}...</span>
                  </p>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                  </div>
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed">{log.action}</p>
                {log.entityId && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Entity ID:</span>
                    <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                      {log.entityId}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {logs.length === 0 && (
            <div className="p-12 text-center text-zinc-500">
              No activity logs found yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
