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
        const expectedResult = {
            projectName: 'Test App',
            actors: [{ name: 'User', description: 'The main user' }],
            useCases: [
                {
                    title: 'Login',
                    description: 'User logs into the system',
                    actors: ['User'],
                    preconditions: ['User must be registered'],
                    postconditions: ['User is authenticated'],
                    mainFlow: ['User enters credentials', 'System validates', 'User logged in'],
                    alternativeFlows: ['User uses SSO'],
                    exceptionFlows: ['Invalid credentials'],
                    acceptanceCriteria: ['Given valid creds, When login, Then success']
                }
            ],
            estimations: [
                {
                    sprintNumber: 1,
                    sprintGoal: 'Setup core boilerplate and auth',
                    estimatedSprintStartDate: '2026-03-01',
                    estimatedSprintEndDate: '2026-03-15',
                    modules: [
                        {
                            moduleName: 'Authentication',
                            tasks: ['Setup DB', 'Create Login Use Case', 'Add UI Routes'],
                            estimatedStoryPoints: 5,
                            estimatedHours: 20
                        }
                    ]
                }
            ]
        };

        mockLlmService.generateStructuredResponse.mockResolvedValue(expectedResult as unknown as ProjectAnalysisResult);

        // Act
        const result = await useCase.execute(idea);

        // Assert
        expect(mockLlmService.generateStructuredResponse).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedResult);
    });
});
