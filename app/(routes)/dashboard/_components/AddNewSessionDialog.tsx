"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconArrowRight, IconPlus } from "@tabler/icons-react";
import { Textarea } from "@/components/ui/textarea";
import { DialogClose } from "@radix-ui/react-dialog";
import axios from "axios";
import DoctorAgentCard, { DoctorAgent } from "./DoctorAgentCard";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import SuggestedDoctorCard from "./SuggestedDoctorCard";

function AddNewSessionDialog() {
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [suggestedDoctors, setSuggestedDoctors] = useState<DoctorAgent[]>();
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorAgent>();

  const handleNextClick = async () => {
    if (!note.trim()) return;
    setLoading(true);
    try {
      const { data } = await axios.post("/api/suggest-doctors", {
        notes: note,
      });
      console.log("✅ Doctor Suggestions:", data);

      setSuggestedDoctors(data.message);

      toast.success("Doctor suggestions loaded!");
      new Audio("/success.wav").play();
    } catch (error) {
      console.error("❌ API Error:", error);
      toast.error("Failed to get suggestions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setNote("");
      setSuggestedDoctors(undefined);
      setLoading(false);
    }
  };

  const onStartConsultation = () => {
    //save all info to data
  };

  return (
    <Dialog onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button className="mt-4 flex items-center justify-center gap-2 rounded-xl group bg-primary text-white hover:bg-primary/90 transition-all">
          <IconPlus
            size={18}
            className="transition-transform duration-200 group-hover:rotate-90"
          />
          <span className="font-medium">Start a Consultation</span>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {suggestedDoctors ? "Suggested Doctors" : "Add Basic Details"}
          </DialogTitle>
          <DialogDescription>
            {suggestedDoctors
              ? "Choose a doctor to start your consultation"
              : "Add your symptoms to find the right specialist"}
          </DialogDescription>
        </DialogHeader>

        {/* MAIN CONTENT AREA */}
        {!suggestedDoctors ? (
          <div className="mt-4">
            <Textarea
              placeholder="e.g., I've had a fever for 3 days, sore throat, and fatigue."
              className="h-[200px]"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {suggestedDoctors.length > 0 ? (
              suggestedDoctors.map((doctor, index) => (
                <SuggestedDoctorCard
                  doctorAgent={doctor}
                  key={index}
                  setSelectedDoctor={() => setSelectedDoctor(doctor)}
                />
              ))
            ) : (
              <p className="col-span-3 text-center py-4 text-muted-foreground">
                No doctors found for your symptoms
              </p>
            )}
          </div>
        )}

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="rounded-xl">
              Cancel
            </Button>
          </DialogClose>

          {!suggestedDoctors ? (
            <Button
              type="button"
              disabled={!note.trim() || loading}
              onClick={handleNextClick}
              className="flex items-center gap-2 rounded-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Next</span>
                  <IconArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => onStartConsultation()}
              type="button"
              className="flex items-center gap-2 rounded-xl group bg-green-600 hover:bg-green-700 text-white"
            >
              <span>Start Consultation</span>
              <IconArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddNewSessionDialog;
