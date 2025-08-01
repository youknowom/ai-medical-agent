// // // "use client";
// // // import axios from "axios";
// // // import { useParams } from "next/navigation";
// // // import React, { useEffect, useState } from "react";
// // // import { DoctorAgent } from "../../_components/DoctorAgentCard";
// // // import Vapi from "@vapi-ai/web";
// // // import { Circle, PhoneCall, PhoneOff } from "lucide-react";
// // // import Image from "next/image";
// // // import { Button } from "@/components/ui/button";
// // // type sessionDetail = {
// // //   id: number;
// // //   notes: string;
// // //   sessionId: string;
// // //   report: JSON;
// // //   selectedDoctor: DoctorAgent;
// // //   createdOn: string;
// // // };
// // // type messages = {
// // //   role: string;
// // //   text: string;
// // // };
// // // function MedicalVoiceAgentPage() {
// // //   const params = useParams();
// // //   const sessionId = params.sessionId as string;
// // //   const [sessionDetails, setsessionDetails] = useState<sessionDetail>();
// // //   const [callStarted, setCallStarted] = useState(false);
// // //   const [vapiInstance, setVapiInstance] = useState<any>();
// // //   const [currentRoll, setCurrentRole] = useState<string | null>();
// // //   const [liveTranscript, setLiveTranscript] = useState<string>();
// // //   const [message, setMessage] = useState<messages[]>([]);

// // //   useEffect(() => {
// // //     if (sessionId) {
// // //       GetSessionDetails();
// // //     }
// // //   }, [sessionId]);

// // //   const GetSessionDetails = async () => {
// // //     try {
// // //       const result = await axios.get(
// // //         "/api/session-chat?sessionId=" + sessionId
// // //       );
// // //       console.log("🟢 Session details:", result.data);
// // //       setsessionDetails(result.data);
// // //     } catch (error) {
// // //       console.error("🔴 Failed to fetch session details:", error);
// // //     }
// // //   };
// // //   const StartCall = () => {
// // //     //Vapi Intigration
// // //     const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
// // //     setVapiInstance(vapi);
// // //     // Start voice conversation
// // //     vapi.start(process.env.NEXT_PUBLIC_VAPI_VOICE_ASSISTANT_ID);

// // //     // Listen for events
// // //     vapi.on("call-start", () => {
// // //       console.log("Call started");
// // //       setCallStarted(true);
// // //     });

// // //     vapi.on("call-end", () => {
// // //       console.log("Call ended");
// // //       setCallStarted(false);
// // //     });

// // //     vapi.on("message", (message) => {
// // //       if (message.type === "transcript") {
// // //         const { role, transcriptType, transcript } = message;
// // //         console.log(`${message.role}: ${message.transcript}`);
// // //         if (transcriptType == "partial") {
// // //           setLiveTranscript(transcript);
// // //           setCurrentRole(role);
// // //         } else if (transcriptType == "final") {
// // //           //final transcript
// // //           setMessage((prev: any) => [
// // //             ...prev,
// // //             { role: role, text: transcript },
// // //           ]);
// // //           setLiveTranscript("");
// // //           setCurrentRole(null);
// // //         }
// // //       }
// // //     });
// // //     vapiInstance.on("speech-start", () => {
// // //       console.log("Assistant started speaking");
// // //       setCurrentRole("assistant");
// // //     });
// // //     vapiInstance.on("speech-end", () => {
// // //       console.log("Assistant stopped speaking");
// // //       setCurrentRole("user");
// // //     });
// // //   };
// // //   const endCall = () => {
// // //     if (!vapiInstance) return;

// // //     //stop the call
// // //     vapiInstance.stop();
// // //     vapiInstance.off("call-start");
// // //     vapiInstance.off("call-end");
// // //     vapiInstance.off("message");

// // //     //Reset call state
// // //     setCallStarted(false);
// // //     setVapiInstance(null);
// // //   };

