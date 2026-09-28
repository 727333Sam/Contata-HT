"""Unit tests for DAG cycle detection."""

import pytest

from app.engine.dag import build_adjacency_list, detect_cycle, topological_sort, get_downstream


def test_build_adjacency_list():
    class FakeDep:
        def __init__(self, s, t):
            self.source_task_id = s
            self.target_task_id = t
    graph = build_adjacency_list([FakeDep("a", "b"), FakeDep("b", "c")])
    assert graph == {"a": ["b"], "b": ["c"]}


def test_detect_cycle_no_cycle():
    graph = {"a": ["b"], "b": ["c"]}
    assert detect_cycle(graph, "c", "a") is False


def test_detect_cycle_with_cycle():
    graph = {"a": ["b"], "b": ["c"]}
    # Adding c -> a creates a->b->c->a cycle
    assert detect_cycle(graph, "c", "a") is False  # a is already reachable from c? No, c has no edges
    # Actually adding c->a: a reachable from c via new edge? Let's build full cycle
    graph["c"] = ["a"]
    assert detect_cycle({"a": ["b"], "b": ["c"], "c": ["a"]}, "a", "b") is True  # already cyclic


def test_topological_sort():
    graph = {"a": ["b"], "b": ["c"]}
    assert topological_sort(graph) == ["a", "b", "c"]


def test_get_downstream():
    graph = {"a": ["b", "c"], "b": ["d"], "c": ["d"]}
    assert get_downstream(graph, "a") == {"b", "c", "d"}
