"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";

export function useSocket() {
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const socketIo = io(process.env.NEXT_PUBLIC_BACKEND);

    setSocket(socketIo);

    function cleanup() {
      socketIo.disconnect();
    }
    return cleanup;
  }, []);

  return socket;
}
