"use client";
import React, { useState } from "react";
import { Brain, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SymptomExtractionPage() {
  const [input, setInput] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);

  let recognition: any = null;
  if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
  }

  const handleMic = () => {
    if (!recognition) {
      setError("Speech recognition not supported in this browser.");
      return;
    }
    setError("");
    setListening(true);
    recognition.start();
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    recognition.onerror = (event: any) => {
      setError("Speech recognition error: " + event.error);
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
    };
  };

  const handleExtract = async () => {
    setLoading(true);
    setError("");
    setSymptoms([]);
    try {
      const res = await fetch("/api/nlp-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Extraction failed");
      setSymptoms(Array.isArray(data.entities) ? data.entities : []);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/dashboard">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-lg bg-primary-600 flex items-center justify-center">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
              NLP Symptom Extraction
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Extract symptoms from text or speech
            </p>
          </div>
        </div>

        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2 mb-2">
            <textarea
              className="w-full rounded border border-purple-200 dark:border-purple-800 p-2 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
              rows={3}
              placeholder="Describe your symptoms..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="button"
              onClick={handleMic}
              className={`ml-2 p-2 rounded-full border border-purple-300 dark:border-purple-700 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 ${listening ? "animate-pulse" : ""}`}
              title="Speak symptoms"
              disabled={listening}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18.75v1.5m0 0h3.375m-3.375 0H8.625M12 3.75v9m0 0a3 3 0 01-3-3V9a3 3 0 016 0v.75a3 3 0 01-3 3z"
                />
              </svg>
            </button>
          </div>
          <button
            className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            onClick={handleExtract}
            disabled={loading || !input.trim()}
          >
            {loading ? "Extracting..." : "Extract Symptoms"}
          </button>
        </div>
        <div className="space-y-2 mt-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Extracted Symptoms:
          </p>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <div className="flex flex-wrap gap-2">
            {symptoms.map((symptom, idx) => (
              <span
                key={symptom + idx}
                className="px-3 py-1.5 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium border border-purple-200 dark:border-purple-800"
              >
                {symptom}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
