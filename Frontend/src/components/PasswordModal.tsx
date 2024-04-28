"use client";
import { useContext, useState } from "react";
import Context from "@/ContextAPI";
export default function Modal({
  setpwdmod,
  pwdflag,
}: {
  setpwdmod: any;
  pwdflag: boolean;
}) {
  const context = useContext(Context);
  const [password, setpassword] = useState<string>("");
  const handleInputChange = (event: any) => {
    setpassword(event.target.value);
  };
  return (
    <Context.Provider value={context}>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none ">
        <div className=" bg-blue-500 p-5  rounded-lg w-1/3 text-text-col ">
          <div className="text-2xl font-extrabold text-center mb-4">
            Enter Password to Edit!
          </div>
          <div className="flex flex-col ">
            <label
              htmlFor="role"
              className="text-sm mb-1 font-bold align-left mt-4"
            >
              Password
            </label>
            <input
              type="text"
              name="password"
              onChange={handleInputChange}
              className="flex-grow px-2 py-2 rounded focus:outline-none bg-bg1-col"
              style={{ minWidth: "50px", width: "auto" }}
            />
            <div className="flex flex-row space-x-4 mx-auto my-4">
              <button
                className="bg-red-900 text-white rounded-lg px-4 py-2 font-bold"
                onClick={() => {
                  setpwdmod(false);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-blue-900 text-white rounded-lg px-4 py-2 font-bold"
                onClick={async () => {
                  if (pwdflag === false) {
                    if (password === context.user.password) {
                      context.seteditable(true);
                    } else {
                      alert("Wrong Password!");
                    }
                  } else {
                    await context.lockuser(password);
                  }
                  setpwdmod(false);
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </Context.Provider>
  );
}
