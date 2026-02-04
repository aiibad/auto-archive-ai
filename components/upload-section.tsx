"use client";

import { useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { archiveDocument } from "@/app/actions/process-document";
import { Upload, Link as LinkIcon, Loader2, FileText, X, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";

export function UploadSection() {
  const [urlInput, setUrlInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const router = useRouter();

  const { startUpload } = useUploadThing("docUploader", {
    onUploadError: (error) => {
      alert(`Upload Error: ${error.message}`);
      setLoading(false);
    },
  });

  const handleArchive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput && !selectedFile) return alert("Please provide a link or a file.");

    setLoading(true);
    setProgress(5);
    setStatus("Preparing...");

    try {
      let finalUrl = urlInput;
      let base64Data = "";

      if (selectedFile) {
        let fileToUpload = selectedFile;

        // 1. COMPRESSION STAGE (Only for images to save tokens)
        if (selectedFile.type.startsWith("image/")) {
          setStatus("Optimizing image...");
          const options = {
            maxSizeMB: 0.4,
            maxWidthOrHeight: 1200,
            useWebWorker: true,
            onProgress: (p: number) => setProgress(5 + p * 0.3), // Scales to ~35%
          };
          fileToUpload = await imageCompression(selectedFile, options);

          // Convert to Base64 for AI Vision analysis
          const reader = new FileReader();
          base64Data = await new Promise((resolve) => {
            reader.readAsDataURL(fileToUpload);
            reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
          });
        }

        // 2. UPLOAD STAGE (35% to 70%)
        setStatus("Uploading to vault...");
        setProgress(40);
        const uploadRes = await startUpload([fileToUpload]);
        if (uploadRes && uploadRes[0]) {
          finalUrl = uploadRes[0].url;
        }
      }

      // 3. AI ANALYSIS STAGE (70% to 100%)
      if (finalUrl) {
        setStatus("AI Analysis in progress...");
        setProgress(75);
        await archiveDocument(finalUrl, base64Data || undefined);
        
        setProgress(100);
        setStatus("Success!");
        
        // Reset state after a brief success message
        setTimeout(() => {
          setUrlInput("");
          setSelectedFile(null);
          setLoading(false);
          setProgress(0);
          setStatus("");
          router.refresh();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      alert("Processing failed.");
      setLoading(false);
    }
  };

  return (
    <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 mb-12">
      <form onSubmit={handleArchive} className="space-y-6">
        
        <div className="group relative border-2 border-dashed border-slate-200 rounded-3xl p-8 transition-all hover:border-blue-400 hover:bg-blue-50/30 flex flex-col items-center justify-center min-h-[160px]">
          {loading ? (
            <div className="w-full max-w-xs animate-in fade-in duration-500">
              <div className="flex justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">{status}</span>
                <span className="text-[10px] font-black text-slate-400">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : selectedFile ? (
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-blue-100">
              <FileText className="text-blue-600" />
              <div className="text-left">
                <p className="text-sm font-bold truncate max-w-[200px]">{selectedFile.name}</p>
                <p className="text-[10px] text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <button type="button" onClick={() => setSelectedFile(null)} className="p-1 hover:text-red-500">
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload className="text-slate-400 group-hover:text-blue-600" size={24} />
              </div>
              <p className="text-sm font-medium text-slate-600">Click to select or drag a file</p>
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </>
          )}
        </div>

        <div className="text-center text-slate-300 text-xs font-bold uppercase tracking-widest">or</div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={loading}
              placeholder="Paste a secure document URL..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="bg-slate-900 hover:bg-black text-white px-10 py-3 rounded-xl font-bold transition-all shadow-lg min-w-[160px] flex items-center justify-center gap-2"
          >
            {loading ? status === "Success!" ? <CheckCircle2 size={18} /> : <Loader2 className="animate-spin" size={18} /> : "Archive Now"}
          </button>
        </div>
      </form>
    </section>
  );
}