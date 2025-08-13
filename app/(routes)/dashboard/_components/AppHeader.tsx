import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const menuOptions = [
  { id: 1, name: "Home", path: "/dashboard" },
  { id: 2, name: "History", path: "/dashboard/history" },
  { id: 3, name: "Billing", path: "/dashboard/billing" },
  { id: 4, name: "Profile", path: "/profile" },
];

function AppHeader() {
  return (
    <header className="flex items-center justify-between px-4 shadow-sm md:px-10 lg:px-20 bg-white h-16">
      {/* Logo + Brand Name */}
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/favicon.svg"
          alt="MediPulse Logo"
          width={40} // fixed size for reliability
          height={40}
          className="object-contain"
          priority
        />
        <span className="text-lg md:text-2xl font-bold text-[#1D0F5F] tracking-tight">
          MediPulse
        </span>
      </Link>

      {/* Nav Menu */}
      <nav className="hidden md:flex gap-12 items-center">
        {menuOptions.map((option) => (
          <Link key={option.id} href={option.path}>
            <h2 className="hover:font-bold cursor-pointer transition-all">
              {option.name}
            </h2>
          </Link>
        ))}
      </nav>

      {/* User Menu */}
      <UserButton />
    </header>
  );
}

export default AppHeader;
