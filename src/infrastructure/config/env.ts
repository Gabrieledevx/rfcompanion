import dotenv from 'dotenv';

dotenv.config();

export const config = {
    openaiApiKey: process.env.OPENAI_API_KEY,
    googleApiKey: process.env.GOOGLE_API_KEY,
    postgresUrl: process.env.POSTGRES_URL,
};

if (!config.openaiApiKey) {
    console.warn("WARNING: OPENAI_API_KEY is not set in .env file.");
}
