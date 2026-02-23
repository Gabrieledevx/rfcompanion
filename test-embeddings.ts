import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import * as dotenv from "dotenv";

dotenv.config();

async function testEmbeddings() {
    try {
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GOOGLE_API_KEY,
            model: "text-embedding-004",
        });

        const res = await embeddings.embedQuery("Hello world");
        console.log("Embedding dimensions:", res.length);
        console.log("Vector preview:", res.slice(0, 5));
    } catch (e) {
        console.error("Error generating embeddings:", e);
    }
}

testEmbeddings();
