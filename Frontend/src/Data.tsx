"use client";
import React, { useState } from "react";
import Context from "./ContextAPI";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
// import { toast } from "react-toastify";
import { toast } from "sonner";

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
  userId: string;
  datetime: string | null;
}
const CodeState: React.FC<CodeStateProps> = ({ children }) => {
  const router = useRouter();
  const projectId = usePathname().split("/")[2];
  const fileId = usePathname().split("/")[3];
  const [id, setId] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([
    {
      content: "",
      filename: "",
      id: "",
      stdin: "",
      stdout: "",
      lang: "",
      userId: "",
      datetime: "",
    },
  ]);
  const [user, setUser] = useState({});
  const [newProjectBool, setNewProjectBool] = useState(false);
  const [editable, setEditable] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);
  const [payload, setPayload] = useState<File | null>(null);
  const [queued, setQueued] = useState({
    loading: false,
    fileId: "",
  });

  const newProject = async (lang: string) => {
    try {
      const response = await axios.get(
        `${BACKEND}/project/newcompiler/${lang}/`,
      );
      if (response.data.success === false) {
        throw response.data.error;
      }
      toast.success("Project Created!");
      setNewProjectBool(true);
      setId(response.data.output.id);
      setUser(response.data.output);
      setFiles(response.data.output.files);
      router.push(
        `code/${response.data.output.id}/${response.data.output.files[0].id}`,
      );
    } catch (error) {
      toast.error("Error creating new project");
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
    try {
      setId(ID);
      const response = await axios.get(`${BACKEND}/project/getproject/${ID}/`);
      if (response.data.success === false) {
        throw response.data.error;
      }
      setFiles(response.data.user.files);
      setUser(response.data.user);
      setId(response.data.user.id);
      toast.success("Snippet Loaded!");
      return { success: 1, user: response.data.user };
    } catch (error) {
      toast.error("Error fetching your code, please try again later!");
      return { success: 0, error: error };
    }
  };

  const getFileData = async (ID: string) => {
    try {
      const response = await axios.get(`${BACKEND}/project/getfile/${ID}`);
      return response.data;
    } catch (error) {
      console.log(error);
      router.push("/maintenance");
      toast.error("Error fetching your code, please try again later!");
    }
  };

  const coderunner = async (File: File) => {
    try {
      toast("Running your Code, please wait!");
      await saver(File);
      const response = await axios.post(`${BACKEND}/code/runcode/`, {
        files: File,
      });
      if (response.data.success) {
        setQueued({ loading: true, fileId: File.id });
      }
      return response.data;
    } catch (error) {
      console.log(error);
      toast.error("Error running your code, please try again later!");
    }
  };

  const saver = async (presentFile: File) => {
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
      toast.error("Error saving your work");
      return error;
    }
  };

  const gitpush = async (
    link: string,
    commitmsg: string,
    branch: string,
    pan: string,
  ) => {
    if (pan === "") {
      return toast.warning("Please provide your Github Personal Access Token");
    }
    try {
      const response = await axios.post(`${BACKEND}/git/gitpush/${id}/`, {
        url: link,
        commitmsg: commitmsg,
        branch: branch,
        pan: pan,
      });
      if (response.data.success === false) {
        throw response.data.error;
      }
      toast.success("Code Pushed!");
      return response;
    } catch (error) {
      typeof error === "string"
        ? toast.error(`${error.slice(0, 50)}`)
        : toast.error(`Please try again later!`);
      return error;
    }
  };
  const snipclone = async () => {
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
      toast.success("Code Cloned!");
      return response;
    } catch (error) {
      typeof error === "string"
        ? toast.error(`Code Not Cloned! Please try again later in sometime ${error.slice(0, 50)}`)
        : toast.error(`Code Not Cloned! Please try again later in sometime!`);
    }
  };
  
  const gitclonepage = () => {
    router.push("/gitclone");
  };
  const gitclone = async (url: string) => {
    const ids = toast("Please wait... Cloning your code now!");
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
      toast.success("Code Cloned!");
      return response;
    } catch (error: any) {
      typeof error.message === "string"
        ? toast.error(`${error.message.slice(0, 50)}`)
        : toast.error(`Please try again later!`);
    }
  };
  const lockuser = async (pwd: string) => {
    const ids = toast("Locking your account...");
    try {
      const response = await axios.post(`${BACKEND}/project/lock-user/${id}`, {
        password: pwd,
      });
      if (response.data.success === false) {
        throw response.data.error;
      }
      setUser(response.data.output);
      toast.success("Snippet Locked!");
      return response;
    } catch (error) {
      typeof error === "string"
        ? toast.error(`${error.slice(0, 50)}`)
        : toast.error(`Please try again later!`);
    }
  };
  const addFeedback = async (feedback: string) => {
    try {
      const response = await axios.post(`${BACKEND}/project/add-feedback`, {
        feedback: feedback,
      });
      return response.data;
    } catch (error) {
      toast.error("Error adding feedback");
    }
  };
  const goHome = () => {
    router.push("/");
  };
  return (
    <Context.Provider
      value={{
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
        gitclonepage,
        gitclone,
        lockuser,
        editable,
        setEditable,
        goHome,
        saving,
        addFile,
        getFileData,
        payload,
        setPayload,
        queued,
        setQueued,
        addFeedback
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default CodeState;
