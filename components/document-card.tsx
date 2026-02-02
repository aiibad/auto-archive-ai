"use client";

import { 
  Trash2, 
  FileText, 
  Receipt, 
  IdCard, 
  Briefcase, 
  ExternalLink, 
  Calendar,
  Loader2 
} from "lucide-react";
import { deleteDocument } from "@/app/actions/process-document";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DocumentCard({ doc }: { doc: any }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Unified Delete Function
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this document?")) {
      setIsDeleting(true);
      try {
        await deleteDocument(doc.id);
        router.refresh(); // Tells Next.js to re-fetch the list
      } catch (error) {
        alert("Failed to delete the document.");
        setIsDeleting(false);
      }
    }
  };

  // 2. Dynamic AI Category Styles
  const getCategoryStyles = (category: string) => {
    switch (category?.toLowerCase()) {
      case "receipt":
        return { 
          icon: <Receipt size={16} />, 
          color: "bg-emerald-50 text-emerald-700 border-emerald-100", 
          accent: "bg-emerald-500" 
        };
      case "id":
        return { 
          icon: <IdCard size={16} />, 
          color: "bg-blue-50 text-blue-700 border-blue-100", 
          accent: "bg-blue-500" 
        };
      case "work":
        return { 
          icon: <Briefcase size={16} />, 
          color: "bg-purple-50 text-purple-700 border-purple-100", 
          accent: "bg-purple-500" 
        };
      default:
        return { 
          icon: <FileText size={16} />, 
          color: "bg-slate-50 text-slate-700 border-slate-100", 
          accent: "bg-slate-500" 
        };
    }
  };

  const style = getCategoryStyles(doc.category);

  return (
    <div className="group relative bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      
      {/* 3. Interactive Delete Button */}
      <button 
        onClick={handleDelete}
        disabled={isDeleting}
        className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white z-20 disabled:opacity-50"
      >
        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
      </button>

      <div className="flex justify-between items-start mb-4">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${style.color}`}>
          {style.icon}
          {doc.category || "General"}
        </div>
        <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
          <Calendar size={12} />
          {new Date(doc.createdAt).toLocaleDateString()}
        </div>
      </div>

      <h3 className="text-slate-900 font-bold text-sm mb-2 line-clamp-2 leading-tight">
        {doc.summary || "No summary provided"}
      </h3>
      
      <p className="text-slate-500 text-[11px] leading-relaxed mb-6 line-clamp-2">
        AI-processed document stored securely in your vault.
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
        <a 
          href={doc.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs font-black text-slate-900 hover:text-blue-600 transition-colors"
        >
          <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
            <ExternalLink size={14} />
          </div>
          VIEW FILE
        </a>
        <div className={`w-2 h-2 rounded-full ${style.accent} opacity-40 animate-pulse`} />
      </div>
    </div>
  );
}