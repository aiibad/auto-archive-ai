"use client"; // <--- ADD THIS LINE FIRST
import { db } from "@/lib/db"; // ⚠️ NOTE: See Warning below
import { archiveDocument, deleteDocument } from "./actions/process-document";
// ... rest of your imports
import { db } from "@/lib/db";
import { archiveDocument, deleteDocument } from "./actions/process-document";
import { DocumentCard } from "@/components/document-card";
import { LayoutGrid, FolderOpen, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { UploadDropzone } from "@uploadthing/react";
import { OurFileRouter } from "./api/uploadthing/core";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; query?: string }>;
}) {
  const { category, query } = await searchParams;

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900">
      {/* SIDEBAR */}
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

      <main className="flex-1 p-4 md:p-10 max-w-6xl mx-auto w-full">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Personal Archive</h1>
          <div className="mt-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
              <Link href="/" className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${!category ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}>All</Link>
              {categories.map((cat) => (
                <Link key={cat} href={`/?category=${cat}`} className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${category === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200'}`}>{cat}s</Link>
              ))}
            </div>
            <form className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input name="query" placeholder="Search summaries..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full shadow-sm" />
            </form>
          </div>
        </header>

        {/* UPLOAD ZONE */}
        <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 mb-12">
          <UploadDropzone<OurFileRouter, "docUploader">
            endpoint="docUploader"
            onClientUploadComplete={async (res) => {
              if (res?.[0]) {
                await archiveDocument(res[0].url);
              }
            }}
            onUploadError={(error: Error) => {
              alert(`Upload Error: ${error.message}`);
            }}
            className="ut-label:text-blue-600 ut-button:bg-slate-900 border-slate-200 bg-slate-50/50 rounded-2xl h-44"
          />
        </section>

        {/* DOCUMENTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docs.length > 0 ? (
            docs.map((doc) => (
              <div key={doc.id} className="relative group">
                <DocumentCard doc={doc} />
                {/* Delete button overlay */}
                <form 
                  action={async () => {
                    "use server";
                    await deleteDocument(doc.id);
                  }}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <button className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 size={14} />
                  </button>
                </form>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl text-slate-400 italic">No documents found.</div>
          )}
        </div>
      </main>
    </div>
  );
}