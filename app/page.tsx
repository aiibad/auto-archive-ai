import { db } from "@/lib/db";
import { archiveDocument } from "./actions/process-document";
import { DocumentCard } from "@/components/document-card";
import { Upload, LayoutGrid, Settings, FolderOpen, Search, Filter } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; query?: string }>;
}) {
  const { category, query } = await searchParams;

  // 1. Build the filtered database query
  const docs = await db.document.findMany({
    where: {
      AND: [
        category ? { category: { equals: category, mode: 'insensitive' } } : {},
        query ? { summary: { contains: query, mode: 'insensitive' } } : {},
      ]
    },
    orderBy: { createdAt: "desc" },
  });

  const categories = ["Receipt", "ID", "Work"];

  async function handleAction(formData: FormData) {
    "use server";
    const url = formData.get("url") as string;
    if (url) await archiveDocument(url);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <FolderOpen className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">Vault.ai</span>
        </div>
        <nav className="space-y-1">
          <Link href="/" className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-all ${!category ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}>
            <LayoutGrid size={20} /> Dashboard
          </Link>
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-4 md:p-10 max-w-6xl mx-auto w-full">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Personal Archive</h1>
          
          {/* --- SEARCH & CATEGORY FILTERS --- */}
          <div className="mt-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
              <Link 
                href="/" 
                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${!category ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/?category=${cat}`}
                  className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${category === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                >
                  {cat}s
                </Link>
              ))}
            </div>

            <form className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                name="query"
                placeholder="Search summaries..." 
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full shadow-sm"
              />
            </form>
          </div>
        </header>

        {/* --- UPLOAD ZONE --- */}
        <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 mb-12">
          <form action={handleAction} className="space-y-6">
            <div className="group relative flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-300 transition-all cursor-pointer">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="p-3 bg-white rounded-xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="text-blue-600" size={24} />
                </div>
                <p className="mb-1 text-sm text-slate-700 font-semibold">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-500">Support for PDF, JPG, PNG or direct URL below</p>
              </div>
              <input type="file" name="file" className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <input 
                name="url" 
                placeholder="Or paste a secure document URL..." 
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <button className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95">
                Archive Now
              </button>
            </div>
          </form>
        </section>

        {/* --- DOCUMENTS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docs.length > 0 ? (
            docs.map((doc) => <DocumentCard key={doc.id} doc={doc} />)
          ) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
              <p className="text-slate-400 italic">No documents found matching this filter.</p>
              <Link href="/" className="text-blue-600 text-sm font-bold mt-2 inline-block underline">Clear all filters</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}