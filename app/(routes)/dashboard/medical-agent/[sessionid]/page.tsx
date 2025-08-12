"use client";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { DoctorAgent } from "../../_components/DoctorAgentCard";
import Vapi from "@vapi-ai/web";
import { Circle, PhoneCall, PhoneOff } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

type SessionDetail = {
  id: number;
  notes: string;
  sessionId: string;
  report: object;
  selectedDoctor: DoctorAgent;
  createdOn: string;
};

type Message = {
  role: string;
  text: string;
};

function MedicalVoiceAgentPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [sessionDetails, setSessionDetails] = useState<SessionDetail>();
  const [callStarted, setCallStarted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [vapiInstance, setVapiInstance] = useState<any>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [callDuration, setCallDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const callStartSound = useRef<HTMLAudioElement | null>(null);
  const callEndSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (sessionId) getSessionDetails();

    callStartSound.current = new Audio("/call-start.wav");
    callEndSound.current = new Audio("/call-end.wav");
    callStartSound.current.volume = 0.7;
    callEndSound.current.volume = 0.7;

    return () => {
      callStartSound.current?.remove();
      callEndSound.current?.remove();
      if (vapiInstance) {
        vapiInstance.stop();
        vapiInstance.removeAllListeners?.();
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionId]);

  const getSessionDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await axios.get(
        `/api/session-chat?sessionId=${sessionId}`
      );
      setSessionDetails(result.data);
    } catch (error) {
      console.error("Failed to fetch session details:", error);
      setError("Failed to load session details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const min = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  const startCall = async () => {
    if (!process.env.NEXT_PUBLIC_VAPI_API_KEY) {
      setError("API key is missing.");
      return;
    }

    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY);
    setVapiInstance(vapi);

    // Log voiceId for debugging
    console.log("🧠 Using voiceId:", sessionDetails?.selectedDoctor?.voiceId);

    const VapiAgentConfig = {
      name: "AI Medical Doctor Voice Agent",
      firstMessage: "Hello! Please tell me your name and age to begin.",
      transcriber: {
        provider: "assembly-ai",
        language: "en",
      },
      voice: {
        provider: "vapi",
        voiceId: "will", // ✅ Hardcoded for testing; replace later with dynamic voiceId
        // voiceId: sessionDetails?.selectedDoctor?.voiceId,
      },
      model: {
        provider: "openai",
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              sessionDetails?.selectedDoctor?.agentPrompt ||
              "You are a friendly AI doctor. Speak professionally with patients.",
          },
        ],
      },
    };

    try {
      vapi.on("call-start", () => {
        callStartSound.current?.play();
        setCallStarted(true);
        setCallEnded(false);
        setError(null);
        timerRef.current = setInterval(() => {
          setCallDuration((prev) => prev + 1);
        }, 1000);
      });

      vapi.on("call-end", () => {
        callEndSound.current?.play();
        setCallStarted(false);
        setCallEnded(true);
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeout(() => setCallEnded(false), 2000);
      });

      vapi.on("message", (message: any) => {
        if (message.type === "transcript") {
          const { role, transcriptType, transcript } = message;
          if (transcriptType === "partial") {
            setLiveTranscript(transcript);
            setCurrentRole(role);
          } else if (transcriptType === "final") {
            setMessages((prev) => [...prev, { role, text: transcript }]);
            setLiveTranscript("");
            setCurrentRole(null);
          }
        }
      });

      vapi.on("speech-start", () => setCurrentRole("assistant"));
      vapi.on("speech-end", () => setCurrentRole("user"));
      vapi.on("error", (error: any) => {
        console.error("Call error:", error);
        setError(`Call failed: ${error.message || "Unknown error"}`);
        endCall();
      });
      //@ts-ignore
      const call = await vapi.start(VapiAgentConfig);
      if (!call) throw new Error("Failed to initialize call");
    } catch (error: any) {
      console.error("Error during call start:", error);
      setError(`Failed to start call: ${error.message || "Unknown error"}`);
      endCall();
    }
  };

  const endCall = () => {
    if (!vapiInstance) return;
    try {
      vapiInstance.stop();
      callEndSound.current?.play();
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
      setCallStarted(false);
      setCallEnded(true);
      setTimeout(() => {
        setCallEnded(false);
        setVapiInstance(null);
      }, 2000);
    } catch (error) {
      console.error("Error ending call:", error);
      setError("Error ending call. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 rounded-3xl bg-gray border">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={getSessionDetails}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden p-5 rounded-3xl bg-gray transition-all duration-700 border">
      {callStarted && (
        <div className="absolute inset-0 bg-green-200 opacity-20 animate-pulse pointer-events-none z-0" />
      )}
      {callEnded && (
        <div className="absolute inset-0 bg-red-400 opacity-40 animate-fade pointer-events-none z-0" />
      )}

      <div className="relative z-10">
        <div className="flex justify-between items-center">
          <h2 className="p-1 px-2 border rounded-md flex gap-2 items-center">
            <Circle
              className={`h-4 w-4 rounded-full ${
                callStarted ? "bg-green-500" : "bg-red-500"
              }`}
            />
            {callStarted ? "Connected" : "Not Connected"}
          </h2>
          <h2 className="font-bold text-xl text-gray-400">
            {formatTime(callDuration)}
          </h2>
        </div>

        {sessionDetails && (
          <div className="flex items-center flex-col mt-10">
            <Image
              src={sessionDetails.selectedDoctor.image}
              alt={sessionDetails.selectedDoctor.description}
              width={120}
              height={120}
              className="h-[100px] w-[100px] object-cover rounded-full"
              priority
            />
            <h2 className="mt-2 text-lg">
              {sessionDetails.selectedDoctor.specialist}
            </h2>
            <p className="text-sm text-gray-400">AI Medical Doctor</p>

            <div className="mt-12 px-4 w-full h-[260px] md:h-[300px] flex flex-col justify-end overflow-hidden border rounded-xl bg-white text-black">
              {messages.slice(-4).map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 m-1 rounded-lg max-w-[80%] shadow-sm ${
                    msg.role === "user"
                      ? "bg-blue-100 self-end text-black"
                      : "bg-gray-100 self-start text-black"
                  }`}
                >
                  <strong className="block text-sm text-gray-500">
                    {msg.role === "user" ? "You" : "Doctor"}
                  </strong>
                  <p className="text-sm">{msg.text}</p>
                </div>
              ))}

              {liveTranscript && (
                <div
                  className={`p-3 m-1 rounded-lg max-w-[80%] italic animate-pulse shadow ${
                    currentRole === "user"
                      ? "bg-blue-200 self-end text-black"
                      : "bg-green-100 self-start text-black"
                  }`}
                >
                  {currentRole === "user" ? "You" : "Doctor"}: {liveTranscript}
                </div>
              )}
            </div>

            {!callStarted ? (
              <Button
                className="mt-10 cursor-pointer"
                onClick={startCall}
                disabled={isLoading}
              >
                <PhoneCall className="mr-2 animate-pulse" />
                Start Call
              </Button>
            ) : (
              <Button
                variant="destructive"
                className="mt-10 cursor-pointer"
                onClick={endCall}
              >
                <PhoneOff className="mr-2 animate-vibrate" />
                Disconnect
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MedicalVoiceAgentPage;
