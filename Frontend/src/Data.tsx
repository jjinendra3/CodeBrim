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
        `http://localhost:5000/project/newcompiler/${lang}`,
      );
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
      router.push(`maincode/${response.data.output.id}`);
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
      const response = await axios.get(
        `http://localhost:5000/project/code-snippet/${ID}`,
      );
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
    const ids = toast.loading("Running your Code, please wait!", {
      autoClose: false,
    });
    try {
      const response = await axios.post("http://localhost:5000/code/runcode", {
        files: files[fileid],
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
      const newFile = {
        id: uuidv4(),
        filename: newFilename,
        content: "",
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
      const response = await axios.post(
        "http://localhost:5000/project/project-save",
        {
          files,
          projectid: id,
        },
      );
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
      const response = await axios.post(
        `http://localhost:5000/git/gitpush/${id}`,
        {
          url: link,
          commitmsg: commitmsg,
          branch: branch,
        },
      );
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
        `http://localhost:5000/project/clone-snippet/${id}`,
      );
      if (response.data.success === false) {
        throw response.data.error;
      }
      setnewproject(true);
      setid(response.data.ouput.id);
      setuser(response.data.output);
      setFiles(response.data.output.files);
      router.push("/maincode/" + response.data.user.id);
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
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default CodeState;
