import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ILLMService } from "../../domain/interfaces/ILLMService";
import { config } from "../config/env";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { ZodType } from "zod";

export class OpenAIService implements ILLMService {
    private model: ChatOpenAI;

    constructor() {
        this.model = new ChatOpenAI({
            openAIApiKey: config.openaiApiKey,
            modelName: "gpt-4-turbo-preview", // Or gpt-3.5-turbo
            temperature: 0,
        });
    }

    async generateResponse(prompt: string): Promise<string> {
        const response = await this.model.invoke([
            new HumanMessage(prompt),
        ]);
        return typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
    }

    async generateStructuredResponse<T>(prompt: string, schema: ZodType<T>): Promise<T> {
        const parser = StructuredOutputParser.fromZodSchema(schema as any);
        const formatInstructions = parser.getFormatInstructions();

        const fullPrompt = `${prompt}\n\n${formatInstructions}`;

        const response = await this.model.invoke([
            new HumanMessage(fullPrompt),
        ]);

        const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
        return (await parser.parse(content)) as T;
    }
}
