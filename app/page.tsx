import { db } from "@/lib/db";
import { DocumentCard } from "@/components/document-card";
import { UploadSection } from "@/components/upload-section";
import { 
  LayoutGrid, 
  FolderOpen, 
  Search, 
  Receipt, 
  IdCard, 
  Briefcase, 
  X,
  FileText
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; query?: string }>;
}) {
  const { category, query } = await searchParams;

  // 1. Fetch filtered documents based on URL parameters
  const docs = await db.document.findMany({
    where: {
      AND: [
        category ? { category: { equals: category, mode: 'insensitive' } } : {},
        query ? { summary: { contains: query, mode: 'insensitive' } } : {},
      ]
    },
    orderBy: { createdAt: "desc" },
  });

  // 2. Fetch counts for the Sidebar Badges
  const allCount = await db.document.count();
  const categoryCounts = await db.document.groupBy({
    by: ['category'],
    _count: { category: true },
  });

  const getCount = (name: string) => {
    return categoryCounts.find(c => c.category?.toLowerCase() === name.toLowerCase())?._count.category || 0;
  };

  const categories = [
    { name: "Receipt", icon: <Receipt size={18} />, count: getCount("Receipt") },
    { name: "ID", icon: <IdCard size={18} />, count: getCount("ID") },
    { name: "Work", icon: <Briefcase size={18} />, count: getCount("Work") },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900">
      {/* SIDEBAR WITH SEARCH & BADGES */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <FolderOpen className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">Vault.ai</span>
        </div>

        {/* SEARCH BAR */}
        <div className="mb-8">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Search Vault</p>
          <form action="/" method="GET" className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              name="query"
              defaultValue={query}
              placeholder="Search summary..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </form>
        </div>

        {/* CATEGORIES WITH BADGES */}
        <nav className="flex-1 space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Categories</p>
          
          <Link 
            href="/" 
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all ${!category ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <div className="flex items-center gap-3"><LayoutGrid size={18} /> <span>All Files</span></div>
            <span className="text-[10px] bg-white border px-1.5 py-0.5 rounded-md shadow-sm">{allCount}</span>
          </Link>

          {categories.map((cat) => (
            <Link 
              key={cat.name}
              href={`/?category=${cat.name}`}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all ${category === cat.name ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-3">{cat.icon} <span>{cat.name}s</span></div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md border shadow-sm ${category === cat.name ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'}`}>
                {cat.count}
              </span>
            </Link>
          ))}
        </nav>

        {/* CLEAR FILTERS */}
        {(category || query) && (
          <Link href="/" className="mt-4 flex items-center justify-center gap-2 text-[10px] font-black text-red-500 hover:text-red-600 p-2 border border-red-100 rounded-xl bg-red-50/50 uppercase tracking-widest">
            <X size={14} /> Clear Filters
          </Link>
        )}
      </aside>

      <main className="flex-1 p-4 md:p-10 max-w-6xl mx-auto w-full">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {category ? `${category}s` : "Personal Archive"}
          </h1>
        </header>

        <UploadSection />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docs.length > 0 ? (
            docs.map((doc) => <DocumentCard key={doc.id} doc={doc} />)
          ) : (
            <div className="col-span-full py-20 text-center bg-white border border-dashed border-slate-200 rounded-[2rem]">
              <FileText className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-400 font-medium">No documents found matching these filters.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}