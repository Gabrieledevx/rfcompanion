import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { ILLMService } from "../../domain/interfaces/ILLMService";
import { config } from "../config/env";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { ZodType } from "zod";
import { Injectable, Logger } from "@nestjs/common";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class GoogleGeminiService implements ILLMService {
    private readonly logger = new Logger(GoogleGeminiService.name);
    private model: ChatGoogleGenerativeAI;

    constructor() {
        this.model = new ChatGoogleGenerativeAI({
            apiKey: config.googleApiKey,
            model: "gemini-3-flash-preview",
            maxRetries: 3,
        });
    }

    async generateResponse(prompt: string): Promise<string> {
        this.logger.debug(`[LLM] 🤖 Preparando llamada a Gemini (Texto libre)...`);
        this.logger.debug(`[LLM] 📄 Longitud del prompt: ${prompt.length} caracteres.`);
        this.logger.debug(`[LLM] ⏳ Pausando por 5 segundos para respetar los límites de la API gratuita...`);
        await delay(5000);

        this.logger.debug(`[LLM] 🚀 Enviando petición...`);
        const response = await this.model.invoke(prompt);
        this.logger.log(`[LLM] ✅ ¡Respuesta recibida!`);

        return typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
    }

    async generateStructuredResponse<T>(prompt: string, schema: ZodType<T>, onProgress?: (progress: number) => Promise<void>): Promise<T> {
        const parser = StructuredOutputParser.fromZodSchema(schema as any);
        const formatInstructions = parser.getFormatInstructions();

        const fullPrompt = `${prompt}\n\n${formatInstructions}`;

        this.logger.debug(`[LLM] 🤖 Preparando llamada a Gemini (Estructurada/JSON)...`);
        this.logger.debug(`[LLM] 📄 Longitud total del prompt + formato: ${fullPrompt.length} caracteres.`);

        let currentProgress = 40;
        let progressInterval: NodeJS.Timeout | null = null;

        if (onProgress) {
            // Simulamos el "pensamiento" de la IA asintóticamente (se frena al acercarse a 84%)
            // Así nunca se estanca de golpe, siempre parece que avanza un "0.5%" u "1%" internamente.
            progressInterval = setInterval(async () => {
                const remaining = 84 - currentProgress;
                if (remaining > 0) {
                    // Avanzamos el 5% de la distancia restante cada segundo (mínimo 1%)
                    const step = Math.max(1, Math.floor(remaining * 0.05));
                    currentProgress += step;
                    await onProgress(currentProgress);
                }
            }, 1500); // 1 tick cada 1.5 segundos
        }

        this.logger.debug(`[LLM] ⏳ Pausando por 10 segundos para respetar los límites de tokens por minuto de la API gratuita...`);
        await delay(10000);

        this.logger.debug(`[LLM] 🚀 Enviando petición a gemini-2.5-flash...`);
        try {
            const response = await this.model.invoke(fullPrompt);

            // Pausar o limpiar el tracking falso una vez que la IA termine
            if (progressInterval) clearInterval(progressInterval);

            this.logger.log(`[LLM] ✅ ¡Respuesta estructurada recibida con éxito!`);

            let content = '';
            if (typeof response.content === 'string') {
                content = response.content;
            } else if (Array.isArray(response.content)) {
                content = response.content.map((c: any) => c.text || '').join('');
            } else {
                content = JSON.stringify(response.content);
            }

            return (await parser.parse(content)) as T;
        } catch (error: any) {
            if (progressInterval) clearInterval(progressInterval);
            this.logger.error(`[LLM] ❌ Error estructurando la respuesta del LLM: ${error.message}`, error.stack);
            throw error;
        }
    }
}
