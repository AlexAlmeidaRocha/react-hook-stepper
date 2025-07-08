import "@testing-library/jest-dom";

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true
});

// Mock console methods to avoid noise in tests
const originalConsole = console;
(window as any).console = {
  ...originalConsole,
  warn: jest.fn(),
  error: jest.fn()
};

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockReturnValue(null);
});
