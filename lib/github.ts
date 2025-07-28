import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import User from "./models/user";

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  private: boolean;
  created_at: string;
  updated_at: string;
  topics: string[];
}

export async function getGitHubAccessToken(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;

    const user = await User.findById(session.user.id).select('+githubAccessToken');
    return user?.githubAccessToken || null;
  } catch (error) {
    console.error('Error getting GitHub access token:', error);
    return null;
  }
}

export async function fetchUserRepositories(): Promise<GitHubRepo[]> {
  try {
    const token = await getGitHubAccessToken();
    if (!token) {
      throw new Error('No GitHub access token available');
    }

    const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const repos: GitHubRepo[] = await response.json();
    return repos;
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error);
    throw error;
  }
}

export async function fetchRepositoryDetails(repoName: string): Promise<GitHubRepo> {
  try {
    const token = await getGitHubAccessToken();
    if (!token) {
      throw new Error('No GitHub access token available');
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.githubUsername) {
      throw new Error('GitHub username not found');
    }

    const response = await fetch(`https://api.github.com/repos/${session.user.githubUsername}/${repoName}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const repo: GitHubRepo = await response.json();
    return repo;
  } catch (error) {
    console.error('Error fetching repository details:', error);
    throw error;
  }
} 