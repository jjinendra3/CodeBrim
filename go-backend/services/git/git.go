package git

import (
	"gorm.io/gorm"
)

type Service struct {
	DB *gorm.DB
}

func NewGitService(db *gorm.DB) *Service {
	return &Service{DB: db}
}
