"use client";
import { useContext, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Context from "@/ContextAPI";
export default function Page() {
  const context = useContext(Context);
  const pathName = usePathname();
  const router = useRouter();
  useEffect(() => {
    const fetchData = async () => {
      const response = await context.code_getter(pathName.split("/")[2]);
      if (response.success === 1) {
        context.setFiles(response.user.files);
        router.push(
          `/code/${pathName.split("/")[2]}/${response.user.files[0].id}`,
        );
      } else {
        router.push("/not-found");
      }
    };
    fetchData();
    //eslint-disable-next-line
  }, []);
  return <div></div>;
}
