import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    githubId?: string;
    githubUsername?: string;
    githubAvatarUrl?: string;
    githubAccessToken?: string; // Only available server-side
  }

  interface Session {
    user: {
      githubId?: string;
      githubUsername?: string;
      githubAvatarUrl?: string;
      // githubAccessToken intentionally omitted from session for security
    } & DefaultSession["user"];
  }
} 