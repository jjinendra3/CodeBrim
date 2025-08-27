package project

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

func NewProjectService(db *gorm.DB) *Service {
	return &Service{DB: db}
}

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
