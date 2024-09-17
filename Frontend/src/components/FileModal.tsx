"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "react-toastify";
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
  const handleSubmit = (event: any) => {
    event.preventDefault();
    if (filename === "") {
      toast.error("Please enter a filename");
      return;
    }
    if (language === "") {
      toast.error("Please enter a valid language");
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
  };
  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
        <div className=" bg-[#101518] p-5  rounded-lg w-1/2 text-text-col border-2 border-green-300 text-white">
          <div className="text-2xl font-extrabold text-center">Add File</div>
          <div className="flex flex-col justify-center items-center">
            <div className="relative group"></div>
            <label
              htmlFor="role"
              className="text-sm mb-1 font-bold align-left mt-4"
            >
              FileName
            </label>
            <form onSubmit={handleSubmit} className="w-full">
              <Input
                onChange={handleInputChange}
                className="text-white w-full font-bold font-mono"
              />
              <h1 className="text-sm font-thin text-center w-full">
                CodeBrim currently supports C++, Python, Javascript, Java and
                Go.
              </h1>
              <div className="flex flex-row space-x-4 mx-auto my-4 justify-center">
                <Button
                  className="bg-red-900 text-white rounded-lg  font-bold"
                  type="button"
                  onClick={() => {
                    setfilemod(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-blue-900 text-white rounded-lg  font-bold"
                  type="submit"
                >
                  Submit
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
}
