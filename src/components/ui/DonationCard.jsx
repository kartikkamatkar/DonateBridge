import React from 'react';
import StatusStamp from './StatusStamp';
import { MapPin, Box, Tag, Calendar, ShieldCheck, Heart, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DonationCard({
  donation,
  matchScoreDetails,
  onApprove,
  onReject,
  onClaim,
  actions = null
}) {
  const {
    id,
    donorName,
    category,
    condition,
    quantity,
    description,
    photos,
    location,
    status,
    submittedAt
  } = donation;

  const dateFormatted = new Date(submittedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-white border border-border rounded-2xl p-6 shadow-premium-sm hover:shadow-premium-md flex flex-col md:flex-row gap-6 relative"
    >
      {/* Left side thumbnail / Category indicator */}
      <div className="shrink-0 flex md:flex-col items-center justify-between border-b md:border-b-0 md:border-r border-border pb-4 md:pb-0 md:pr-6 md:w-48">
        <div className="text-center md:w-full space-y-2">
          <span className="font-mono text-[10px] text-slate-400 block tracking-wider uppercase">REFERENCE ID</span>
          <span className="text-sm font-semibold font-mono text-ink">{id}</span>
          
          <div className="mt-2 text-center md:flex justify-center hidden">
            <StatusStamp status={status} />
          </div>
        </div>

        <div className="flex md:flex-col gap-2 md:mt-4 w-full justify-center md:items-center">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-50 border border-border text-xs text-slate-600 font-medium">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            {category}
          </span>
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 justify-center mt-1">
            <Calendar className="w-3.5 h-3.5" />
            {dateFormatted}
          </span>
        </div>
      </div>

      {/* Right side info details */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="text-display-md text-lg text-ink font-semibold">
              {donation.itemName || `${quantity}x ${category} Request`}
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
              Condition: {condition}
            </span>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            {description || "No description provided."}
          </p>

          {/* Photos list */}
          {photos && photos.length > 0 && (
            <div className="flex gap-2.5 overflow-x-auto py-1">
              {photos.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`${category} preview`}
                  className="w-16 h-16 object-cover border border-border rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=100';
                  }}
                />
              ))}
            </div>
          )}

          {/* Location / Donor metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs border-t border-border">
            <div className="flex items-center gap-2 text-slate-500">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">{location?.address || "Location unspecified"}</span>
            </div>
            <div className="flex items-center gap-2 sm:justify-end text-slate-500">
              <User className="w-4 h-4 text-slate-400" />
              <span>Donor: <strong className="text-ink font-medium">{donorName || "Anonymous"}</strong></span>
            </div>
          </div>

          {/* Match Score Breakdown panel */}
          {matchScoreDetails && (
            <div className="mt-4 p-4 bg-slate-50 border border-border rounded-xl space-y-3">
              <div className="flex justify-between items-baseline text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Algorithm Matching Recommendation
                </span>
                <span className="font-semibold text-primary">{matchScoreDetails.total}% Score</span>
              </div>

              {/* Progress bar stack */}
              <div className="h-2 rounded-full overflow-hidden flex bg-slate-200">
                <div style={{ width: `${matchScoreDetails.categoryFit}%` }} className="bg-primary h-full" />
                <div style={{ width: `${matchScoreDetails.distanceScore}%` }} className="bg-sky-500 h-full" />
                <div style={{ width: `${matchScoreDetails.urgencyScore}%` }} className="bg-emerald-500 h-full" />
                <div style={{ width: `${matchScoreDetails.freshnessScore}%` }} className="bg-amber-500 h-full" />
              </div>

              {/* Legend details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-primary rounded-full" /> Category ({matchScoreDetails.categoryFit}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-sky-500 rounded-full" /> Distance ({matchScoreDetails.distance} km)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-50 rounded-full" /> Urgency ({matchScoreDetails.urgencyScore}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-amber-400 rounded-full" /> Recency ({matchScoreDetails.freshnessScore}%)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Panel */}
        {(onApprove || onReject || onClaim || actions || donation.rejectionReason) && (
          <div className="mt-6 pt-4 border-t border-border flex flex-wrap gap-2 items-center justify-between">
            {donation.rejectionReason && (
              <p className="text-xs text-red-500 italic">
                Moderation rejection reason: "{donation.rejectionReason}"
              </p>
            )}

            <div className="flex gap-2 ml-auto">
              {onReject && (
                <button
                  onClick={onReject}
                  className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Reject listing
                </button>
              )}
              {onApprove && (
                <button
                  onClick={onApprove}
                  className="saas-btn px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Approve listing
                </button>
              )}
              {onClaim && (
                <button
                  onClick={onClaim}
                  className="saas-btn px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Claim request
                </button>
              )}
              {actions}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
