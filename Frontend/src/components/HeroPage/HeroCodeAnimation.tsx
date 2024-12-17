'use client'

import { useState, useEffect } from 'react'

const sampleCode = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`

export default function CodeEditor() {
  const [text, setText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < sampleCode.length) {
      const timeout = setTimeout(() => {
        setText(prevText => prevText + sampleCode[currentIndex])
        setCurrentIndex(prevIndex => prevIndex + 1)
      }, 50)

      return () => clearTimeout(timeout)
    }
  }, [currentIndex])

  return (
    <div className="rounded-lg bg-gray-800 p-4 shadow-lg overflow-hidden">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex space-x-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-sm text-gray-400">script.js</div>
      </div>
      <pre className="language-javascript overflow-x-auto">
        <code className="text-sm sm:text-base text-green-400">{text}</code>
      </pre>
    </div>
  )
}

