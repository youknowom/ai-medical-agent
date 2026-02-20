"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FileText,
  ArrowLeft,
  Upload,
  Send,
  Download,
  X,
  Bot,
  User,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ImageIcon,
  FileUp,
  Trash2,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import jsPDF from "jspdf";

/* ─────────────────────── types ─────────────────────── */
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isFile?: boolean;
  fileName?: string;
};

type UploadedFile = {
  name: string;
  type: string;
  size: number;
  base64: string;
  preview?: string;
};

/* ─────────────────────── helpers ─────────────────────── */
function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function parseMarkdownBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-neutral-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function renderContent(content: string) {
  const lines = content.split("\n");
  return lines.map((line, idx) => {
    if (line.startsWith("# ")) {
      return (
        <h2 key={idx} className="text-lg font-bold text-neutral-900 mt-3 mb-1 first:mt-0">
          {line.slice(2)}
        </h2>
      );
    }
    if (line.startsWith("## ")) {
      return (
        <h3 key={idx} className="text-base font-semibold text-neutral-800 mt-2 mb-1">
          {line.slice(3)}
        </h3>
      );
    }
    if (line.startsWith("### ")) {
      return (
        <h4 key={idx} className="text-sm font-semibold text-neutral-700 mt-2 mb-0.5">
          {line.slice(4)}
        </h4>
      );
    }
    if (line.startsWith("- ") || line.startsWith("• ")) {
      return (
        <div key={idx} className="flex gap-2 ml-2 my-0.5">
          <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
          <span className="text-neutral-700 text-sm">
            {parseMarkdownBold(line.slice(2))}
          </span>
        </div>
      );
    }
    if (line.trim() === "") return <div key={idx} className="h-2" />;
    return (
      <p key={idx} className="text-sm text-neutral-700 leading-relaxed">
        {parseMarkdownBold(line)}
      </p>
    );
  });
}

function MsgBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} items-start`}>
      {/* Avatar */}
      <div
        className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-sm ${isUser
            ? "bg-gradient-to-br from-blue-500 to-blue-700"
            : "bg-gradient-to-br from-emerald-500 to-emerald-700"
          }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${isUser
            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-sm"
            : "bg-white border border-neutral-200 rounded-tl-sm"
          }`}
      >
        {msg.isFile && (
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-current/10">
            <FileText className="w-4 h-4 opacity-70 shrink-0" />
            <span className="text-xs font-medium opacity-80 truncate">{msg.fileName}</span>
          </div>
        )}
        {isUser ? (
          <p className="text-sm text-white/95 leading-relaxed">{msg.content}</p>
        ) : (
          <div className="space-y-0.5">{renderContent(msg.content)}</div>
        )}
      </div>
    </div>
  );
}

