import { Button } from "@/components/ui/button";
import { IconArrowRight } from "@tabler/icons-react";
import Image from "next/image";
import React from "react";

type DoctorAgent = {
  id: number;
  specialist: string;
  description: string;
  image: string;
  agentPrompt: string;
};

type Props = {
  doctorAgent: DoctorAgent;
};

function DoctorAgentCard({ doctorAgent }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition hover:shadow-lg">
      <Image
        src={doctorAgent.image}
        alt={doctorAgent.specialist}
        width={400}
        height={250}
        className="w-full h-[200px] object-cover"
      />
      <div className="p-4">
        <h2 className="font-semibold text-lg text-gray-800">
          {doctorAgent.specialist}
        </h2>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {doctorAgent.description}
        </p>
        <Button className="mt-4 w-full flex justify-between items-center group rounded-xl">
          <span>Start Consultation</span>
          <IconArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
        </Button>
      </div>
    </div>
  );
}

export default DoctorAgentCard;
