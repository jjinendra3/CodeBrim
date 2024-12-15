"use client";
import React, { useState } from "react";
import Context from "./ContextAPI";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND;
interface CodeStateProps {
  children: React.ReactNode;
}
export interface File {
  id: string;
  filename: string;
  content: string;
  stdin: string;
  stdout: string;
  lang: string;
}
const CodeState: React.FC<CodeStateProps> = ({ children }) => {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([
    {
      content: "",
      filename: "",
      id: "",
      stdin: "",
      stdout: "",
      lang: "",
    },
  ]);
  const [user, setUser] = useState({});
  const [newProjectBool, setNewProjectBool] = useState(false);
  const [editable, setEditable] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);

  const newProject = async (lang: string) => {
    const ids = toast.loading("Creating new Project...", { autoClose: false });
    try {
      const response = await axios.get(
        `${BACKEND}/project/newcompiler/${lang}/`,
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
      setNewProjectBool(true);
      setId(response.data.output.id);
      setUser(response.data.output);
      setFiles(response.data.output.files);
      router.push(
        `code/${response.data.output.id}/${response.data.output.files[0].id}`,
      );
    } catch (error) {
      toast.update(ids, {
        render: `${error}`,
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
    return;
  };
  const addFile = async (lang: string, fileName: string) => {
    try {
      const response = await axios.post(`${BACKEND}/project/add-file`, {
        projectId: id,
        lang: lang,
        filename: fileName,
      });
      setFiles(prevFiles => [...prevFiles, response.data.output]);
      return response.data;
    } catch (error) {
      console.log(error);
      toast.error("Error creating new file");
    }
  };
  const code_getter = async (ID: string) => {
    const ids = toast.loading("Fetching your Code, please wait!", {
      autoClose: false,
    });
    try {
      setId(ID);
      const response = await axios.get(`${BACKEND}/project/getproject/${ID}/`);
      if (response.data.success === false) {
        throw response.data.error;
      }
      setFiles(response.data.user.files);
      setUser(response.data.user);
      setId(response.data.user.id);
      toast.update(ids, {
        render: `Data Fetched!`,
        type: "success",
        isLoading: false,
        autoClose: 1000,
      });
      return { success: 1, user: response.data.user };
    } catch (error) {
      toast.update(ids, {
        render: `${error}`,
        type: "error",
        isLoading: false,
        autoClose: 1000,
      });
      return { success: 0, error: error };
    }
  };

  const getFileData = async (ID: string) => {
    try {
      const response = await axios.get(`${BACKEND}/project/getfile/${ID}`);
      return response.data;
    } catch (error) {
      console.log(error);
      router.push('/maintenance')
      toast.error("Error fetching your code, please try again later!");
    }
  };

  const coderunner = async (File: File) => {
    try {
      // await saver();
      toast("Running your Code, please wait!");
      const response = await axios.post(`${BACKEND}/code/runcode/`, {
        files: File,
      });
      return response.data;
    } catch (error) {
      console.log(error);
      toast.error("Error running your code, please try again later!");
    }
  };


  const saver = async (presentFile:File) => {
    try {
      setSaving(true);
      const response = await axios.post(`${BACKEND}/project/file-save`, {
        presentFile,
      });
      if (response.data.success === false) {
        throw response.data.error;
      }
      setSaving(false);
      return response;
    } catch (error) {
      console.log(error);
      toast.error("Error saving your work", { autoClose: 2000 });
      return error;
    }
  };

  const gitpush = async (
    link: string,
    commitmsg: string,
    branch: string,
    pan: string,
  ) => {
    const ids = toast.loading("Please wait... Pushing your code to git now!", {
      autoClose: false,
    });
    if (pan === "") {
      return toast.update(ids, {
        render: "Please provide your Github Personal Access Token",
        type: "error",
        isLoading: false,
        autoClose: 1000,
      });
    }
    try {
      // await saver();
      const response = await axios.post(`${BACKEND}/git/gitpush/${id}/`, {
        url: link,
        commitmsg: commitmsg,
        branch: branch,
        pan: pan,
      });
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
      typeof error === "string"
        ? toast.update(ids, {
            render: `${error.slice(0, 50)}`,
            type: "error",
            isLoading: false,
            autoClose: 1000,
          })
        : toast.update(ids, {
            render: `Please try again later!`,
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
        `${BACKEND}/project/clone-snippet/${id}/`,
      );
      if (response.data.success === false) {
        throw response.data.error;
      }
      setNewProjectBool(true);
      setEditable(true);
      setId(response.data.output.id);
      setUser(response.data.output);
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
      typeof error === "string"
        ? toast.update(ids, {
            render: `Code Not Cloned! Please try again later in sometime ${error.slice(0, 50)}`,
            type: "error",
            isLoading: false,
            autoClose: 1000,
          })
        : toast.update(ids, {
            render: `Code Not Cloned! Please try again later in sometime!`,
            type: "error",
            isLoading: false,
            autoClose: 1000,
          });
    }
  };
  const wakeServer = async () => {
    const ids = toast.loading("Waking up the server...", { autoClose: false });
    try {
      const response = await axios.get(`${BACKEND}/server/wake-up/`);
      if (response.data.success === false) {
        throw response.data.error;
      }
      toast.update(ids, {
        render: "Server is awake!",
        type: "success",
        isLoading: false,
        autoClose: 1000,
      });
    } catch (error) {
      typeof error === "string"
        ? toast.update(ids, {
            render: `${error.slice(0, 50)}`,
            type: "error",
            isLoading: false,
            autoClose: 1000,
          })
        : toast.update(ids, {
            render: `Please try again later!`,
            type: "error",
            isLoading: false,
            autoClose: 1000,
          });
    }
  };
  const gitclonepage = () => {
    router.push("/gitclone");
  };
  const gitclone = async (url: string) => {
    const ids = toast.loading("Please wait... Cloning your code now!", {
      autoClose: false,
    });
    try {
      const response = await axios.post(`${BACKEND}/git/gitclone`, {
        url: url,
      });
      if (response.data.success === false) {
        throw response.data.error;
      }
      setNewProjectBool(true);
      setId(response.data.response.id);
      setFiles(response.data.response.files);
      await router.push("/code/" + response.data.response.id);
      toast.update(ids, {
        render: "Code Cloned!",
        type: "success",
        isLoading: false,
        autoClose: 1000,
      });
      return response;
    } catch (error: any) {
      typeof error.message === "string"
        ? toast.update(ids, {
            render: `${error.message.slice(0, 50)}`,
            type: "error",
            isLoading: false,
            autoClose: 1000,
          })
        : toast.update(ids, {
            render: `Please try again later!`,
            type: "error",
            isLoading: false,
            autoClose: 1000,
          });
    }
  };
  const lockuser = async (pwd: string) => {
    const ids = toast.loading("Locking your account...", { autoClose: false });
    try {
      const response = await axios.post(`${BACKEND}/project/lock-user/${id}`, {
        password: pwd,
      });
      if (response.data.success === false) {
        throw response.data.error;
      }
      setUser(response.data.output);
      toast.update(ids, {
        render: "Snippet Locked!",
        type: "success",
        isLoading: false,
        autoClose: 1000,
      });
      return response;
    } catch (error) {
      typeof error === "string"
        ? toast.update(ids, {
            render: `${error.slice(0, 50)}`,
            type: "error",
            isLoading: false,
            autoClose: 1000,
          })
        : toast.update(ids, {
            render: `Please try again later!`,
            type: "error",
            isLoading: false,
            autoClose: 1000,
          });
    }
  };
  const goHome = () => {
    router.push("/");
  };
  return (
    <Context.Provider
      value={{
        id,
        files,
        user,
        newProjectBool,
        newProject,
        setFiles,
        code_getter,
        coderunner,
        saver,
        gitpush,
        snipclone,
        wakeServer,
        gitclonepage,
        gitclone,
        lockuser,
        editable,
        setEditable,
        goHome,
        saving,
        addFile,
        getFileData
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default CodeState;
