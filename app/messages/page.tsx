'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, User } from 'lucide-react';
import { toast } from 'sonner';

interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    image?: string;
    githubUsername?: string;
  }>;
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  lastMessageTime?: string;
  unreadCount: { [key: string]: number };
}

interface Message {
  _id: string;
  content: string;
  messageType: string;
  createdAt: string;
  sender: {
    _id: string;
    name: string;
    image?: string;
    githubUsername?: string;
  };
  read: boolean;
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [followingUsers, setFollowingUsers] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    
    if (status === 'authenticated') {
      fetchConversations();
      fetchFollowingUsers();
    }
  }, [status, router]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      } else {
        toast.error('Failed to load conversations');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    }
  };

  const fetchFollowingUsers = async () => {
    try {
      const response = await fetch('/api/follow?type=following');
      if (response.ok) {
        const data = await response.json();
        setFollowingUsers(data.follows || []);
      } else {
        console.error('Failed to load following users');
      }
    } catch (error) {
      console.error('Error fetching following users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      } else {
        toast.error('Failed to load messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const otherParticipant = selectedConversation.participants.find(
        p => p._id !== session?.user?.id
      );

      if (!otherParticipant) {
        toast.error('Invalid conversation');
        return;
      }

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: otherParticipant._id,
          content: newMessage.trim(),
        }),
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages(selectedConversation._id);
        fetchConversations(); // Refresh conversations to update last message
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation._id);
  };

  const startNewConversation = async (user: any) => {
    try {
      setSending(true);
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: user.following._id,
          content: 'Hello! 👋',
        }),
      });

      if (response.ok) {
        // Refresh conversations and select the new one
        await fetchConversations();
        toast.success('Conversation started!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to start conversation');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation');
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p._id !== session?.user?.id);
  };

  const getUnreadCount = (conversation: Conversation) => {
    return conversation.unreadCount[session?.user?.id || ''] || 0;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Messages</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {conversations.length === 0 && followingUsers.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-sm">Start following users to begin messaging</p>
              </div>
            ) : (
              <div className="space-y-1">
                {/* Existing Conversations */}
                {conversations.map((conversation) => {
                  const otherParticipant = getOtherParticipant(conversation);
                  const unreadCount = getUnreadCount(conversation);
                  
                  return (
                    <div
                      key={conversation._id}
                      className={`p-4 cursor-pointer hover:bg-muted/50 border-b ${
                        selectedConversation?._id === conversation._id ? 'bg-muted' : ''
                      }`}
                      onClick={() => handleConversationSelect(conversation)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={otherParticipant?.image} />
                          <AvatarFallback>
                            {otherParticipant?.name?.charAt(0) || <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">
                              {otherParticipant?.name || otherParticipant?.githubUsername || 'Unknown User'}
                            </p>
                            {conversation.lastMessageTime && (
                              <span className="text-xs text-muted-foreground">
                                {formatTime(conversation.lastMessageTime)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage?.content || 'No messages yet'}
                            </p>
                            {unreadCount > 0 && (
                              <Badge variant="destructive" className="ml-2">
                                {unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Users you can message (if no existing conversation) */}
                {followingUsers
                  .filter(user => !conversations.some(conv => 
                    conv.participants.some(p => p._id === user.following._id)
                  ))
                  .map((user) => (
                    <div
                      key={user.following._id}
                      className="p-4 cursor-pointer hover:bg-muted/50 border-b"
                      onClick={() => startNewConversation(user)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.following.image} />
                          <AvatarFallback>
                            {user.following.name?.charAt(0) || <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">
                              {user.following.name || user.following.githubUsername || 'Unknown User'}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              Start Chat
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            Click to start a conversation
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Messages Area */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={getOtherParticipant(selectedConversation)?.image} />
                    <AvatarFallback>
                      {getOtherParticipant(selectedConversation)?.name?.charAt(0) || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {getOtherParticipant(selectedConversation)?.name || 
                       getOtherParticipant(selectedConversation)?.githubUsername || 
                       'Unknown User'}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No messages yet</p>
                      <p className="text-sm">Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${message.sender._id === session?.user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            message.sender._id === session?.user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender._id === session?.user?.id
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground'
                          }`}>
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      disabled={sending}
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={!newMessage.trim() || sending}
                      size="icon"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p>Choose a conversation from the list to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
