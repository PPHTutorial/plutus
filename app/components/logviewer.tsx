'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useContent } from '../hooks/context'
import { FaSpinner } from 'react-icons/fa'


export default function LogViewer() {
  const { logData, isFlashing } = useContent()
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)
  const [dots, setDots] = useState<string>("")
  const logContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logData])
  return (
    <div className="flex flex-col max-h-80 min-h-60 border border-neutral-300 w-full">
      <div ref={logContainerRef}
        className="bg-black text-sm overflow-y-auto font-mono text-green-800 p-2">
        {!logData.length && !isFlashing && <p className="justify-center items-center text-center m-auto text-green-800">Ready to flash!</p>}
        {!logData.length && isFlashing && <div>
          <FaSpinner className="animate-spin text-green-800 mx-auto size-4" />
          <p className="justify-center items-center text-center m-auto text-green-800">Initializing...</p>
        </div>}
        {logData.map((log, index) => (
          typeof log === 'string' 
            ? <p key={index} className="whitespace-pre-wrap">{log}</p>
            : <div key={index} className="whitespace-nowrap break-all">{log}</div>
        ))}

      </div>
    </div>
  )
}