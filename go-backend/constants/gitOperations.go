package constants

import (
	"os"
	"regexp"

	"github.com/go-git/go-git/v6"
)

func IsValidGitUrl(url string) bool {
	gitUrlRegex := regexp.MustCompile(`^(git|https?):\/\/[^\s/$.?#].[^\s]*$`)
	return gitUrlRegex.MatchString(url)
}

func ExecuteGitClone(repoUrl string, folderPath string) bool {
	_, err := git.PlainClone(folderPath, &git.CloneOptions{
		URL:      repoUrl,
		Progress: os.Stdout,
	})
	if err != nil {
		return false
	}
	return true
}