// // //   return (
// // //     <div className="p-5 border rounded-3xl bg-secondary">
// // //       <div className="flex justify-between items-center">
// // //         <h2 className="p-1 px-2 border rounded-md flex gap-2 items-center">
// // //           <Circle
// // //             className={`h-4 w-4 rounded-full ${
// // //               callStarted ? "bg-green-500" : "bg-red-500"
// // //             }`}
// // //           />
// // //           {callStarted ? "connected" : "Not Connected"}
// // //         </h2>
// // //         <h2 className="font-bold text-xl text-gray-400">00.00</h2>
// // //       </div>
// // //       {sessionDetails && (
// // //         <div className="flex items-center flex-col mt-10">
// // //           <Image
// // //             src={sessionDetails?.selectedDoctor?.image}
// // //             alt={sessionDetails?.selectedDoctor?.description}
// // //             width={120}
// // //             height={120}
// // //             className="h-[100px] w-[100px] object-cover rounded-full"
// // //           />
// // //           <h2 className="mt-2 text-lg">
// // //             {sessionDetails?.selectedDoctor?.specialist}
// // //           </h2>
// // //           <p className="text-sm text-gray-400">AI Medical Voice Agenet</p>

// // //           <div className="mt-12 overflow-y-auto flex flex-col items-center px-10 md:px-28 lg:px-52 xl:px-72">
// // //             {message?.slice(-4).map((msg: messages, index) => {
// // //               <h2 className="text-gray-400 p-2" key={index}>
// // //                 {msg.role}
// // //                 {msg.text}
// // //               </h2>;
// // //             })}

// // //             {liveTranscript && liveTranscript?.length > 0 && (
// // //               <h2 className="text-lg">
// // //                 {currentRoll}:{liveTranscript}
// // //               </h2>
// // //             )}
// // //           </div>
// // //           {!callStarted ? (
// // //             <Button className="mt-20" onClick={StartCall}>
// // //               <PhoneCall />
// // //               Start Call
// // //             </Button>
// // //           ) : (
// // //             <Button variant={"destructive"} onClick={endCall}>
// // //               <PhoneOff />
// // //               Disconnect
// // //             </Button>
// // //           )}
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // }

// // // export default MedicalVoiceAgentPage;
// // // //1.53.15
// // "use client";
// // import axios from "axios";
// // import { useParams } from "next/navigation";
// // import React, { useEffect, useState, useRef } from "react";
// // import { DoctorAgent } from "../../_components/DoctorAgentCard";
// // import Vapi from "@vapi-ai/web";
// // import { Circle, PhoneCall, PhoneOff } from "lucide-react";
// // import Image from "next/image";
// // import { Button } from "@/components/ui/button";

// // type sessionDetail = {
// //   id: number;
// //   notes: string;
// //   sessionId: string;
// //   report: JSON;
// //   selectedDoctor: DoctorAgent;
// //   createdOn: string;
// // };

// // type messages = {
// //   role: string;
// //   text: string;
// // };

// // function MedicalVoiceAgentPage() {
// //   const params = useParams();
// //   const sessionId = params.sessionId as string;
// //   const [sessionDetails, setsessionDetails] = useState<sessionDetail>();
// //   const [callStarted, setCallStarted] = useState(false);
// //   const [vapiInstance, setVapiInstance] = useState<any>();
// //   const [currentRoll, setCurrentRole] = useState<string | null>();
// //   const [liveTranscript, setLiveTranscript] = useState<string>();
// //   const [message, setMessage] = useState<messages[]>([]);
// //   const [callDuration, setCallDuration] = useState(0);
// //   const timerRef = useRef<NodeJS.Timeout | null>(null);

// //   useEffect(() => {
// //     if (sessionId) GetSessionDetails();
// //   }, [sessionId]);

// //   const GetSessionDetails = async () => {
// //     try {
// //       const result = await axios.get(
// //         "/api/session-chat?sessionId=" + sessionId
// //       );
// //       setsessionDetails(result.data);
// //     } catch (error) {
// //       console.error("🔴 Failed to fetch session details:", error);
// //     }
// //   };

// //   const formatTime = (seconds: number): string => {
// //     const min = Math.floor(seconds / 60)
// //       .toString()
// //       .padStart(2, "0");
// //     const sec = (seconds % 60).toString().padStart(2, "0");
// //     return `${min}:${sec}`;
// //   };

