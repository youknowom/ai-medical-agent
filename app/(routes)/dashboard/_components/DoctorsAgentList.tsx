import { AIDoctorAgents } from "@/shared/list";
import React from "react";
import DoctorAgentCard from "./DoctorAgentCard";

function DoctorsAgentList() {
  return (
    <div className="mt-10">
      <h2 className="font-semibold text-2xl text-gray-800">
        All Specialist Doctors Are Here to Help You
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 md:gap-8 mt-5">
        {AIDoctorAgents.map((doctor, index) => (
          <DoctorAgentCard key={index} doctorAgent={doctor} />
        ))}
      </div>
    </div>
  );
}

export default DoctorsAgentList;
