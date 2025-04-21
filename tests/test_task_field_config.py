import pytest
from frontend.src.components.taskFieldConfig import TASK_FIELD_CONFIG, PORTFOLIO_PROJECT_SECTION


def test_project_options_for_portfolio():
    """
    Test that project_id.getOptions returns correct projects for a given portfolio.
    """
    for portfolio, projects in PORTFOLIO_PROJECT_SECTION.items():
        opts = TASK_FIELD_CONFIG['project_id'].getOptions(portfolio)
        assert set(opts) == set(projects.keys())


def test_section_options_for_project():
    """
    Test that section_id.getOptions returns correct sections for a given portfolio and project.
    """
    for portfolio, projects in PORTFOLIO_PROJECT_SECTION.items():
        for project, sections in projects.items():
            opts = TASK_FIELD_CONFIG['section_id'].getOptions(portfolio, project)
            assert set(opts) == set(sections)


def test_section_options_empty_if_no_project():
    """
    Edge case: section_id.getOptions returns [] if project is not provided or not found.
    """
    portfolio = next(iter(PORTFOLIO_PROJECT_SECTION))
    opts = TASK_FIELD_CONFIG['section_id'].getOptions(portfolio, None)
    assert opts == []
    opts = TASK_FIELD_CONFIG['section_id'].getOptions(portfolio, "NON_EXISTENT_PROJECT")
    assert opts == []


def test_project_options_empty_for_unknown_portfolio():
    """
    Failure case: project_id.getOptions returns [] for unknown portfolio.
    """
    opts = TASK_FIELD_CONFIG['project_id'].getOptions("NON_EXISTENT_PORTFOLIO")
    assert opts == []
