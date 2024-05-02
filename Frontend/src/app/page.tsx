"use client";
import { FaGithub } from "react-icons/fa";
import { useContext, useState } from "react";
import Context from "@/ContextAPI";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const IndexPage = () => {
  const [inputValue, setInputValue] = useState<string>("");

  const handleInputChange = (event: any) => {
    setInputValue(event.target.value);
  };
  const context = useContext(Context);

  return (
    <Context.Provider value={context}>
      <div className="flex flex-col p-8 font-sans text-white mb-20">
        <h1 className="text-5xl font-semibold text-center font-serif">
          CodeBrim
        </h1>
        <h6 className="text-md font-semibold mb-12 text-center font-mono">
          Compiler on the Go!
        </h6>
        <div className="w-full md:w-1/2 mx-auto">
          <div className="flex flex-row justify-center space-x-2">
            <Input
              type="text"
              placeholder="CodeBrim Link"
              onChange={handleInputChange}
              value={inputValue}
            />
            <Button className="w-16 h-10 flex p-2 rounded-md text-lg font-semibold justify-center">
              Go!
            </Button>
          </div>
          <h1 className="mt-12 mb-12 text-2xl font-bold font-sans underline text-center">
            Create a New Project
          </h1>
          <div className="flex flex-wrap justify-center gap-8">
            <Button
              className="w-32 h-10 flex p-2 rounded-md text-lg font-semibold justify-center"
              onClick={() => {
                context.newProject("cpp");
              }}
            >
              C++
            </Button>
            <Button
              className="w-32 h-10 flex p-2 rounded-md text-lg font-semibold justify-center"
              onClick={() => {
                context.newProject("python");
              }}
            >
              Python
            </Button>
            <Button
              className="w-32 h-10 flex p-2 rounded-md text-lg font-semibold justify-center"
              onClick={() => {
                context.newProject("javascript");
              }}
            >
              Javascript
            </Button>
            <Button
              className="w-32 h-10 flex p-2 rounded-md text-lg font-semibold justify-center"
              onClick={() => {
                context.newProject("java");
              }}
            >
              Java
            </Button>
            <Button
              className="w-32 h-10 flex p-2 rounded-md text-lg font-semibold justify-center"
              onClick={() => {
                context.newProject("go");
              }}
            >
              Go
            </Button>
          </div>
          <div className="flex justify-center mt-16">
            {/* <div className="flex-row">
              <Button
                className="bg-gray-700 w-48 flex space-x-2 p-2 rounded-md text-lg font-semibold justify-center"
                onClick={context.gitclonepage}
              >
                <FaGithub />
                <div className="align-middle">Clone</div>
              </Button>
            </div> */}
          </div>
        </div>
      </div>
      <Footer />
    </Context.Provider>
  );
};

export default IndexPage;
