import { create } from "zustand";
import axios from "axios";
import { toast } from "sonner";
import { CodeState, Feedback, File } from "@/type";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND;

export const useCodeStore = create<CodeState>((set, get) => ({
  id: null,
  files: [],
  user: {},
  newProjectBool: false,
  editable: true,
  saving: false,
  payload: null,
  queued: {
    loading: false,
    fileId: "",
  },
  presentFile: null,
  canLock: false,
  setCanLock: canLock => set({ canLock }),
  setPresentFile: presentFile => set({ presentFile }),
  setId: id => set({ id }),
  setFiles: files => set({ files }),
  setUser: user => set({ user }),
  setNewProjectBool: newProjectBool => set({ newProjectBool }),
  setEditable: editable => set({ editable }),
  setSaving: saving => set({ saving }),
  setPayload: payload => set({ payload }),
  setQueued: queued => set({ queued }),

  newProject: async (lang: string) => {
    try {
      const creating = toast.loading("Creating Project...");
      const response = await axios.get(
        `${BACKEND}/project/newcompiler/${lang}/`,
      );
      if (response.data.success === false) {
        throw response.data.error;
      }
      toast.success("Project Created", {
        id: creating,
      });

      set({
        newProjectBool: true,
        id: response.data.output.id,
        user: response.data.output,
        files: response.data.output.items,
      });

      return response.data.output;
    } catch (error) {
      toast.error("Error creating new project");
      return undefined;
    }
  },

  addFile: async (file: File) => {
    try {
      const { name, type, lang, parentId } = file;
      const response = await axios.post(`${BACKEND}/project/add-item`, {
        projectId: get().id,
        lang,
        name,
        type,
        parentId,
      });
      toast.success("File Added");
      return response.data.output;
    } catch (error) {
      console.log(error);
      toast.error("Error creating new file");
      return undefined;
    }
  },
  deleteFile: async (fileId: string) => {
    try {
      const response = await axios.delete(
        `${BACKEND}/project/delete-item/${fileId}`,
      );
      if (response.data.success === false) {
        throw response.data.error;
      }
      toast.success("File Deleted!");
      return response.data;
    } catch (error) {
      console.log(error);
      toast.error("Error deleting file");
      return undefined;
    }
  },
  updateFile: async (file: File) => {
    try {
      const response = await axios.put(`${BACKEND}/project/update-item`, {
        file: file,
      });
      if (response.data.success === false) {
        throw response.data.error;
      }
      toast.success("File Updated!");
      return response.data;
    } catch (error) {
      console.log(error);
      toast.error("Error updating file");
      return undefined;
    }
  },
  getCode: async (id: string) => {
    try {
      set({ id });
      const response = await axios.get(`${BACKEND}/project/getproject/${id}/`);
      if (response.data.success === false) {
        throw response.data.error;
      }

      set({
        files: response.data.user.files,
        user: response.data.user,
        id: response.data.user.id,
      });

      toast.success("Snippet Loaded!");
      return { success: 1, user: response.data.user };
    } catch (error) {
      toast.error("Error fetching your code, please try again later!");
      return { success: 0, error };
    }
  },

  getFileData: async (id: string) => {
    try {
      const response = await axios.get(`${BACKEND}/project/getfile/${id}`);
      if (response.data.success === false) {
        throw response.data.error;
      }
      set({ presentFile: response.data.file });
      return response.data;
    } catch (error) {
      console.log(error);
      toast.error("Error fetching your code, please try again later!");
      return undefined;
    }
  },

  codeRunner: async (file: File) => {
    try {
      toast("Running your Code, please wait!");
      await get().saver(file);
      const response = await axios.post(`${BACKEND}/code/runcode/`, {
        files: file,
      });

      if (response.data.success) {
        set({ queued: { loading: true, fileId: file.id } });
      }

      return response.data;
    } catch (error) {
      console.log(error);
      toast.error("Error running your code, please try again later!");
      return undefined;
    }
  },

  saver: async (presentFile: File) => {
    try {
      set({ saving: true });
      const response = await axios.post(`${BACKEND}/project/file-save`, {
        presentFile,
      });

      if (response.data.success === false) {
        throw response.data.error;
      }

      set({ saving: false });
      return response;
    } catch (error) {
      console.log(error);
      toast.error("Error saving your work");
      return error;
    }
  },

  gitPush: async (
    link: string,
    commitMsg: string,
    branch: string,
    pat: string,
  ) => {
    if (pat === "") {
      toast.warning("Please provide your Github Personal Access Token");
      return undefined;
    }

    try {
      const response = await axios.post(`${BACKEND}/git/gitpush/${get().id}/`, {
        url: link,
        commitmsg: commitMsg,
        branch: branch,
        pan: pat,
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
  },

  snipClone: async () => {
    try {
      const response = await axios.get(
        `${BACKEND}/project/clone-snippet/${get().id}/`,
      );

      if (response.data.success === false) {
        throw response.data.error;
      }

      set({
        newProjectBool: true,
        editable: true,
        id: response.data.output.id,
        user: response.data.output,
        files: response.data.output.files,
      });

      toast.success("Code Cloned!");
      return response.data.output;
    } catch (error) {
      typeof error === "string"
        ? toast.error(
            `Code Not Cloned! Please try again later in sometime ${error.slice(0, 50)}`,
          )
        : toast.error(`Code Not Cloned! Please try again later in sometime!`);
      return undefined;
    }
  },

  gitClone: async (repoUrl: string) => {
    toast("Please wait... Cloning your code now!");
    try {
      const response = await axios.post(`${BACKEND}/git/clone`, {
        repoUrl,
      });
      if (response.data.success === false) {
        throw response.data.error;
      }
      set({
        newProjectBool: true,
        id: response.data.output.id,
        user: response.data.output,
        files: response.data.output.files,
      });

      toast.success("Code Cloned!");
      return response.data.output;
    } catch (error: any) {
      console.log(error);
      typeof error.message === "string"
        ? toast.error(`${error.message.slice(0, 50)}`)
        : toast.error(`Please try again later!`);
      return undefined;
    }
  },
  userPrivacy: async (pwd: string | undefined) => {
    const isLocking = pwd === undefined;
    toast(isLocking ? "Locking project..." : "Unlocking project...");
    try {
      const response = await axios.post(
        `${BACKEND}/project/project-privacy/${get().id}`,
        {
          password: pwd,
        },
      );
      if (response.data.success === false) {
        throw response.data.error;
      }
      set({ user: response.data.output });
      toast.success(isLocking ? "Project locked!" : "Project unlocked!");
      return response.data.output;
    } catch (error) {
      toast.error(`Please try again later!`);
      return undefined;
    }
  },

  addFeedback: async (feedback: Feedback) => {
    try {
      const response = await axios.post(`${BACKEND}/project/add-feedback`, {
        feedback: feedback,
      });
      return response.data;
    } catch (error) {
      toast.error("Error adding feedback");
      return undefined;
    }
  },
}));
