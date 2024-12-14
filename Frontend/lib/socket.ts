'use client';
import { useEffect, useState } from "react";
import io from 'socket.io-client'

export function useSocket() {
  const [socket, setSocket] = useState<any>(null)

  useEffect(() => {
    const socketIo = io('http://127.0.0.1:5000')

    setSocket(socketIo)

    function cleanup() {
      socketIo.disconnect()
    }
    return cleanup;
  }, [])

  return socket
}
