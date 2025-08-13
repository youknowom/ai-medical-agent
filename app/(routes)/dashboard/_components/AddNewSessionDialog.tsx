"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconArrowRight, IconPlus } from "@tabler/icons-react";
import { Textarea } from "@/components/ui/textarea";
import { DialogClose } from "@radix-ui/react-dialog";
import axios from "axios";
import DoctorAgentCard, { DoctorAgent } from "./DoctorAgentCard";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import SuggestedDoctorCard from "./SuggestedDoctorCard";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { SessionDetail } from "@/types/session";

function AddNewSessionDialog() {
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [suggestedDoctors, setSuggestedDoctors] = useState<DoctorAgent[]>();
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorAgent>();
  const router = useRouter();
  const [historyList, setHistoryList] = useState<SessionDetail[]>([]);
  const { has } = useAuth();
  //@ts-ignore
  const paidUser = has && has({ plan: "pro" });

  const handleNextClick = async () => {
    if (!note.trim()) return;
    setLoading(true);
    try {
      const { data } = await axios.post("/api/suggest-doctors", {
        notes: note,
      });
      console.log("✅ Doctor Suggestions:", data);
      setSuggestedDoctors(data.message);
      toast.success("Doctor suggestions loaded!");
      new Audio("/success.wav").play();
    } catch (error: any) {
      console.error("❌ API Error:", error.response || error.message);
      toast.error(
        error.response?.data?.error ||
          "Failed to get suggestions. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setNote("");
      setSuggestedDoctors(undefined);
      setLoading(false);
    }
  };

  const onStartConsultation = async () => {
    setLoading(true);
    try {
      const result = await axios.post("/api/session-chat", {
        notes: note,
        selectedDoctor: selectedDoctor,
      });

      if (!result.data?.sessionId) {
        throw new Error("No session ID returned");
      }

      router.push(`/dashboard/medical-agent/${result.data.sessionId}`);
    } catch (error) {
      console.error("❌ Failed to start session:", error);
      toast.error("Failed to start session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getHistoryList = async () => {
    try {
      const result = await axios.get("/api/session-chat?sessionId=all");
      console.log(result.data);
      setHistoryList(result.data);
    } catch (error) {
      console.error("Failed to fetch history list", error);
    }
  };

  useEffect(() => {
    getHistoryList();
  }, []);

  return (
    <Dialog onOpenChange={handleDialogClose}>
      {/* ... rest of your JSX remains exactly the same ... */}
    </Dialog>
  );
}

export default AddNewSessionDialog;
