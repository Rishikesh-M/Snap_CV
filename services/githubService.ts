
import { Project, PortfolioStats } from '../types.ts';

const GITHUB_API_BASE = 'https://api.github.com';

interface GithubProfile {
    login: string;
    name: string;
    avatar_url: string;
    bio: string;
    html_url: string;
    followers: number;
    public_repos: number;
    blog: string;
    location: string;
}

interface GithubRepo {
    name: string;
    description: string;
    html_url: string;
    language: string;
    stargazers_count: number;
    updated_at: string;
}

export const getGithubData = async (username: string) => {
    try {
        const [profileRes, reposRes] = await Promise.all([
            fetch(`${GITHUB_API_BASE}/users/${username}`),
            fetch(`${GITHUB_API_BASE}/users/${username}/repos?sort=updated&per_page=10`)
        ]);

        if (!profileRes.ok || !reposRes.ok) {
            throw new Error('Failed to fetch GitHub data');
        }

        const profile: GithubProfile = await profileRes.json();
        const repos: GithubRepo[] = await reposRes.json();

        return { profile, repos };
    } catch (error) {
        console.error("GitHub API Error:", error);
        return null;
    }
};

export const processGithubData = (data: { profile: GithubProfile, repos: GithubRepo[] }) => {
    const { profile, repos } = data;

    const stats: PortfolioStats = {
        repos: profile.public_repos,
        followers: profile.followers,
        projectsCount: repos.length
    };

    const projects: Project[] = repos
        .filter(repo => !repo.name.toLowerCase().includes(profile.login)) // Exclude profile repo
        .slice(0, 6)
        .map(repo => ({
            id: repo.name,
            name: repo.name,
            description: repo.description || 'No description provided.',
            type: repo.language || 'Code',
            url: repo.html_url
        }));

    return {
        fullName: profile.name || profile.login,
        role: profile.bio ? 'Developer' : 'Software Engineer', // Fallback
        bio: profile.bio || `Developer based in ${profile.location || 'the cloud'}.`,
        avatar: profile.avatar_url,
        stats,
        projects,
        githubProjects: projects.slice(0, 3) // Reuse for now
    };
};
