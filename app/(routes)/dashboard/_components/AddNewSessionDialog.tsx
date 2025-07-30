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

function AddNewSessionDialog() {
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [suggestedDoctors, setSuggestedDoctors] = useState<DoctorAgent[]>();

  const OnClickNext = async () => {
    setLoading(true);
    try {
      const result = await axios.post("/api/suggest-doctors", {
        notes: note,
      });

      console.log("✅ Doctor Suggestions:", result.data);
      setSuggestedDoctors(result.data);
      toast.success("Doctor suggestions loaded!");

      // ✅ Play sound here
      const audio = new Audio("/success.wav");
      audio.play();
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
          <DialogTitle>Add Basic Details</DialogTitle>
          <DialogDescription asChild>
            {!suggestedDoctors ? (
              <div>
                <h2 className="text-sm text-muted-foreground">
                  Please describe your symptoms or relevant information to get
                  matched with a doctor.
                </h2>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold mb-2">
                  Suggested Doctors:
                </h3>

                {suggestedDoctors && suggestedDoctors.length > 0 ? (
                  suggestedDoctors.map((doctor) => (
                    <DoctorAgentCard key={doctor.id} doctorAgent={doctor} />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No suggestions found.
                  </p>
                )}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        {!suggestedDoctors && (
          <div className="mt-4">
            <Textarea
              placeholder="e.g., I’ve had a fever for 3 days, sore throat, and fatigue."
              className="h-[200px]"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button className="rounded-xl" type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>

          {!suggestedDoctors ? (
            <Button
              type="button"
              disabled={!note.trim() || loading}
              onClick={OnClickNext}
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
