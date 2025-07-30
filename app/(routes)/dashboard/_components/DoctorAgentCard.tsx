import { Button } from "@/components/ui/button";
import { IconArrowRight } from "@tabler/icons-react";
import Image from "next/image";
import React from "react";

export type DoctorAgent = {
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
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition hover:shadow-lg w-full sm:max-w-sm mx-auto">
      <div className="relative w-full h-[200px]">
        <Image
          src={doctorAgent.image}
          alt={doctorAgent.specialist}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
          className="object-cover rounded-t-xl"
        />
      </div>
      <div className="p-3 md:p-4">
        <h2 className="font-semibold text-base md:text-lg text-gray-800">
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
