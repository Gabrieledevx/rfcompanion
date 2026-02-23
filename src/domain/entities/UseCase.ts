import { Actor } from "./Actor";

export class UseCase {
    constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly description: string,
        public readonly actors: Actor[],
        public readonly preconditions: string[],
        public readonly postconditions: string[],
        public readonly mainFow: string[]
    ) { }
}
