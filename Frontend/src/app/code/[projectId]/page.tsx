"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCodeStore } from "@/lib/codeStore";
export default function Page() {
  const { getCode, setFiles } = useCodeStore();
  const pathName = usePathname();
  const router = useRouter();
  useEffect(() => {
    const fetchData = async () => {
      const response = await getCode(pathName.split("/")[2]);
      if (response.success === 1) {
        setFiles(response.user.items);
        router.push(
          `/code/${pathName.split("/")[2]}/${response.user.items[0].id}`,
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
