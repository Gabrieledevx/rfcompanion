import { PGVectorStoreWrapper } from "./infrastructure/db/PGVectorStore";
import { Document } from "@langchain/core/documents";
import * as dotenv from "dotenv";

dotenv.config();

async function seed() {
    const vectorStore = new PGVectorStoreWrapper();

    const examples = [
        new Document({
            pageContent: "Project Name: Global Fintech Payment Gateway\nDescription: An event-driven microservices architecture using NestJS and Apache Kafka to process thousands of transactions per second. Includes CQRS pattern for read/write separation, optimistic UI for instantaneous balance updates, real-time WebSocket notifications for transaction statuses, and strict distributed tracing constraints (OpenTelemetry) to guarantee 99.99% uptime.",
            metadata: { source: "seed", projectType: "Fintech", architecture: "Event-Driven Microservices" }
        }),
        new Document({
            pageContent: "Project Name: Real-time Collaborative Remote Workspace\nDescription: A highly scalable remote document editing platform mimicking Google Docs. Frontend built with React and Yjs for Conflict-free Replicated Data Types (CRDTs). Backend utilizes a Node.js WebSocket cluster orchestrated by Redis Pub/Sub, backing up data asynchronously to a scalable NoSQL database (MongoDB/DynamoDB) to ensure zero data loss and ultra-low latency collaboration.",
            metadata: { source: "seed", projectType: "SaaS", architecture: "Real-time WebSocket & CRDT" }
        }),
        new Document({
            pageContent: "Project Name: AI-Powered On-Demand Delivery Cloud\nDescription: A serverless cloud-native delivery routing system. Uses geo-spatial databases (PostGIS) for real-time driver tracking. Heavy compute tasks (like AI route optimization) are offloaded to background worker queues (BullMQ/RabbitMQ). The mobile frontend features offline-first capabilities using Service Workers and local caching, syncing with the cloud seamlessly once connectivity is restored.",
            metadata: { source: "seed", projectType: "Logistics", architecture: "Serverless & Offline-First" }
        }),
        new Document({
            pageContent: "Project Name: High-Traffic E-Commerce Analytics Engine\nDescription: A high-throughput data ingestion pipeline handling millions of clickstream events. Implements API Gateway pattern, rate limiting, and JWT-based RBAC authentication at the edge. Employs a columnar data warehouse (e.g., ClickHouse or BigQuery) for sub-second analytical queries, providing the administration panel with a butter-smooth, real-time dashboard experience.",
            metadata: { source: "seed", projectType: "Analytics", architecture: "Data Pipeline & High-Throughput" }
        })
    ];

    console.log("Seeding example projects into vector store...");
    await vectorStore.addDocuments(examples);
    console.log("Seeding complete!");
    process.exit(0);
}

seed().catch(console.error);
