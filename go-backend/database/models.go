package database

import (
	"time"
)

type User struct {
	ID       string    `gorm:"primaryKey;" json:"id"`
	Datetime time.Time `gorm:"autoCreateTime" json:"datetime"`
	Password *string   `json:"password,omitempty"`
	Items    []File    `gorm:"foreignKey:UserID" json:"items"`
}

type File struct {
	ID      string  `gorm:"primaryKey;" json:"id"`
	Name    string  `json:"name"`
	Type    string  `json:"type"`
	Content *string `json:"content,omitempty"`
	Lang    *string `json:"lang,omitempty"`
	Stdin   *string `json:"stdin,omitempty"`
	Stdout  *string `json:"stdout,omitempty"`

	ParentID *string `gorm:"column:parentId" json:"parentId,omitempty"`
	Parent   *File   `gorm:"foreignKey:ParentID;constraint:OnDelete:CASCADE" json:"parent,omitempty"`
	Children []File  `gorm:"foreignKey:ParentID" json:"children,omitempty"`

	UserID *string `gorm:"column:userId" json:"userId,omitempty"`
	User   *User   `gorm:"foreignKey:UserID" json:"user,omitempty"`

	Datetime time.Time `gorm:"autoCreateTime" json:"datetime"`
}

type Feedback struct {
	ID       string    `gorm:"primaryKey;default:gen_random_uuid()" json:"id"`
	Datetime time.Time `gorm:"autoCreateTime" json:"datetime"`
	Happy    bool      `json:"happy"`
	Content  string    `json:"content"`
}
