import { IVectorStore } from "../../domain/interfaces/IVectorStore";
import { Document } from "@langchain/core/documents";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { config } from "../config/env";
import { PoolConfig } from "pg";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PGVectorStoreWrapper implements IVectorStore {
    private store: PGVectorStore | null = null;

    constructor() { }

    private async getStore(): Promise<PGVectorStore> {
        if (this.store) return this.store;

        const pgConfig: PoolConfig = {
            connectionString: config.postgresUrl,
        };

        // Using Google embeddings since we switched to Gemini
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: config.googleApiKey,
            model: "gemini-embedding-001",
        });

        this.store = await PGVectorStore.initialize(embeddings, {
            postgresConnectionOptions: pgConfig,
            tableName: "project_requirements_v2",
            columns: {
                idColumnName: "id",
                vectorColumnName: "embedding",
                contentColumnName: "content",
                metadataColumnName: "metadata",
            },
        });

        return this.store;
    }

    async addDocuments(documents: Document[]): Promise<void> {
        const store = await this.getStore();
        await store.addDocuments(documents);
    }

    async similaritySearch(query: string, k: number = 4): Promise<Document[]> {
        const store = await this.getStore();
        return await store.similaritySearch(query, k);
    }
}
