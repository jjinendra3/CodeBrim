package project

import (
	"github.com/gin-gonic/gin"
	"github.com/jjinendra3/codebrim/database"
)

func (s *Service) UpdateFile(c *gin.Context) {
	var fileData database.File
	if err := c.ShouldBindJSON(&fileData); err != nil {
		c.JSON(400, gin.H{"error": "Invalid file data"})
		return
	}
	if err := s.DB.Model(&database.File{}).Where("id = ?", fileData.ID).Updates(fileData).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"success": true, "output": fileData})
}

func (s *Service) SetProjectPrivacy (c *gin.Context){
	id := c.Param("id")
	if id == "" {
		c.JSON(400, gin.H{"error": "ID parameter is required"})
		return
	}
	var privacyData struct {
		Password bool `json:"password"`
	}
	if err := c.ShouldBindJSON(&privacyData); err != nil {
		c.JSON(400, gin.H{"error": "Invalid privacy data"})
		return
	}
	file := s.DB.Model(&database.User{}).Where("id = ?", id).Update("password", privacyData.Password)
	if file.Error != nil {
		c.JSON(500, gin.H{"error": file.Error.Error()})
		return
	}
	c.JSON(200, gin.H{"success": true, "output": file})
}