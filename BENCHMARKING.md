# 📊 Benchmarking

This document describes the performance characteristics of the CodeBrim execution engine under controlled load.  
The goal of these benchmarks is to evaluate **end-to-end execution latency**, **queue behavior**, and **system stability** under concurrent workloads.


## 🧠 Benchmark Scope

The benchmark measures:

- End-to-end latency (request → execution → response)
- Queue behavior under concurrent load
- System throughput
- Execution isolation overhead

## ⚙️ Test Environment

| Component | Value |
|--------|------|
| Machine | Intel i5-12500H |
| RAM | 16 GB |
| OS | Windows 11 |
| Runtime | Docker |
| Execution Model | One container per request |
| Queue | BullMQ (Redis) |
| Database | PostgreSQL (Supabase) |
| Transport | HTTP + WebSocket |
| Client | Go-based benchmark tool |

> Database interactions are part of the execution flow, but were observed to have negligible impact compared to container startup and scheduling.

## 🔬 Methodology

Each benchmark run follows this flow:

1. Client sends execution requests concurrently
2. Requests are queued using Redis (BullMQ)
3. Workers spin up isolated containers per request
4. Execution results are sent back via WebSocket
5. End-to-end latency is recorded per request

Latency is measured from request submission to result receipt.

## 📈 Benchmark Results

### ✅ Baseline Test (Recommended Operating Range)

**Purpose:** Measure stable system behavior under moderate concurrency.

| Metric | Value |
|------|------|
| Requests | 50 |
| Client Concurrency | 10 |
| Worker Concurrency | 10 |
| Avg Latency | **17.5s** |
| P50 Latency | 18.4s |
| P95 Latency | 27.3s |
| Throughput | **~213 req/s** |

**Observations:**
- Stable latency distribution
- No dropped requests
- Predictable queue behavior

### ⚙️ Scalability Test

**Purpose:** Observe behavior as concurrency increases.

| Metric | Value |
|------|------|
| Requests | 100 |
| Client Concurrency | 10 |
| Worker Concurrency | 20 |
| Avg Latency | **35.1s** |
| P95 Latency | 54.2s |
| Throughput | **~265 req/s** |

**Observations:**
- Throughput increases but begins to plateau
- Queue wait time becomes dominant
- System remains stable with no failures

## 🔍 Key Insights

- **Container startup time dominates latency**.
- Throughput plateaus after ~20 workers due to resource contention.
- Queueing behavior is predictable and stable.
- The system degrades gracefully under increased load.
- Isolation-first design trades throughput for safety and determinism.


## 📌 Notes

* Results may vary based on hardware and Docker configuration.
* Benchmarks represent cold-start behavior.
* Future optimizations may include container reuse, migration to GO or pooling.