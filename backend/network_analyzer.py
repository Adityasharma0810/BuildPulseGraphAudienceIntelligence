"""Deterministic NetworkX reference implementation of the graph service."""
from functools import lru_cache
from random import Random

import networkx as nx


@lru_cache(maxsize=30)
def graph_for(day: int) -> nx.DiGraph:
    rng = Random(835)
    graph = nx.DiGraph()
    graph.add_nodes_from(range(150))
    edges = {(node, (node + 6) % 150): 1 + rng.randrange(10) for node in graph}
    while len(edges) < 408:
        a, b = rng.randrange(150), rng.randrange(150)
        if a != b and (a, b) not in edges:
            edges[a, b] = 1 + rng.randrange(30)
    for (source, target), event_day in edges.items():
        if event_day <= day:
            graph.add_edge(source, target, day=event_day)
    return nx.freeze(graph)


def analyze(day: int) -> dict:
    graph = graph_for(day)
    influence = nx.pagerank(graph, max_iter=300)
    groups = nx.community.louvain_communities(graph, seed=7)
    assignment = {n: i for i, group in enumerate(groups) for n in group}
    return {"nodes": [{"id": n, "handle": f"@signal_{n+1:03}", "pageRank": influence[n], "community": assignment[n], "botSuspicion": n % 13 == 11} for n in graph],
            "edges": [{"source": a, "target": b, **data} for a, b, data in graph.edges(data=True)]}


def simulate(day: int, seed: int, tone: str) -> dict:
    graph = graph_for(day)
    rng = Random(seed * 763 + day * 97)
    chance = {"Neutral": .56, "Urgent": .68, "Empathetic": .79}[tone]
    seen = {seed}
    waves = [[seed]]
    while waves[-1]:
        new = []
        for source in waves[-1]:
            for target in graph.successors(source):
                if target not in seen and rng.random() < chance * (1 if source % 6 == target % 6 else .76):
                    seen.add(target)
                    new.append(target)
        if not new:
            break
        waves.append(new)
    return {"waves": waves, "reach": len(seen), "unit": "activated nodes"}
