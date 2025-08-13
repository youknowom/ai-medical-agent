"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { HeroParallax } from "@/components/ui/hero-parallax";

function useIsClient() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  return isClient;
}

export default function Home() {
  const isClient = useIsClient();
  const { user } = useUser();

  const carouselImages = [
    "/splash.png",
    "/splash2.png",
    "/splash3.png",
    "/splash4.png",
  ];

  const products = [
    { title: "Moonbeam", link: "#", thumbnail: "/splash.png" },
    { title: "Sunflare", link: "#", thumbnail: "/splash2.png" },
    { title: "LunarX", link: "#", thumbnail: "/splash3.png" },
    { title: "Stellar", link: "#", thumbnail: "/splash4.png" },
    { title: "Nebula", link: "#", thumbnail: "/splash.png" },
    { title: "Cosmo", link: "#", thumbnail: "/splash2.png" },
    { title: "Astro", link: "#", thumbnail: "/splash3.png" },
    { title: "Galaxy", link: "#", thumbnail: "/splash4.png" },
    { title: "Orbit", link: "#", thumbnail: "/splash.png" },
    { title: "Comet", link: "#", thumbnail: "/splash2.png" },
  ];

  return (
    <div className="relative my-10 flex flex-col items-center justify-center">
      <Navbar user={user} />

      {/* Side & bottom borders */}
      <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80" />
      <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80" />
      <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80" />

      <div className="px-4 py-10 md:py-20 text-center w-full max-w-6xl">
        {/* Heading */}
        <h1 className="relative z-10 mx-auto max-w-4xl text-2xl font-bold text-slate-700 md:text-4xl lg:text-7xl dark:text-slate-300">
          {isClient &&
            [
              "🧠 Speak Health",
              <br key="br" />,
              "Building AI for Medical Conversations",
            ].map((item, index) =>
              typeof item === "string" ? (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.2,
                    ease: "easeInOut",
                  }}
                  className="inline-block"
                >
                  {item} {index === 0 && " "}
                </motion.span>
              ) : (
                item
              )
            )}
        </h1>

        {/* Subheading */}
        {isClient && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.8 }}
            className="relative z-10 mx-auto max-w-xl py-4 text-lg font-normal text-neutral-600 dark:text-neutral-400"
          >
            24/7 Medical Support, Powered by AI — Deliver intelligent,
            voice-first care that triages symptoms, books appointments, and
            supports patients anytime, anywhere.
          </motion.p>
        )}

        {/* Get Started Button */}
        <Link href="/sign-in">
          {isClient && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 1 }}
              className="relative z-10 mt-8 flex justify-center"
            >
              <Button className="w-60 rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                Get Started
              </Button>
            </motion.div>
          )}
        </Link>

        {/* Carousel Section */}
        <ContainerScroll
          titleComponent={
            <h2 className="text-3xl md:text-5xl font-bold text-slate-700 dark:text-slate-300">
              Medical Conversations
            </h2>
          }
        >
          <div className="relative mt-6 w-full flex justify-center">
            <div className="w-96 md:w-[500px] h-64 md:h-80 overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-900 relative">
              <Carousel>
                <CarouselContent className="flex gap-4">
                  {products.map((product, index) => (
                    <CarouselItem
                      key={index}
                      className="flex-shrink-0 w-full h-full"
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={product.thumbnail} // use thumbnail string
                          alt={product.title}
                          fill
                          className="object-cover rounded-2xl"
                          priority
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </div>
        </ContainerScroll>

        {/* Hero Parallax Section */}
        <div className="mt-20 w-full">
          <HeroParallax products={products} />
        </div>
      </div>
    </div>
  );
}

const Navbar = ({ user }: { user: any }) => {
  return (
    <nav className="absolute top-0 left-0 w-full flex items-center justify-between border-b border-neutral-200 px-4 dark:border-neutral-800">
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

      {!user ? (
        <Link href="/sign-in">
          <button className="w-24 rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 md:w-32 dark:bg-white dark:text-black dark:hover:bg-gray-200">
            Login
          </button>
        </Link>
      ) : (
        <div className="flex items-center gap-5">
          <UserButton />
          <Link href="/dashboard">
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-white dark:bg-blue-500">
              Dashboard
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
};
