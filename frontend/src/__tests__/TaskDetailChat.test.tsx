// @ts-nocheck
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import TaskDetail from '../components/TaskDetail';

const mockTask = { id: 1, name: 'Test Task', description: 'Desc', due_date: null };
const chatHist: any[] = [];

beforeEach(() => {
  global.fetch = jest.fn((url: RequestInfo, opts?: RequestInit) => {
    const path = typeof url === 'string' ? url : url.toString();
    const method = opts?.method;
    if (path.endsWith('/tasks/1')) {
      return Promise.resolve(({ ok: true, json: () => Promise.resolve(mockTask) }) as any);
    }
    if (path.endsWith('/tasks/1/chat') && method === undefined) {
      return Promise.resolve(({ ok: true, json: () => Promise.resolve(chatHist) }) as any);
    }
    if (path.endsWith('/tasks/1/chat') && method === 'POST') {
      return Promise.resolve(({ ok: true, json: () => Promise.resolve([
        { sender: 'user', message: 'Hello' },
        { sender: 'ai', message: 'Echo: Hello' }
      ]) }) as any);
    }
    return Promise.resolve(({ ok: false }) as any);
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

test('loads initial chat history', async () => {
  render(
    <ChakraProvider>
      <TaskDetail taskId={1} auth={{ username: 'u', password: 'p' }} />
    </ChakraProvider>
  );
  await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
    '/api/tasks/1/chat', expect.any(Object)
  ));
  // no messages
  expect(screen.queryByText('Hello')).toBeNull();
});

test('sends and displays chat messages', async () => {
  render(
    <ChakraProvider>
      <TaskDetail taskId={1} auth={{ username: 'u', password: 'p' }} />
    </ChakraProvider>
  );
  // wait initial
  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
  const input = screen.getByPlaceholderText('Type your message...');
  const sendBtn = screen.getByRole('button', { name: /send/i });
  fireEvent.change(input, { target: { value: 'Hello' } });
  fireEvent.click(sendBtn);
  await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
    '/api/tasks/1/chat', expect.objectContaining({ method: 'POST' })
  ));
  // messages appear
  expect(await screen.findByText('Hello')).toBeInTheDocument();
  expect(await screen.findByText('Echo: Hello')).toBeInTheDocument();
});
