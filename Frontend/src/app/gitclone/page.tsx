"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, GitBranch, Terminal, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCodeStore } from "@/lib/codeStore";

const Home = () => {
  const gitClone = useCodeStore(state => state.gitClone);
  const [gitUrl, setGitUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGitUrl(e.target.value);
    if (error) setError("");
  };

  const handleSubmit = async (e?: any) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }

    if (!gitUrl.trim()) {
      setError("Please enter a repository URL");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await gitClone(gitUrl);
      const fileItem = response.items.find(
        (item: File) => item.type === "file",
      );
      const fileId = fileItem ? fileItem.id : undefined;
      if (!fileId) {
        router.push(`/code/${response.id}`);
      }
      router.push(`/code/${response.id}/${fileId}`);

      setError("");
    } catch (error) {
      console.error("Error cloning repository:", error);
      setError(
        "Failed to clone repository. Please check the URL and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <GitBranch className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Clone Repository
          </h1>
          <p className="text-slate-300 text-lg max-w-md mx-auto">
            Enter your Git repository URL to get started with code analysis and
            exploration
          </p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Repository URL
            </CardTitle>
            <CardDescription className="text-slate-400">
              Supports GitHub, GitLab, and other Git hosting services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center space-x-2 text-sm text-slate-400 mb-2">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span>terminal</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400 font-mono">$ git clone</span>
                  <Input
                    type="text"
                    value={gitUrl}
                    onChange={handleChange}
                    onKeyDown={e => e.key === "Enter" && handleSubmit(e as any)}
                    placeholder="https://github.com/username/repository.git"
                    className="bg-transparent border-none text-green-400 font-mono text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-green-400/50 flex-1"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <Alert className="bg-red-500/10 border-red-500/20 text-red-400">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleSubmit}
                disabled={isLoading || !gitUrl.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 text-lg transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Cloning Repository...
                  </>
                ) : (
                  <>
                    Clone Repository
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        <div className="text-center mt-8">
          <p className="text-slate-500 text-sm">
            Supports public repositories.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
