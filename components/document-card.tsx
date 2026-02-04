"use client";

import { 
  ExternalLink, 
  Trash2, 
  Receipt, 
  IdCard, 
  Briefcase, 
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { deleteDocument } from "@/app/actions/process-document";
import { useState } from "react";

// 1. Map categories to icons and Tailwind colors
const categoryStyles: Record<string, { bg: string; text: string; icon: any; accent: string }> = {
  Receipt: { 
    bg: "bg-emerald-50", 
    text: "text-emerald-700", 
    icon: Receipt, 
    accent: "bg-emerald-500" 
  },
  ID: { 
    bg: "bg-indigo-50", 
    text: "text-indigo-700", 
    icon: IdCard, 
    accent: "bg-indigo-500" 
  },
  Work: { 
    bg: "bg-amber-50", 
    text: "text-amber-700", 
    icon: Briefcase, 
    accent: "bg-amber-500" 
  },
  Error: { 
    bg: "bg-red-50", 
    text: "text-red-700", 
    icon: AlertCircle, 
    accent: "bg-red-500" 
  },
  General: { 
    bg: "bg-slate-50", 
    text: "text-slate-700", 
    icon: FileText, 
    accent: "bg-slate-500" 
  },
};

export function DocumentCard({ doc }: { doc: any }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); //

  // Define character limit for truncation
  const CHARACTER_LIMIT = 150;
  const isLongText = doc.summary.length > CHARACTER_LIMIT;
  
  // Determine style based on category
  const style = categoryStyles[doc.category] || categoryStyles.General;
  const CategoryIcon = style.icon;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    setIsDeleting(true);
    try {
      await deleteDocument(doc.id); 
    } catch (error) {
      console.error("Delete failed:", error);
      setIsDeleting(false);
    }
  };

  return (
    <div className={`group relative bg-white border border-slate-200 rounded-[2rem] p-6 transition-all hover:shadow-2xl hover:-translate-y-1 ${isDeleting ? 'opacity-50 grayscale' : ''}`}>
      
      {/* HEADER: Category Badge with Icon */}
      <div className="flex justify-between items-start mb-6">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${style.bg} ${style.text} font-bold text-[10px] uppercase tracking-wider`}>
          <CategoryIcon size={14} />
          {doc.category}
        </div>
        
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 disabled:cursor-not-allowed"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* BODY: Icon + Summary with Read More Toggle */}
      <div className="flex gap-4 mb-6">
        <div className={`shrink-0 w-12 h-12 rounded-2xl ${style.bg} ${style.text} flex items-center justify-center`}>
          <CategoryIcon size={24} />
        </div>
        
        <div className="flex-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Analysis</p>
          <div className="text-slate-900 font-bold text-sm leading-relaxed">
            {/* Logic for Truncation */}
            {isExpanded || !isLongText ? (
              doc.summary
            ) : (
              `${doc.summary.substring(0, CHARACTER_LIMIT)}...`
            )}

            {/* Toggle Button */}
            {isLongText && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-1 text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-0.5"
              >
                {isExpanded ? (
                  <>Show Less <ChevronUp size={14} /></>
                ) : (
                  <>Read More <ChevronDown size={14} /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER: Actions and Timestamp */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
        <a 
          href={doc.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
        >
          <div className="p-2 bg-blue-50 rounded-lg">
            <ExternalLink size={14} />
          </div>
          View File
        </a>
        
        <div className="flex items-center gap-2 text-slate-400">
           <span className="text-[10px] font-medium">
             {new Date(doc.createdAt).toLocaleDateString()}
           </span>
           <div className={`w-2 h-2 rounded-full ${style.accent} animate-pulse`} />
        </div>
      </div>
    </div>
  );
}