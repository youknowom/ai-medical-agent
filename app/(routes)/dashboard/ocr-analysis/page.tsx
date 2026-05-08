"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FileText, ArrowLeft, Send, Download, X, Sparkles,
  AlertCircle, Loader2, FileUp, Stethoscope, Activity,
  ChevronRight, Mic,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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
  model?: string;
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

function renderContent(content: string) {
  const lines = content.split("\n");
  const result: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Headings
    if (line.startsWith("## ")) {
      result.push(
        <div key={i} className="flex items-center gap-2 mt-4 mb-2 first:mt-0">
          <div className="h-px flex-1 bg-gradient-to-r from-emerald-200 to-transparent" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-600 whitespace-nowrap">
            {line.slice(3)}
          </h3>
          <div className="h-px flex-1 bg-gradient-to-l from-emerald-200 to-transparent" />
        </div>
      );
      i++; continue;
    }
    if (line.startsWith("# ")) {
      result.push(
        <h2 key={i} className="text-base font-bold text-slate-900 mt-3 mb-1 first:mt-0">
          {line.slice(2)}
        </h2>
      );
      i++; continue;
    }
    if (line.startsWith("### ")) {
      result.push(
        <h4 key={i} className="text-sm font-semibold text-slate-700 mt-2 mb-0.5">
          {line.slice(4)}
        </h4>
      );
      i++; continue;
    }

    // Bullet list
    if (line.startsWith("- ") || line.startsWith("• ")) {
      result.push(
        <div key={i} className="flex gap-2 my-0.5 ml-1">
          <span className="text-emerald-500 mt-1 shrink-0 text-xs">◆</span>
          <span className="text-sm text-slate-600 leading-relaxed">{parseBold(line.slice(2))}</span>
        </div>
      );
      i++; continue;
    }

    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s(.+)/);
    if (numMatch) {
      result.push(
        <div key={i} className="flex gap-2.5 my-1 ml-1">
          <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center mt-0.5">
            {numMatch[1]}
          </span>
          <span className="text-sm text-slate-600 leading-relaxed">{parseBold(numMatch[2])}</span>
        </div>
      );
      i++; continue;
    }

    // Horizontal rule
    if (line.trim() === "---") {
      result.push(<hr key={i} className="my-3 border-slate-200" />);
      i++; continue;
    }

    // Status badges inline (e.g. "| HIGH |" or "🔴 HIGH")
    if (line.includes("🔴") || line.includes("✅") || line.includes("⚠️")) {
      result.push(
        <p key={i} className="text-sm text-slate-700 leading-relaxed my-0.5">
          {parseBadges(parseBold(line))}
        </p>
      );
      i++; continue;
    }

    // Empty
    if (line.trim() === "") {
      result.push(<div key={i} className="h-1.5" />);
      i++; continue;
    }

    // Regular paragraph
    result.push(
      <p key={i} className="text-sm text-slate-700 leading-relaxed">
        {parseBold(line)}
      </p>
    );
    i++;
  }
  return result;
}

function parseBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="font-semibold text-slate-900">{p.slice(2, -2)}</strong>
    ) : <span key={i}>{p}</span>
  );
}

function parseBadges(content: React.ReactNode): React.ReactNode {
  // Just return as-is since badges come from emojis in the text
  return content;
}

/* ─────────────────────── Doctor Avatar ─────────────────────── */
function DoctorAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? "w-8 h-8" : size === "lg" ? "w-12 h-12" : "w-9 h-9";
  return (
    <div className={`${dim} rounded-full overflow-hidden ring-2 ring-emerald-300 ring-offset-1 shrink-0 relative`}>
      <Image
        src="/mediscan-avatar.png"
        alt="MediScan AI Doctor"
        fill
        className="object-cover"
        sizes="48px"
      />
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0 ring-2 ring-blue-200 ring-offset-1">
      <span className="text-white text-sm font-bold">U</span>
    </div>
  );
}