/* ── Bug fix: TypingIndicator had duplicate className props on one element ── */
function TypingIndicator() {
  return (
    <div className="flex gap-3 items-start">
      <div className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-sm">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white border border-neutral-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          <span
            className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── main page ─────────────────────── */
export default function OCRAnalysisPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 Hello! I'm **MediScan AI** — your intelligent medical report analyzer.\n\n📄 **To get started:**\n- Upload a medical report (lab results, prescription, X-ray image, or PDF)\n- Then ask me anything about it!\n\nI'll extract all key values, flag abnormal results, and explain everything in simple language.\n\n## What I can analyze:\n- 🧪 Blood test & lab reports\n- 💊 Prescriptions & medication lists\n- 🩻 X-ray & scan images\n- 📋 Doctor's notes & discharge summaries",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleFile = useCallback((file: File) => {
    if (!file) return;
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Unsupported file type. Please upload PNG, JPG, WEBP, or PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Maximum size is 10MB.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      setUploadedFile({
        name: file.name,
        type: file.type,
        size: file.size,
        base64,
        preview: file.type.startsWith("image/") ? dataUrl : undefined,
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const sendMessage = async () => {
    const text = input.trim();
    if (!text && !uploadedFile) return;
    if (isLoading) return;

    setError(null);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text || "Please analyze this medical report.",
      timestamp: new Date().toISOString(),
      isFile: !!uploadedFile,
      fileName: uploadedFile?.name,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const historyForApi = messages
      .slice(1)
      .slice(-8)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const { data } = await axios.post("/api/medical-report-scan", {
        fileBase64: uploadedFile?.base64 || null,
        fileType: uploadedFile?.type || null,
        fileName: uploadedFile?.name || null,
        userMessage: text || "Please analyze this medical report in detail.",
        conversationHistory: historyForApi,
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      if (uploadedFile) setUploadedFile(null);
    } catch (err: any) {
      const errText =
        err.response?.data?.error ||
        err.message ||
        "Something went wrong. Please try again.";
      setError(errText);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const downloadReport = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let y = 20;

    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, pageWidth, 12, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("MediScan AI — Medical Report", margin, 8);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleString(), pageWidth - margin, 8, { align: "right" });

    y = 24;
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Medical Report Analysis", margin, y);
    y += 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Generated on ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
      margin,
      y,
    );
    y += 8;

    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    messages.forEach((msg) => {
      if (msg.id === "welcome") return;
      const isUser = msg.role === "user";

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(isUser ? 59 : 16, isUser ? 130 : 185, isUser ? 246 : 129);
      doc.text(isUser ? "▶ Patient" : "◆ MediScan AI", margin, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(40, 40, 40);

      const cleanContent = msg.content
        .replace(/\*\*/g, "")
        .replace(/^#{1,4}\s/gm, "")
        .replace(/^[•\-]\s/gm, "  • ");

      const lines = doc.splitTextToSize(cleanContent, maxWidth);
      lines.forEach((line: string) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(line, margin, y);
        y += 5;
      });

      y += 4;
      doc.setDrawColor(235, 235, 235);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;
    });

    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(160, 160, 160);
      doc.setFont("helvetica", "italic");
      doc.text(
        "⚠ This report is AI-generated for informational purposes only. Consult a licensed physician for medical decisions.",
        margin, 290,
      );
      doc.setFont("helvetica", "normal");
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, 290, { align: "right" });
    }

    doc.save(`MediScan-Report-${Date.now()}.pdf`);
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100dvh - 80px)", maxWidth: "56rem", margin: "0 auto" }}>
      {/* ── Header ── */}
      <div className="flex items-start sm:items-center justify-between mb-3 sm:mb-4 gap-3">
        <div className="min-w-0">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-700 transition-colors mb-1.5 sm:mb-2 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Dashboard
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </span>
            MediScan AI
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Upload a medical report and ask anything about it
          </p>
        </div>

        <button
          onClick={downloadReport}
          disabled={messages.length <= 1}
          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export PDF</span>
        </button>
      </div>

      {/* ── Chat area ── */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto rounded-2xl border border-neutral-200 bg-neutral-50 p-4 space-y-4 mb-4"
      >
        {messages.map((msg) => (
          <MsgBubble key={msg.id} msg={msg} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={chatEndRef} />
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-2.5 mb-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── File preview ── */}
      {uploadedFile && (
        <div className="flex items-center gap-3 px-4 py-3 mb-3 rounded-xl bg-emerald-50 border border-emerald-200">
          {uploadedFile.preview ? (
            <img
              src={uploadedFile.preview}
              alt="preview"
              className="w-10 h-10 rounded-lg object-cover border border-emerald-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-800 truncate">{uploadedFile.name}</p>
            <p className="text-xs text-neutral-500">{formatFileSize(uploadedFile.size)}</p>
          </div>
          <button
            onClick={() => setUploadedFile(null)}
            className="shrink-0 w-7 h-7 rounded-full bg-neutral-200 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Input area ── */}
      <div
        className={`rounded-2xl border-2 transition-colors ${isDragging ? "border-emerald-400 bg-emerald-50" : "border-neutral-200 bg-white"
          }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <div className="flex items-end gap-2 p-3">
          {/* Upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-neutral-100 hover:bg-emerald-100 hover:text-emerald-600 text-neutral-500 transition-colors"
            title="Upload file"
          >
            <FileUp className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              uploadedFile
                ? "Ask something about this file… (or press Enter to auto-analyze)"
                : "Ask about your report, or upload a file first…"
            }
            rows={1}
            className="flex-1 resize-none bg-transparent outline-none text-sm text-neutral-900 placeholder:text-neutral-400 max-h-32 leading-relaxed py-1.5"
            style={{ overflowY: "auto" }}
          />

          {/* Send button */}
          <button
            onClick={sendMessage}
            disabled={isLoading || (!input.trim() && !uploadedFile)}
            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Drag hint */}
        {isDragging && (
          <div className="text-center text-sm text-emerald-600 font-medium pb-3">
            Drop your file here to upload
          </div>
        )}
      </div>
    </div>
  );
}