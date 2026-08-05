import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, Heart, Navigation, Award, Sparkles, Check, Package, Building, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { Button } from '../ui/Button';

export default function ItemCard({
  item,
  type = 'donations', // 'donations' | 'ngos'
  isSelected = false,
  isHovered = false,
  isSaved = false,
  smartMatchDetails = null,
  onSelect,
  onHover,
  onToggleSave,
  onClaim,
  userRole
}) {
  const title = item.title || item.name || item.category || 'Dispatched Item';
  const category = item.category || 'General';
  const quantity = item.quantity || 1;
  const distanceKm = item._dist ? item._dist.toFixed(1) : null;
  const address = item.location?.address || item.address || 'Address listed';
  const trustScore = item.trustScore || item.trust_score || 85;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onMouseEnter={() => onHover && onHover(item.id)}
      onMouseLeave={() => onHover && onHover(null)}
      className={`group relative bg-white border rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between text-left cursor-pointer ${
        isSelected
          ? 'border-[#4A7C59] ring-2 ring-[#4A7C59]/30 shadow-xl bg-[#F8FCFA]'
          : isHovered
          ? 'border-stone-400 shadow-lg scale-[1.01]'
          : 'border-stone-200 shadow-sm hover:shadow-md'
      }`}
      onClick={() => onSelect && onSelect(item)}
    >
      <div className="space-y-4">
        
        {/* Top Card Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              type === 'ngos' ? 'bg-accent text-primary' : 'bg-amber-50 text-amber-600'
            }`}>
              {type === 'ngos' ? <Building className="w-5 h-5" /> : <Package className="w-5 h-5" />}
            </div>
            
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">
                {type === 'ngos' ? 'Verified NGO Partner' : `${quantity} Units Available`}
              </span>
              <h3 className="font-bold text-base text-stone-900 truncate leading-snug group-hover:text-primary transition-colors">
                {title}
              </h3>
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave && onToggleSave(item.id, e);
            }}
            className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
              isSaved
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-stone-50 border-stone-200 text-stone-400 hover:text-stone-700 hover:bg-stone-100'
            }`}
            title={isSaved ? 'Saved in wishlist' : 'Save item'}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Smart Match Banner if available */}
        {smartMatchDetails && (
          <div className="bg-accent border border-primary/30 p-2.5 rounded-2xl flex items-center justify-between text-xs text-primary font-semibold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" /> Smart Match
            </span>
            <span className="font-bold text-sm bg-white px-2 py-0.5 rounded-lg border border-primary/20 shadow-xs">
              {smartMatchDetails.score}% Score
            </span>
          </div>
        )}

        {/* Info Pills */}
        <div className="flex flex-wrap gap-2 text-xs font-medium">
          {category && (
            <span className="bg-stone-100 text-stone-700 px-3 py-1 rounded-xl border border-stone-200">
              {category}
            </span>
          )}

          {distanceKm && (
            <span className="bg-emerald-50 text-emerald-800 font-mono font-bold px-3 py-1 rounded-xl border border-emerald-200 flex items-center gap-1">
              <Navigation className="w-3 h-3 text-emerald-600" /> {distanceKm} km away
            </span>
          )}

          {type === 'ngos' && (
            <span className="bg-amber-50 text-amber-800 font-mono font-bold px-3 py-1 rounded-xl border border-amber-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-600" /> {trustScore}% Trust
            </span>
          )}
        </div>

        {/* Address */}
        <p className="text-xs text-stone-500 flex items-center gap-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="truncate">{address}</span>
        </p>
      </div>

      {/* Card Actions Footer */}
      <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect && onSelect(item);
          }}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
            isSelected
              ? 'bg-primary text-white border-primary'
              : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          {isSelected ? 'Routing Active' : 'Navigate'}
        </button>

        {type === 'donations' && userRole === 'ngo' && (
          <Button
            size="sm"
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2 px-4 rounded-xl shadow-xs"
            onClick={(e) => {
              e.stopPropagation();
              onClaim && onClaim(item);
            }}
          >
            Claim Dispatch
          </Button>
        )}
      </div>
    </motion.div>
  );
}
