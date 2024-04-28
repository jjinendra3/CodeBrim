"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
export default function Modal({
  setfilemod,
  context,
  setfileindex,
}: {
  setfilemod: any;
  context: any;
  setfileindex: any;
}) {
  const [filename, setfilename] = useState<string>("");
  const [language, setlanguage] = useState<string>("");
  const handleLangChange = (event: string) => {
    if (event === "javascript") {
      setext(".js");
    } else if (event === "cpp") {
      setext(".cpp");
    } else if (event === "python") {
      setext(".py");
    } else if (event === "java") {
      setext(".java");
    } else if (event === "go") {
      setext(".go");
    }
    setlanguage(event);
    setIsOpen(false);
  };
  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setfilename(value + `${ext}`);
  };
  const [isOpen, setIsOpen] = useState(false);
  const [ext, setext] = useState("");
  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none ">
        <div className=" bg-blue-500 p-5  rounded-lg w-1/3 text-text-col ">
          <div className="text-2xl font-extrabold text-center mb-4">
            Add File
          </div>
          <div className="flex flex-col justify-center items-center">
            <div className="relative group">
              <Select onValueChange={handleLangChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select a Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Language</SelectLabel>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="javascript">Javascript</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <label
              htmlFor="role"
              className="text-sm mb-1 font-bold align-left mt-4"
            >
              FileName
            </label>
            {language !== "" && (
              <div className="bg-white space-x-2 ">
                <input
                  type="text"
                  name="filename"
                  onChange={handleInputChange}
                  className="flex-grow px-2 py-2 rounded focus:outline-none bg-bg1-col"
                  style={{ minWidth: "50px", width: "auto" }}
                />

                {ext}
              </div>
            )}
            <div className="flex flex-row space-x-4 mx-auto my-4">
              <Button
                className="bg-red-900 text-white rounded-lg  font-bold"
                onClick={() => {
                  setfilemod(false);
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-900 text-white rounded-lg  font-bold"
                onClick={() => {
                  if (language === "") {
                    alert("Please select a language");
                    return;
                  }
                  if (filename === "") {
                    alert("Please enter a filename");
                    return;
                  }
                  for (let i in context.files) {
                    if (context.files[i].filename === filename) {
                      alert("File already exists");
                      return;
                    }
                  }
                  context.newFile(filename, language);
                  setfileindex(context.files.length);
                  setfilemod(false);
                }}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
}
