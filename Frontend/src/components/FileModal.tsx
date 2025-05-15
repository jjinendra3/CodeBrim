"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "react-toastify";
import { FilePlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { useCodeStore } from "@/lib/codeStore";

export default function Modal() {
  const addFile = useCodeStore(state => state.addFile);
  const [filename, setfilename] = useState<string>("");
  const [language, setlanguage] = useState<string>("");

  const handleInputChange = (event: any) => {
    const { value } = event.target;
    const extension = value.split(".").pop()?.toLowerCase();
    setfilename(value);
    switch (extension) {
      case "js":
        setlanguage("javascript");
        break;
      case "cpp":
        setlanguage("cpp");
        break;
      case "py":
        setlanguage("python");
        break;
      case "java":
        setlanguage("java");
        break;
      case "go":
        setlanguage("go");
        break;
      default:
        setlanguage("");
        break;
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault(); // Prevent form submission
    if (filename === "") {
      toast.error("Please enter a filename");
      return;
    }
    if (language === "") {
      toast.error("Please enter a valid language");
      return;
    }
    const response = await addFile(language, filename);
    if (response.success) {
      toast.success("File created successfully!");
      setfilename("");
      setlanguage("");
    } else {
      toast.error("Error in creating file, please try again later!");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission on Enter key press
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full">
          <FilePlus className="mr-2 h-4 w-4" /> Add File
        </Button>
      </DialogTrigger>
      <DialogContent className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none">
        <div className=" bg-[#101518] p-5  rounded-lg w-1/2 text-text-col border-2 border-green-300 text-white">
          <DialogTitle className="text-2xl font-extrabold text-center">
            Add File
          </DialogTitle>
          <div className="flex flex-col justify-center items-center">
            <form
              onSubmit={handleSubmit}
              className="w-full"
              onKeyDown={handleKeyDown}
            >
              <Input
                placeholder="Filename"
                onChange={handleInputChange}
                className="text-white w-full font-bold font-mono"
              />
              <h1 className="text-sm font-thin text-center w-full">
                CodeBrim currently supports C, C++, Python, Javascript, Java and
                Go.
              </h1>
              <div className="flex flex-row space-x-4 mx-auto my-4 justify-center">
                <Button
                  className="bg-red-900 text-white rounded-lg font-bold"
                  onClick={() => {}}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-blue-900 text-white rounded-lg font-bold"
                  type="submit"
                >
                  Submit
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
