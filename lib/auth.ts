import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongoose";
import User from "@/lib/models/user";

export const authOptions: NextAuthOptions = {
  debug: true, // Enable debug mode to see more detailed logs
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // GitHub OAuth Provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: { 
        params: { 
          scope: 'read:user user:email repo' 
        } 
      },
    }),
    // Credentials Provider (Email + Password)
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }
        await connectDB();
        const user = await User.findOne({ email: credentials.email }).select('+password');
        if (!user || !user?.password) {
          throw new Error('Invalid credentials');
        }
        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isCorrectPassword) {
          throw new Error('Invalid credentials');
        }
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
        };
      }
    })
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  callbacks: {
    // Save Google and GitHub users to MongoDB
    async signIn({ user, account, profile }) {
      console.log('SignIn callback triggered:', { provider: account?.provider, user: user?.email });
      await connectDB();
      if (account?.provider === "google") {
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          const newUser = await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            title: "Developer",
          });
          user.id = newUser._id.toString();
        } else {
          user.id = existingUser._id.toString();
        }
      } else if (account?.provider === "github") {
        try {
          console.log('Processing GitHub user...');
          // Save GitHub info and encrypted token
          const githubId = (profile as any)?.id?.toString() || account.providerAccountId;
          const githubUsername = (profile as any)?.login;
          const githubAvatarUrl = (profile as any)?.avatar_url;
          const githubAccessToken = account.access_token;
          
          // Handle missing email from GitHub - create a fallback email
          const userEmail = user.email || `${githubUsername}@github.user`;
          
          console.log('Looking for existing user with email:', userEmail);
          let dbUser = await User.findOne({ email: userEmail });
          
          if (!dbUser) {
            console.log('Creating new GitHub user...');
            dbUser = await User.create({
              name: user.name || githubUsername,
              email: userEmail,
              image: user.image,
              title: "Developer",
              githubId,
              githubUsername,
              githubAvatarUrl,
              githubAccessToken,
            });
            console.log('New user created:', dbUser._id);
          } else {
            console.log('Updating existing user...');
            dbUser.githubId = githubId;
            dbUser.githubUsername = githubUsername;
            dbUser.githubAvatarUrl = githubAvatarUrl;
            dbUser.githubAccessToken = githubAccessToken;
            await dbUser.save();
            console.log('User updated:', dbUser._id);
          }
          user.id = dbUser._id.toString();
          console.log('GitHub signIn completed successfully');
        } catch (error) {
          console.error('Error in GitHub signIn callback:', error);
          throw error;
        }
      } else if (account?.provider === "credentials") {
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          user.id = dbUser._id.toString();
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token.id) {
        session.user.id = token.id as string;
        
        // Fetch user from database to get GitHub fields
        try {
          const dbUser = await User.findById(token.id);
          if (dbUser) {
            session.user.githubId = dbUser.githubId;
            session.user.githubUsername = dbUser.githubUsername;
            session.user.githubAvatarUrl = dbUser.githubAvatarUrl;
          }
        } catch (error) {
          console.error('Error fetching user for session:', error);
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 