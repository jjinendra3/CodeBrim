export type File = {
  fileId: string;
  id: string;
  filename: string;
  content: string;
  stdin: string;
  stdout: string;
  lang: string;
  userId: string;
  datetime: string | null;
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

  // Actions
  setId: (id: string | null) => void;
  setFiles: (files: File[]) => void;
  setUser: (user: Record<string, any>) => void;
  setNewProjectBool: (value: boolean) => void;
  setEditable: (value: boolean) => void;
  setSaving: (value: boolean) => void;
  setPayload: (payload: File | null) => void;
  setQueued: (queued: QueuedState) => void;

  // Methods
  newProject: (lang: string) => Promise<any>;
  addFile: (lang: string, fileName: string) => Promise<any>;
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
  lockUser: (pwd: string) => Promise<any>;
  addFeedback: (feedback: Feedback) => Promise<any>;
};
