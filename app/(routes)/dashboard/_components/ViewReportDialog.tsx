import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SessionDetail } from "../medical-agent/[sessionId]/page";
import moment from "moment";
import jsPDF from "jspdf";
import { DoctorAgent } from "./DoctorAgentCard";

type Props = {
  record: SessionDetail;
};

function ViewReportDialog({ record }: Props) {
  // Ensure selectedDoctor is always parsed
  let doctor: DoctorAgent | null = record.selectedDoctor as any;
  if (typeof doctor === "string") {
    try {
      doctor = JSON.parse(doctor);
    } catch {
      doctor = null;
    }
  }

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Medical AI Voice Agent Report", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Doctor Specialization: ${doctor?.specialist || "N/A"}`, 20, 40);
    doc.text(
      `Consult Date: ${moment(new Date(record?.createdOn)).format("LLL")}`,
      20,
      50
    );
    doc.text(`Notes:`, 20, 70);

    const splitNotes = doc.splitTextToSize(
      record.notes || "No notes available.",
      170
    );
    doc.text(splitNotes, 20, 80);

    doc.save(`report-${record.sessionId}.pdf`);
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="link" size="sm">
          View Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle asChild>
            <h2 className="text-center text-4xl">
              Medical AI Voice Agent Report
            </h2>
          </DialogTitle>
          <DialogDescription asChild>
            <div className="mt-10">
              <h2 className="font-bold text-blue-500 text-lg">Video Info</h2>
              <div className="grid grid-cols-2 gap-4">
                <h2>
                  <span className="font-bold">Doctor Specialization:</span>{" "}
                  {doctor?.specialist || "N/A"}
                </h2>
                <h2>
                  <span className="font-bold">Consult Date:</span>{" "}
                  {moment(new Date(record?.createdOn)).fromNow()}
                </h2>
              </div>
              <div className="mt-6">
                <h2 className="font-bold">Notes:</h2>
                <p>{record.notes || "No notes available."}</p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleDownloadPDF}>Download Report</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ViewReportDialog;
