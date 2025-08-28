package git

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jjinendra3/codebrim/constants"
	"github.com/jjinendra3/codebrim/database"
	"gorm.io/gorm"
)

type Service struct {
	DB *gorm.DB
}

func NewGitService(db *gorm.DB) *Service {
	return &Service{DB: db}
}

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
