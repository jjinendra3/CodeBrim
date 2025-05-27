const MULTIMEDIA_EXTENSIONS = {
  images: [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "webp",
    "svg",
    "ico",
    "tiff",
    "tif",
  ],
  videos: ["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv", "m4v", "3gp"],
  audio: ["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a", "opus"],
  documents: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"],
  archives: ["zip", "rar", "7z", "tar", "gz", "bz2", "xz"],
  executables: ["exe", "msi", "deb", "rpm", "dmg", "pkg", "app"],
};

const ALL_MULTIMEDIA = [
  ...MULTIMEDIA_EXTENSIONS.images,
  ...MULTIMEDIA_EXTENSIONS.videos,
  ...MULTIMEDIA_EXTENSIONS.audio,
  ...MULTIMEDIA_EXTENSIONS.documents,
  ...MULTIMEDIA_EXTENSIONS.archives,
  ...MULTIMEDIA_EXTENSIONS.executables,
];

export function isMultimediaFile(fileExtension: string): boolean {
  return ALL_MULTIMEDIA.includes(fileExtension.toLowerCase());
}
