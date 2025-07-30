// import React from "react";
// import HistoryList from "./_components/HistoryList";
// import { Button } from "@/components/ui/button";
// import DoctorsAgentList from "./_components/DoctorsAgentList";

// const Dashboard = () => {
//   return (
//     <div>
//       <div className="flex justify-between items-center">
//         <h2 className="font-bold text-2xl">My Dashboard</h2>
//         <Button className="rounded-xl">+ Start a Consultation</Button>
//       </div>
//       <HistoryList />
//       <DoctorsAgentList />
//     </div>
//   );
// };

// export default Dashboard;
import React from "react";
import HistoryList from "./_components/HistoryList";
import { Button } from "@/components/ui/button";
import DoctorsAgentList from "./_components/DoctorsAgentList";

const Dashboard = () => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="font-bold text-2xl">My Dashboard</h2>
        <Button className="rounded-xl bg-primary text-white hover:bg-primary/90 transition">
          + Start a Consultation
        </Button>
      </div>
      <HistoryList />
      <DoctorsAgentList />
    </div>
  );
};

export default Dashboard;
