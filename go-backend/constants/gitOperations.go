package constants

import (
	"os"
	"regexp"
	"strconv"
	"time"

	"github.com/go-git/go-git/v6"
	"github.com/go-git/go-git/v6/config"
	"github.com/jjinendra3/codebrim/database"
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
	return err == nil
}
func ExecuteGitPush(files []database.File, accessToken string,userId string,repoName string) bool {
	temporaryDirectory := "temp-push-" + userId +"-"+strconv.FormatInt(time.Now().Unix(), 10)
	if err := os.MkdirAll(temporaryDirectory, os.ModePerm); err != nil {
		return false
	}
	r, err := git.PlainOpen(temporaryDirectory)
	if err != nil {
		return false
	}
	w, err := r.Worktree()
	if err != nil {
		return false
	}
	remoteUrl := "https://" + accessToken + "@github.com/" + repoName + ".git"
	if _, err = r.CreateRemote(&config.RemoteConfig{
		Name: "origin",
		URLs: []string{remoteUrl},
	}); err != nil {
		return false
	}
	if err := w.Pull(&git.PullOptions{RemoteName: "origin"}); err != nil {
		return false
	}
	CreateFolderStructureRecursive(files, temporaryDirectory)
	if _, err := w.Add("."); err != nil {
		return false
	}
	_, err = w.Commit("Commit from CodeBrim", &git.CommitOptions{
		All: true,
	})
	if err != nil {
		DeleteFolderRecursive(temporaryDirectory)
		return false
	}
	if err := r.Push(&git.PushOptions{}); err != nil {
		DeleteFolderRecursive(temporaryDirectory)
		return false
	}

	return true
}