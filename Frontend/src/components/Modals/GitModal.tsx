"use client";

import { useState } from "react";
import { useCodeStore } from "@/lib/codeStore";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "../ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Alert, AlertDescription } from "../ui/alert";
import {
  GitBranch,
  Upload,
  X,
  Info,
  Github,
  Key,
  MessageSquare,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function GitPushDialog() {
  const isTabletOrLarger = !useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeploymentLoading, setIsDeploymentLoading] = useState(false);
  const [shouldShowSuccess, setShouldShowSuccess] = useState(false);

  const gitPushAction = useCodeStore(state => state.gitPush);

  const [gitControlsData, setGitControlsData] = useState({
    repositoryLink: "",
    commitMessage: "Initial commit",
    branchName: "main",
    personalAccessToken: "",
  });

  const handleInputValueChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setGitControlsData({
      ...gitControlsData,
      [event.target.name]: event.target.value,
    });
  };

  const resetAllInputs = () => {
    setGitControlsData({
      repositoryLink: "",
      commitMessage: "Initial commit",
      branchName: "main",
      personalAccessToken: "",
    });
    setShouldShowSuccess(false);
  };

  const handleDeploymentSubmit = async () => {
    setIsDeploymentLoading(true);
    try {
      await gitPushAction(
        gitControlsData.repositoryLink,
        gitControlsData.commitMessage,
        gitControlsData.branchName,
        gitControlsData.personalAccessToken,
      );
      setShouldShowSuccess(true);
      setTimeout(() => {
        setIsDialogOpen(false);
        resetAllInputs();
      }, 2000);
    } catch (deploymentError) {
      console.error("Git push deployment failed:", deploymentError);
    } finally {
      setIsDeploymentLoading(false);
    }
  };

  const handleDialogCancel = () => {
    setIsDialogOpen(false);
    resetAllInputs();
  };

  const isFormDataValid =
    gitControlsData.repositoryLink &&
    gitControlsData.personalAccessToken &&
    gitControlsData.commitMessage;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant={"default"} size={"xs"}>
          <GitBranch className="h-4 w-4" />
          {isTabletOrLarger && (
            <span className="ml-2 font-medium">Git Deploy</span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md mx-auto bg-gray-900 border-gray-700 shadow-2xl text-gray-100">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-center">
            <div className="p-3 rounded-full bg-gradient-to-br from-emerald-600 to-blue-600 shadow-lg">
              <Github className="h-6 w-6 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
            Deploy to Repository
          </DialogTitle>
        </DialogHeader>

        {shouldShowSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-400">
                Successfully Deployed!
              </h3>
              <p className="text-sm text-gray-400">
                Your code has been pushed to the repository
              </p>
            </div>
          </div>
        ) : (
          <>
            <Alert className="border-blue-700 bg-blue-900/20 backdrop-blur-sm">
              <Info className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-200 text-xs">
                Ensure your repository is public and you have a valid Personal
                Access Token
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="repositoryLink"
                  className="text-sm font-semibold flex items-center gap-2 text-gray-200"
                >
                  <Github className="h-4 w-4 text-gray-400" />
                  Repository URL
                </Label>
                <Input
                  type="url"
                  name="repositoryLink"
                  value={gitControlsData.repositoryLink}
                  onChange={handleInputValueChange}
                  placeholder="https://github.com/username/repo.git"
                  className="bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 font-mono text-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="personalAccessToken"
                  className="text-sm font-semibold flex items-center gap-2 text-gray-200"
                >
                  <Key className="h-4 w-4 text-gray-400" />
                  Personal Access Token
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-gray-400 hover:text-gray-300 transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-800 border-gray-600 text-gray-100">
                        <p className="text-xs">
                          Generate a classic PAT from GitHub Settings →
                          Developer settings
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Input
                  type="password"
                  name="personalAccessToken"
                  value={gitControlsData.personalAccessToken}
                  onChange={handleInputValueChange}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="commitMessage"
                  className="text-sm font-semibold flex items-center gap-2 text-gray-200"
                >
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  Commit Message
                </Label>
                <Textarea
                  name="commitMessage"
                  value={gitControlsData.commitMessage}
                  onChange={handleInputValueChange}
                  placeholder="Describe your changes..."
                  rows={2}
                  className="bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 resize-none transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="branchName"
                  className="text-sm font-semibold flex items-center gap-2 text-gray-200"
                >
                  <GitBranch className="h-4 w-4 text-gray-400" />
                  Target Branch
                </Label>
                <Input
                  type="text"
                  name="branchName"
                  value={gitControlsData.branchName}
                  onChange={handleInputValueChange}
                  className="bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-gray-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  onClick={handleDialogCancel}
                  className="flex-1 bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700 hover:border-gray-500 transition-all duration-200"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </DialogClose>

              <Button
                onClick={handleDeploymentSubmit}
                disabled={!isFormDataValid || isDeploymentLoading}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-0"
              >
                {isDeploymentLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Deploy
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
