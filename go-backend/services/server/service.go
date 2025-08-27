package server

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/jjinendra3/codebrim/database"
	"gorm.io/gorm"
)

type Service struct {
	DB *gorm.DB
}

func NewServerService(db *gorm.DB) *Service {
	return &Service{DB: db}
}

func (s *Service) GetAllUsers(c *gin.Context) {
	password := c.Param("pwd")
	actualPassword := os.Getenv("RESET_PWD")
	if password != actualPassword {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Incorrect Password",
		})
		return
	}
	var users []database.User
	result := s.DB.Preload("Items").Find(&users)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": result.Error.Error(),
		})
		return
	}
	c.JSON(http.StatusAccepted, gin.H{
		"success": true,
		"users":   users,
	})
}

func (s *Service) ResetDatabase(c *gin.Context) {
	password := c.Param("pwd")
	actualPassword := os.Getenv("RESET_PWD")
	if password != actualPassword {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Incorrect Password",
		})
		return
	}
	err := s.DB.Exec("TRUNCATE TABLE Users, Files, Feedback").Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusAccepted, gin.H{
		"success": true,
		"message": "Database reset successfully",
	})
}
