"use client";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import AddNewSessionDialog from "./AddNewSessionDialog";
import axios from "axios";
import HistoryTable from "./HistoryTable";
// import { SessionDetail } from "../medical-agent/[sessionId]/page";
import { SessionDetail } from "@/types/session";
const HistoryList = () => {
  const [historyList, setHistoryList] = useState<SessionDetail[]>([]);

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
    <div className="mt-10">
      {historyList.length === 0 ? (
        <div className="flex items-center flex-col justify-center p-7 border-2 border-dashed rounded-2xl ">
          <Image
            src={"/medical-assistance.png"}
            alt="medical-assistance"
            width={150}
            height={150}
          />
          <h2 className="font-bold text-xl mt-5">No Recent Consultations</h2>
          <p>It looks like you haven't consulted with any doctors yet.</p>
          <AddNewSessionDialog />
        </div>
      ) : (
        <HistoryTable historyList={historyList} />
      )}
    </div>
  );
};

export default HistoryList;
