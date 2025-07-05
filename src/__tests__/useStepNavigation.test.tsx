import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useStepNavigation } from '../useStepNavigation';
import { StepperState, StepperConfig } from '../types/StepTypes';

// Mock data
const mockStepperState: StepperState<any> = {
  generalInfo: {
    totalSteps: 3,
    currentProgress: 0,
    completedProgress: 0,
    canAccessProgress: 0.33,
  },
  steps: [
    { name: 'Step 1', canAccess: true, canEdit: true, isOptional: false, isCompleted: false },
    { name: 'Step 2', canAccess: true, canEdit: true, isOptional: false, isCompleted: false },
    { name: 'Step 3', canAccess: false, canEdit: false, isOptional: false, isCompleted: false },
  ],
  generalState: {},
};

const mockConfig: StepperConfig = {
  steps: [],
  saveLocalStorage: false,
  next: {
    currentStep: {
      canAccess: true,
      isCompleted: true,
      canEdit: true,
    },
    nextStep: {
      canAccess: true,
      isCompleted: false,
      canEdit: true,
    },
  },
};

describe('useStepNavigation', () => {
  let mockSetCurrentStep: jest.Mock;
  let mockUpdateStepperState: jest.Mock;
  let mockSetLoading: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetCurrentStep = jest.fn();
    mockUpdateStepperState = jest.fn();
    mockSetLoading = jest.fn();
    
    // Mock console methods
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderUseStepNavigation = (
    currentStep: number = 0,
    stepperState: StepperState<any> = mockStepperState,
    config: StepperConfig = mockConfig
  ) => {
    return renderHook(() =>
      useStepNavigation({
        currentStep,
        setCurrentStep: mockSetCurrentStep,
        stepperState,
        updateStepperState: mockUpdateStepperState,
        setLoading: mockSetLoading,
        config,
      })
    );
  };

  describe('onNext', () => {
    it('should navigate to next step', async () => {
      const { result } = renderUseStepNavigation(0);

      await act(async () => {
        await result.current.onNext();
      });

      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(mockSetCurrentStep).toHaveBeenCalledWith(1);
      expect(mockUpdateStepperState).toHaveBeenCalled();
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });

    it('should not navigate when already on last step', async () => {
      const { result } = renderUseStepNavigation(2); // Last step

      await act(async () => {
        await result.current.onNext();
      });

      expect(mockSetCurrentStep).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('You are already on the last step.');
    });

    it('should call onCompleteStep callback when provided', async () => {
      const onCompleteStep = jest.fn();
      const { result } = renderUseStepNavigation(0);

      await act(async () => {
        await result.current.onNext({ onCompleteStep });
      });

      expect(onCompleteStep).toHaveBeenCalled();
    });

    it('should update steps status when provided', async () => {
      const { result } = renderUseStepNavigation(0);
      const updateStepsStatus = [
        { stepIndex: 0, data: { isCompleted: true } },
      ];

      await act(async () => {
        await result.current.onNext({ updateStepsStatus });
      });

      expect(mockUpdateStepperState).toHaveBeenCalledWith(
        expect.objectContaining({
          steps: expect.arrayContaining([
            expect.objectContaining({ isCompleted: true }),
          ]),
        })
      );
    });

    it('should update general state when provided', async () => {
      const { result } = renderUseStepNavigation(0);
      const updateGeneralStates = { data: { testData: 'test' } };

      await act(async () => {
        await result.current.onNext({ updateGeneralStates });
      });

      expect(mockUpdateStepperState).toHaveBeenCalledWith(
        expect.objectContaining({
          generalState: expect.objectContaining({ testData: 'test' }),
        })
      );
    });

    it('should handle errors gracefully', async () => {
      const onCompleteStep = jest.fn().mockRejectedValue(new Error('Test error'));
      const { result } = renderUseStepNavigation(0);

      await act(async () => {
        await result.current.onNext({ onCompleteStep });
      });

      expect(console.error).toHaveBeenCalledWith('Error in step navigation:', expect.any(Error));
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });
  });

  describe('onPrev', () => {
    it('should navigate to previous step', async () => {
      const { result } = renderUseStepNavigation(1);

      await act(async () => {
        await result.current.onPrev();
      });

      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(mockSetCurrentStep).toHaveBeenCalledWith(0);
      expect(mockUpdateStepperState).toHaveBeenCalled();
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });

    it('should not navigate when already on first step', async () => {
      const { result } = renderUseStepNavigation(0);

      await act(async () => {
        await result.current.onPrev();
      });

      expect(mockSetCurrentStep).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('You are already on the first step.');
    });

    it('should call onCompleteStep callback when provided', async () => {
      const onCompleteStep = jest.fn();
      const { result } = renderUseStepNavigation(1);

      await act(async () => {
        await result.current.onPrev({ onCompleteStep });
      });

      expect(onCompleteStep).toHaveBeenCalled();
    });
  });

  describe('goToStep', () => {
    it('should navigate to specific step', async () => {
      const { result } = renderUseStepNavigation(0);

      await act(async () => {
        await result.current.goToStep(1);
      });

      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(mockSetCurrentStep).toHaveBeenCalledWith(1);
      expect(mockUpdateStepperState).toHaveBeenCalled();
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });

    it('should not navigate when target step is current step', async () => {
      const { result } = renderUseStepNavigation(1);

      await act(async () => {
        await result.current.goToStep(1);
      });

      expect(mockSetCurrentStep).not.toHaveBeenCalled();
      expect(mockUpdateStepperState).not.toHaveBeenCalled();
    });

    it('should throw error when step does not exist', async () => {
      const { result } = renderUseStepNavigation(0);

      await act(async () => {
        await expect(result.current.goToStep(5)).rejects.toThrow('The step 5 does not exist.');
      });
    });

    it('should throw error when step index is negative', async () => {
      const { result } = renderUseStepNavigation(0);

      await act(async () => {
        await expect(result.current.goToStep(-1)).rejects.toThrow('The step -1 does not exist.');
      });
    });

    it('should not navigate to inaccessible step when validation is enabled', async () => {
      const configWithValidation = {
        ...mockConfig,
        validations: {
          goToStep: {
            canAccess: true,
          },
        },
      };

      const { result } = renderUseStepNavigation(0, mockStepperState, configWithValidation);

      await act(async () => {
        await result.current.goToStep(2); // Step 2 is not accessible
      });

      expect(mockSetCurrentStep).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(
        'The step 2 is not accessible because it is not available.'
      );
    });

    it('should navigate to inaccessible step when validation is disabled', async () => {
      const configWithoutValidation = {
        ...mockConfig,
        validations: {
          goToStep: {
            canAccess: false,
          },
        },
      };

      const { result } = renderUseStepNavigation(0, mockStepperState, configWithoutValidation);

      await act(async () => {
        await result.current.goToStep(2); // Step 2 is not accessible but validation is disabled
      });

      expect(mockSetCurrentStep).toHaveBeenCalledWith(2);
    });

    it('should call onCompleteStep callback when provided', async () => {
      const onCompleteStep = jest.fn();
      const { result } = renderUseStepNavigation(0);

      await act(async () => {
        await result.current.goToStep(1, { onCompleteStep });
      });

      expect(onCompleteStep).toHaveBeenCalled();
    });
  });

  describe('localStorage integration', () => {
    it('should save to localStorage when saveLocalStorage is true', async () => {
      const localStorageMock = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      };

      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      });

      const configWithLocalStorage = {
        ...mockConfig,
        saveLocalStorage: true,
      };

      const { result } = renderUseStepNavigation(0, mockStepperState, configWithLocalStorage);

      await act(async () => {
        await result.current.onNext();
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'stepperState',
        expect.any(String)
      );
    });

    it('should remove from localStorage when reaching last step', async () => {
      const localStorageMock = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      };

      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      });

      const configWithLocalStorage = {
        ...mockConfig,
        saveLocalStorage: true,
      };

      const { result } = renderUseStepNavigation(1, mockStepperState, configWithLocalStorage);

      await act(async () => {
        await result.current.onNext();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('stepperState');
    });
  });
});
