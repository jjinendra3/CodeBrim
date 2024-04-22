"use client";
import React, { useState } from "react";
import Context from "./ContextAPI";
import { useRouter } from "next/navigation";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
const BACKEND = process.env.NEXT_PUBLIC_DATABASE;
interface CodeStateProps {
  children: React.ReactNode;
}
interface File {
  id: string;
  filename: string;
  content: string;
  stdin: string;
  stdout: string;
}
const CodeState: React.FC<CodeStateProps> = ({ children }) => {
  const router = useRouter();
  const [id, setid] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([
    {
      content: "",
      filename: "",
      id: "",
      stdin: "",
      stdout: "",
    },
  ]);
  const [user, setuser] = useState({});
  const [newproject, setnewproject] = useState(false);

  const newProject = async (lang: string) => {
    const ids = toast.loading("Creating new Project...", { autoClose: false });
    try {
      const response = await axios.get(
        `${BACKEND}/project/newcompiler/${lang}`,
      );
      if (response.data.success === false) {
        throw response.data.error;
      }
      toast.update(ids, {
        render: "New Project created!",
        type: "success",
        isLoading: false,
        autoClose: 1000,
      });
      setnewproject(true);
      setid(response.data.output.id);
      setuser(response.data.output);
      setFiles(response.data.output.files);
      router.push(`code/${response.data.output.id}`);
    } catch (error) {
      console.error(error);
      toast.update(ids, {
        render: `${error}`,
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
    return;
  };

  const code_getter = async (ID: string) => {
    const ids = toast.loading("Fetching your Code, please wait!", {
      autoClose: false,
    });
    try {
      setid(ID);
      const response = await axios.get(`${BACKEND}/project/code-snippet/${ID}`);
      if (response.data.success === false) {
        throw response.data.error;
      }
      setFiles(response.data.user.files);
      setuser(response.data.user);
      setid(response.data.user.id);
      toast.update(ids, {
        render: `Data Fetched!`,
        type: "success",
        isLoading: false,
        autoClose: 1000,
      });
    } catch (error) {
      toast.update(ids, {
        render: `${error}`,
        type: "error",
        isLoading: false,
        autoClose: 1000,
      });
      return error;
    }
  };

  const coderunner = async (fileid: number) => {
    let save: any;
    try {
      save = await saver();
    } catch (error) {
      throw error;
    }
    const ids = toast.loading("Running your Code, please wait!", {
      autoClose: false,
    });
    try {
      const response = await axios.post(`${BACKEND}/code/runcode`, {
        files: save.data.files[fileid],
      });
      if (response.data.success === false) {
        throw response.data.error;
      }
      toast.update(ids, {
        render: "Code Ran successfully!",
        type: "success",
        isLoading: false,
        autoClose: 1000,
      });
      setFiles((prevFiles: any[]) => {
        const updatedFiles = [...prevFiles];
        updatedFiles[fileid] = {
          ...updatedFiles[fileid],
          stdout: response.data.stdout,
        };
        return updatedFiles;
      });
      return response.data;
    } catch (error) {
      toast.update(ids, {
        render: `${error}`,
        type: "error",
        isLoading: false,
        autoClose: 1000,
      });
    }
  };

  const newFile = (newFilename: string, language: string) => {
    const ids = toast.loading("Adding new file!", { autoClose: false });
    try {
      let content: string = "";
      switch (language) {
        case "cpp":
          content = `#include <iostream> \nusing namespace std; \nint main() \n{ \n\tcout << "Hello World!"; \n\treturn 0; \n}`;
          break;
        case "python":
          content = `print("Hello World!")`;
          break;
        case "javascript":
          content = `console.log("Hello World!")`;
          break;

        case "go":
          content = `package main \nimport "fmt" \nfunc main() { \n\tfmt.Println("Hello World!") \n}`;
          break;
        case "java":
          content = `class Main { \n\tpublic static void main(String[] args) { \n\t\tSystem.out.println("Hello World!"); \n\t} \n}`;
          break;
        default:
          break;
      }
      const newFile = {
        id: uuidv4(),
        filename: newFilename,
        content: content,
        stdin: "",
        stdout: "",
        lang: language,
      };
      setFiles((prevFiles) => [...prevFiles, newFile]);
      toast.update(ids, {
        render: "File added successfully!",
        type: "success",
        isLoading: false,
        autoClose: 1000,
      });
    } catch (error) {
      toast.update(ids, {
        render: `New file not added, please save your work and refresh`,
        type: "error",
        isLoading: false,
        autoClose: 1000,
      });
    }
  };

  const saver = async () => {
    const ids = toast.loading("Please wait... Saving your work now!", {
      autoClose: false,
    });
    try {
      const response = await axios.post(`${BACKEND}/project/project-save`, {
        files,
        projectid: id,
      });
      if (response.data.success === false) {
        throw response.data.error;
      }
      setFiles(response.data.files);

      toast.update(ids, {
        render: "Code Saved!",
        type: "success",
        isLoading: false,
        autoClose: 1000,
      });
      return response;
    } catch (error) {
      toast.update(ids, {
        render: "Code Not saved! Please try again later in sometime",
        type: "error",
        isLoading: false,
        autoClose: 1000,
      });
      return error;
    }
  };
  const gitpush = async (link: string, commitmsg: string, branch: string) => {
    const ids = toast.loading("Please wait... Pushing your code to git now!", {
      autoClose: false,
    });
    try {
      saver();
      const response = await axios.post(`${BACKEND}/git/gitpush/${id}`, {
        url: link,
        commitmsg: commitmsg,
        branch: branch,
      });
      console.log(response);
      if (response.data.success === false) {
        throw response.data.error;
      }
      toast.update(ids, {
        render: "Code Pushed!",
        type: "success",
        isLoading: false,
        autoClose: 1000,
      });
      return response;
    } catch (error) {
      toast.update(ids, {
        render: "Code Not pushed! Please try again later in sometime",
        type: "error",
        isLoading: false,
        autoClose: 1000,
      });
      return error;
    }
  };
  const snipclone = async () => {
    const ids = toast.loading("Please wait... Cloning your code now!", {
      autoClose: false,
    });
    try {
      const response = await axios.get(
        `${BACKEND}/project/clone-snippet/${id}`,
      );
      if (response.data.success === false) {
        throw response.data.error;
      }
      setnewproject(true);
      setid(response.data.output.id);
      setuser(response.data.output);
      setFiles(response.data.output.files);
      await router.push("/code/" + response.data.output.id);
      toast.update(ids, {
        render: "Code Cloned!",
        type: "success",
        isLoading: false,
        autoClose: 1000,
      });
      return response;
    } catch (error) {
      toast.update(ids, {
        render: `Code Not Cloned! Please try again later in sometime ${error}`,
        type: "error",
        isLoading: false,
        autoClose: 1000,
      });
    }
  };
  const wakeServer = async () => {
    const ids = toast.loading("Waking up the server...", { autoClose: false });
    try {
      const response = await axios.get(`${BACKEND}/server/wake-up`);
      if (response.data.success === false) {
        throw response.data.error;
      }
      router.push("/main");
      toast.update(ids, {
        render: "Server is awake!",
        type: "success",
        isLoading: false,
        autoClose: 1000,
      });
    } catch (error) {
      toast.update(ids, {
        render: `${error}`,
        type: "error",
        isLoading: false,
        autoClose: 1000,
      });
    }
  };
  return (
    <Context.Provider
      value={{
        id,
        files,
        newproject,
        newProject,
        setFiles,
        code_getter,
        coderunner,
        newFile,
        saver,
        gitpush,
        snipclone,
        wakeServer,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default CodeState;
