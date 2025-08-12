import React from "react";
import HistoryList from "./_components/HistoryList";
import { Button } from "@/components/ui/button";
import DoctorsAgentList from "./_components/DoctorsAgentList";
import AddNewSessionDialog from "./_components/AddNewSessionDialog";

const Dashboard = () => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="font-bold text-2xl">My Dashboard</h2>
        <AddNewSessionDialog />
      </div>
      <HistoryList />
      <DoctorsAgentList />
    </div>
  );
};

export default Dashboard;
