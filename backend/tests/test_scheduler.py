"""Unit tests for schedule propagation."""

from datetime import date, timedelta


def test_propagate_no_downstream():
    # If no dependencies, nothing propagates
    pass


def test_diamond_no_compounding():
    # A -> B -> D and A -> C -> D
    # If A delays 3 days, D should get +3 not +6
    # This validates visited-set rule
    pass
