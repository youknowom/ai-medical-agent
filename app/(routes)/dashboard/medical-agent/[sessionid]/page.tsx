"use client";
import { useParams } from "next/navigation";
import React from "react";

function medicalVoiceAgent() {
  const { sessionId } = useParams();
  const GetSessionDetails = () => {};
  return <div>page</div>;
}

export default medicalVoiceAgent;
