import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { ILLMService } from "../../domain/interfaces/ILLMService";
import { config } from "../config/env";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { ZodType } from "zod";
import { Injectable } from "@nestjs/common";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class GoogleGeminiService implements ILLMService {
    private model: ChatGoogleGenerativeAI;

    constructor() {
        this.model = new ChatGoogleGenerativeAI({
            apiKey: config.googleApiKey,
            model: "gemini-2.5-flash",
            maxRetries: 3,
        });
    }

    async generateResponse(prompt: string): Promise<string> {
        console.log(`\n[LLM] 🤖 Preparando llamada a Gemini (Texto libre)...`);
        console.log(`[LLM] 📄 Longitud del prompt: ${prompt.length} caracteres.`);
        console.log(`[LLM] ⏳ Pausando por 5 segundos para respetar los límites de la API gratuita...`);
        await delay(5000);

        console.log(`[LLM] 🚀 Enviando petición...`);
        const response = await this.model.invoke(prompt);
        console.log(`[LLM] ✅ ¡Respuesta recibida!\n`);

        return typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
    }

    async generateStructuredResponse<T>(prompt: string, schema: ZodType<T>): Promise<T> {
        const parser = StructuredOutputParser.fromZodSchema(schema as any);
        const formatInstructions = parser.getFormatInstructions();

        const fullPrompt = `${prompt}\n\n${formatInstructions}`;

        console.log(`\n[LLM] 🤖 Preparando llamada a Gemini (Estructurada/JSON)...`);
        console.log(`[LLM] 📄 Longitud total del prompt + formato: ${fullPrompt.length} caracteres.`);
        console.log(`[LLM] ⏳ Pausando por 10 segundos para respetar los límites de tokens por minuto de la API gratuita...`);
        await delay(10000);

        console.log(`[LLM] 🚀 Enviando petición a gemini-2.5-flash...`);
        const response = await this.model.invoke(fullPrompt);
        console.log(`[LLM] ✅ ¡Respuesta estructurada recibida con éxito!\n`);

        const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
        return (await parser.parse(content)) as T;
    }
}
