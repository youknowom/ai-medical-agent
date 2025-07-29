"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { UserDetailContext } from "@/context/UserDetailContext";

export type UserDetail = {
  name: string;
  email: string;
  creadits: Number;
};

function Provider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [UserDetail, setUserDetail] = useState<any>();
  // useEffect(() => {
  //   const createUser = async () => {
  //     try {
  //       const response = await axios.post("/api/users");
  //       console.log("✅ User from API:", response.data);
  //     } catch (error) {
  //       console.error("❌ Error creating user:", error);
  //     }
  //   };

  //   if (isLoaded && user) {
  //     createUser();
  //   }
  // }, [isLoaded, user]);
  useEffect(() => {
    user && CreateNewUser();
  }, [user]);
  const CreateNewUser = async () => {
    const result = await axios.post("/api/users");
    console.log(result.data);
    setUserDetail(result.data);
  };

  return (
    <div>
      <UserDetailContext.Provider value={{ UserDetail, setUserDetail }}>
        {children}
      </UserDetailContext.Provider>
    </div>
  );
}

export default Provider;
