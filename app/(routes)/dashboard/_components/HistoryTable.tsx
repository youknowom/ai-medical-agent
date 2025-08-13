import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { SessionDetail } from "../medical-agent/[sessionId]/page";
import { SessionDetail } from "@/types/session";
import { Button } from "@/components/ui/button";
import moment from "moment";
import { DoctorAgent } from "./DoctorAgentCard";
import { IconChevronDown } from "@tabler/icons-react";
import ViewReportDialog from "./ViewReportDialog";

type Props = {
  historyList: SessionDetail[] | SessionDetail; // Accept array or single object
};

function HistoryTable({ historyList }: Props) {
  const [showAll, setShowAll] = useState(false);

  // Ensure historyList is always an array
  const historyArray: SessionDetail[] = Array.isArray(historyList)
    ? historyList
    : historyList
    ? [historyList]
    : [];

  // Sort by createdOn descending
  const sortedHistory = [...historyArray].sort(
    (a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
  );

  // Show only 5 initially
  const visibleRecords = showAll ? sortedHistory : sortedHistory.slice(0, 5);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">
        Previous Consultation Reports
      </h3>

      {historyArray.length === 0 ? (
        <p className="text-gray-500">No consultation history found.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">
                  AI Medical Specialist
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRecords.map((record: SessionDetail) => {
                let doctor: DoctorAgent | null = record.selectedDoctor as any;
                if (typeof doctor === "string") {
                  try {
                    doctor = JSON.parse(doctor);
                  } catch {
                    doctor = null;
                  }
                }

                return (
                  <TableRow key={record.sessionId}>
                    <TableCell className="font-medium">
                      {doctor?.specialist ?? "N/A"}
                    </TableCell>
                    <TableCell>{record.notes}</TableCell>
                    <TableCell>
                      {moment(new Date(record.createdOn)).fromNow()}
                    </TableCell>
                    <TableCell className="text-right">
                      <ViewReportDialog record={record} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {historyArray.length > 5 && (
            <div className="flex justify-center mt-4">
              {/* <button
                aria-label={showAll ? "Show less" : "View more"}
                onClick={() => setShowAll(!showAll)}
                className="flex items-center gap-1 text-blue-600 focus:outline-none cursor-pointer"
              >
                {showAll ? "Show Less" : "View More"}
                <IconChevronDown
                  className={`transition-transform duration-300 ${
                    showAll ? "rotate-180" : ""
                  }`}
                  size={20}
                />
              </button> */}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default HistoryTable;
