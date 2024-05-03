import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function Modal({
  setmod,
  gitcontrols,
  setgitcontrols,
  context,
}: {
  setmod: any;
  gitcontrols: any;
  setgitcontrols: any;
  context: any;
}) {
  const handleInputChange = (event: any) => {
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
  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none ">
        <div className="relative my-6 mx-auto sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl bg-[#101518] p-5 rounded-lg text-text-col border-2 border-green-300 text-white">
          <div className="text-2xl font-extrabold text-center mb-4">
            Push to Repository
          </div>
          <div className="flex flex-col ">
            <div className="mb-4 font-bold text-center">
              Please make the repository public before hitting Submit.
            </div>
            <label
              htmlFor="repolink"
              className="text-xs mb-1 font-bold align-left"
            >
              Repository Link
            </label>
            <Input
              type="text"
              name="repolink"
              id="repolink"
              onChange={handleInputChange}
              className="w-full px-2 py-2 mb-2 border rounded focus:outline-none"
            />
            <label
              htmlFor="repolink"
              className="text-xs mb-1 font-bold align-left"
            >
              {" Personal Access Token (Classic) (Provide access to repo)"}
            </label>
            <Input
              type="password"
              name="pan"
              id="pan"
              onChange={handleInputChange}
              className="w-full px-2 py-2 mb-2 border rounded focus:outline-none"
            />
            <label
              htmlFor="commitmsg"
              className="text-xs mb-1 font-bold align-left"
            >
              Commit Message
            </label>
            <Input
              type="text"
              name="commitmsg"
              onChange={handleInputChange}
              className="w-full px-2 py-2 mb-2 border rounded focus:outline-none"
            />
            <label
              htmlFor="branch"
              className="text-xs mb-1 font-bold align-left"
            >
              Branch Name
            </label>
            <Input
              type="text"
              disabled
              value={"master"}
              name="branch"
              onChange={handleInputChange}
              className="w-full px-2 py-2 mb-2 border rounded focus:outline-none"
            />
            <div className="flex flex-row space-x-4 mx-auto my-4">
              <Button
                className="bg-red-900 text-white rounded-lg px-4 py-2 font-bold"
                onClick={() => {
                  resetInputs();
                  setmod(false);
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-900 text-white rounded-lg px-4 py-2 font-bold"
                onClick={() => {
                  resetInputs();
                  context.gitpush(
                    gitcontrols.repolink,
                    gitcontrols.commitmsg,
                    gitcontrols.branch,
                    gitcontrols.pan,
                  );
                  setmod(false);
                }}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
}
