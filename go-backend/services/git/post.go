package git

import (
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jjinendra3/codebrim/constants"
	"github.com/jjinendra3/codebrim/database"
)

func (s *Service) CloneRepo(c *gin.Context) {
	var CloneRepoDetails struct {
		CloneUrl string `json:"repoUrl"`
	}
	if err := c.ShouldBindJSON(&CloneRepoDetails); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	if !constants.IsValidGitUrl(CloneRepoDetails.CloneUrl) {
		c.JSON(400, gin.H{"error": "Invalid Git URL"})
		return
	}
	userId := strings.ReplaceAll(uuid.New().String()[5:10], "-", "")
	folderPath := "temp-repo-" + userId
	if !constants.ExecuteGitClone(CloneRepoDetails.CloneUrl, folderPath) {
		c.JSON(500, gin.H{"error": "Failed to clone repository"})
		return
	}
	files, err := constants.ProcessFolder(folderPath, userId, []database.File{}, "", "")
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to process folder"})
		return
	}
	res := s.DB.Create(&database.User{
		ID:    userId,
		Items: files,
	})
	constants.DeleteFolderRecursive(folderPath)
	if res.Error != nil {
		c.JSON(500, gin.H{"error": "Error in cloning the repository."})
		return
	}
	c.JSON(200, gin.H{"success": true, "output": res})
}

func (s *Service) GitPush(c *gin.Context) {
	var GitDetails struct {
		GitUrl      string `json:"gitUrl" required:"true"`
		AccessToken string `json:"accessToken" required:"true"`
		Branch      string `json:"branch" required:"true"`
		CommitMsg   string `json:"commitMsg" required:"true"`
	}
	userId := c.Param("id")
	if err := c.ShouldBindJSON(&GitDetails); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	if !constants.IsValidGitUrl(GitDetails.GitUrl) {
		c.JSON(400, gin.H{"error": "Invalid Git URL"})
		return
	}
	urlParts := strings.ReplaceAll(GitDetails.GitUrl, ".git", "")
	parts := strings.Split(urlParts, "/")
	var repoName string
	if len(parts) >= 2 {
		repoName = strings.Join(parts[len(parts)-2:], "/")
	}
	fmt.Println(repoName)
	if repoName == "" {
		c.JSON(400, gin.H{"error": "Invalid repository name"})
		return
	}
	var user database.User
	result := s.DB.Preload("Items").Where("id = ?", userId).Order("datetime asc").First(&user)
	if result.Error != nil {
		c.JSON(404, gin.H{"error": "User not found"})
		return
	}
	if len(user.Items) == 0 {
		c.JSON(404, gin.H{"error": "No files found to push"})
		return
	}
	if !constants.ExecuteGitPush(user.Items, GitDetails.AccessToken, userId, repoName) {
		c.JSON(500, gin.H{"error": "Failed to push changes"})
		return
	}
	c.JSON(200, gin.H{"success": true, "message": "Successfully Pushed", "filesCount": len(user.Items)})
}