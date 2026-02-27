export interface ILLMService {
    generateResponse(prompt: string): Promise<string>;
    generateStructuredResponse<T>(prompt: string, schema: any, onProgress?: (progress: number) => Promise<void>): Promise<T>;
}
