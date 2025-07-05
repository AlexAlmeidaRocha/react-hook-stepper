import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useStepsActions } from '../useStepsActions';
import { StepperState, StepConfig, StepperConfig } from '../types/StepTypes';

// Mock data
const mockStepperState: StepperState<any> = {
  generalInfo: {
    totalSteps: 3,
    currentProgress: 0,
    completedProgress: 0,
    canAccessProgress: 0.33,
  },
  steps: [
    {
      name: 'Step 1',
      canAccess: true,
      canEdit: true,
      isOptional: false,
      isCompleted: false,
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
  generalState: { testData: 'initial' },
};

const mockSteps: StepConfig[] = [
  { name: 'Step 1', component: <div>Step 1</div> },
  { name: 'Step 2', component: <div>Step 2</div> },
  { name: 'Step 3', component: <div>Step 3</div> },
];

const mockConfig: StepperConfig = {
  steps: mockSteps,
  saveLocalStorage: false,
};

describe('useStepsActions', () => {
  let mockUpdateStepperState: jest.Mock;
  let mockSetCurrentStep: jest.Mock;
  let mockSetConfig: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateStepperState = jest.fn();
    mockSetCurrentStep = jest.fn();
    mockSetConfig = jest.fn();
  });

  const renderUseStepsActions = (
    stepperState: StepperState<any> = mockStepperState,
    currentStep: number = 0,
    config: StepperConfig = mockConfig,
  ) => {
    return renderHook(() =>
      useStepsActions({
        updateStepperState: mockUpdateStepperState,
        stepperState,
        currentStep,
        setCurrentStep: mockSetCurrentStep,
        setConfig: mockSetConfig,
        config,
      }),
    );
  };

  describe('setStepsInfo', () => {
    it('should set steps information correctly', () => {
      const { result } = renderUseStepsActions();

      act(() => {
        result.current.setStepsInfo(mockSteps);
      });

      expect(mockUpdateStepperState).toHaveBeenCalledWith(expect.any(Function));

      // Test the function passed to updateStepperState
      const updateFunction = mockUpdateStepperState.mock.calls[0][0];
      const newState = updateFunction(mockStepperState);

      expect(newState).toEqual(
        expect.objectContaining({
          generalInfo: expect.objectContaining({
            totalSteps: 3,
            currentProgress: 0,
            completedProgress: 0,
            canAccessProgress: 0,
          }),
          steps: expect.arrayContaining([
            expect.objectContaining({
              name: 'Step 1',
              canAccess: true,
              canEdit: true,
              isOptional: false,
              isCompleted: false,
            }),
          ]),
        }),
      );
    });

    it('should handle steps with predefined properties', () => {
      const stepsWithProperties: StepConfig[] = [
        {
          name: 'Step 1',
          component: <div>Step 1</div>,
          canAccess: true,
          canEdit: true,
          isOptional: true,
          isCompleted: true,
        },
      ];

      const { result } = renderUseStepsActions();

      act(() => {
        result.current.setStepsInfo(stepsWithProperties);
      });

      expect(mockUpdateStepperState).toHaveBeenCalledWith(expect.any(Function));

      // Test the function passed to updateStepperState
      const updateFunction = mockUpdateStepperState.mock.calls[0][0];
      const newState = updateFunction(mockStepperState);

      expect(newState).toEqual(
        expect.objectContaining({
          steps: expect.arrayContaining([
            expect.objectContaining({
              name: 'Step 1',
              canAccess: true,
              canEdit: true,
              isOptional: true,
              isCompleted: true,
            }),
          ]),
        }),
      );
    });

    it('should handle empty steps array', () => {
      const { result } = renderUseStepsActions();

      act(() => {
        result.current.setStepsInfo([]);
      });

      expect(mockUpdateStepperState).toHaveBeenCalledWith(expect.any(Function));

      // Test the function passed to updateStepperState
      const updateFunction = mockUpdateStepperState.mock.calls[0][0];
      const newState = updateFunction(mockStepperState);

      expect(newState).toEqual(
        expect.objectContaining({
          generalInfo: expect.objectContaining({
            totalSteps: 0,
          }),
          steps: [],
        }),
      );
    });
  });

  describe('cleanLocalStorage', () => {
    it('should remove stepperState from localStorage', () => {
      const localStorageMock = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      };

      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      });

      const { result } = renderUseStepsActions();

      act(() => {
        result.current.cleanLocalStorage();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('stepperState');
    });
  });

  describe('updateGeneralState', () => {
    it('should update general state with new data', () => {
      const { result } = renderUseStepsActions();
      const newData = { newTestData: 'updated' };

      act(() => {
        result.current.updateGeneralState({ data: newData });
      });

      expect(mockUpdateStepperState).toHaveBeenCalledWith(
        expect.objectContaining({
          generalState: expect.objectContaining({
            testData: 'initial',
            newTestData: 'updated',
          }),
        }),
      );
    });

    it('should save to localStorage when saveLocalStorage is true', () => {
      const localStorageMock = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      };

      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      });

      const configWithLocalStorage = { ...mockConfig, saveLocalStorage: true };
      const { result } = renderUseStepsActions(
        mockStepperState,
        0,
        configWithLocalStorage,
      );

      act(() => {
        result.current.updateGeneralState({ data: { test: 'data' } });
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'stepperState',
        expect.any(String),
      );
    });

    it('should return updated state', () => {
      const { result } = renderUseStepsActions();
      const newData = { newTestData: 'updated' };

      let updatedState: StepperState<any>;
      act(() => {
        updatedState = result.current.updateGeneralState({ data: newData });
      });

      expect(updatedState!.generalState).toEqual(
        expect.objectContaining({
          testData: 'initial',
          newTestData: 'updated',
        }),
      );
    });
  });

  describe('updateSteps', () => {
    it('should update steps with valid data', () => {
      const { result } = renderUseStepsActions();
      const updates = [
        { stepIndex: 0, data: { isCompleted: true, canAccess: true } },
        { stepIndex: 1, data: { canEdit: false } },
      ];

      act(() => {
        result.current.updateSteps(updates);
      });

      expect(mockUpdateStepperState).toHaveBeenCalledWith(
        expect.objectContaining({
          steps: expect.arrayContaining([
            expect.objectContaining({ isCompleted: true, canAccess: true }),
            expect.objectContaining({ canEdit: false }),
          ]),
        }),
      );
    });

    it('should throw error for invalid step data', () => {
      const { result } = renderUseStepsActions();
      const updates = [
        { stepIndex: 0, data: { invalidProperty: true } as any },
      ];

      expect(() => {
        act(() => {
          result.current.updateSteps(updates);
        });
      }).toThrow('Invalid data provided');
    });

    it('should throw error for invalid step index', () => {
      const { result } = renderUseStepsActions();
      const updates = [{ stepIndex: 10, data: { isCompleted: true } }];

      expect(() => {
        act(() => {
          result.current.updateSteps(updates);
        });
      }).toThrow('Invalid stepIndex: 10');
    });

    it('should throw error for negative step index', () => {
      const { result } = renderUseStepsActions();
      const updates = [{ stepIndex: -1, data: { isCompleted: true } }];

      expect(() => {
        act(() => {
          result.current.updateSteps(updates);
        });
      }).toThrow('Invalid stepIndex: -1');
    });

    it('should save to localStorage when saveLocalStorage is true', () => {
      const localStorageMock = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      };

      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      });

      const configWithLocalStorage = { ...mockConfig, saveLocalStorage: true };
      const { result } = renderUseStepsActions(
        mockStepperState,
        0,
        configWithLocalStorage,
      );

      act(() => {
        result.current.updateSteps([
          { stepIndex: 0, data: { isCompleted: true } },
        ]);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'stepperState',
        expect.any(String),
      );
    });

    it('should return updated state', () => {
      const { result } = renderUseStepsActions();
      const updates = [{ stepIndex: 0, data: { isCompleted: true } }];

      let updatedState: StepperState<any>;
      act(() => {
        updatedState = result.current.updateSteps(updates);
      });

      expect(updatedState!.steps[0].isCompleted).toBe(true);
    });

    it('should handle multiple updates correctly', () => {
      const { result } = renderUseStepsActions();
      const updates = [
        { stepIndex: 0, data: { isCompleted: true } },
        { stepIndex: 1, data: { canAccess: false } },
        { stepIndex: 2, data: { isOptional: true } },
      ];

      act(() => {
        result.current.updateSteps(updates);
      });

      expect(mockUpdateStepperState).toHaveBeenCalledWith(
        expect.objectContaining({
          steps: expect.arrayContaining([
            expect.objectContaining({ isCompleted: true }),
            expect.objectContaining({ canAccess: false }),
            expect.objectContaining({ isOptional: true }),
          ]),
        }),
      );
    });
  });

  describe('updateConfig', () => {
    it('should update config with new values', () => {
      const { result } = renderUseStepsActions();
      const newConfig = {
        steps: [],
        saveLocalStorage: true,
        next: {
          currentStep: { canAccess: false },
        },
      };

      act(() => {
        result.current.updateConfig(newConfig);
      });

      expect(mockSetConfig).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should merge config with existing values', () => {
      const { result } = renderUseStepsActions();
      const newConfig = { saveLocalStorage: true };

      act(() => {
        result.current.updateConfig(newConfig);
      });

      // Check that the function passed to setConfig merges correctly
      const setConfigCall = mockSetConfig.mock.calls[0][0];
      const mergedConfig = setConfigCall(mockConfig);

      expect(mergedConfig).toEqual({
        ...mockConfig,
        saveLocalStorage: true,
      });
    });
  });
});
