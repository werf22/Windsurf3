import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider, Button } from '@chakra-ui/react';

test('ChakraProvider renders a button', () => {
  render(
    <ChakraProvider>
      <Button>Test</Button>
    </ChakraProvider>
  );
  expect(screen.getByText('Test')).toBeInTheDocument();
});