// //   const StartCall = () => {
// //     const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
// //     setVapiInstance(vapi);
// //     vapi.start(process.env.NEXT_PUBLIC_VAPI_VOICE_ASSISTANT_ID);

// //     vapi.on("call-start", () => {
// //       console.log("Call started");
// //       setCallStarted(true);
// //       timerRef.current = setInterval(() => {
// //         setCallDuration((prev) => prev + 1);
// //       }, 1000);
// //     });

// //     vapi.on("call-end", () => {
// //       console.log("Call ended");
// //       setCallStarted(false);
// //       if (timerRef.current) clearInterval(timerRef.current);
// //     });

// //     vapi.on("message", (message) => {
// //       if (message.type === "transcript") {
// //         const { role, transcriptType, transcript } = message;
// //         if (transcriptType === "partial") {
// //           setLiveTranscript(transcript);
// //           setCurrentRole(role);
// //         } else if (transcriptType === "final") {
// //           setMessage((prev) => [...prev, { role, text: transcript }]);
// //           setLiveTranscript("");
// //           setCurrentRole(null);
// //         }
// //       }
// //     });

// //     vapi.on("speech-start", () => setCurrentRole("assistant"));
// //     vapi.on("speech-end", () => setCurrentRole("user"));
// //   };

// //   const endCall = () => {
// //     if (!vapiInstance) return;
// //     vapiInstance.stop();
// //     vapiInstance.removeAllListeners?.();
// //     if (timerRef.current) clearInterval(timerRef.current);
// //     setCallDuration(0);
// //     setCallStarted(false);
// //     setVapiInstance(null);
// //   };

// //   return (
// //     <div className="p-5 border rounded-3xl bg-secondary">
// //       <div className="flex justify-between items-center">
// //         <h2 className="p-1 px-2 border rounded-md flex gap-2 items-center">
// //           <Circle
// //             className={`h-4 w-4 rounded-full ${
// //               callStarted ? "bg-green-500" : "bg-red-500"
// //             }`}
// //           />
// //           {callStarted ? "Connected" : "Not Connected"}
// //         </h2>
// //         <h2 className="font-bold text-xl text-gray-400">
// //           {formatTime(callDuration)}
// //         </h2>
// //       </div>

// //       {sessionDetails && (
// //         <div className="flex items-center flex-col mt-10">
// //           <Image
// //             src={sessionDetails?.selectedDoctor?.image}
// //             alt={sessionDetails?.selectedDoctor?.description}
// //             width={120}
// //             height={120}
// //             className="h-[100px] w-[100px] object-cover rounded-full"
// //           />
// //           <h2 className="mt-2 text-lg">
// //             {sessionDetails?.selectedDoctor?.specialist}
// //           </h2>
// //           <p className="text-sm text-gray-400">AI Medical Voice Agent</p>

// //           <div className="mt-12 px-4 w-full h-[260px] md:h-[300px] flex flex-col justify-end overflow-hidden border rounded-xl bg-white text-black transition-all">
// //             {[...message.slice(-4)].map((msg, index) => (
// //               <div
// //                 key={index}
// //                 className={`p-3 m-1 rounded-lg max-w-[80%] transition-all duration-300 shadow-sm ${
// //                   msg.role === "user"
// //                     ? "bg-blue-100 self-end text-black"
// //                     : "bg-gray-100 self-start text-black"
// //                 }`}
// //               >
// //                 <strong className="block text-sm text-gray-500">
// //                   {msg.role}
// //                 </strong>
// //                 <p className="text-sm">{msg.text}</p>
// //               </div>
// //             ))}

// //             {liveTranscript && (
// //               <div
// //                 className={`p-3 m-1 rounded-lg max-w-[80%] italic animate-pulse shadow ${
// //                   currentRoll === "user"
// //                     ? "bg-blue-200 self-end text-black"
// //                     : "bg-green-100 self-start text-black"
// //                 }`}
// //               >
// //                 {currentRoll}: {liveTranscript}
// //               </div>
// //             )}
// //           </div>

