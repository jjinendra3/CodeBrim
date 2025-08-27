package project

import (
	"gorm.io/gorm"
)

type Service struct {
	DB *gorm.DB
}

func NewProjectService(db *gorm.DB) *Service {
	return &Service{DB: db}
}
