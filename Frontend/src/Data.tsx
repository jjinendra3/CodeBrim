"use client";
import React, { useState } from "react";
import Context from "./ContextAPI";
import { useRouter } from "next/navigation";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
interface CodeStateProps {
  children: React.ReactNode;
}
interface File {
  id: string;
  filename: string;
  content: string;
  stdin: string;
  stdout: string;
  stderr: string;
}
const CodeState: React.FC<CodeStateProps> = ({ children }) => {
  const router = useRouter();
  const [id, setid] = useState<string | null>(null);
  const [language, setlanguage] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([{
    content:"",
    filename:"",
    id:"",
    stderr:"",
    stdin:"",
    stdout:""
  }]);
  const [newproject, setnewproject] = useState(false);

  const newProject = async (lang: string) => {
   const id=toast.loading("Creating new Project...", { autoClose: false });
    try {
      const response = await axios.get(
        `http://localhost:5000/newcompiler/${lang}`,
      );
      toast.update(id, { render: "New Project created!", type: "success", isLoading: false, autoClose: 1000 });
      setnewproject(true)
      setid(response.data.output[0].id);
      setlanguage(response.data.output[0].lang);
      setFiles([response.data.newfile]);
      router.push(`maincode/${response.data.output[0].id}`);
    } catch (error) {
      console.error(error);
      toast.update(id, { render: `${error}`, type: "error", isLoading: false, autoClose: 1000 });
    }
    return;
  };

  const code_getter = async (ID: string) => {
    const id = toast.loading("Fetching your Code, please wait!", { autoClose: false });
    try {
      setid(ID);
      const response = await axios.get(
        `http://localhost:5000/code-snippet/${ID}`,
      );
      if(response.data.success===false){
        throw response.data.error
      }
      setlanguage(response.data.user.lang);
      setFiles(response.data.user.files);
      setid(response.data.user.id);
      toast.update(id, {
        render: `Data Fetched!`,
        type: "success",
        isLoading: false,
        autoClose: 1000,
      });
    } catch (error) {
      toast.update(id, { render: `${error}`, type: "error", isLoading: false ,autoClose:1000 });
      return error;
    }
  };

  const coderunner = async (fileid: number) => {
    const id = toast.loading("Running your Code, please wait!", { autoClose: false });
    try {
      const response = await axios.post("http://localhost:5000/runcode", {
        files: files[fileid],
        lang: language,
      });
      toast.update(id, {
        render: "Code Ran successfully!",
        type: "success",
        isLoading: false,
        autoClose: 1000,
      });
      return response.data;
    } catch (error) {
      toast.update(id, { render: `${error}`, type: "error", isLoading: false, autoClose: 1000});
    }
  };

  const newFile = () => {
    const id = toast.loading("Adding new file!", { autoClose: false });
    try {
      const lastMainIndex = files.reduce((acc, file) => {
        const match = file.filename.match(/^main(\d+)$/);
        if (match) {
          return Math.max(acc, parseInt(match[1]));
        }
        return acc;
      }, 0);
      const newFilename =
        `main${lastMainIndex + 1}` + "." + files[0].filename.slice(-2);
      const newFile = {
        id: uuidv4(),
        filename: newFilename,
        content: "",
        stdin: "",
        stdout: "",
        stderr: "",
      };
      setFiles((prevFiles) => [...prevFiles, newFile]);
      toast.update(id, {
        render: "FIle added successfully!",
        type: "success",
        isLoading: false,
        autoClose: 1000,     });
    } catch (error) {
      toast.update(id, {
        render: `New file not added, please save your work and refresh`,
        type: "error",
        isLoading: false,
        autoClose:1000
      });
    }
  };

  const saver = async () => {
    const id = toast.loading("Please wait... SAving your work now!", { autoClose: false });
    try {
      const response = await axios.post("http://localhost:5000/project-save", {
        files,
        projectid: id,
      });
      
      toast.update(id, { render: "Code Saved!", type: "success", isLoading: false, autoClose: 1000 });
      return response;
    } catch (error) {
      toast.update(id, {
        render: "Code Not saved! Please try again later in sometime",
        type: "error",
        isLoading: false,autoClose:1000
      });
      return error;
    }
  };
  const gitpush = async (link: string,commitmsg:string,branch:string) => {
    const ids = toast.loading("Please wait... Pushing your code to git now!", { autoClose: false });
    try {
      saver();
      const response = await axios.post( `http://localhost:5000/gitpush/${id}`, {
        url:link,
        commitmsg:commitmsg,
        branch:branch
      });
      toast.update(ids, { render: "Code Pushed!", type: "success", isLoading: false, autoClose: 1000 });
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
  }
  return (
    <Context.Provider
      value={{
        id,
        language,
        files,
        newProject,
        setFiles,
        code_getter,
        coderunner,
        newFile,
        saver,
        newproject,
        gitpush
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default CodeState;