// //           {!callStarted ? (
// //             <Button className="mt-10" onClick={StartCall}>
// //               <PhoneCall className="mr-2" />
// //               Start Call
// //             </Button>
// //           ) : (
// //             <Button variant="destructive" className="mt-10" onClick={endCall}>
// //               <PhoneOff className="mr-2" />
// //               Disconnect
// //             </Button>
// //           )}
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // export default MedicalVoiceAgentPage;
// "use client";
// import axios from "axios";
// import { useParams } from "next/navigation";
// import React, { useEffect, useRef, useState } from "react";
// import { DoctorAgent } from "../../_components/DoctorAgentCard";
// import Vapi from "@vapi-ai/web";
// import { Circle, PhoneCall, PhoneOff } from "lucide-react";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";

// type sessionDetail = {
//   id: number;
//   notes: string;
//   sessionId: string;
//   report: JSON;
//   selectedDoctor: DoctorAgent;
//   createdOn: string;
// };

// type messages = {
//   role: string;
//   text: string;
// };

// function MedicalVoiceAgentPage() {
//   const params = useParams();
//   const sessionId = params.sessionId as string;

//   const [sessionDetails, setsessionDetails] = useState<sessionDetail>();
//   const [callStarted, setCallStarted] = useState(false);
//   const [vapiInstance, setVapiInstance] = useState<any>();
//   const [currentRoll, setCurrentRole] = useState<string | null>();
//   const [liveTranscript, setLiveTranscript] = useState<string>();
//   const [message, setMessage] = useState<messages[]>([]);
//   const [callDuration, setCallDuration] = useState(0);

//   const timerRef = useRef<NodeJS.Timeout | null>(null);
//   const callStartSound = useRef<HTMLAudioElement | null>(null);
//   const callEndSound = useRef<HTMLAudioElement | null>(null);

//   useEffect(() => {
//     if (sessionId) GetSessionDetails();

//     // Load sound files
//     callStartSound.current = new Audio("/call-start.wav");
//     callEndSound.current = new Audio("/call-end.wav");

//     // Optional: adjust volume
//     if (callStartSound.current) callStartSound.current.volume = 0.7;
//     if (callEndSound.current) callEndSound.current.volume = 0.7;
//   }, [sessionId]);

//   const GetSessionDetails = async () => {
//     try {
//       const result = await axios.get(
//         "/api/session-chat?sessionId=" + sessionId
//       );
//       setsessionDetails(result.data);
//     } catch (error) {
//       console.error("🔴 Failed to fetch session details:", error);
//     }
//   };

//   const formatTime = (seconds: number): string => {
//     const min = Math.floor(seconds / 60)
//       .toString()
//       .padStart(2, "0");
//     const sec = (seconds % 60).toString().padStart(2, "0");
//     return `${min}:${sec}`;
//   };

//   const StartCall = () => {
//     const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
//     setVapiInstance(vapi);
//     vapi.start(process.env.NEXT_PUBLIC_VAPI_VOICE_ASSISTANT_ID);

//     vapi.on("call-start", () => {
//       console.log("Call started");
//       callStartSound.current?.play();
//       setCallStarted(true);
//       timerRef.current = setInterval(() => {
//         setCallDuration((prev) => prev + 1);
//       }, 1000);
//     });

//     vapi.on("call-end", () => {
//       console.log("Call ended");
//       callEndSound.current?.play();
//       setCallStarted(false);
//       if (timerRef.current) clearInterval(timerRef.current);
//     });

//     vapi.on("message", (message) => {
//       if (message.type === "transcript") {
//         const { role, transcriptType, transcript } = message;
//         if (transcriptType === "partial") {
//           setLiveTranscript(transcript);
//           setCurrentRole(role);
//         } else if (transcriptType === "final") {
//           setMessage((prev) => [...prev, { role, text: transcript }]);
//           setLiveTranscript("");
//           setCurrentRole(null);
//         }
//       }
//     });

