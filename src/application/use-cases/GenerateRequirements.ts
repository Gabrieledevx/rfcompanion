import { ProjectIdea } from "../../domain/entities/ProjectIdea";
import { ILLMService } from "../../domain/interfaces/ILLMService";
import { IVectorStore } from "../../domain/interfaces/IVectorStore";
import { IProjectRepository } from "../../domain/interfaces/IProjectRepository";
import { ProjectAnalysisSchema, ProjectAnalysisResult } from "../schemas/ProjectAnalysisSchema";
import { Document } from "@langchain/core/documents";
import { Logger } from "@nestjs/common";

export class GenerateRequirements {
    private readonly logger = new Logger(GenerateRequirements.name);

    constructor(
        private llmService: ILLMService,
        private vectorStore?: IVectorStore,
        private projectRepository?: IProjectRepository
    ) { }

    async execute(idea: ProjectIdea, traceId?: string, onProgress?: (progress: number) => Promise<void>): Promise<ProjectAnalysisResult> {
        let context = "";

        if (onProgress) await onProgress(10); // 10% Iniciando

        this.logger.log({
            message: `Starting requirements generation for idea: ${idea.name}`,
            traceId,
            ideaId: idea.id
        });

        if (this.vectorStore) {
            try {
                if (onProgress) await onProgress(20); // 20% Buscando historial

                this.logger.debug({ message: "Searching for similar projects in vector store...", traceId });
                const similarDocs = await this.vectorStore.similaritySearch(idea.description, 3);
                if (similarDocs.length > 0) {
                    context = "\n### Related Context (from previous projects):\n";
                    similarDocs.forEach((doc, i) => {
                        context += `[${i + 1}] ${doc.pageContent}\n`;
                    });
                }
            } catch (error: any) {
                this.logger.warn({
                    message: "Could not retrieve context from vector store",
                    traceId,
                    error: error.message
                });
            }
        }

        const prompt = `
      You are an expert Business Analyst, Software Architect, and UX Researcher.
      Analyze the following project idea. 
      Pay SPECIAL ATTENTION to the "Related Context" provided, which contains highly scalable architecture patterns (like Event-Driven, CRDTs, Offline-First, CQRS) that you MUST incorporate if relevant.
      
      Project Name: ${idea.name}
      Description: ${idea.description}
      Target Start Date: ${idea.targetStartDate ? idea.targetStartDate.toISOString().split('T')[0] : 'Assume standard execution starts immediately (Today)'}
      ${context}
      
      Identify and generate the following exhaustive Software Requirements:
      1. Key Actors and Stakeholders.
      2. Core Use Cases. For each Use Case:
         - Main Flow (the happy path).
         - Alternative Flows (valid, but secondary paths).
         - Exception Flows (when things go wrong, missing permissions, network errors, etc).
         - Acceptance Criteria (using Given/When/Then format).
      3. Business Rules: Strict product/legal/technical limits (e.g., max upload sizes, conditions, mandatory disclaimers).
      4. Data Models (Entities): List core database entities (e.g. User, Incident) and their properties (e.g. id, userId, timestamp).
      5. Third Party Integrations: Necessary external APIs (AWS S3, Stripe, Twilio, SendGrid, etc).
      6. API Endpoints: Fundamental REST/GraphQL endpoints required to support the Use Cases.
      7. Non-Functional Requirements (Scalability, Security, Performance).
      8. Accessibility & Ergonomics: Specific UX guidelines for distress/stressful situations, voiceover, dark mode, large touch areas.
      9. High-Level Architecture Recommendations drawing inspiration from the Related Context.
      10. Release Phases (MVP): Break down the project into logical release phases (e.g. Phase 1 MVP, Phase 2, etc.) to minimize risk.
      11. Observability: Define telemetry, crash reporting (e.g. Sentry), and performance tracking strategies without compromising privacy.
      12. Data Lifecycle: Define data retention policies, archival, and automatic deletion rules (e.g. purging video files after 30 days).
      13. Internationalization (i18n): Strategies for multi-language support and regional legal adaptations (e.g. state-specific laws).
      14. Testing Strategy: Outline robust QA strategies including Unit, Integration, E2E (e.g. Detox/Appium), and UAT, prioritizing offline state testing.
      15. Security & Vulnerability Management: Strict adherence to OWASP Mobile Top 10, DevSecOps pipelines with SAST/DAST/SCA tools, and Pentesting schedules.
      16. Estimations: Provide a strict Agile Scrum-based estimation. Break down the entire development lifecycle into Sprints. For each Sprint define the sequence number, Goal, and Modules. CRITICAL: Calculate and define the 'estimatedSprintStartDate' and 'estimatedSprintEndDate' based on consecutive 2-week agile sprint cycles starting precisely from the requested Target Start Date. For each Module list the high-level tasks to execute, the required Story Points, and the total Estimated Hours. Ensure consistency between all listed modules and the Use Cases defined in step 2.
      
      Return the combined result in a structured JSON format strictly matching the schema provided.
    `;

        try {
            if (onProgress) await onProgress(40); // 40% Evaluando arquitectura LLM

            this.logger.log({ message: `Generating structured response via LLM`, traceId });
            const result = await this.llmService.generateStructuredResponse<ProjectAnalysisResult>(prompt, ProjectAnalysisSchema, onProgress);

            if (onProgress) await onProgress(85); // 85% Respuesta obtenida de LLM

            if (this.vectorStore) {
                try {
                    const newDoc = new Document({
                        pageContent: `Project Name: ${idea.name}\nDescription: ${idea.description}\nRequirements:\n${JSON.stringify(result, null, 2)}`,
                        metadata: { source: "user_input", projectName: idea.name }
                    });

                    this.logger.debug({ message: `Guardando el nuevo proyecto en la base de datos vectorial para futuro contexto...`, traceId });
                    await this.vectorStore.addDocuments([newDoc]);
                    this.logger.log({ message: `¡Proyecto guardado exitosamente en la memoria vectorial!`, traceId });

                } catch (e: any) {
                    this.logger.warn({ message: `Error guardando en la memoria vectorial`, traceId, error: e.message });
                }
            }

            // [NUEVO] Guardar la respuesta JSON cruda y persistente en la tabla operativa de PostgreSQL 
            if (this.projectRepository) {
                try {
                    this.logger.debug({ message: `Guardando resultado JSON crudo en repositorio transaccional...`, traceId });
                    await this.projectRepository.saveProjectAnalysis(idea, result);
                } catch (e: any) {
                    this.logger.warn({ message: `Error guardando en el repositorio estructurado (JSONB)`, traceId, error: e.message });
                }
            }

            if (onProgress) await onProgress(100); // 100% Tarea completa

            this.logger.log({ message: `Requirements generated successfully`, traceId });
            return result;
        } catch (error: any) {
            this.logger.error({
                message: `Error during requirements generation`,
                traceId,
                error: error.message,
                stack: error.stack
            });
            throw error; // Let the GlobalExceptionFilter catch it
        }
    }
}
