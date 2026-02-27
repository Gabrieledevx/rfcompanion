import { IVectorStore } from "../../domain/interfaces/IVectorStore";
import { Document } from "@langchain/core/documents";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { config } from "../config/env";
import { PoolConfig } from "pg";
import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import * as crypto from "crypto";

@Injectable()
export class PGVectorStoreWrapper implements IVectorStore, OnModuleDestroy {
    private store: PGVectorStore | null = null;
    private readonly logger = new Logger(PGVectorStoreWrapper.name);

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

    async onModuleDestroy() {
        if (this.store) {
            try {
                // Cierra las conexiones a la base de datos de manera segura
                await this.store.end();
                this.logger.log('Conexión a base de datos vectorial PostgreSQL cerrada correctamente.');
            } catch (error: any) {
                this.logger.error('Error al cerrar la conexión a PostgreSQL:', error.stack);
            }
        }
    }

    async addDocuments(documents: Document[]): Promise<void> {
        try {
            const store = await this.getStore();

            // Generar un ID único por cada documento
            const ids = documents.map(() => crypto.randomUUID());

            await store.addDocuments(documents, { ids });
            this.logger.log(`Se han procesado y guardado ${documents.length} documentos en la memoria vectorial.`);
        } catch (error: any) {
            this.logger.error(`Error guardando documentos en memoria vectorial:`, error.stack);
            throw new Error("Error interno al interactuar con el VectorStore");
        }
    }

    async similaritySearch(query: string, k: number = 4, filter?: Record<string, any>): Promise<Document[]> {
        try {
            const store = await this.getStore();
            // Pasamos el parámetro de filtro a LangChain
            return await store.similaritySearch(query, k, filter);
        } catch (error: any) {
            this.logger.error(`Error buscando vectores para la consulta: "${query}"`, error.stack);
            throw new Error("Error interno al interactuar con el VectorStore");
        }
    }
}
