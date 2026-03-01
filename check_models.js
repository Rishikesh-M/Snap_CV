import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';

async function listModels() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        let apiKey = '';

        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf-8');
            const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/) || envContent.match(/VITE_API_KEY=(.*)/);
            if (match) {
                apiKey = match[1].trim();
            }
        }

        if (!apiKey) {
            console.error("Could not find API Key in .env.local");
            return;
        }

        const ai = new GoogleGenAI({ apiKey });
        console.log("Fetching models...");

        try {
            const models = await ai.models.list();
            // The newer SDK returns an async iterable or has a `models` property
            if (models && typeof models[Symbol.asyncIterator] === 'function') {
                for await (const model of models) {
                    if (model.name.includes('gemini')) {
                        console.log(`- ${model.name.replace('models/', '')}`);
                    }
                }
            } else if (Array.isArray(models)) {
                models.forEach(m => console.log(`- ${m.name}`));
            } else if (models.models) {
                models.models.forEach(m => console.log(`- ${m.name}`));
            } else {
                console.log("Could not iterate models", models);
            }

        } catch (apiError) {
            console.error("API Error listing models:", apiError.message);
        }

    } catch (error) {
        console.error("Script failed:", error);
    }
}

listModels();
