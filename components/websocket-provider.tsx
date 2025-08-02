'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useUser } from '@supabase/auth-helpers-react'
import { io, Socket } from 'socket.io-client'

interface WebSocketContextType {
  socket: Socket | null
  isConnected: boolean
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
})

export const useWebSocket = () => useContext(WebSocketContext)

interface WebSocketProviderProps {
  children: React.ReactNode
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const user = useUser()

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    // Initialize socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001', {
      auth: {
        userId: user.id,
      },
    })

    newSocket.on('connect', () => {
      console.log('WebSocket connected')
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
    })

    newSocket.on('cv-processing-update', (data) => {
      console.log('CV processing update:', data)
      // You can dispatch custom events or use a state management solution
      window.dispatchEvent(new CustomEvent('cv-update', { detail: data }))
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [user])

  return (
    <WebSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  )
}
