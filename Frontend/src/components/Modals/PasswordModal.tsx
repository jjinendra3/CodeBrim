"use client";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCodeStore } from "@/lib/codeStore";
import { Lock, LockKeyholeOpen } from "lucide-react";

export default function PasswordDialog() {
  const { userPrivacy, user, setUser, canLock } = useCodeStore();
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState<string>("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (user.password && user.password === password) {
      if (canLock) {
        await userPrivacy(undefined);
      }
      setUser({
        ...user,
        password: undefined,
      });
    } else {
      await userPrivacy(password);
    }
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="text-white hover:bg-gray-700">
          {!user?.password ? (
            <Lock className="h-4 w-4" />
          ) : (
            <LockKeyholeOpen className="h-4 w-4" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#101518] border-green-300 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-center">
            {user?.password
              ? canLock
                ? "Lock Project"
                : "Enter Password to Unlock"
              : "Lock Project"}
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
            <Button type="button" className="bg-red-900 text-white font-bold">
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
