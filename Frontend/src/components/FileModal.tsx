"use client";
import { useState } from "react";
export default function Modal({
  setfilemod,
  context,
}: {
  setfilemod: any;
  context: any;
}) {
  const [filename, setfilename] = useState<string>("");
  const [language, setlanguage] = useState<string>("");
  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setfilename(value + `${ext}`);
  };
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [ext, setext] = useState("");
  const items = ["C++", "Python", "Javascript", "Java", "Go", "Rust"];

  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none ">
        <div className=" bg-blue-500 p-5  rounded-lg w-1/3 text-text-col ">
          <div className="text-2xl font-extrabold text-center mb-4">
            Git Controls
          </div>
          <div className="flex flex-col ">
            <div className="mb-4 font-bold text-center">
              Please make the repository public before hitting Submit.
            </div>
            <div className="relative group">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
              >
                <span className="mr-2">Open Dropdown</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 ml-2 -mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {isOpen && (
                <div className="absolute right-0 mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-1 space-y-1">
                  <input
                    className="block w-full px-4 py-2 text-gray-800 border rounded-md  border-gray-300 focus:outline-none"
                    type="text"
                    placeholder="Search items"
                    autoComplete="off"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {filteredItems.map((item) => (
                    <a
                      key={item}
                      href="#"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 active:bg-blue-100 cursor-pointer rounded-md"
                      onClick={() => {
                        let name: string = item.charAt(0).toLowerCase() + item.slice(1);;
                      
                        if (item === "Javascript") {
                          setext(".js");
                        } else if (item === "C++") {
                          setext(".cpp");
                        } else if (item === "Python") {
                          setext(".py");
                        } else if (item === "Java") {
                          setext(".java");
                        } else if (item === "Go") {
                          setext(".go");
                        } else if (item === "Rust") {
                          setext(".rs");
                        }
                        if (name === "c++") {
                          name = "cpp";
                        }
                        setlanguage(name);
                        setIsOpen(false);
                      }}
                    >
                      {item}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <label
              htmlFor="role"
              className="text-sm mb-1 font-bold align-left mt-4"
            >
              FileName
            </label>
            {language!=="" && <div className="bg-white ">
              <input
                type="text"
                name="filename"
                onChange={handleInputChange}
                className="flex-grow px-2 py-2 rounded focus:outline-none bg-bg1-col"
                style={{ minWidth: "50px", width: "auto" }}
              />
              {ext}
            </div>}
            <div className="flex flex-row space-x-4 mx-auto my-4">
              <button
                className="bg-red-900 text-white rounded-lg px-4 py-2 font-bold"
                onClick={() => {
                  setfilemod(false);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-blue-900 text-white rounded-lg px-4 py-2 font-bold"
                onClick={() => {
                  if(language==="" || filename===""){
                    alert("Please select a language");
                    return;
                  }
                  for (let i in context.files) {
                    if (context.files[i].filename === filename) {
                      alert("File already exists");
                      return;
                    }
                  }
                  context.newFile(filename, language);
                  setfilemod(false);
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
}
