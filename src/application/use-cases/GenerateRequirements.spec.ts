import { GenerateRequirements } from '../../application/use-cases/GenerateRequirements';
import { ProjectIdea } from '../../domain/entities/ProjectIdea';
import { ILLMService } from '../../domain/interfaces/ILLMService';
import { ProjectAnalysisResult } from '../../application/schemas/ProjectAnalysisSchema';

describe('GenerateRequirements Use Case', () => {
    let useCase: GenerateRequirements;
    let mockLlmService: jest.Mocked<ILLMService>;

    beforeEach(() => {
        mockLlmService = {
            generateResponse: jest.fn(),
            generateStructuredResponse: jest.fn(),
        };

        // We explicitly test with only the LLMService to avoid vector DB issues in simple unit tests
        useCase = new GenerateRequirements(mockLlmService);
    });

    it('should call llmService and return the structured analysis result', async () => {
        // Arrange
        const idea = new ProjectIdea('1', 'Test App', 'A test application description.');
        const expectedResult: ProjectAnalysisResult = {
            projectName: 'Test App',
            actors: [{ name: 'User', description: 'The main user' }],
            useCases: [
                {
                    title: 'Login',
                    description: 'User logs into the system',
                    actors: ['User'],
                    preconditions: ['User must be registered'],
                    postconditions: ['User is authenticated'],
                    mainFlow: ['User enters credentials', 'System validates', 'User logged in']
                }
            ]
        };

        mockLlmService.generateStructuredResponse.mockResolvedValue(expectedResult);

        // Act
        const result = await useCase.execute(idea);

        // Assert
        expect(mockLlmService.generateStructuredResponse).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedResult);
    });
});
