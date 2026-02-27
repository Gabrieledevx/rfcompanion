export class ProjectIdea {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly description: string,
        public readonly targetStartDate?: Date,
        public readonly createdAt: Date = new Date()
    ) { }
}
