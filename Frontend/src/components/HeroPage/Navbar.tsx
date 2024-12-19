import Link from "next/link";
import { Code, Github } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900 bg-opacity-90 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Code className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-bold text-white">CodeBrim</span>
          </Link>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="https://github.com/jjinendra3/codebrim"
                target="_blank"
                className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Docs
              </Link>
              <Link
                href="https://github.com/jjinendra3/codebrim"
                target="_blank"
                className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Open Source
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
