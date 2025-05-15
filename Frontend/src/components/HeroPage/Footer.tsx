import { Github, Twitter, Linkedin, Mail } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">
              &copy; 2025 CodeBrim. All rights reserved.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="https://github.com/jjinendra3"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500 transition-colors"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link
              href="https://twitter.com/jjinendra3"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500 transition-colors"
            >
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link
              href="https://linkedin.com/in/jjinendra3"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500 transition-colors"
            >
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Link>
            <Link
              href="https://mail.google.com/mail/?view=cm&fs=1&to=jjinendra3@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500 transition-colors"
            >
              <Mail className="h-5 w-5" />
              <span className="sr-only">Mail</span>
            </Link>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-sm">
              Developed by{" "}
              <Link
                href={"https://jinendrajain.xyz"}
                className="font-semibold text-blue-500"
              >
                Jinendra Jain
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
