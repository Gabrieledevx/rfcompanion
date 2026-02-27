import dotenv from 'dotenv';

dotenv.config();

export const config = {
    openaiApiKey: process.env.OPENAI_API_KEY,
    googleApiKey: process.env.GOOGLE_API_KEY,
    postgresUrl: process.env.POSTGRES_URL,
    elkUrl: process.env.ELK_URL || 'http://localhost:9200',
    redisHost: process.env.REDIS_HOST || 'localhost',
    redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
};

if (!config.openaiApiKey) {
    console.warn("WARNING: OPENAI_API_KEY is not set in .env file.");
}
