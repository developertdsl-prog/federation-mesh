# Federation-Mesh 🌐

> **High-Performance Distributed GraphQL Subgraph Router, Schema Composition Engine & Query Planner**

[![CI Pipeline](https://github.com/developertdsl-prog/federation-mesh/actions/workflows/ci.yml/badge.svg)](https://github.com/developertdsl-prog/federation-mesh/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](package.json)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](Dockerfile)
[![GraphQL Federation](https://img.shields.io/badge/GraphQL-Federation%20v2-e10098.svg)](https://graphql.org)

Federation-Mesh is an enterprise-grade GraphQL Federation Router and Gateway designed to coordinate decoupled microservices (subgraphs) into a unified, high-performance Supergraph API. It eliminates N+1 query patterns using automated entity batching, provides intelligent AST query decomposition into parallel/sequential execution DAGs, enforces strict field-level RBAC, and protects against algorithmic complexity denial-of-service attacks.

---

## 🏛️ Architecture Overview

Federation-Mesh sits between client applications and distributed microservices, parsing incoming GraphQL operations and decomposing them into minimal subgraph fetch plans.

```mermaid
graph TD
    Client["Client Applications (Web / Mobile / CLI)"]
    Gateway["Federation-Mesh Gateway Router (:4000)"]
    
    subgraph CoreEngine ["Federation Engine Core"]
        ComplexityGuard["Query Complexity & Depth Guard"]
        Parser["AST Parser & Query Cache"]
        Planner["Query Planner (DAG Generator)"]
        Executor["Parallel / Sequential Query Executor"]
        DataLoaderMgr["DataLoader Entity Batcher"]
    end

    subgraph SubgraphCluster ["Distributed Subgraphs"]
        UserSub["User Subgraph (:4001)<br/>@key(fields: 'id')"]
        ProductSub["Product Subgraph (:4002)<br/>@key(fields: 'id')"]
        OrderSub["Order Subgraph (:4003)<br/>@key(fields: 'id')"]
        InventorySub["Inventory Subgraph (:4004)<br/>@key(fields: 'id')"]
        ReviewSub["Review Subgraph (:4005)<br/>@key(fields: 'id')"]
    end

    Client -->|GraphQL Operation| Gateway
    Gateway --> ComplexityGuard
    ComplexityGuard --> Parser
    Parser --> Planner
    Planner --> Executor
    Executor --> DataLoaderMgr
    DataLoaderMgr -->|Fetch Users| UserSub
    DataLoaderMgr -->|Fetch Products| ProductSub
    DataLoaderMgr -->|Fetch Orders| OrderSub
    DataLoaderMgr -->|Fetch Stock| InventorySub
    DataLoaderMgr -->|Fetch Ratings| ReviewSub
```

---

## ⚡ Query Execution Plan (DAG Decomposition)

When a client queries federated types across multiple entities (e.g. `order` -> `customer` -> `products` -> `inventory`), Federation-Mesh generates a directed acyclic graph (DAG) executing non-dependent steps concurrently:

```mermaid
graph LR
    Root["Client Query: Order Details"] --> Step1["Step 1: Fetch Order from Order Subgraph"]
    Step1 --> Step2A["Step 2A: Fetch Customer (User Subgraph)"]
    Step1 --> Step2B["Step 2B: Fetch Product Details (Product Subgraph)"]
    Step2B --> Step3A["Step 3A: Batch Fetch Inventory (Inventory Subgraph)"]
    Step2B --> Step3B["Step 3B: Batch Fetch Reviews (Review Subgraph)"]
    Step2A --> Merge["Merge Execution Tree into Single JSON Payload"]
    Step3A --> Merge
    Step3B --> Merge
    Merge --> Response["Client Response (Sub-millisecond merge)"]
```

---

## 🔄 Entity Batch Resolution via DataLoader

Federation-Mesh prevents distributed N+1 query storms by queueing cross-service entity representation references (`_entities`) and dispatching unified batch requests:

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Router as Federation-Mesh Router
    participant Orders as Order Subgraph
    participant Products as Product Subgraph
    participant DataLoader as Product DataLoader

    Client->>Router: query { user(id: "1") { orders { product { name price } } } }
    Router->>Orders: Query User Orders
    Orders-->>Router: Returns 5 Orders with 5 Product IDs
    Note over Router,DataLoader: Router passes product IDs to DataLoader queue
    Router->>DataLoader: load("prod_101"), load("prod_102"), ...
    DataLoader->>DataLoader: Deduplicate & Collate into single batch
    DataLoader->>Products: _entities(representations: [{__typename: "Product", id: ...}])
    Products-->>DataLoader: Returns batch array of Products
    DataLoader-->>Router: Resolves individual Promises
    Router-->>Client: Unified GraphQL JSON response
```

---

## 🚀 Key Features

- **Automated Schema Composition:** Merges isolated subgraph SDLs into a fully validated Supergraph AST, reporting type collisions, missing keys, and unresolved directives.
- **Intelligent Query Planner:** Decomposes arbitrary multi-level nested queries into dependency graphs, optimizing parallel network I/O.
- **Zero N+1 Entity Batching:** Per-request DataLoader caching and batching across all federated `@key` references.
- **AST Query Complexity & Depth Limiting:** Configurable score-based complexity analyzer blocking malformed, recursive, or deep queries before network dispatch.
- **Subgraph Fault Isolation:** Circuit breaker pattern and graceful partial responses when non-critical subgraphs degrade.
- **Interactive React 18 Console:** Real-time query planner DAG visualization, latency flame graphs, live GraphQL runner, and subgraph health monitoring.
- **Prometheus Telemetry:** Built-in instrumentation for P95/P99 execution times, query depth distributions, and cache hit ratios.

---

## 🛠️ Quick Start

### Prerequisites
- Node.js >= 18.0.0
- Docker & Docker Compose (optional for containerized setup)
- MongoDB >= 5.0 (local or container)

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/developertdsl-prog/federation-mesh.git
   cd federation-mesh
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   ```bash
   cp .env.example .env
   ```

4. **Start the Supergraph Router & Mock Subgraphs:**
   ```bash
   npm run start
   ```

5. **Access the Web Console & GraphQL Endpoint:**
   - **GraphQL Endpoint:** `http://localhost:4000/graphql`
   - **React 18 Mesh Dashboard:** `http://localhost:4000/`
   - **Health API:** `http://localhost:4000/api/health`
   - **Query Plan Visualizer API:** `http://localhost:4000/api/analytics/query-plans`

---

## 🧪 Running Automated Tests

Federation-Mesh includes 7 comprehensive automated test suites covering AST composition, DAG generation, DataLoader deduplication, and full e2e workflows:

```bash
npm test
```

### Test Coverage Breakdown:
1. `schemaComposer.test.js` - Subgraph schema parsing, federation directive validation, conflict detection.
2. `queryPlanner.test.js` - Query AST decomposition, parallel and sequential execution step generation.
3. `queryExecutor.test.js` - Plan tree execution, cross-subgraph data merging, fault tolerance.
4. `dataLoaderBatching.test.js` - DataLoader deduplication, batch array alignment, and N+1 prevention.
5. `queryComplexity.test.js` - Depth guard, complexity scoring, and malicious query rejection.
6. `gatewayController.test.js` - HTTP POST `/graphql` handling, introspection queries, error sanitization.
7. `e2eFederationMeshWorkflow.test.js` - Full end-to-end multi-service federated query workflow.

---

## 🐳 Docker Containerization

Run the complete Supergraph cluster (Gateway + 5 Subgraphs + MongoDB) in isolated containers:

```bash
docker-compose up --build
```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
