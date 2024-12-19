"use client";
import CodeEditor from "@/components/HeroPage/HeroCodeAnimation";
import FeatureHighlights from "@/components/HeroPage/HighLights";
import { motion } from "framer-motion";
import { Code } from "lucide-react";
import Link from "next/link";
export default function Hero() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col justify-center">
          <motion.h1
            className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="block">Code Anywhere,</span>{" "}
            <motion.span
              className="text-blue-500 block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Execute Everywhere
            </motion.span>
          </motion.h1>
          <motion.p
            className="mt-4 text-lg sm:text-xl text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            Experience the future of coding with our lightning-fast online
            compiler. Write, run, and debug your code in the cloud.
          </motion.p>
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            <Link
              href="/language"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <Code className="mr-2 h-5 w-5" />
              Start Coding
            </Link>
          </motion.div>
        </div>
        <div className="mt-8 lg:mt-0">
          <CodeEditor />
        </div>
      </div>
      <FeatureHighlights />
    </div>
  );
}
