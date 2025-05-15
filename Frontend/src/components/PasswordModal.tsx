"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCodeStore } from "@/lib/codeStore";

export default function PasswordDialog({
  open,
  setOpen,
  pwdflag,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  pwdflag: boolean;
}) {
  const { lockUser, user, setEditable } = useCodeStore();
  const [password, setPassword] = useState<string>("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pwdflag) {
      if (password === user.password) {
        setEditable(true);
      } else {
        toast.error("Wrong Password!");
      }
    } else {
      await lockUser(password);
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-[#101518] border-green-300 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-center">
            Enter Password to Edit!
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4 mt-4">
          <label htmlFor="password" className="text-sm font-bold">
            Password
          </label>
          <Input
            type="text"
            name="password"
            onChange={handleInputChange}
            className="font-mono"
          />
          <div className="flex justify-center space-x-4 mt-2">
            <Button
              type="button"
              className="bg-red-900 text-white font-bold"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-900 text-white font-bold">
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
