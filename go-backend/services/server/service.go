package server

import (
	"fmt"

	"github.com/jjinendra3/codebrim/database"
	"gorm.io/gorm"
)

type ServerService struct {
	DB *gorm.DB
}

func NewServerService(db *gorm.DB) *ServerService {
	return &ServerService{DB: db}
}

func (s *ServerService) GetAllUsers() ([]database.User, error) {
	var users []database.User
	result := s.DB.Find(&users)
	fmt.Println(result)
	return users, result.Error
}

func (s *ServerService) ResetDatabase() error {
	return s.DB.Exec("TRUNCATE TABLE Users, Files, Feedback").Error
}