/* ─────────────────────── Message Bubble ─────────────────────── */
function MsgBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  const time = new Date(msg.timestamp).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} items-end group`}>
      {isUser ? <UserAvatar /> : <DoctorAvatar />}

      <div className={`flex flex-col gap-1 max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Name + time */}
        <div className={`flex items-center gap-2 px-1 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-xs font-semibold text-slate-500">
            {isUser ? "You" : "MediScan AI"}
          </span>
          <span className="text-[10px] text-slate-400">{time}</span>
          {msg.model && !isUser && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium border border-emerald-200 hidden group-hover:inline-flex">
              {msg.model.split("/").pop()?.split(":")[0]}
            </span>
          )}
        </div>

        {/* Bubble */}
        <div
          className={`relative rounded-2xl px-4 py-3 shadow-sm transition-shadow hover:shadow-md ${isUser
              ? "bg-gradient-to-br from-blue-500 to-violet-600 text-white rounded-br-sm"
              : "bg-white border border-slate-200/80 rounded-bl-sm backdrop-blur-sm"
            }`}
        >
          {/* File tag */}
          {msg.isFile && (
            <div className={`flex items-center gap-2 mb-2 pb-2 border-b ${isUser ? "border-white/20" : "border-slate-200"}`}>
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isUser ? "bg-white/20" : "bg-emerald-100"}`}>
                <FileText className={`w-3.5 h-3.5 ${isUser ? "text-white" : "text-emerald-600"}`} />
              </div>
              <span className={`text-xs font-medium truncate max-w-[180px] ${isUser ? "text-white/90" : "text-slate-600"}`}>
                {msg.fileName}
              </span>
            </div>
          )}

          {isUser ? (
            <p className="text-sm text-white/95 leading-relaxed">{msg.content}</p>
          ) : (
            <div className="space-y-0.5">{renderContent(msg.content)}</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Typing Indicator ─────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex gap-3 items-end">
      <DoctorAvatar />
      <div className="flex flex-col gap-1 items-start">
        <span className="text-xs font-semibold text-slate-500 px-1">MediScan AI</span>
        <div className="bg-white border border-slate-200/80 rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm">
          <div className="flex gap-1.5 items-center">
            {[0, 150, 300].map((delay, i) => (
              <span
                key={i}
                className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Quick Prompts ─────────────────────── */
const QUICK_PROMPTS = [
  { icon: "🤒", label: "I have fever", text: "I have a fever of 101°F since yesterday" },
  { icon: "💊", label: "Check medication", text: "Can you explain this medication list for me?" },
  { icon: "🧪", label: "Blood test help", text: "Can you explain what these blood test values mean?" },
  { icon: "😮‍💨", label: "Breathing issues", text: "I'm having shortness of breath and chest tightness" },
];

/* ─────────────────────── Main Page ─────────────────────── */
export default function OCRAnalysisPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 Hello! I'm **Dr. Meera** — your personal AI medical assistant at MediPulse.\n\n## How I can help you\n- 🩺 Analyze medical reports (lab tests, X-rays, prescriptions, PDFs)\n- 🤒 Explain your symptoms & suggest which doctor to see\n- 💊 Help understand medications and dosages\n- 📋 Answer medical questions in simple language\n\n## To get started:\n- Upload a medical report using the 📎 button below, **OR**\n- Simply describe your symptoms and I'll guide you!\n\n⚠️ This is AI-generated guidance. Please consult a qualified doctor for diagnosis and treatment.",
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleFile = useCallback((file: File) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setError("Unsupported file type. Please upload PNG, JPG, WEBP, or PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum size is 10 MB.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setUploadedFile({
        name: file.name,
        type: file.type,
        size: file.size,
        base64: dataUrl.split(",")[1],
        preview: file.type.startsWith("image/") ? dataUrl : undefined,
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const sendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
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
      .slice(1).slice(-8)
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
        model: data.model,
      };
      setMessages((prev) => [...prev, aiMsg]);
      if (uploadedFile) setUploadedFile(null);
    } catch (err: any) {
      const errText =
        err.response?.data?.error || err.message || "Something went wrong. Please try again.";
      setError(errText);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  /* ── Auto-resize textarea ── */
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 128) + "px";
  }, [input]);

  const downloadReport = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let y = 20;

    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, pageWidth, 14, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("MediScan AI — MediPulse Medical Report", margin, 9);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleString(), pageWidth - margin, 9, { align: "right" });

    y = 26;
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Medical Report Analysis", margin, y);
    y += 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated on ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, margin, y);
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
      doc.text(isUser ? "▶ Patient" : "◆ Dr. Meera (MediScan AI)", margin, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(40, 40, 40);

      const cleaned = msg.content.replace(/\*\*/g, "").replace(/^#{1,4}\s/gm, "").replace(/^[-•]\s/gm, "  • ");
      const lines = doc.splitTextToSize(cleaned, maxWidth);
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
      doc.setFontSize(7.5);
      doc.setTextColor(160, 160, 160);
      doc.setFont("helvetica", "italic");
      doc.text("⚠ AI-generated for informational purposes only. Consult a licensed physician for medical decisions.", margin, 290);
      doc.setFont("helvetica", "normal");
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, 290, { align: "right" });
    }
    doc.save(`MediScan-Report-${Date.now()}.pdf`);
  };

  const hasChats = messages.length > 1;

  return (
    <div className="flex flex-col" style={{ height: "calc(100dvh - 80px)", maxWidth: "58rem", margin: "0 auto" }}>

      {/* ── Header ── */}
      <div className="flex items-start sm:items-center justify-between mb-3 gap-3">
        <div className="min-w-0">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-2 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative">
              <DoctorAvatar size="lg" />
              {/* Online dot */}
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-300" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                MediScan AI
                <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200 uppercase tracking-wide">
                  Online
                </span>
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Stethoscope className="w-3 h-3" />
                Dr. Meera · AI Medical Assistant · MediPulse
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={downloadReport}
          disabled={!hasChats}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export PDF</span>
        </button>
      </div>

      {/* ── Chat area ── */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50/80 to-white px-4 py-5 space-y-5 mb-3 shadow-inner">
        {messages.map((msg) => (
          <MsgBubble key={msg.id} msg={msg} />
        ))}
        {isLoading && <TypingIndicator />}

        {/* Quick prompts — only show when no chats yet */}
        {!hasChats && !isLoading && (
          <div className="pt-4">
            <p className="text-xs text-slate-400 text-center mb-3 font-medium uppercase tracking-widest">Quick Questions</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp.label}
                  onClick={() => sendMessage(qp.text)}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left transition-all group shadow-sm hover:shadow"
                >
                  <span className="text-lg shrink-0">{qp.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 group-hover:text-emerald-700">{qp.label}</p>
                    <p className="text-[10px] text-slate-400 truncate">{qp.text}</p>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-400 ml-auto shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-start gap-2.5 px-4 py-3 mb-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="flex-1 text-xs leading-relaxed">{error}</span>
          <button onClick={() => setError(null)} className="shrink-0 hover:bg-red-100 rounded-lg p-0.5 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── File preview pill ── */}
      {uploadedFile && (
        <div className="flex items-center gap-3 px-4 py-2.5 mb-2 rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm">
          {uploadedFile.preview ? (
            <img src={uploadedFile.preview} alt="preview" className="w-9 h-9 rounded-lg object-cover border border-emerald-300 shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-emerald-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">{uploadedFile.name}</p>
            <p className="text-[10px] text-slate-500">{formatFileSize(uploadedFile.size)} · Ready to analyze</p>
          </div>
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse shrink-0" />
          <button
            onClick={() => setUploadedFile(null)}
            className="shrink-0 w-6 h-6 rounded-full bg-white hover:bg-red-50 hover:text-red-500 text-slate-400 flex items-center justify-center transition-colors border border-slate-200"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* ── Input Box ── */}
      <div
        className={`rounded-2xl border-2 transition-all shadow-sm ${isDragging
            ? "border-emerald-400 bg-emerald-50 scale-[1.01] shadow-emerald-200 shadow-md"
            : "border-slate-200 bg-white hover:border-slate-300 focus-within:border-emerald-400 focus-within:shadow-emerald-100 focus-within:shadow-md"
          }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        {isDragging && (
          <div className="text-center py-6 text-sm text-emerald-600 font-semibold flex flex-col items-center gap-2">
            <FileUp className="w-8 h-8 text-emerald-400" />
            Drop your medical file here
          </div>
        )}

        {!isDragging && (
          <div className="flex items-end gap-2 p-3">
            {/* Upload btn */}
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Upload file"
              className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-emerald-100 hover:text-emerald-600 text-slate-500 transition-all hover:scale-105 active:scale-95"
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
                  ? "Ask about this file… or press Enter to auto-analyze"
                  : "Describe your symptoms or ask a medical question…"
              }
              rows={1}
              className="flex-1 resize-none bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400 max-h-32 leading-relaxed py-1.5 min-h-[36px]"
            />

            {/* Send btn */}
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || (!input.trim() && !uploadedFile)}
              className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-sm shadow-emerald-200"
            >
              {isLoading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />
              }
            </button>
          </div>
        )}

        {/* Footer hint */}
        {!isDragging && (
          <div className="flex items-center justify-between px-4 pb-2.5">
            <p className="text-[10px] text-slate-400">Press <kbd className="px-1 py-0.5 rounded bg-slate-100 text-slate-500 font-mono text-[9px]">Enter</kbd> to send · <kbd className="px-1 py-0.5 rounded bg-slate-100 text-slate-500 font-mono text-[9px]">Shift+Enter</kbd> for new line</p>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
              Powered by MediPulse AI
            </p>
          </div>
        )}
      </div>
    </div>
  );
}