import { Document } from "@langchain/core/documents";

export interface IVectorStore {
    addDocuments(documents: Document[]): Promise<void>;
    similaritySearch(query: string, k?: number, filter?: Record<string, any>): Promise<Document[]>;
}
