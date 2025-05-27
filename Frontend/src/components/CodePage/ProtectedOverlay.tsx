import { Lock } from "lucide-react";
import PasswordDialog from "../Modals/PasswordModal";

export default function ProtectedOverlay() {
  return (
    <>
      <div className="absolute inset-0 backdrop-blur-md bg-blue-600/20 border border-white/30 z-40 max-h-screen" />
      <div className="absolute inset-0 flex items-center justify-center z-50 max-h-screen">
        <div className="text-center text-white p-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Lock className="h-8 w-8" />
            <h2 className="text-3xl font-bold">Locked Project</h2>
          </div>
          <p className="text-lg mb-6 max-w-md">
            The project is currently locked. Please enter the password to access
            it.
          </p>
          <PasswordDialog />
        </div>
      </div>
    </>
  );
}
