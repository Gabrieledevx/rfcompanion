export class FunctionalRequirement {
    constructor(
        public readonly id: string,
        public readonly description: string,
        public readonly priority: 'LOW' | 'MEDIUM' | 'HIGH'
    ) { }
}