//     vapi.on("speech-start", () => setCurrentRole("assistant"));
//     vapi.on("speech-end", () => setCurrentRole("user"));
//   };

//   const endCall = () => {
//     if (!vapiInstance) return;
//     vapiInstance.stop();
//     vapiInstance.removeAllListeners?.();
//     callEndSound.current?.play();
//     if (timerRef.current) clearInterval(timerRef.current);
//     setCallDuration(0);
//     setCallStarted(false);
//     setVapiInstance(null);
//   };

//   return (
//     <div className="p-5 border rounded-3xl bg-secondary">
//       <div className="flex justify-between items-center">
//         <h2 className="p-1 px-2 border rounded-md flex gap-2 items-center">
//           <Circle
//             className={`h-4 w-4 rounded-full ${
//               callStarted ? "bg-green-500" : "bg-red-500"
//             }`}
//           />
//           {callStarted ? "Connected" : "Not Connected"}
//         </h2>
//         <h2 className="font-bold text-xl text-gray-400">
//           {formatTime(callDuration)}
//         </h2>
//       </div>

//       {sessionDetails && (
//         <div className="flex items-center flex-col mt-10">
//           <Image
//             src={sessionDetails?.selectedDoctor?.image}
//             alt={sessionDetails?.selectedDoctor?.description}
//             width={120}
//             height={120}
//             className="h-[100px] w-[100px] object-cover rounded-full"
//           />
//           <h2 className="mt-2 text-lg">
//             {sessionDetails?.selectedDoctor?.specialist}
//           </h2>
//           <p className="text-sm text-gray-400">AI Medical Voice Agent</p>

//           <div className="mt-12 px-4 w-full h-[260px] md:h-[300px] flex flex-col justify-end overflow-hidden border rounded-xl bg-white text-black transition-all">
//             {[...message.slice(-4)].map((msg, index) => (
//               <div
//                 key={index}
//                 className={`p-3 m-1 rounded-lg max-w-[80%] transition-all duration-300 shadow-sm ${
//                   msg.role === "user"
//                     ? "bg-blue-100 self-end text-black"
//                     : "bg-gray-100 self-start text-black"
//                 }`}
//               >
//                 <strong className="block text-sm text-gray-500">
//                   {msg.role}
//                 </strong>
//                 <p className="text-sm">{msg.text}</p>
//               </div>
//             ))}

//             {liveTranscript && (
//               <div
//                 className={`p-3 m-1 rounded-lg max-w-[80%] italic animate-pulse shadow ${
//                   currentRoll === "user"
//                     ? "bg-blue-200 self-end text-black"
//                     : "bg-green-100 self-start text-black"
//                 }`}
//               >
//                 {currentRoll}: {liveTranscript}
//               </div>
//             )}
//           </div>

//           {!callStarted ? (
//             <Button className="mt-10" onClick={StartCall}>
//               <PhoneCall className="mr-2" />
//               Start Call
//             </Button>
//           ) : (
//             <Button variant="destructive" className="mt-10" onClick={endCall}>
//               <PhoneOff className="mr-2" />
//               Disconnect
//             </Button>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// export default MedicalVoiceAgentPage;
"use client";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { DoctorAgent } from "../../_components/DoctorAgentCard";
import Vapi from "@vapi-ai/web";
import { Circle, PhoneCall, PhoneOff } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

type sessionDetail = {
  id: number;
  notes: string;
  sessionId: string;
  report: JSON;
  selectedDoctor: DoctorAgent;
  createdOn: string;
};

type messages = {
  role: string;
  text: string;
};

function MedicalVoiceAgentPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [sessionDetails, setsessionDetails] = useState<sessionDetail>();
  const [callStarted, setCallStarted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [vapiInstance, setVapiInstance] = useState<any>();
  const [currentRoll, setCurrentRole] = useState<string | null>();
  const [liveTranscript, setLiveTranscript] = useState<string>();
  const [message, setMessage] = useState<messages[]>([]);
  const [callDuration, setCallDuration] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const callStartSound = useRef<HTMLAudioElement | null>(null);
  const callEndSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (sessionId) GetSessionDetails();

    callStartSound.current = new Audio("/call-start.wav");
    callEndSound.current = new Audio("/call-end.wav");

    callStartSound.current.volume = 0.7;
    callEndSound.current.volume = 0.7;
  }, [sessionId]);

  const GetSessionDetails = async () => {
    try {
      const result = await axios.get(
        "/api/session-chat?sessionId=" + sessionId
      );
      setsessionDetails(result.data);
    } catch (error) {
      console.error("🔴 Failed to fetch session details:", error);
    }
  };

  const formatTime = (seconds: number): string => {
    const min = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  const StartCall = () => {
    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
    setVapiInstance(vapi);
    vapi.start(process.env.NEXT_PUBLIC_VAPI_VOICE_ASSISTANT_ID);

    vapi.on("call-start", () => {
      callStartSound.current?.play();
      setCallStarted(true);
      setCallEnded(false);
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    });

    vapi.on("call-end", () => {
      callEndSound.current?.play();
      setCallStarted(false);
      setCallEnded(true);
      if (timerRef.current) clearInterval(timerRef.current);

      setTimeout(() => {
        setCallEnded(false);
      }, 2000);
    });

    vapi.on("message", (message) => {
      if (message.type === "transcript") {
        const { role, transcriptType, transcript } = message;
        if (transcriptType === "partial") {
          setLiveTranscript(transcript);
          setCurrentRole(role);
        } else if (transcriptType === "final") {
          setMessage((prev) => [...prev, { role, text: transcript }]);
          setLiveTranscript("");
          setCurrentRole(null);
        }
      }
    });

    vapi.on("speech-start", () => setCurrentRole("assistant"));
    vapi.on("speech-end", () => setCurrentRole("user"));
  };

  const endCall = () => {
    if (!vapiInstance) return;
    vapiInstance.stop();
    vapiInstance.removeAllListeners?.();
    callEndSound.current?.play();

    if (timerRef.current) clearInterval(timerRef.current);
    setCallDuration(0);
    setCallStarted(false);
    setCallEnded(true);

    setTimeout(() => {
      setCallEnded(false);
    }, 2000);

    setVapiInstance(null);
  };
  return (
    <div className="relative overflow-hidden p-5 rounded-3xl bg-gray transition-all duration-700 border">
      {/* GREEN pulsing overlay when call is active */}
      {callStarted && (
        <div className="absolute inset-0 bg-green-200 opacity-20 animate-pulse pointer-events-none z-0"></div>
      )}

      {/* RED flash overlay when call just ended */}
      {callEnded && (
        <div className="absolute inset-0 bg-red-400 opacity-40 animate-fade pointer-events-none z-0"></div>
      )}

      {/* Main content */}
      <div className="relative z-10">
        <div className="flex justify-between items-center">
          <h2 className="p-1 px-2 border rounded-md flex gap-2 items-center">
            <Circle
              className={`h-4 w-4 rounded-full ${
                callStarted ? "bg-green-500" : "bg-red-500"
              }`}
            />
            {callStarted ? "Connected" : "Not Connected"}
          </h2>
          <h2 className="font-bold text-xl text-gray-400">
            {formatTime(callDuration)}
          </h2>
        </div>

        {sessionDetails && (
          <div className="flex items-center flex-col mt-10">
            <Image
              src={sessionDetails?.selectedDoctor?.image}
              alt={sessionDetails?.selectedDoctor?.description}
              width={120}
              height={120}
              className="h-[100px] w-[100px] object-cover rounded-full"
            />
            <h2 className="mt-2 text-lg">
              {sessionDetails?.selectedDoctor?.specialist}
            </h2>
            <p className="text-sm text-gray-400">AI Medical Doctor</p>

            <div className="mt-12 px-4 w-full h-[260px] md:h-[300px] flex flex-col justify-end overflow-hidden border rounded-xl bg-white text-black">
              {[...message.slice(-4)].map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 m-1 rounded-lg max-w-[80%] shadow-sm ${
                    msg.role === "user"
                      ? "bg-blue-100 self-end text-black"
                      : "bg-gray-100 self-start text-black"
                  }`}
                >
                  <strong className="block text-sm text-gray-500">
                    {msg.role}
                  </strong>
                  <p className="text-sm">{msg.text}</p>
                </div>
              ))}

              {liveTranscript && (
                <div
                  className={`p-3 m-1 rounded-lg max-w-[80%] italic animate-pulse shadow ${
                    currentRoll === "user"
                      ? "bg-blue-200 self-end text-black"
                      : "bg-green-100 self-start text-black"
                  }`}
                >
                  {currentRoll}: {liveTranscript}
                </div>
              )}
            </div>

            {!callStarted ? (
              <Button className="mt-10 cursor-pointer" onClick={StartCall}>
                <PhoneCall className="mr-2 animate-pulse" />
                Start Call
              </Button>
            ) : (
              <Button
                variant="destructive"
                className="mt-10 cursor-pointer"
                onClick={endCall}
              >
                <PhoneOff className="mr-2 animate-vibrate" />
                Disconnect
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // return (
  //   <div
  //     className={`p-5 border rounded-3xl transition-all duration-700 ${
  //       callStarted
  //         ? "bg-green-200 animate-pulse"
  //         : callEnded
  //         ? "bg-red-500"
  //         : "bg-primary"
  //     }`}
  //   >
  //     <div className="flex justify-between items-center">
  //       <h2 className="p-1 px-2 border rounded-md flex gap-2 items-center">
  //         <Circle
  //           className={`h-4 w-4 rounded-full ${
  //             callStarted ? "bg-green-500" : "bg-red-500"
  //           }`}
  //         />
  //         {callStarted ? "Connected" : "Not Connected"}
  //       </h2>
  //       <h2 className="font-bold text-xl text-gray-700">
  //         {formatTime(callDuration)}
  //       </h2>
  //     </div>

  //     {sessionDetails && (
  //       <div className="flex items-center flex-col mt-10">
  //         <Image
  //           src={sessionDetails?.selectedDoctor?.image}
  //           alt={sessionDetails?.selectedDoctor?.description}
  //           width={120}
  //           height={120}
  //           className="h-[100px] w-[100px] object-cover rounded-full"
  //         />
  //         <h2 className="mt-2 text-lg">
  //           {sessionDetails?.selectedDoctor?.specialist}
  //         </h2>
  //         <p className="text-sm text-gray-600">AI Medical Voice Agent</p>

  //         <div className="mt-12 px-4 w-full h-[260px] md:h-[300px] flex flex-col justify-end overflow-hidden border rounded-xl bg-white text-black transition-all">
  //           {[...message.slice(-4)].map((msg, index) => (
  //             <div
  //               key={index}
  //               className={`p-3 m-1 rounded-lg max-w-[80%] transition-all duration-300 shadow-sm ${
  //                 msg.role === "user"
  //                   ? "bg-blue-100 self-end text-black"
  //                   : "bg-gray-100 self-start text-black"
  //               }`}
  //             >
  //               <strong className="block text-sm text-gray-500">
  //                 {msg.role}
  //               </strong>
  //               <p className="text-sm">{msg.text}</p>
  //             </div>
  //           ))}

  //           {liveTranscript && (
  //             <div
  //               className={`p-3 m-1 rounded-lg max-w-[80%] italic animate-pulse shadow ${
  //                 currentRoll === "user"
  //                   ? "bg-blue-200 self-end text-black"
  //                   : "bg-green-100 self-start text-black"
  //               }`}
  //             >
  //               {currentRoll}: {liveTranscript}
  //             </div>
  //           )}
  //         </div>

  //         {!callStarted ? (
  //           <Button className="mt-10" onClick={StartCall}>
  //             <PhoneCall className="mr-2" />
  //             Start Call
  //           </Button>
  //         ) : (
  //           <Button variant="destructive" className="mt-10" onClick={endCall}>
  //             <PhoneOff className="mr-2" />
  //             Disconnect
  //           </Button>
  //         )}
  //       </div>
  //     )}
  //   </div>
  // );
}

export default MedicalVoiceAgentPage;
