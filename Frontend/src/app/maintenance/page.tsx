import { Wrench } from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-700 to-blue-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-blue-100 rounded-lg shadow-xl p-8 text-center">
        <Wrench
          className="w-16 h-16 text-blue-500 mx-auto mb-4"
          aria-label="Maintenance icon"
        />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {"We're Under Maintenance"}
        </h1>
        <div className="flex flex-col mb-6">
          <p className="text-gray-600">
            Our online code compiler is currently undergoing scheduled
            maintenance to improve your coding experience.
          </p>
          <p className="text-gray-600">{"We'll be back soon!"}</p>
        </div>
      </div>
    </div>
  );
}
