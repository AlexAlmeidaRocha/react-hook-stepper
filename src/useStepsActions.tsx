import { useCallback } from 'react';
import {
  StepperState,
  UpdateGeneralStateInput,
  UpdateStepInput,
  StepConfig,
  StepState,
  UseStepsActionsProps,
  ValidationConfigStepper,
} from './types/StepTypes';

export const useStepsActions = <T,>({
  updateStepperState,
  stepperState,
  currentStep,
  setCurrentStep,
  setConfig,
  config,
}: UseStepsActionsProps<T>) => {
  const saveToLocalStorage = useCallback((state: StepperState<T>) => {
    if (config.saveLocalStorage) {
      localStorage.setItem('stepperState', JSON.stringify(state));
    }
  }, [config.saveLocalStorage]);

  const setStepsInfo = useCallback((steps: StepConfig[]) => {
    updateStepperState((prevState) => ({
      ...prevState,
      generalInfo: {
        totalSteps: steps.length,
        currentProgress: 0,
        completedProgress: 0,
        canAccessProgress: 0,
      },
      steps: steps.map((step: StepConfig, index: number) => ({
        name: step.name,
        canAccess: step.canAccess !== undefined ? step.canAccess : true, // Default to true to allow navigation
        canEdit: step.canEdit !== undefined ? step.canEdit : true,
        isOptional: step.isOptional || false,
        isCompleted: step.isCompleted || false,
      })),
    }));
  }, [updateStepperState]);

  const updateStateWithLocalStorage = useCallback(
    (stepperState: StepperState<T>) => {
      const newState = {
        ...stepperState,
        generalInfo: {
          totalSteps: stepperState.steps.length,
          currentProgress: stepperState.generalInfo.currentProgress || 0,
          completedProgress: stepperState.generalInfo.completedProgress || 0,
          canAccessProgress: stepperState.generalInfo.canAccessProgress || 0,
        },
        steps: stepperState.steps.map((step) => ({
          name: step.name,
          canAccess: step.canAccess !== undefined ? step.canAccess : true,
          canEdit: step.canEdit !== undefined ? step.canEdit : true,
          isOptional: step.isOptional || false,
          isCompleted: step.isCompleted || false,
        })),
        generalState: stepperState.generalState,
      };
      
      const completedSteps = stepperState.steps.filter((step) => step.isCompleted === true).length;
      setCurrentStep(completedSteps);
      updateStepperState(newState);
    },
    [setCurrentStep, updateStepperState],
  );

  const cleanLocalStorage = useCallback(() => {
    localStorage.removeItem('stepperState');
  }, []);

  const updateGeneralState = useCallback(
    ({
      stepIndex = currentStep,
      data,
    }: UpdateGeneralStateInput<T>): StepperState<T> => {
      const newState: StepperState<T> = {
        ...stepperState,
        generalState: {
          ...stepperState.generalState,
          ...data,
        },
      };
      
      updateStepperState(newState);
      saveToLocalStorage(newState);

      return newState;
    },
    [currentStep, stepperState, updateStepperState, saveToLocalStorage],
  );

  const updateSteps = useCallback(
    (updates: UpdateStepInput[]): StepperState<T> => {
      const validKeys: (keyof StepState)[] = [
        'canAccess',
        'canEdit',
        'isOptional',
        'isCompleted',
      ];

      // Validate all updates before applying any
      updates.forEach(({ data, stepIndex }) => {
        const isValidData = Object.keys(data).every((key) =>
          validKeys.includes(key as keyof StepState),
        );

        if (!isValidData) {
          throw new Error(
            `Invalid data provided: ${JSON.stringify(data)}. Valid keys are: ${validKeys.join(', ')}`,
          );
        }

        if (stepIndex < 0 || stepIndex >= stepperState.steps.length) {
          throw new Error(`Invalid stepIndex: ${stepIndex}.`);
        }
      });

      // Apply all updates
      const updatedSteps = [...stepperState.steps];
      updates.forEach(({ stepIndex, data }) => {
        updatedSteps[stepIndex] = {
          ...updatedSteps[stepIndex],
          ...data,
        };
      });

      const newState = {
        ...stepperState,
        steps: updatedSteps,
      };
      
      updateStepperState(newState);
      saveToLocalStorage(newState);

      return newState;
    },
    [stepperState, updateStepperState, saveToLocalStorage],
  );

  const updateConfig = useCallback((newConfig: ValidationConfigStepper) => {
    setConfig((prev) => ({
      ...prev,
      ...newConfig,
    }));
  }, [setConfig]);

  return {
    setStepsInfo,
    updateStateWithLocalStorage,
    updateGeneralState,
    updateSteps,
    updateConfig,
    cleanLocalStorage,
  };
};
