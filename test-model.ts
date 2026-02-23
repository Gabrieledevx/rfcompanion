import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import * as dotenv from "dotenv";

dotenv.config();

async function test() {
    const model = new ChatGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_API_KEY,
        model: "gemini-2.5-pro",
    });

    try {
        console.log("Testing with string...");
        await model.invoke("Hello, simple string.");
        console.log("String invoke works");
    } catch (e) {
        console.error("String invoke failed:", e.message);
    }

    try {
        console.log("\nTesting with raw object type 'human'...");
        await model.invoke([{ type: "human", content: "Hello, plain object type human." }] as any);
        console.log("Object type 'human' works");
    } catch (e) {
        console.error("Object type 'human' failed:", e.message);
    }

    try {
        console.log("\nTesting with role 'user'...");
        await model.invoke([{ role: "user", content: "Hello, plain object role user." }] as any);
        console.log("Role 'user' works");
    } catch (e) {
        console.error("Role 'user' failed:", e.message);
    }
}

test();
