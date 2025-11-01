import '@testing-library/jest-dom'
import { vi, afterEach } from 'vitest'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
interface MockIntersectionObserver {
  observe: ReturnType<typeof vi.fn>;
  unobserve: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
}

(globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = vi.fn().mockImplementation((): MockIntersectionObserver => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
interface MockResizeObserver {
  observe: ReturnType<typeof vi.fn>;
  unobserve: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
}

(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = vi.fn().mockImplementation((): MockResizeObserver => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock localStorage
interface MockStorage {
  getItem: ReturnType<typeof vi.fn>;
  setItem: ReturnType<typeof vi.fn>;
  removeItem: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
}

const localStorageMock: MockStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
;(globalThis as unknown as { localStorage: MockStorage }).localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock: MockStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
;(globalThis as unknown as { sessionStorage: MockStorage }).sessionStorage = sessionStorageMock

// Mock URL.createObjectURL
interface MockURL {
  createObjectURL: ReturnType<typeof vi.fn>;
  revokeObjectURL: ReturnType<typeof vi.fn>;
}

;(globalThis as unknown as { URL: MockURL }).URL.createObjectURL = vi.fn(() => 'mocked-url')
;(globalThis as unknown as { URL: MockURL }).URL.revokeObjectURL = vi.fn()

// Mock fetch
;(globalThis as unknown as { fetch: ReturnType<typeof vi.fn> }).fetch = vi.fn()

// Setup cleanup after each test
afterEach(() => {
  vi.clearAllMocks()
})