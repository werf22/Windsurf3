import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import theme from './theme'

// Expose TASK_FIELD_CONFIG for Cypress E2E tests (dev/test only)
if (import.meta.env.MODE !== 'production') {
  import('./components/taskFieldConfig').then(mod => {
    // @ts-ignore
    window.TASK_FIELD_CONFIG = mod.TASK_FIELD_CONFIG;
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
)
