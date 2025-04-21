import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskDetail from '../frontend/src/components/TaskDetail';
import React from 'react';
import { ChakraProvider } from '@chakra-ui/react'; // Added provider

const mockTask = {
  portfolio_id: [],
  project_id: [],
  section_id: [],
};

describe('TaskDetail Portfolio→Project→Section hierarchy', () => {
  it('Project options depend on selected portfolios, Section options depend on selected projects', async () => {
    render(
      <ChakraProvider>
        <TaskDetail task={mockTask} />
      </ChakraProvider>
    );

    // Portfolio field: open menu and select a portfolio
    const portfolioBtn = screen.getByRole('button', { name: /add portfolio/i });
    fireEvent.click(portfolioBtn);
    const firstPortfolio = await screen.findByText('GLOBAL (Global)');
    fireEvent.click(firstPortfolio);

    // Project field: should now be enabled and show projects for selected portfolio
    const projectBtn = screen.getByRole('button', { name: /add project/i });
    fireEvent.click(projectBtn);
    const projectOption = await screen.findByText('OVERDUE (Global)');
    fireEvent.click(projectOption);

    // Section field: should now be enabled and show sections for selected project
    const sectionBtn = screen.getByRole('button', { name: /add section/i });
    fireEvent.click(sectionBtn);
    const sectionOption = await screen.findByText('Osobný Život & Rozvoj (OVERDUE (Global))');
    expect(sectionOption).toBeInTheDocument();
    fireEvent.click(sectionOption);

    // Remove project and section should clear dependent fields
    const projectChipClose = screen.getAllByRole('button', { name: /close/i })[1];
    fireEvent.click(projectChipClose);
    await waitFor(() => {
      expect(screen.queryByText('Osobný Život & Rozvoj (OVERDUE (Global))')).not.toBeInTheDocument();
    });
  });
});
