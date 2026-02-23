import { GoogleGeminiService } from "../../infrastructure/llm/GoogleGeminiService";
import { PGVectorStoreWrapper } from "../../infrastructure/db/PGVectorStore";
import { GenerateRequirements } from "../../application/use-cases/GenerateRequirements";
import { ProjectIdea } from "../../domain/entities/ProjectIdea";

async function main() {
    try {
        const llmService = new GoogleGeminiService();
        const vectorStore = new PGVectorStoreWrapper();
        const useCase = new GenerateRequirements(llmService, vectorStore);

        const ideaDescription = process.argv[2] || "A platform for connecting freelance graphic designers with small businesses.";
        const ideaName = process.argv[3] || "DesignConnect";

        console.log(`Analyzing Project: ${ideaName}`);
        console.log(`Description: ${ideaDescription}`);
        console.log("---------------------------------------------------");

        const projectIdea = new ProjectIdea("1", ideaName, ideaDescription);
        const result = await useCase.execute(projectIdea);

        console.log("Analysis Result:");
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error("An error occurred:", error);
    }
}

main();
