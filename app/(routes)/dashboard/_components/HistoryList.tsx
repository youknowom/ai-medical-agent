"use client";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import Image from "next/image";
import React, { useState } from "react";
import AddNewSessionDialog from "./AddNewSessionDialog";

const HistoryList = () => {
  const [HistoryList, setHistoryList] = useState([]);
  return (
    <div className="mt-10">
      {HistoryList.length == 0 ? (
        <div className="flex items-center flex-col justify-center p-7 border-2 border-dashed rounded-2xl ">
          <Image
            src={"/medical-assistance.png"}
            alt="medical-assistance"
            width={150}
            height={150}
          />
          <h2 className="font-bold text-xl mt-5">No Recent Consultations</h2>
          <p>It looks like you haven't consulted with any doctors yet.</p>
          {/* <Button className="mt-3 rounded-xl bg-primary text-white hover:bg-primary/90 transition">
            + Start a Consultation
          </Button> */}
          {/* 
          <Button className="mt-4 flex items-center justify-center gap-2 rounded-xl group bg-primary text-white hover:bg-primary/90 transition-all">
            <IconPlus
              size={18}
              className="transition-transform duration-200 group-hover:rotate-90"
            />
            <span className="font-medium">Start a Consultation</span>
          </Button> */}
          <AddNewSessionDialog />
        </div>
      ) : (
        <div>List</div>
      )}
    </div>
  );
};

export default HistoryList;
