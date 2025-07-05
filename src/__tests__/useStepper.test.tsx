import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useStepper } from '../useStepper';
import { StepsProvider } from '../StepsContext';
import { StepperConfig } from '../types/StepTypes';

// Mock data
const mockSteps = [
  { name: 'Step 1', component: <div>Step 1</div> },
  { name: 'Step 2', component: <div>Step 2</div> },
  { name: 'Step 3', component: <div>Step 3</div> },
];

const mockConfig: StepperConfig = {
  steps: mockSteps,
  saveLocalStorage: false,
};

// Wrapper component for testing
const createWrapper = (initialConfig?: StepperConfig) => {
  return ({ children }: { children: React.ReactNode }) => (
    <StepsProvider initialConfig={initialConfig}>{children}</StepsProvider>
  );
};

describe('useStepper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw error when used outside StepsProvider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    try {
      expect(() => {
        renderHook(() => useStepper());
      }).toThrow('useStepper must be used within a StepProvider');
    } finally {
      console.error = originalError;
    }
  });

  it('should return stepper context when used within StepsProvider', () => {
    const { result } = renderHook(() => useStepper(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toBeDefined();
    expect(result.current.activeStep).toBeDefined();
    expect(result.current.onNext).toBeDefined();
    expect(result.current.onPrev).toBeDefined();
    expect(result.current.goToStep).toBeDefined();
    expect(result.current.stepperState).toBeDefined();
  });

  it('should initialize with config when provided', () => {
    const { result } = renderHook(() => useStepper(mockConfig), {
      wrapper: createWrapper(),
    });

    act(() => {
      // Allow time for useEffect to run
    });

    expect(result.current.stepperState.generalInfo.totalSteps).toBe(3);
    expect(result.current.stepperState.steps).toHaveLength(3);
    expect(result.current.stepperState.steps[0].name).toBe('Step 1');
  });

  it('should handle localStorage when saveLocalStorage is true', () => {
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    const configWithLocalStorage: StepperConfig = {
      ...mockConfig,
      saveLocalStorage: true,
    };

    const mockSavedState = {
      generalInfo: {
        totalSteps: 3,
        currentProgress: 0.33,
        completedProgress: 0.33,
        canAccessProgress: 0.33,
      },
      steps: [
        {
          name: 'Step 1',
          canAccess: true,
          canEdit: true,
          isOptional: false,
          isCompleted: true,
        },
        {
          name: 'Step 2',
          canAccess: true,
          canEdit: true,
          isOptional: false,
          isCompleted: false,
        },
        {
          name: 'Step 3',
          canAccess: false,
          canEdit: false,
          isOptional: false,
          isCompleted: false,
        },
      ],
      generalState: {},
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSavedState));

    const { result } = renderHook(() => useStepper(configWithLocalStorage), {
      wrapper: createWrapper(),
    });

    act(() => {
      // Allow time for useEffect to run
    });

    expect(localStorageMock.getItem).toHaveBeenCalledWith('stepperState');
  });

  it('should not initialize when no config is provided', () => {
    // Clear localStorage before test
    localStorage.removeItem('stepperState');

    // Create wrapper with saveLocalStorage disabled
    const configWithoutLocalStorage = {
      steps: [],
      saveLocalStorage: false,
    };

    const { result } = renderHook(() => useStepper(), {
      wrapper: createWrapper(configWithoutLocalStorage),
    });

    expect(result.current.stepperState.generalInfo.totalSteps).toBe(0);
    expect(result.current.stepperState.steps).toHaveLength(0);
  });

  it('should handle localStorage error gracefully', () => {
    const localStorageMock = {
      getItem: jest.fn().mockImplementation(() => {
        throw new Error('localStorage error');
      }),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    const configWithLocalStorage: StepperConfig = {
      ...mockConfig,
      saveLocalStorage: true,
    };

    const { result } = renderHook(() => useStepper(configWithLocalStorage), {
      wrapper: createWrapper(),
    });

    act(() => {
      // Allow time for useEffect to run
    });

    // Should not crash and should still initialize with config
    expect(result.current.stepperState.generalInfo.totalSteps).toBe(3);
  });

  it('should update config when dependencies change', () => {
    const { result, rerender } = renderHook(
      ({ config }) => useStepper(config),
      {
        wrapper: createWrapper(),
        initialProps: { config: mockConfig },
      },
    );

    const newConfig: StepperConfig = {
      steps: [
        { name: 'New Step 1', component: <div>New Step 1</div> },
        { name: 'New Step 2', component: <div>New Step 2</div> },
      ],
      saveLocalStorage: false,
    };

    act(() => {
      rerender({ config: newConfig });
    });

    expect(result.current.stepperState.generalInfo.totalSteps).toBe(2);
    expect(result.current.stepperState.steps[0].name).toBe('New Step 1');
  });
});
