package constants

import (
	"archive/zip"
	"bufio"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
	"github.com/jjinendra3/codebrim/database"
)

func CreateZipFromFolder(folderPath, outputZipPath string) error {
	zipFile, err := os.Create(outputZipPath)
	if err != nil {
		return err
	}
	defer zipFile.Close()

	zipWriter := zip.NewWriter(zipFile)
	defer zipWriter.Close()

	err = filepath.Walk(folderPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		relPath, err := filepath.Rel(folderPath, path)
		if err != nil {
			return err
		}

		if relPath == "." {
			return nil
		}

		header, err := zip.FileInfoHeader(info)
		if err != nil {
			return err
		}

		header.Name = filepath.ToSlash(relPath)

		if info.IsDir() {
			header.Name += "/"
		}

		writer, err := zipWriter.CreateHeader(header)
		if err != nil {
			return err
		}

		if !info.IsDir() {
			file, err := os.Open(path)
			if err != nil {
				return err
			}
			defer file.Close()

			_, err = io.Copy(writer, file)
			if err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		return err
	}

	fileInfo, err := zipFile.Stat()
	if err != nil {
		return err
	}
	fmt.Printf("ZIP created: %d total bytes\n", fileInfo.Size())
	return nil
}

func GetLangName(extension string) string {
	switch strings.ToLower(extension) {
	case "js":
		return "javascript"
	case "java":
		return "java"
	case "py":
		return "python"
	case "cpp", "cc", "cxx":
		return "cpp"
	case "c":
		return "c"
	case "go":
		return "go"
	default:
		return "txt"
	}
}

func ProcessFolder(folderPath, userID string, files []database.File, basePath, parentID string) ([]database.File, error) {
	if basePath == "" {
		basePath = folderPath
	}

	entries, err := os.ReadDir(folderPath)
	if err != nil {
		fmt.Printf("Error processing folder: %v\n", err)
		return files, err
	}

	for _, entry := range entries {
		if entry.Name() == ".git" {
			continue
		}

		itemPath := filepath.Join(folderPath, entry.Name())
		itemID := uuid.New().String()

		if entry.IsDir() {
			fileData := database.File{
				ID:       itemID,
				Name:     entry.Name(),
				Type:     "folder",
				ParentID: &parentID,
			}
			files = append(files, fileData)

			files, err = ProcessFolder(itemPath, userID, files, basePath, itemID)
			if err != nil {
				fmt.Printf("Error processing subdirectory %s: %v\n", itemPath, err)
				continue
			}
		} else {
			content, err := ReadFileContent(itemPath)
			if err != nil {
				fmt.Printf("Error reading file %s: %v\n", itemPath, err)
				continue
			}

			fileExtension := strings.TrimPrefix(filepath.Ext(entry.Name()), ".")
			lang := GetLangName(fileExtension)

			fileData := database.File{
				ID:       itemID,
				Name:     entry.Name(),
				Type:     "file",
				Content:  &content,
				Lang:     &lang,
				ParentID: &parentID,
			}
			files = append(files, fileData)
		}
	}

	return files, nil
}

func ReadFileContent(filePath string) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	var content strings.Builder
	scanner := bufio.NewScanner(file)
	
	for scanner.Scan() {
		line := scanner.Text()
		line = strings.ReplaceAll(line, "\x00", " ")
		content.WriteString(line)
		content.WriteString("\n")
	}

	if err := scanner.Err(); err != nil {
		return "", err
	}

	return content.String(), nil
}

func CreateFolderStructureRecursive(files []database.File, basePath string) error {
	if err := os.MkdirAll(basePath, 0755); err != nil {
		return err
	}

	var rootFiles []database.File
	for _, file := range files {
		if file.ParentID == nil {
			rootFiles = append(rootFiles, file)
		}
	}

	var createFileOrFolder func(file database.File, currentPath string) error
	createFileOrFolder = func(file database.File, currentPath string) error {
		fullPath := filepath.Join(currentPath, file.Name)

		if file.Type == "folder" {
			if err := os.MkdirAll(fullPath, 0755); err != nil {
				return err
			}

			for _, f := range files {
				if f.ParentID == &file.ID {
					if err := createFileOrFolder(f, fullPath); err != nil {
						return err
					}
				}
			}
		} else {
			content := file.Content
			if content == nil {
				content = new(string)
			}

			if err := os.WriteFile(fullPath, []byte(*content), 0644); err != nil {
				return err
			}
		}

		return nil
	}

	for _, rootFile := range rootFiles {
		if err := createFileOrFolder(rootFile, basePath); err != nil {
			return err
		}
	}

	return nil
}

func DeleteFolderRecursive(folderPath string) error {
	if folderPath == "" {
		return nil
	}

	if _, err := os.Stat(folderPath); os.IsNotExist(err) {
		return nil
	}

	return os.RemoveAll(folderPath)
}