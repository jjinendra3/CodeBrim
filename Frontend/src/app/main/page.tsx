"use client";
import { FaGithub } from "react-icons/fa";
import { useContext, useState } from "react";
import Context from "@/ContextAPI";
const IndexPage = () => {
  const [inputValue, setInputValue] = useState<string>("");

  const handleInputChange = (event: any) => {
    setInputValue(event.target.value);
  };
  const context = useContext(Context);
  return (
    <Context.Provider value={context}>
      <div className="min-h-screen flex flex-col p-8 font-sans bg-gray-900 text-white">
        <h1 className="text-4xl font-semibold">CodeBrim</h1>
        <h6 className="text-md font-semibold mb-8 ml-2">Compiler on the Go!</h6>
        <div className="w-1/2 mx-auto">
          <div className="flex-row justify-around items-center  mx-auto ml-28">
            <label htmlFor="" className="text-sm mb-2 block">
              Have a SnipLink? Paste it here
            </label>
            <div className="flex">
              <div className="flex">
                <input
                  id="snippet-link"
                  type="text"
                  onChange={handleInputChange}
                  className="mr-2 bg-gray-800 border border-gray-700 rounded-md py-1 px-1 text-white w-96"
                />
              </div>
              <button
                className="bg-gray-800 hover:bg-blue-700 text-white font-bold p-2 rounded-md"
                onClick={() => {
                  const slicer: string = inputValue.slice(-5);
                  window.location.assign("code/" + slicer);
                }}
              >
                Let's Go!
              </button>
            </div>
          </div>
          <h1 className="mt-12 text-2xl font-bold font-sans font-underline">
            Create a New Project Here
          </h1>
          <div className="flex justify-around mt-8">
            <div>
              <a
                href="#"
                className="styled-button text-indigo-600 w-32"
                onClick={() => {
                  context.newProject("cpp");
                }}
              >
                C++
              </a>
            </div>
            <div>
              <a
                href="#"
                className="styled-button text-blue-600 w-32"
                onClick={() => {
                  context.newProject("python");
                }}
              >
                Python
              </a>
            </div>
            <div className="flex items-center justify-center">
              <a
                href="#"
                className="styled-button text-violet-400 w-32 "
                onClick={() => {
                  context.newProject("javascript");
                }}
              >
                Javascript
              </a>
            </div>
          </div>

          <div className="flex justify-around mt-4">
            <div>
              <a
                href="#"
                className="styled-button text-green-600 w-32"
                onClick={() => {
                  context.newProject("java");
                }}
              >
                Java
              </a>
            </div>
            <div>
              <a
                href="#"
                className="styled-button text-yellow-600 w-32"
                onClick={() => {
                  context.newProject("go");
                }}
              >
                Go
              </a>
            </div>
            <div>
              <a
                href="#"
                className="styled-button text-orange-600 w-32"
                onClick={() => {
                  context.newProject("rust");
                }}
              >
                Rust
              </a>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-16 ">
          <div className="flex-row">
            <div className="mt-12 bg-gray-700 w-48 flex space-x-2 p-2 rounded-md text-lg font-semibold justify-center ">
              <FaGithub className="mt-1" />
              <div className="align-middle">Clone</div>
            </div>
          </div>
        </div>
      </div>
    </Context.Provider>
  );
};

export default IndexPage;
