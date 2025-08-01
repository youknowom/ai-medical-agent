import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const menuOptions = [
  { id: 1, name: "Home", path: "/home" },
  { id: 2, name: "History", path: "/history" },
  { id: 3, name: "Pricing", path: "/pricing" },
  { id: 4, name: "Profile", path: "/profile" },
];

function AppHeader() {
  return (
    <div className="flex items-center justify-between px-4 shadow-sm md:px-10 lg:px-20 bg-white h-16">
      {/* Logo + Brand Name */}
      <Link href="/" className="flex items-center gap-2">
        <div className="relative w-8 h-8 md:w-10 md:h-10">
          <Image
            src="/favicon.svg"
            alt="MediPulse Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <span className="text-lg md:text-2xl font-bold text-[#1D0F5F] tracking-tight">
          MediPulse
        </span>
      </Link>

      {/* Nav Menu */}
      <div className="hidden md:flex gap-12 items-center">
        {menuOptions.map((option) => (
          <Link key={option.id} href={option.path}>
            <h2 className="hover:font-bold cursor-pointer transition-all">
              {option.name}
            </h2>
          </Link>
        ))}
      </div>

      {/* User Menu */}
      <UserButton />
    </div>
  );
}

export default AppHeader;
