package project

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jjinendra3/codebrim/constants"
	"github.com/jjinendra3/codebrim/database"
)

func (s *Service) CreateFile(c *gin.Context) {
	var fileData struct{
		ProjectId string `json:"projectId"`
		Name      string `json:"name"`
		Type      string `json:"type"`
		ParentId  string `json:"parentId"`
		Lang      string `json:"lang"`
	}
	if err := c.ShouldBindJSON(&fileData); err != nil {
		c.JSON(400, gin.H{"error": "Invalid file data"})
		return
	}
	content := constants.LanguageContent(fileData.Lang)
	id := uuid.New().String()
	file := s.DB.Create(&database.File{
		ID:      id,
		UserID:  &fileData.ProjectId,
		Name:    fileData.Name,
		Type:    fileData.Type,
		ParentID: &fileData.ParentId,
		Lang:    &fileData.Lang,
		Content: &content,
	})
	if file.Error != nil {
		c.JSON(500, gin.H{"error": file.Error.Error()})
		return
	}
	c.JSON(200, gin.H{"success": true, "output": file})
}

func (s *Service) AddFeedback(c *gin.Context) {
	var feedback struct{
		Content string `json:"content"`
		Happy   bool   `json:"happy"`
	}
	if err := c.ShouldBindJSON(&feedback); err != nil {
		c.JSON(400, gin.H{"error": "Invalid feedback data"})
		return
	}
	//	TODO: Implement Feedback to Rollbar
	if err := s.DB.Create(&database.Feedback{
		Content: feedback.Content,
		Happy:   feedback.Happy,
	}).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}	
	c.JSON(200, gin.H{"success": true, "output": feedback})
}