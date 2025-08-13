"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { IconArrowRight } from "@tabler/icons-react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

export type DoctorAgent = {
  id: number;
  specialist: string;
  description: string;
  image: string;
  voiceId?: string;
  agentPrompt: string;
  subscriptionRequired: boolean;
};

type Props = {
  doctorAgent: DoctorAgent;
};

function DoctorAgentCard({ doctorAgent }: Props) {
  const { has } = useAuth();
  //@ts-ignore
  const paidUser = has && has({ plan: "pro" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onStartConsultation = async () => {
    setLoading(true);
    try {
      const result = await axios.post("/api/session-chat", {
        notes: "New Query",
        selectedDoctor: doctorAgent,
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

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition hover:shadow-lg w-full sm:max-w-sm mx-auto">
      {/* Image section */}
      <div className="relative w-full h-[200px]">
        {doctorAgent.subscriptionRequired && (
          <Badge className="absolute m-2 right-0 z-10 bg-red-500 text-white shadow-md">
            Premium
          </Badge>
        )}
        <Image
          src={doctorAgent.image}
          alt={doctorAgent.specialist}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
          className="object-cover rounded-t-xl"
        />
      </div>

      {/* Content section */}
      <div className="p-3 md:p-4">
        <h2 className="font-semibold text-base md:text-lg text-gray-800">
          {doctorAgent.specialist}
        </h2>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {doctorAgent.description}
        </p>
        <Button
          onClick={onStartConsultation}
          className="mt-4 w-full flex justify-between items-center group rounded-xl"
          disabled={!paidUser && doctorAgent.subscriptionRequired}
        >
          <span>Start Consultation</span>
          <IconArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
        </Button>
      </div>
    </div>
  );
}

export default DoctorAgentCard;
