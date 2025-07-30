import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import React from "react";

const menuOptions = [
  { id: 1, name: "Home", path: "/home" },
  { id: 2, name: "History", path: "/history" },
  { id: 3, name: "Pricing", path: "/pricing" },
  { id: 4, name: "Profile", path: "/profile" },
];

function AppHeader() {
  return (
    <div className="flex items-center justify-between p-4 shadow px-6 md:px-20 lg:px-40">
      <div className="relative w-[120px] md:w-[180px] aspect-[2/1]">
        <Image
          src="/logo.svg"
          alt="logo"
          fill
          className="object-contain"
          priority
        />
      </div>

      <div className="hidden md:flex gap-12 items-center">
        {menuOptions.map((option) => (
          <div key={option.id}>
            <h2 className="hover:font-bold cursor-pointer transition-all">
              {option.name}
            </h2>
          </div>
        ))}
      </div>

      <UserButton />
    </div>
  );
}

export default AppHeader;
