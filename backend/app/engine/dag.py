"""DAG engine — cycle detection and topological ordering."""

from collections import defaultdict, deque
from typing import Dict, List, Set, Tuple


def build_adjacency_list(dependencies: list) -> Dict[str, List[str]]:
    """Build directed adjacency list from dependency objects.

    Args:
        dependencies: List of Dependency models or dicts with source/target UUIDs.

    Returns:
        Adjacency dict mapping source -> list of targets.
    """
    graph = defaultdict(list)
    for dep in dependencies:
        source = str(dep.source_task_id) if hasattr(dep, "source_task_id") else str(dep.get("source_task_id"))
        target = str(dep.target_task_id) if hasattr(dep, "target_task_id") else str(dep.get("target_task_id"))
        graph[source].append(target)
    return dict(graph)


def detect_cycle(graph: Dict[str, List[str]], source: str, target: str) -> bool:
    """Check whether adding edge source->target creates a cycle.

    Uses DFS with white(0)/gray(1)/black(2) coloring. Temporarily inserts
    the candidate edge, runs DFS from source, and restores graph.

    Args:
        graph: Current adjacency list.
        source: Candidate edge source node.
        target: Candidate edge target node.

    Returns:
        True if a cycle would be formed, False otherwise.
    """
    # Temporarily add edge
    original = graph.get(source, [])
    graph[source] = original + [target]

    # DFS coloring: 0 = white (unvisited), 1 = gray (in current path), 2 = black (done)
    color = defaultdict(int)
    stack = [(source, False)]

    while stack:
        node, processed = stack.pop()
        if processed:
            color[node] = 2
            continue
        if color[node] == 1:
            # Back edge found -> cycle
            # Restore before returning
            graph[source] = original
            return True
        if color[node] == 2:
            continue
        color[node] = 1
        stack.append((node, True))
        for neighbor in graph.get(node, []):
            if color[neighbor] == 1:
                graph[source] = original
                return True
            if color[neighbor] == 0:
                stack.append((neighbor, False))

    graph[source] = original
    return False


def topological_sort(graph: Dict[str, List[str]]) -> List[str]:
    """Kahn's algorithm — returns ordered list of node IDs.

    Args:
        graph: Adjacency list of dependencies.

    Returns:
        Topologically sorted node list.
    """
    in_degree = defaultdict(int)
    nodes = set(graph.keys())
    for neighbors in graph.values():
        for n in neighbors:
            nodes.add(n)
    for node in nodes:
        if node not in in_degree:
            in_degree[node] = 0
    for src, targets in graph.items():
        for t in targets:
            in_degree[t] += 1

    queue = deque([n for n in nodes if in_degree[n] == 0])
    result = []
    while queue:
        node = queue.popleft()
        result.append(node)
        for neighbor in graph.get(node, []):
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if len(result) != len(nodes):
        raise ValueError("Graph contains a cycle — topological sort impossible.")
    return result


def get_downstream(graph: Dict[str, List[str]], task_id: str) -> Set[str]:
    """BFS to find all downstream dependents of task_id.

    Args:
        graph: Adjacency list.
        task_id: Starting task UUID (string).

    Returns:
        Set of all reachable downstream task IDs.
    """
    visited: Set[str] = set()
    queue = deque([task_id])
    while queue:
        current = queue.popleft()
        if current in visited:
            continue
        visited.add(current)
        for neighbor in graph.get(current, []):
            if neighbor not in visited:
                queue.append(neighbor)
    visited.discard(task_id)
    return visited
"""DAG engine — EVALUATION A (20%): DFS cycle detection, diamond-dependency math, rollback."""
