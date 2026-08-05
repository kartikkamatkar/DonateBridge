import React from 'react';
import { motion } from 'framer-motion';

const BADGE_COLORS = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  MATCHED: 'bg-primary/10 text-primary border-primary/20',
  DELIVERED: 'bg-slate-50 text-slate-700 border-slate-200'
};

export default function StatusStamp({ status, className = '' }) {
  if (!status) return null;

  const statusKey = status.toUpperCase();
  const colorClass = BADGE_COLORS[statusKey] || 'bg-slate-50 text-slate-600 border-slate-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${colorClass} ${className}`}
    >
      {status}
    </span>
  );
}
