import { z } from "zod";

export const ActorSchema = z.object({
    name: z.string().describe("Name of the actor or stakeholder"),
    description: z.string().describe("Role and responsibilities of the actor"),
});

export const UseCaseSchema = z.object({
    title: z.string().describe("Title of the use case"),
    description: z.string().describe("Brief description of the use case"),
    actors: z.array(z.string()).describe("List of actor names involved"),
    preconditions: z.array(z.string()).describe("Conditions that must be true before the use case"),
    postconditions: z.array(z.string()).describe("Conditions that must be true after the use case"),
    mainFlow: z.array(z.string()).describe("Steps of the main success scenario"),
    alternativeFlows: z.array(z.string()).describe("Alternative valid paths the user could take"),
    exceptionFlows: z.array(z.string()).describe("What happens when things go wrong (errors, missing permissions, etc)"),
    acceptanceCriteria: z.array(z.string()).describe("Testable criteria, ideally using Given/When/Then format")
});

export const DataModelSchema = z.object({
    entityName: z.string().describe("Name of the database entity/table"),
    properties: z.array(z.string()).describe("Specific fields, e.g., 'id (uuid)', 'userId (string)'")
});

export const ApiEndpointSchema = z.object({
    method: z.string().describe("HTTP Method (GET, POST, etc.)"),
    path: z.string().describe("Endpoint URL path (e.g., /api/v1/incidents)"),
    description: z.string().describe("What this endpoint does")
});

export const ProjectAnalysisSchema = z.object({
    projectName: z.string().describe("Suggested name for the project"),
    actors: z.array(ActorSchema).describe("List of identified actors and stakeholders"),
    useCases: z.array(UseCaseSchema).describe("List of identified use cases"),
    businessRules: z.array(z.string()).describe("Strict rules the software must obey backend and frontend"),
    dataModels: z.array(DataModelSchema).describe("Core database entities and their properties"),
    thirdPartyIntegrations: z.array(z.string()).describe("External services to use (AWS S3, Twilio, Stripe, etc.)"),
    apiEndpoints: z.array(ApiEndpointSchema).describe("Crucial API endpoints based on the use cases"),
    nonFunctionalRequirements: z.array(z.string()).describe("List of non-functional requirements (e.g. performance, security, scalability)"),
    accessibilityAndErgonomics: z.array(z.string()).describe("UX, Dark mode, VoiceOver/TalkBack guidelines, big touch areas for stress etc."),
    architectureRecommendations: z.array(z.string()).describe("List of architectural recommendations (e.g. Microservices, WebSockets, DBs) based on context"),
    releasePhases: z.array(z.string()).describe("Phased development approach (e.g. Phase 1 MVP, Phase 2, etc)"),
    observability: z.array(z.string()).describe("Telemetry, crash reporting (e.g. Sentry, Datadog), and performance tracking"),
    dataLifecycle: z.array(z.string()).describe("Data retention policies, archival, and automatic deletion rules (esp. for large media)"),
    internationalization: z.array(z.string()).describe("i18n/l10n requirements, languages, timezone handling, and regional legal adaptations"),
    testingStrategy: z.array(z.string()).describe("QA methodology (Unit, Integration, E2E, UAT) with target coverages and frameworks"),
    securityAndVulnerabilityManagement: z.array(z.string()).describe("OWASP guidelines, SAST/DAST/SCA tooling in CI/CD, pentesting, and encryption rules"),
});

export type ProjectAnalysisResult = z.infer<typeof ProjectAnalysisSchema>;
