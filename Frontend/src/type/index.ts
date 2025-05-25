export type File = {
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  lang: string | null;
  stdin?: string;
  stdout?: string;
  parentId: string | null;
  userId: string;
  datetime: Date;
  children?: File[];
};

type QueuedState = {
  loading: boolean;
  fileId: string;
};

export type Feedback = {
  content: string;
  happy: boolean;
};

export type CodeState = {
  id: string | null;
  files: File[];
  user: Record<string, any>;
  newProjectBool: boolean;
  editable: boolean;
  saving: boolean;
  payload: File | null;
  queued: QueuedState;
  presentFile: File | null;
  canLock: boolean;

  setCanLock: (canLock: boolean) => void;
  setPresentFile: (presentFile: File | null) => void;
  setId: (id: string | null) => void;
  setFiles: (files: File[]) => void;
  setUser: (user: Record<string, any>) => void;
  setNewProjectBool: (value: boolean) => void;
  setEditable: (value: boolean) => void;
  setSaving: (value: boolean) => void;
  setPayload: (payload: File | null) => void;
  setQueued: (queued: QueuedState) => void;

  newProject: (lang: string) => Promise<any>;
  addFile: (file: File) => Promise<any>;
  deleteFile: (fileId: string) => Promise<any>;
  updateFile: (file: File) => Promise<any>;
  getCode: (
    id: string,
  ) => Promise<{ success: number; user?: any; error?: any }>;
  getFileData: (id: string) => Promise<any>;
  codeRunner: (file: File) => Promise<any>;
  saver: (presentFile: File) => Promise<any>;
  gitPush: (
    link: string,
    commitMsg: string,
    branch: string,
    pat: string,
  ) => Promise<any>;
  snipClone: () => Promise<any>;
  gitClone: (url: string) => Promise<any>;
  userPrivacy: (pwd: string | undefined) => Promise<any>;
  addFeedback: (feedback: Feedback) => Promise<any>;
};
