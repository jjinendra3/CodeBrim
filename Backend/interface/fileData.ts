export interface FileData {
  id: string;
  name: string;
  type: string;
  content?: string;
  lang?: string;
  stdin?: string;
  stdout?: string;
  parentId?: string;
}
