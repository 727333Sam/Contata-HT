"""Unit tests for status management."""


def test_recalculate_ready():
    # When all prerequisites done, task should become ready (in_progress)
    pass


def test_recalculate_blocked():
    # When prerequisite not done, task stays backlog/blocked
    pass


def test_regression_downstream():
    # Done -> in_progress should block dependents
    pass
