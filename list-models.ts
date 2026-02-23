import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

async function list() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    // There isn't a direct get/list models in this SDK version maybe? Wait.
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}`);
        const data = await response.json();
        const embeddingModels = data.models.filter((m: any) => m.name.includes("embed"));
        console.log(embeddingModels.map((m: any) => m.name));
    } catch (e) {
        console.error(e);
    }
}
list();
