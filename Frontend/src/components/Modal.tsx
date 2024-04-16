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
      name: event.target.value,
    });
  };
  const resetInputs = () => {
    setgitcontrols({
      repolink: "",
      commitmsg: "commit",
      branch: "main",
    });
  };
  gitcontrols;
  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none ">
        <div className="relative  my-6 mx-auto max-w-3xl bg-blue-500 p-5  rounded-lg w-1/3 text-text-col ">
          <div className="text-2xl font-extrabold text-center mb-4">
            Git Controls
          </div>
          <div className="flex flex-col ">
            <div className="mb-4 font-bold text-center">
              Please make the repository public before hitting Submit.
            </div>
            <label htmlFor="role" className="text-xs mb-1 font-bold align-left">
              Repository Link
            </label>
            <input
              type="text"
              name="repolink"
              onChange={handleInputChange}
              className="w-full px-2 py-2 mb-2 border border-bg2-col rounded focus:outline-none bg-bg1-col"
            />
            <label htmlFor="role" className="text-xs mb-1 font-bold align-left">
              Commit Message
            </label>
            <input
              type="text"
              name="commitmsg"
              onChange={handleInputChange}
              className="w-full px-2 py-2 mb-2 border border-bg2-col rounded focus:outline-none bg-bg1-col"
            />{" "}
            <label htmlFor="role" className="text-xs mb-1 font-bold align-left">
              Branch Name
            </label>
            <input
              type="text"
              placeholder="main"
              name="branch"
              onChange={handleInputChange}
              className="w-full px-2 py-2 mb-2 border border-bg2-col rounded focus:outline-none bg-bg1-col"
            />
            <div className="flex flex-row space-x-4 mx-auto my-4">
              <button
                className="bg-red-900 text-white rounded-lg px-4 py-2 font-bold"
                onClick={() => {
                  resetInputs();
                  setmod(false);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-blue-900 text-white rounded-lg px-4 py-2 font-bold"
                onClick={() => {
                  resetInputs();
                  context.gitpush(
                    gitcontrols.repolink,
                    gitcontrols.commitmsg,
                    gitcontrols.branch,
                  );
                  setmod(false);
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
}
