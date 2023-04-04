# Changelog

All notable changes to **Federation-Mesh** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2023-06-23

### Added
- Core GraphQL Federation Supergraph composition engine.
- Directed Acyclic Graph (DAG) query planner decomposing cross-subgraph ASTs.
- Per-request DataLoader batching and deduplication resolving `@key` entities.
- Subgraphs cluster: Users, Products, Orders, Inventory, and Reviews.
- AST query depth and complexity analysis middleware mitigating DoS attacks.
- Tamper-evident query audit logging with SHA-256 plan fingerprinting.
- React 18 interactive Query Plan Visualizer and GraphQL Explorer console.
- 7 automated unit and end-to-end test suites with 100% pass rates.
- Multi-stage Docker containerization and GitHub Actions automated CI workflow.
