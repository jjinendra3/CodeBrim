package database

import (
	"database/sql"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func InitDb() *gorm.DB {
	_ = godotenv.Load()
	dsn := os.Getenv("DATABASE_URL")

	sqlDB, err := sql.Open("pgx", dsn)
	if err != nil {
		return nil
	}
	db, err := gorm.Open(postgres.New(postgres.Config{
		Conn: sqlDB,
	}), &gorm.Config{})
	if err != nil {
		return nil
	}
	return db
}

func AutoMigrate(db *gorm.DB) {
	db.AutoMigrate(&User{})
	db.AutoMigrate(&File{})
	db.AutoMigrate(&Feedback{})
}

func (User) TableName() string {
	return "User"
}

func (File) TableName() string {
	return "Files"
}

func (Feedback) TableName() string {
	return "Feedback"
}
