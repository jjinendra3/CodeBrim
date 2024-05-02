"use client";
import { useContext, useState } from "react";
import Context from "@/ContextAPI";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "react-toastify";
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
  async function handleSubmit(event: any) {
    event.preventDefault();
    if (pwdflag === false) {
      if (password === context.user.password) {
        context.seteditable(true);
      } else {
        toast.error("Wrong Password!");
      }
    } else {
      await context.lockuser(password);
    }
    setpwdmod(false);
  }
  return (
    <Context.Provider value={context}>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none ">
        <div className=" bg-[#101518] border-2 border-green-300 p-5  rounded-lg w-1/2 text-text-col text-white">
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
            <form onSubmit={handleSubmit}>
              <Input
                type="text"
                name="password"
                onChange={handleInputChange}
                className="w-full font-mono"
              />
              <div className="flex flex-row space-x-4 mx-auto my-4 justify-center">
                <Button
                  className="bg-red-900 text-white rounded-lg px-4 py-2 font-bold"
                  type="button"
                  onClick={() => {
                    setpwdmod(false);
                  }}
                >
                  Cancel
                </Button>
                <Button className="bg-blue-900 text-white rounded-lg px-4 py-2 font-bold">
                  Submit
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </Context.Provider>
  );
}
