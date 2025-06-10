import Link from "next/link";
import { Terminal, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 text-green-500 flex items-center justify-center">
      <div className="max-w-2xl w-full p-8 bg-gray-800 rounded-lg shadow-xl">
        <div className="flex items-center mb-6">
          <Terminal className="w-6 h-6 mr-2" />
          <h1 className="text-2xl font-mono">Error 404: Page Not Found</h1>
        </div>
        <div className="font-mono mb-8">
          <p className="mb-4">{'$ grep -R "requested_page" /var/www/html'}</p>
          <p className="mb-4">grep: /var/www/html: No such file or directory</p>
          <p className="flex items-center">
            <span className="mr-2">$</span>
            <span className="animate-pulse">|</span>
          </p>
        </div>
        <p className="mb-6 text-gray-400">
          {
            "Oops! It seems the code for this page has gone missing. Don't worry, even the best developers encounter 404 errors sometimes."
          }{" "}
        </p>
        <div className="flex space-x-4">
          <Link
            href="/"
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
