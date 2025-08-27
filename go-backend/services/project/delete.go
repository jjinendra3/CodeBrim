package project

import (
	"github.com/gin-gonic/gin"
	"github.com/jjinendra3/codebrim/database"
)

func (s *Service) DeleteFile(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(400, gin.H{"error": "ID parameter is required"})
		return
	}
	if err := s.DB.Delete(&database.File{}, id).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"success": true})
}
