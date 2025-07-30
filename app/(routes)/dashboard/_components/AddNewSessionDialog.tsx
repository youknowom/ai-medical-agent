// import React from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { IconPlus } from "@tabler/icons-react";
// import { Textarea } from "@/components/ui/textarea";
// import { DialogClose } from "@radix-ui/react-dialog";
// function AddNewSessionDialog() {
//   return (
//     <Dialog>
//       <DialogTrigger>
//         <Button className="mt-4 flex items-center justify-center gap-2 rounded-xl group bg-primary text-white hover:bg-primary/90 transition-all">
//           <IconPlus
//             size={18}
//             className="transition-transform duration-200 group-hover:rotate-90"
//           />
//           <span className="font-medium">Start a Consultation</span>
//         </Button>
//       </DialogTrigger>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Add Basic Details</DialogTitle>
//           <DialogDescription asChild>
//             <div>
//               <h2>Add Symtoms or ANy Other Deatils</h2>
//               <Textarea
//                 placeholder="Add detail here"
//                 className="h-[200px] mt-1"
//               />
//             </div>
//           </DialogDescription>
//         </DialogHeader>
//         <DialogFooter>
//           <DialogClose>
//             <Button variant={"outline"}>Cancel</Button>
//           </DialogClose>

//           <Button>Start</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// export default AddNewSessionDialog;
import React from "react";
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
import { IconPlus } from "@tabler/icons-react";
import { Textarea } from "@/components/ui/textarea";
import { DialogClose } from "@radix-ui/react-dialog";

function AddNewSessionDialog() {
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
          <Textarea placeholder="Add detail here" className="h-[200px]" />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button">Start</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddNewSessionDialog;
