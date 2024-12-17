"use client";

import { useContext, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Code } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Context from "@/ContextAPI";
import { Button } from "@/components/ui/button";
const languages = [
  {
    name: "C",
    icon: "/languageIcon/c.svg",
    description: "Powerful low-level programming",
    code: "c",
  },
  {
    name: "C++",
    icon: "/languageIcon/cpp.svg",
    description: "Object-oriented and efficient",
    code: "cpp",
  },
  {
    name: "Java",
    icon: "/languageIcon/java.svg",
    description: "Write once, run anywhere",
    code: "java",
  },
  {
    name: "JavaScript",
    icon: "/languageIcon/js.svg",
    description: "The language of the web",
    code: "javascript",
  },
  {
    name: "Go",
    icon: "/languageIcon/go.svg",
    description: "Simple and fast compilation",
    code: "go",
  },
  {
    name: "Python",
    icon: "/languageIcon/py.svg",
    description: "Easy to learn, versatile",
    code: "python",
  },
];

export default function ChooseLanguage() {
  const context = useContext(Context);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-4xl font-extrabold text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Choose Your Programming Language
        </motion.h1>
        <motion.p
          className="text-xl text-center text-gray-400 mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Select the language you want to code in and start your journey
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {languages.map((lang, index) => (
            <motion.div
              key={lang.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <button
                onClick={() => setSelectedLanguage(lang.code)}
                className={`w-full h-full p-6 rounded-xl transition-all duration-200 flex flex-col justify-center items-center ${
                  selectedLanguage === lang.code
                    ? "bg-blue-600 shadow-lg shadow-blue-500/50"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                <Image
                  src={lang.icon}
                  width={100}
                  height={100}
                  className="w-32 h-32 mb-4"
                  alt="Language Icon"
                />
                <h2 className="text-2xl font-bold mb-2">{lang.name}</h2>
                <p
                  className={cn(
                    selectedLanguage === lang.code
                      ? "text-white"
                      : "text-gray-400",
                  )}
                >
                  {lang.description}
                </p>
              </button>
            </motion.div>
          ))}
        </div>
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Button
            className={`inline-flex items-center justify-center rounded-md px-6 py-3 text-lg font-medium transition-colors duration-200 ${
              selectedLanguage
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
            onClick={async e => await context.newProject(selectedLanguage)}
          >
            <Code className="mr-2 h-5 w-5" />
            Start Coding
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
