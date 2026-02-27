import { ProjectIdea } from '../entities/ProjectIdea';
import { ProjectAnalysisResult } from '../../application/schemas/ProjectAnalysisSchema';

export interface IProjectRepository {
    saveProjectAnalysis(idea: ProjectIdea, result: ProjectAnalysisResult): Promise<void>;
}
