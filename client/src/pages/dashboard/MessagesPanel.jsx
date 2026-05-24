import React from 'react';
import { Mail, User, Clock } from 'lucide-react';

export function MessagesPanel({ messages = [], title = 'Contact Messages' }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-black text-base">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Messages routed from the public contact form</p>
      </div>

      <div className="space-y-3">
        {messages.map((item) => (
          <div key={item.id} className="glass-surface rounded-2xl p-5 border border-slate-200/40 dark:border-slate-800/40">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
              <div>
                <h4 className="font-black text-sm flex items-center gap-2"><Mail size={15} className="text-[hsl(var(--primary))]" /> {item.subject}</h4>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-2"><User size={12} /> {item.name} · {item.email}</p>
              </div>
              <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1"><Clock size={11} /> {item.time}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">{item.message}</p>
          </div>
        ))}
        {!messages.length && (
          <div className="glass-surface rounded-2xl p-8 text-center text-sm text-slate-500">
            No contact messages yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default MessagesPanel;
