package database

import (
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func InitDb() *gorm.DB {
	dsn := "host=localhost user=gorm password=gorm dbname=gorm port=9920 sslmode=disable TimeZone=Asia/Shanghai"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err!=nil{
		return nil
	}
	return db
}