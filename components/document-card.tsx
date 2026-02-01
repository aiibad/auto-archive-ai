import { 
  FileText, Receipt, IdCard, Briefcase, 
  ExternalLink, Calendar, Trash2 
} from "lucide-react";
import { deleteDocument } from "@/app/actions/process-document";

export function DocumentCard({ doc }: { doc: any }) {
  const getCategoryStyles = (category: string) => {
    switch (category?.toLowerCase()) {
      case "receipt":
        return {
          icon: <Receipt size={18} />,
          color: "bg-emerald-50 text-emerald-700 border-emerald-100",
          accent: "bg-emerald-500"
        };
      case "id":
        return {
          icon: <IdCard size={18} />,
          color: "bg-blue-50 text-blue-700 border-blue-100",
          accent: "bg-blue-500"
        };
      case "work":
        return {
          icon: <Briefcase size={18} />,
          color: "bg-purple-50 text-purple-700 border-purple-100",
          accent: "bg-purple-500"
        };
      default:
        return {
          icon: <FileText size={18} />,
          color: "bg-slate-50 text-slate-700 border-slate-100",
          accent: "bg-slate-500"
        };
    }
  };

  const style = getCategoryStyles(doc.category);

  return (
    <div className="group relative bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      
      {/* --- DELETE BUTTON --- */}
      <form 
        action={async () => {
          "use server";
          await deleteDocument(doc.id);
        }}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <button 
          className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
          title="Delete document"
        >
          <Trash2 size={16} />
        </button>
      </form>

      <div className="flex justify-between items-start mb-4">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold ${style.color}`}>
          {style.icon}
          {doc.category || "General"}
        </div>
        <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
          <Calendar size={12} />
          {new Date(doc.createdAt).toLocaleDateString()}
        </div>
      </div>

      <h3 className="text-slate-900 font-semibold text-base mb-2 line-clamp-2 leading-snug">
        {doc.summary || "No summary available"}
      </h3>
      
      <p className="text-slate-500 text-xs leading-relaxed mb-6 line-clamp-3">
        Securely analyzed and archived.
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <a 
          href={doc.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors"
        >
          <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-100 transition-colors">
            <ExternalLink size={14} />
          </div>
          View Document
        </a>
        <div className={`w-1.5 h-1.5 rounded-full ${style.accent} opacity-40`} />
      </div>
    </div>
  );
}