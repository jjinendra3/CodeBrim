'use client';
import { useContext, useState } from 'react';
import Context from '@/ContextAPI';
export default function Home() {
    const context=useContext(Context);
  const [serverStatus, setServerStatus] = useState('Sleeping 😴');

  const wakeServer = async () => {
    setServerStatus('Waking up... 🚀');
   await context.wakeServer();
    setServerStatus('Awake! 🌞');
  };

  return (
    <Context.Provider value={context}>
        <h1 className='text-2xl font-bold mb-4 text-white ml-8 mt-8'>CodeBrim - Compiler on the Go!</h1>
    <div className="flex flex-col items-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-white mt-28">Server Status: {serverStatus}</h1>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={wakeServer}
        >
        Click here to wake up the server
      </button>
      
      <h1 className="text-xl font-bold mb-4 text-white mt-28">This will take nearly a minute to process! </h1>
    </div>
          </Context.Provider>
  );
}
