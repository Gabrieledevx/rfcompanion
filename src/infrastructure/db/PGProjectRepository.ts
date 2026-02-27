import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import { config } from '../config/env';
import { IProjectRepository } from '../../domain/interfaces/IProjectRepository';
import { ProjectIdea } from '../../domain/entities/ProjectIdea';
import { ProjectAnalysisResult } from '../../application/schemas/ProjectAnalysisSchema';

@Injectable()
export class PGProjectRepository implements IProjectRepository, OnModuleDestroy {
    private pool: Pool;
    private readonly logger = new Logger(PGProjectRepository.name);
    private isInitialized = false;

    constructor() {
        this.pool = new Pool({
            connectionString: config.postgresUrl,
        });
    }

    async onModuleDestroy() {
        if (this.pool) {
            await this.pool.end();
            this.logger.log('Conexión a base de datos PostgreSQL (SQL puro) cerrada correctamente.');
        }
    }

    private async initialize() {
        if (this.isInitialized) return;

        const query = `
            CREATE TABLE IF NOT EXISTS project_analyses (
                id UUID PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                target_start_date TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                analysis_result JSONB NOT NULL
            );
        `;
        try {
            await this.pool.query(query);
            this.isInitialized = true;
        } catch (error: any) {
            this.logger.error('Error al intentar crear tabla project_analyses en PG: ' + error.message, error.stack);
            throw error;
        }
    }

    async saveProjectAnalysis(idea: ProjectIdea, result: ProjectAnalysisResult): Promise<void> {
        await this.initialize();

        const query = `
            INSERT INTO project_analyses (id, name, description, target_start_date, created_at, analysis_result)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO UPDATE SET 
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                analysis_result = EXCLUDED.analysis_result
        `;

        try {
            await this.pool.query(query, [
                idea.id,
                idea.name,
                idea.description,
                idea.targetStartDate || null,
                idea.createdAt || new Date(),
                JSON.stringify(result)
            ]);
            this.logger.log(`✅ Resultado JSON guardado exitosamente en tabla relacional PG para idea: ${idea.id}`);
        } catch (error: any) {
            this.logger.error(`Error guardando JSON puro en la tabla project_analyses para la idea ${idea.id}: ` + error.message, error.stack);
            throw error;
        }
    }
}
