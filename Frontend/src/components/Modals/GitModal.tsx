"use client";

import { useCodeStore } from "@/lib/codeStore";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { GitBranch } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function GitPushDialog({
  gitcontrols,
  setgitcontrols,
}: {
  gitcontrols: {
    repolink: string;
    commitmsg: string;
    branch: string;
    pan: string;
  };
  setgitcontrols: (val: any) => void;
}) {
  const isTabBigger = !useIsMobile();

  const gitPush = useCodeStore(state => state.gitPush);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setgitcontrols({
      ...gitcontrols,
      [event.target.name]: event.target.value,
    });
  };

  const resetInputs = () => {
    setgitcontrols({
      repolink: "",
      commitmsg: "commit",
      branch: "master",
      pan: "",
    });
  };

  const handleSubmit = () => {
    gitPush(
      gitcontrols.repolink,
      gitcontrols.commitmsg,
      gitcontrols.branch,
      gitcontrols.pan,
    );
    resetInputs();
  };

  const handleCancel = () => {
    resetInputs();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size={"xs"}
          className="flex gap-2 items-center"
        >
          <GitBranch className="h-4 w-4" />
          {isTabBigger && <span>Git Controls</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#101518] text-white border-green-300">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-center">
            Push to Repository
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-center mb-4 font-semibold text-gray-300">
          Please make the repository public before hitting Submit.
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="repolink" className="text-xs font-bold">
              Repository Link
            </label>
            <Input
              type="text"
              name="repolink"
              value={gitcontrols.repolink}
              onChange={handleInputChange}
              className="font-mono mt-1"
            />
          </div>

          <div>
            <label htmlFor="pan" className="text-xs font-bold">
              Personal Access Token (Classic)
            </label>
            <Input
              type="password"
              name="pan"
              value={gitcontrols.pan}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="commitmsg" className="text-xs font-bold">
              Commit Message
            </label>
            <Input
              type="text"
              name="commitmsg"
              value={gitcontrols.commitmsg}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="branch" className="text-xs font-bold">
              Branch Name
            </label>
            <Input
              type="text"
              name="branch"
              value="master"
              disabled
              className="mt-1 bg-gray-800 text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <Button
            type="button"
            className="bg-red-900 text-white font-bold"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-blue-900 text-white font-bold"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
