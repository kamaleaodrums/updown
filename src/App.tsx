import React, { useState, useEffect, useRef } from "react";
import { 
  Upload, 
  File, 
  Download, 
  Trash2, 
  FileText, 
  Image as ImageIcon, 
  Music, 
  Video, 
  Archive,
  Loader2,
  Plus,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FileData {
  id: number;
  original_name: string;
  filename: string;
  mime_type: string;
  size: number;
  uploaded_at: string;
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-blue-500" />;
  if (mimeType.startsWith("video/")) return <Video className="w-5 h-5 text-purple-500" />;
  if (mimeType.startsWith("audio/")) return <Music className="w-5 h-5 text-pink-500" />;
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("tar")) return <Archive className="w-5 h-5 text-orange-500" />;
  if (mimeType.includes("pdf") || mimeType.includes("text") || mimeType.includes("word")) return <FileText className="w-5 h-5 text-emerald-500" />;
  return <File className="w-5 h-5 text-slate-500" />;
};

export default function App() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    try {
      const response = await fetch("/api/files");
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        fetchFiles();
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/files/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setFiles(files.filter((f) => f.id !== id));
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">FileBox</h1>
            <p className="text-slate-500">Securely upload and manage your files.</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium text-slate-600">Storage Online</span>
            </div>
          </div>
        </header>

        {/* Upload Area */}
        <section 
          className={`relative mb-12 rounded-3xl border-2 border-dashed transition-all duration-300 ${
            dragActive ? "border-blue-500 bg-blue-50/50" : "border-slate-200 bg-white"
          } p-12 text-center group cursor-pointer`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          
          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${
              dragActive ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-400"
            }`}>
              {isUploading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <Upload className="w-8 h-8" />
              )}
            </div>
            <h3 className="text-xl font-semibold mb-1">
              {isUploading ? "Uploading..." : "Click or drag file to upload"}
            </h3>
            <p className="text-slate-400 text-sm">Support for any file type up to 50MB</p>
          </div>
        </section>

        {/* File List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              Recent Files
              <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full">
                {files.length}
              </span>
            </h2>
          </div>

          <div className="grid gap-3">
            <AnimatePresence mode="popLayout">
              {files.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white border border-slate-100 rounded-2xl p-12 text-center"
                >
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <File className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-slate-400">No files uploaded yet.</p>
                </motion.div>
              ) : (
                files.map((file) => (
                  <motion.div
                    key={file.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow group"
                  >
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                      {getFileIcon(file.mime_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 truncate" title={file.original_name}>
                        {file.original_name}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span>{formatSize(file.size)}</span>
                        <span>•</span>
                        <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={`/api/download/${file.filename}`}
                        download
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                        title="Download"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  );
}
