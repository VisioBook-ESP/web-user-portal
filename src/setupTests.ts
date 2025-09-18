import { vi } from "vitest";
import { config } from "@vue/test-utils";

// Mock global objects
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Global test configuration
config.global.stubs = {
  teleport: true,
  transition: false,
  "transition-group": false,
};

// Mock API base URL
vi.stubEnv("VITE_API_BASE_URL", "http://localhost:5170/api/v1");
