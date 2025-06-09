"use client";
import { useEffect } from "react";
import { redirect, usePathname, useRouter } from "next/navigation";
import { useCodeStore } from "@/lib/codeStore";
export default function Page() {
  redirect("/maintenance");
  const { getCode, setFiles, setUser, user, canLock } = useCodeStore();
  const pathName = usePathname();
  const router = useRouter();
  useEffect(() => {
    const fetchData = async () => {
      const response = await getCode(pathName.split("/")[2]);
      if (response.success === 1) {
        setUser(response.user);
        setFiles(response.user.items);
        router.push(
          `/code/${pathName.split("/")[2]}/${response.user.items[0].id}`,
        );
      } else {
        router.push("/not-found");
      }
    };
    fetchData();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <div></div>;
}
