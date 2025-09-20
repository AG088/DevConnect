# 🚀 DevConnect - Developer Social Network

A modern, full-stack social networking platform designed specifically for developers to connect, collaborate, and share their projects.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [System Blueprint](#system-blueprint)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🎯 Overview

DevConnect is a comprehensive social networking platform that enables developers to:

- **Connect** with other developers through a follow system
- **Share** projects, code snippets, and technical insights
- **Message** each other in real-time conversations
- **Discover** new opportunities and collaborations
- **Build** their professional network in the tech community

## ✨ Features

### 🔐 Authentication & User Management
- **NextAuth.js** integration with multiple providers
- **Secure session management**
- **User profiles** with GitHub integration
- **Profile customization** with avatars and bio

### 👥 Social Networking
- **Follow System** with pending/accepted/rejected states
- **Network Discovery** to find and connect with developers
- **User Profiles** with project showcases
- **Activity Feeds** showing posts and interactions

### 💬 Real-time Messaging
- **Private Conversations** between connected users
- **Message History** with read receipts
- **Unread Counts** and conversation management
- **Start New Chats** with users you follow

### 📝 Content Sharing
- **Project Showcases** with code snippets
- **Post Creation** with rich text and code blocks
- **Like System** for posts and projects
- **Feed Algorithm** for content discovery

### 🛠️ Developer Tools
- **Code Editor** integration
- **GitHub Repository** import
- **Project Management** tools
- **Collaboration Features**

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern component library
- **Lucide React** - Beautiful icons
- **Sonner** - Toast notifications

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **NextAuth.js** - Authentication framework
- **Socket.io** - Real-time communication

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking
- **Git** - Version control

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer     │    │   Database      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ • Pages         │    │ • Authentication│    │ • Users         │
│ • Components    │    │ • Messaging     │    │ • Messages      │
│ • Hooks         │    │ • Follow System │    │ • Conversations │
│ • State Mgmt    │    │ • Posts/Projects│    │ • Follows       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- GitHub account (for OAuth)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/AG088/DevConnect.git
cd DevConnect
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env.local` file:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/devconnect

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# GitHub OAuth
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register    - User registration
POST /api/auth/login       - User login
GET  /api/auth/session     - Get current session
```

### User Management
```
GET    /api/users          - Get all users
GET    /api/users/[id]     - Get user by ID
PUT    /api/users/[id]     - Update user profile
DELETE /api/users/[id]     - Delete user
```

### Follow System
```
POST   /api/follow         - Send follow request
GET    /api/follow         - Get follow relationships
PATCH  /api/follow/[id]    - Accept/reject follow request
GET    /api/follow/status  - Check follow status
```

### Messaging System
```
GET    /api/messages                    - Get user conversations
POST   /api/messages                    - Send message
GET    /api/messages/[conversationId]   - Get conversation messages
PATCH  /api/messages/[conversationId]   - Mark as read
```

### Posts & Projects
```
GET    /api/posts           - Get all posts
POST   /api/posts           - Create new post
GET    /api/posts/[id]      - Get post by ID
POST   /api/posts/[id]/like - Like/unlike post

GET    /api/projects        - Get all projects
POST   /api/projects        - Create new project
GET    /api/projects/[id]   - Get project by ID
PUT    /api/projects/[id]   - Update project
DELETE /api/projects/[id]   - Delete project
```

## 🗄️ Database Schema

### User Model
```typescript
interface IUser {
  name: string;
  email: string;
  password: string;
  image?: string;
  githubUsername?: string;
  title?: string;
  bio?: string;
  skills: string[];
  location?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Follow Model
```typescript
interface IFollow {
  follower: ObjectId;     // User who wants to follow
  following: ObjectId;    // User being followed
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}
```

### Conversation Model
```typescript
interface IConversation {
  participants: ObjectId[];           // Array of 2 user IDs
  lastMessage?: ObjectId;             // Reference to latest message
  lastMessageContent?: string;        // Preview of last message
  lastMessageTime?: Date;             // When last message was sent
  unreadCount: { [userId: string]: number }; // Unread count per user
  createdAt: Date;
  updatedAt: Date;
}
```

### Message Model
```typescript
interface IMessage {
  sender: ObjectId;                   // Who sent the message
  recipient: ObjectId;                // Who receives the message
  content: string;                    // Message text
  messageType: 'text' | 'code' | 'file' | 'image';
  read: boolean;                      // Read status
  readAt?: Date;                      // When it was read
  createdAt: Date;
  updatedAt: Date;
}
```

### Post Model
```typescript
interface IPost {
  author: ObjectId;                   // User who created the post
  content: string;                    // Post content
  images?: string[];                  // Attached images
  tags: string[];                     // Post tags
  likes: ObjectId[];                  // Users who liked the post
  comments: ObjectId[];               // Comments on the post
  createdAt: Date;
  updatedAt: Date;
}
```

### Project Model
```typescript
interface IProject {
  title: string;                      // Project title
  description: string;                // Project description
  author: ObjectId;                   // Project creator
  technologies: string[];             // Tech stack used
  githubUrl?: string;                 // GitHub repository
  liveUrl?: string;                   // Live demo URL
  images: string[];                   // Project screenshots
  likes: ObjectId[];                  // Users who liked the project
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔄 System Blueprint

### 1. User Registration & Authentication Flow
```
User Registration
    ↓
NextAuth.js handles OAuth (GitHub)
    ↓
User data stored in MongoDB
    ↓
Session created and managed
    ↓
Redirect to dashboard
```

### 2. Follow System Flow
```
User A wants to follow User B
    ↓
POST /api/follow with targetUserId
    ↓
Check if follow relationship exists
    ↓
Create follow request with 'pending' status
    ↓
User B receives notification
    ↓
User B can accept/reject request
    ↓
Status updated to 'accepted' or 'rejected'
    ↓
Users can now message each other (if accepted)
```

### 3. Messaging System Flow
```
User visits /messages page
    ↓
Fetch existing conversations
    ↓
Fetch users they follow
    ↓
Display conversations + "Start Chat" options
    ↓
User clicks "Start Chat" or existing conversation
    ↓
POST /api/messages to send message
    ↓
Create conversation (if doesn't exist)
    ↓
Create message and update conversation metadata
    ↓
Update UI with new message/conversation
```

### 4. Content Sharing Flow
```
User creates post/project
    ↓
POST /api/posts or /api/projects
    ↓
Validate user authentication
    ↓
Save to database with author reference
    ↓
Update user's feed
    ↓
Notify followers (if implemented)
    ↓
Display in feed with like/comment options
```

### 5. Real-time Features (Future)
```
WebSocket connection established
    ↓
User sends message
    ↓
Message saved to database
    ↓
WebSocket event emitted to recipient
    ↓
Recipient's UI updates in real-time
    ↓
Unread count updates
    ↓
Notification shown (if not on messages page)
```

## 🚀 Deployment

### Vercel Deployment (Recommended)
1. **Connect your GitHub repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on push to main branch**

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables for Production
```env
MONGODB_URI=your-production-mongodb-uri
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret
GITHUB_ID=your-production-github-id
GITHUB_SECRET=your-production-github-secret
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
```bash
git checkout -b feature/amazing-feature
```
3. **Commit your changes**
```bash
git commit -m 'Add some amazing feature'
```
4. **Push to the branch**
```bash
git push origin feature/amazing-feature
```
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **Vercel** for hosting and deployment
- **MongoDB** for the database solution
- **shadcn/ui** for the beautiful components
- **All contributors** who help make this project better

## 📞 Support

If you have any questions or need help:

- **Create an issue** on GitHub
- **Join our community** discussions
- **Check the documentation** for common solutions

---

**Made with ❤️ by the DevConnect team**

*Connect. Collaborate. Code.*
