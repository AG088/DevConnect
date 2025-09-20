import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

interface MessageData {
  recipientId: string
  content: string
  messageType: 'text' | 'code' | 'file' | 'image'
}

interface TypingData {
  recipientId: string
  isTyping: boolean
}

interface UseSocketReturn {
  socket: Socket | null
  isConnected: boolean
  sendMessage: (data: MessageData) => void
  sendTyping: (data: TypingData) => void
  markAsRead: (conversationId: string) => void
  setStatus: (status: 'online' | 'away' | 'offline') => void
}

export function useSocket(): UseSocketReturn {
  const { data: session } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  // Initialize socket connection
  useEffect(() => {
    if (!session?.user?.id) return

    const initSocket = async () => {
      try {
        // Initialize socket connection
        const socket = io(process.env.NEXTAUTH_URL || 'http://localhost:3000', {
          transports: ['websocket', 'polling'],
          auth: {
            token: session.user.id, // Pass user ID for authentication
          },
        })

        socketRef.current = socket

        // Connection events
        socket.on('connect', () => {
          console.log('Socket.IO connected')
          setIsConnected(true)
        })

        socket.on('disconnect', () => {
          console.log('Socket.IO disconnected')
          setIsConnected(false)
        })

        socket.on('connect_error', (error) => {
          console.error('Socket.IO connection error:', error)
          setIsConnected(false)
        })

        // Message events
        socket.on('new_message', (data) => {
          console.log('New message received via Socket.IO:', data)
          // You can add a callback here to handle new messages
          // For example, update the messages state in your component
        })

        socket.on('message_sent', (data) => {
          console.log('Message sent via Socket.IO:', data)
          // Handle message sent confirmation
        })

        socket.on('user_typing', (data) => {
          console.log('User typing via Socket.IO:', data)
          // Handle typing indicator
        })

        socket.on('message_read', (data) => {
          console.log('Message read via Socket.IO:', data)
          // Handle read receipt
        })

        socket.on('user_status_change', (data) => {
          console.log('User status changed via Socket.IO:', data)
          // Handle user status change
        })

        socket.on('error', (error) => {
          console.error('Socket.IO error:', error)
        })

      } catch (error) {
        console.error('Error initializing Socket.IO:', error)
      }
    }

    initSocket()

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [session?.user?.id])

  // Send message
  const sendMessage = useCallback((data: MessageData) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send_message', data)
    } else {
      console.warn('Socket.IO not connected')
    }
  }, [isConnected])

  // Send typing indicator
  const sendTyping = useCallback((data: TypingData) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing', data)
    }
  }, [isConnected])

  // Mark conversation as read
  const markAsRead = useCallback((conversationId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('mark_read', { conversationId })
    }
  }, [isConnected])

  // Set user status
  const setStatus = useCallback((status: 'online' | 'away' | 'offline') => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('set_status', { status })
    }
  }, [isConnected])

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage,
    sendTyping,
    markAsRead,
    setStatus,
  }
} 