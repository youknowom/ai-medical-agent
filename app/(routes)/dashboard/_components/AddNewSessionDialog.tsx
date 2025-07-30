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

function AddNewSessionDialog() {
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const OnClickNext = async () => {
    setLoading(true);
    try {
      const result = await axios.post("/api/suggest-doctors", {
        notes: note,
      });

      console.log("✅ Doctor Suggestions:", result.data); // This will show result
    } catch (error) {
      console.error("❌ API Error:", error); // This will show if there's a backend error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
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
          <DialogDescription>
            Please describe symptoms or any other relevant information.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <Textarea
            placeholder="Add detail here"
            className="h-[200px]"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button className="rounded-xl" type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            disabled={!note.trim()}
            onClick={() => OnClickNext()}
            className="flex justify-between items-center group rounded-xl"
          >
            <span>Next</span>
            <IconArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddNewSessionDialog;
