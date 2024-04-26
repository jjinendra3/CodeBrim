"use client";
import { useState,useContext } from "react";
import Context from "@/ContextAPI";
const Home = () => {
  const context = useContext(Context);
  const [gitUrl, setGitUrl] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGitUrl(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    context.gitclone(gitUrl);
  };
  
  return (
    <Context.Provider value={context}>
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="flex-row ">
        <span className="font-thin">
          Enter Your Repository URL and press ENTER
        </span>
        <form
          onSubmit={handleSubmit}
          className="flex items-center space-x-2 mt-4"
        >
          <div className="bg-black p-4 rounded-lg">
            <span className="text-green-400 mr-2 text-2xl">$ git clone</span>
            <input
              type="text"
              value={gitUrl}
              onChange={handleChange}
              placeholder="repo-url"
              className="bg-transparent border-green-400 text-2xl text-green-400 focus:outline-none focus:border-green-600 w-96 placeholder:opacity-50 placeholder:text-green-400"
            />
          </div>
        </form>
      </div>
    </div>
    </Context.Provider>
  );
};

export default Home;
