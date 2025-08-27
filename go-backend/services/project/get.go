package project

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jjinendra3/codebrim/constants"
	"github.com/jjinendra3/codebrim/database"
	"gorm.io/gorm"
)

func (s *Service) NewCompiler(c *gin.Context) {
	id := strings.ReplaceAll(uuid.New().String()[5:10], "-", "")
	language := c.Param("lang")
	if language == "" {
		c.JSON(400, gin.H{"error": "Language parameter is required"})
		return
	}
	content := constants.LanguageContent(language)
	fileID := uuid.New().String()
	var filename string
	if language == "python" {
		filename = "main.py"
	} else if language == "javascript" {
		filename = "main.js"
	} else {
		filename = "main." + language
	}
	user := database.User{
		ID: id,
		Items: []database.File{
			{
				ID:      fileID,
				Name:    filename,
				Content: &content,
				Lang:    &language,
				Type:    "file",
			},
		},
	}
	if err := s.DB.Create(&user).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"success": true, "output": user})
}

func (s *Service) GetProjectByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(400, gin.H{"error": "ID parameter is required"})
		return
	}
	var user database.User
	if err := s.DB.Preload("Items").First(&user, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "Project not found"})
			return
		}
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"success": true, "user": user})
}

func (s *Service) GetFileByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(400, gin.H{"error": "ID parameter is required"})
		return
	}
	var file database.File
	if err := s.DB.First(&file, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "File not found"})
			return
		}
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"success": true, "file": file})
}

func (s *Service) CloneSnippet(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(400, gin.H{"error": "ID parameter is required"})
		return
	}
	var user database.User
	if err := s.DB.Preload("Items").First(&user, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "Project not found"})
			return
		}
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	newUserId := strings.ReplaceAll(uuid.New().String()[5:10], "-", "")
	for i := range user.Items {
		user.Items[i].ID = uuid.New().String()
	}
	newUser := database.User{
		ID:    newUserId,
		Items: user.Items,
	}
	if err := s.DB.Create(&newUser).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"success": true, "output": newUser})
}

func (s *Service) DownloadProject(c *gin.Context){
	var tempFolderPath string
		var zipFilePath string

		cleanup := func() {
			if tempFolderPath != "" {
				constants.DeleteFolderRecursive(tempFolderPath)
			}
			if zipFilePath != "" {
				if _, err := os.Stat(zipFilePath); err == nil {
					os.Remove(zipFilePath)
				}
			}
		}
		defer cleanup()

		userID := c.Param("id")
		if userID == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":   "User ID is required",
			})
			return
		}

		var user database.User
		if err := s.DB.Preload("Items").Where("id = ?", userID).First(&user).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{
					"success": false,
					"error":   "No code snippets found for this user",
				})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error":   "Database error",
			})
			return
		}

		timestamp := time.Now().UnixNano()
		folderName := fmt.Sprintf("temp-%s-%d", user.ID, timestamp)
		zipFileName := fmt.Sprintf("%s.zip", folderName)

		tempFolderPath = filepath.Clean(folderName)
		zipFilePath = filepath.Clean(zipFileName)

		fmt.Printf("Creating folder structure for user %s...\n", user.ID)

		if err := constants.CreateFolderStructureRecursive(user.Items, tempFolderPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error":   "Failed to create folder structure",
			})
			return
		}

		if err := constants.CreateZipFromFolder(tempFolderPath, zipFilePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error":   "Failed to create zip file",
			})
			return
		}

		fileInfo, err := os.Stat(zipFilePath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error":   "Failed to create zip file",
			})
			return
		}

		filename := fmt.Sprintf("code-snippets-codebrim-%s.zip", user.ID)
		c.Header("Content-Type", "application/zip")
		c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", filename))
		c.Header("Content-Length", strconv.FormatInt(fileInfo.Size(), 10))

		c.File(zipFilePath)
}
