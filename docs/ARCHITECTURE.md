# PulseGraph architecture

## What runs today

- `/` is a static Next.js page with interactive client islands. Seeded TypeScript fixtures reproduce Nova X1 posts, hourly topics, daily audience aggregates and an interaction graph. Zustand shares the replay day, cohort, selected trend and graph node. Recharts and D3 render the analytics; the large graph uses canvas. GSAP/ScrollTrigger and Lenis coordinate scroll effects; Motion handles component transitions. The Three.js hero uses a static vector field when WebGL or motion is unavailable.
- `/api/analyze` is a request-time Node route. It accepts at most 20 posts, 500 characters per post and 6,000 total, with optional bounded context. It masks email, phone, URL and handle patterns, then streams four parallel Groq reports followed by fusion. Zod checks output shape and the route validates graph and post references. The model never receives secrets or unmasked matches from this pipeline. If configuration, rate gating, or a provider call fails, the route streams labeled cached examples rather than exposing upstream errors.
- The optional Python API illustrates independent read, simulation, and WebSocket boundaries. Its X/Telegram adapters are mock iterators, its emotion mapper is cue-based, and its trend detector compares a seeded volume series to a rolling baseline. NetworkX computes PageRank and Louvain communities; the browser replay computes PageRank and Brandes betweenness and uses six predefined communities.

## Production path

| Stage | Proposed method | Reason / validation |
| --- | --- | --- |
| Connectors | Authorized public APIs → normalized Kafka events | Preserve source timestamps and deletion notices. Deduplicate with a stable source event ID. |
| Storage | TimescaleDB, Neo4j, Qdrant | Separate temporal queries, relationship traversal and embedding similarity. Enforce retention in every store. |
| Emotion | XLM-R multi-label head and a separate sarcasm head | Calibrate across languages and code-mixing; evaluate sarcasm independently on labeled, consented evaluation data. Surface cues as explanations, not proof. |
| Topics | BERTopic and Kleinberg burst detection | Cluster embeddings into topics and distinguish bursts from seasonal variation. |
| Forecast | Hawkes-process models | Estimate self-exciting volume, compare against simple baselines, and backtest calibrated forecast intervals. The demo’s forecasts are scripted, not trained. |
| Influence | PageRank, betweenness, Louvain | Rank structurally central actors, surface bridges, and measure community structure. A flag indicates suspicion, not automation or identity. |
| Cascade | Independent Cascade | Each active source attempts outgoing links once. Compare tones using paired random draws; report uncertainty across many runs in production. |
| Delivery | FastAPI queries/stream → Next.js dashboard | Coordinate updates without coupling streaming ingestion to a page request. |

## Privacy and operating limits

- The dashboard uses fictional identities and synthetic aggregates. The badge’s **k ≥ 50** and **ε = 1.0** are production design targets, **not guarantees applied to the demo**. A production release would need contributor bounding, thresholded groups, calibrated noise, a documented privacy budget, and audits against reconstruction.
- The live lab suppresses age breakdowns for small samples, sends masked text to Groq, and stores neither submitted text nor results. Regex masking is limited. No raw private messages should be submitted. Analyze public content only when authorized, respect platform policies, and treat model output as estimates. Short threads cannot establish ages, real-world influence or measured growth.
- The rate limiter is a bounded process-local sliding window. Deploy behind trusted ingress that **overwrites** client IP headers; untrusted clients must not be allowed to supply them directly. Use Redis/Upstash and gateway-level request quotas for a distributed deployment. Ensure the host allows streamed responses up to 60 seconds.
- Source connectors, trained models and production data stores are architectural examples, not enabled services. Lighthouse and device-specific FPS targets are unmeasured. The GitHub footer links to the relevant topic until a project repository URL is available.

## Map attribution

- India ADM1: [geoBoundaries gbOpen](https://www.geoboundaries.org/), DataMeet India community and Election Commission of India, licensed [CC BY 2.5 India](https://creativecommons.org/licenses/by/2.5/in/). The project simplifies shapes and transliterates names from the [source snapshot](https://github.com/wmgeolab/geoBoundaries/tree/9469f09/releaseData/gbOpen/IND/ADM1). Boundaries are for illustration, not an authoritative statement of jurisdiction.
- World: [Natural Earth 1:110m countries](https://www.naturalearthdata.com/about/terms-of-use/), public domain. Shapes are simplified for the demo.
