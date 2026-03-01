
import { GoogleGenAI, Type } from "@google/genai";
import { UserPortfolio } from "./types.ts";
import { getGithubData, processGithubData } from "./services/githubService.ts";

const getApiKey = () => {
  // Check Vite environment variables first
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env.VITE_GEMINI_API_KEY) return import.meta.env.VITE_GEMINI_API_KEY;
    if (import.meta.env.VITE_API_KEY) return import.meta.env.VITE_API_KEY;
  }
  // Fallback to process.env for other environments
  try {
    return process.env.VITE_GEMINI_API_KEY || process.env.API_KEY || "";
  } catch (e) {
    return "";
  }
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const generatePortfolioFromLinks = async (links: { github: string; linkedin: string; otherLink: string; context?: string }): Promise<UserPortfolio> => {
  // 1. Try to fetch real GitHub data
  let githubData = null;
  let githubContext = "";

  if (!getApiKey()) {
    console.error("API Key is missing. Please check .env.local");
    throw new Error("API Key Missing");
  }

  try {
    const githubUsername = links.github.split('github.com/')[1]?.split('/')[0];
    if (githubUsername) {
      const rawData = await getGithubData(githubUsername);
      if (rawData) {
        githubData = processGithubData(rawData);
        githubContext = `
        REAL DATA FETCHED FROM GITHUB API:
        Name: ${githubData.fullName}
        Bio: ${githubData.bio}
        Avatar URL: ${githubData.avatar}
        Public Repos: ${githubData.stats.repos}
        Followers: ${githubData.stats.followers}
        Top Projects: ${JSON.stringify(githubData.projects.map(p => ({ name: p.name, description: p.description, language: p.type })))}
        `;
      }
    }
  } catch (e) {
    console.warn("GitHub fetch failed, falling back to AI inference", e);
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Parse these professional profile links and the provided context (resume/bio) to generate a high-quality, structured portfolio JSON.
    
    IMPORTANT: I have already fetched some real data from GitHub. USE THIS DATA AS THE GROUND TRUTH. Do not hallucinate different values for these fields if the real data is provided.
    ${githubContext}

    User Provided Links:
    GitHub: ${links.github}
    LinkedIn: ${links.linkedin}
    Other Link (Portfolio/Blog/Project): ${links.otherLink}
    
    User Provided Context (Resume/Bio/Details): ${links.context || "No additional context provided."}
    
    Return the data structured for a "PortfolioX" profile.
    - If real GitHub data is present, use it for stats, projects, avatar, and bio. 
    - Infer "skills" and "learningProgress" from the project languages and descriptions.
    - If the "Other Link" is provided, try to extract relevant project details or portfolio context from it if possible (or assume it's a key project).
    - If real data is MISSING, infer reasonable placeholders.
    - Calculate a 'score' (0-100) and a 'grade' (S, A, B, C, D) based on the impressiveness of the profile (repos, followers, project complexity). Start high (70+) for any valid developer profile.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          fullName: { type: Type.STRING },
          role: { type: Type.STRING },
          bio: { type: Type.STRING },
          avatar: { type: Type.STRING },
          domain: { type: Type.STRING },
          stats: {
            type: Type.OBJECT,
            properties: {
              repos: { type: Type.NUMBER },
              followers: { type: Type.NUMBER },
              projectsCount: { type: Type.NUMBER }
            }
          },
          score: { type: Type.NUMBER },
          grade: { type: Type.STRING },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          projects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                type: { type: Type.STRING }
              }
            }
          },
          githubProjects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                type: { type: Type.STRING }
              }
            }
          },
          learningProgress: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                percentage: { type: Type.NUMBER }
              }
            }
          }
        }
      }
    }
  });

  let responseText = "";
  // Check if text is a function (older SDKs or specific response types)
  if (typeof (response as any).text === 'function') {
    try {
      responseText = (response as any).text();
    } catch (e) {
      console.error("Error retrieving text from response function", e);
      responseText = "";
    }
  }
  // Check if text is a property (newer SDKs)
  else if (response.text) {
    responseText = response.text as string;
  } else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
    responseText = response.candidates[0].content.parts[0].text;
  }
  else {
    // Fallback inspect structure
    console.log("Unexpected response structure:", response);
  }

  console.log("Gemini Raw Response:", responseText);

  if (!responseText) {
    throw new Error("No response text from Gemini");
  }

  const portfolio = JSON.parse(responseText || "{}");

  // Merge AI inference with real data to ensure key fields are accurate
  if (githubData) {
    portfolio.stats = {
      ...portfolio.stats,
      repos: githubData.stats.repos,
      followers: githubData.stats.followers
    };

    // Use real github repositories for the githubProjects section
    portfolio.githubProjects = githubData.projects.slice(0, 3).map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      type: p.type
    }));

    if (!portfolio.avatar) portfolio.avatar = githubData.avatar;
    if (githubData.bio && !links.context) portfolio.bio = githubData.bio;
    if (!portfolio.fullName) portfolio.fullName = githubData.fullName;
  }

  // Fill defaults if missing
  if (!portfolio.score) portfolio.score = 75;
  if (!portfolio.grade) portfolio.grade = 'B';

  return {
    ...portfolio,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString()
  };
};
