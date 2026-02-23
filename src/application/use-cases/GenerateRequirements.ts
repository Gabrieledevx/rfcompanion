import { ProjectIdea } from "../../domain/entities/ProjectIdea";
import { ILLMService } from "../../domain/interfaces/ILLMService";
import { IVectorStore } from "../../domain/interfaces/IVectorStore";
import { ProjectAnalysisSchema, ProjectAnalysisResult } from "../schemas/ProjectAnalysisSchema";
import { Document } from "@langchain/core/documents";

export class GenerateRequirements {
    constructor(
        private llmService: ILLMService,
        private vectorStore?: IVectorStore
    ) { }

    async execute(idea: ProjectIdea): Promise<ProjectAnalysisResult> {
        let context = "";

        if (this.vectorStore) {
            try {
                console.log("Searching for similar projects in vector store...");
                const similarDocs = await this.vectorStore.similaritySearch(idea.description, 3);
                if (similarDocs.length > 0) {
                    context = "\n### Related Context (from previous projects):\n";
                    similarDocs.forEach((doc, i) => {
                        context += `[${i + 1}] ${doc.pageContent}\n`;
                    });
                }
            } catch (error) {
                console.warn("Could not retrieve context from vector store:", error);
            }
        }

        const prompt = `
      You are an expert Business Analyst, Software Architect, and UX Researcher.
      Analyze the following project idea. 
      Pay SPECIAL ATTENTION to the "Related Context" provided, which contains highly scalable architecture patterns (like Event-Driven, CRDTs, Offline-First, CQRS) that you MUST incorporate if relevant.
      
      Project Name: ${idea.name}
      Description: ${idea.description}
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
      
      Return the combined result in a structured JSON format strictly matching the schema provided.
    `;

        try {
            const result = await this.llmService.generateStructuredResponse<ProjectAnalysisResult>(prompt, ProjectAnalysisSchema);

            if (this.vectorStore) {
                try {
                    const newDoc = new Document({
                        pageContent: `Project Name: ${idea.name}\nDescription: ${idea.description}\nRequirements:\n${JSON.stringify(result, null, 2)}`,
                        metadata: { source: "user_input", projectName: idea.name }
                    });
                    console.log("[RAG] 💾 Guardando el nuevo proyecto en la base de datos vectorial para futuro contexto...");
                    await this.vectorStore.addDocuments([newDoc]);
                    console.log("[RAG] ✅ ¡Proyecto guardado exitosamente en la memoria!");
                } catch (e) {
                    console.warn("[RAG] ⚠️ Error guardando en la memoria vectorial:", e);
                }
            }

            return result;
        } catch (error) {
            console.error("Error generating requirements:", error);
            throw error;
        }
    }
}
