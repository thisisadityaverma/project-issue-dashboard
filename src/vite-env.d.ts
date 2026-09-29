/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Artificial latency (ms) added to the mock API so loading states are visible. */
  readonly VITE_MOCK_DELAY_MS?: string;
}
