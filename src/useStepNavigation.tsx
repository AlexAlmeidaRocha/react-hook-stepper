import { useCallback, useMemo } from 'react';
import {
  StepStateCallback,
  UpdateStepInput,
  UpdateGeneralStateInput,
  UseStepNavigationProps,
  StepperState,
} from './types/StepTypes';

export const useStepNavigation = <T,>({
  currentStep,
  setCurrentStep,
  stepperState,
  updateStepperState,
  setLoading,
  config,
}: UseStepNavigationProps<T>) => {
  // Helper functions to reduce code duplication
  const calculateProgress = useMemo(() => {
    return (steps: any[], totalSteps: number) => ({
      completedProgress:
        steps.filter((item) => item.isCompleted === true).length /
        (totalSteps || 1),
      canAccessProgress:
        steps.filter((item) => item.canAccess === true).length /
        (totalSteps || 1),
    });
  }, []);

  const updateStepsStatus = useCallback(
    (currentState: StepperState<T>, updates: UpdateStepInput[] = []) => {
      const updatedSteps = [...currentState.steps];
      updates.forEach((updateStep) => {
        updatedSteps[updateStep.stepIndex] = {
          ...currentState.steps[updateStep.stepIndex],
          ...updateStep.data,
        };
      });
      return updatedSteps;
    },
    [],
  );

  const updateStepStates = useCallback(
    (steps: any[], currentStepIndex: number, targetStepIndex?: number) => {
      return steps.map((step, index) => {
        const isCurrentStep = index === currentStepIndex;
        const isTargetStep =
          targetStepIndex !== undefined && index === targetStepIndex;

        if (isCurrentStep) {
          return {
            ...step,
            canAccess: config.next?.currentStep?.canAccess ?? step.canAccess,
            isCompleted:
              config.next?.currentStep?.isCompleted ?? step.isCompleted,
            isOptional: config.next?.currentStep?.isOptional ?? step.isOptional,
            canEdit: config.next?.currentStep?.canEdit ?? step.canEdit,
          };
        }

        if (isTargetStep) {
          return {
            ...step,
            canAccess: config.next?.nextStep?.canAccess ?? step.canAccess,
            isCompleted: config.next?.nextStep?.isCompleted ?? step.isCompleted,
            isOptional: config.next?.nextStep?.isOptional ?? step.isOptional,
            canEdit: config.next?.nextStep?.canEdit ?? step.canEdit,
          };
        }

        return step;
      });
    },
    [config],
  );

  const saveToLocalStorage = useCallback(
    (state: StepperState<T>, targetStep: number) => {
      if (config.saveLocalStorage) {
        // Remove from localStorage if it's the last step
        if (targetStep === state.generalInfo.totalSteps) {
          localStorage.removeItem('stepperState');
        } else {
          localStorage.setItem('stepperState', JSON.stringify(state));
        }
      }
    },
    [config.saveLocalStorage],
  );

  const executeStepNavigation = useCallback(
    async (
      targetStep: number,
      args?: {
        onCompleteStep?: StepStateCallback<T>;
        updateStepsStatus?: UpdateStepInput[];
        updateGeneralStates?: UpdateGeneralStateInput<T>;
      },
    ) => {
      const {
        onCompleteStep,
        updateStepsStatus: statusUpdates,
        updateGeneralStates,
      } = args || {};

      setLoading(true);

      try {
        let currentState = stepperState;

        // Update steps status if provided
        const updatedSteps = updateStepsStatus(currentState, statusUpdates);

        // Update step states based on navigation
        const finalSteps = updateStepStates(
          updatedSteps,
          currentStep,
          targetStep,
        );

        // Calculate progress
        const progress = calculateProgress(
          finalSteps,
          currentState.generalInfo.totalSteps,
        );

        // Create new state
        currentState = {
          ...currentState,
          steps: finalSteps,
          generalInfo: {
            ...currentState.generalInfo,
            currentProgress:
              targetStep / (currentState.generalInfo.totalSteps || 1),
            ...progress,
          },
          generalState: {
            ...currentState.generalState,
            ...(updateGeneralStates?.data || {}),
          },
        };

        // Save to localStorage
        saveToLocalStorage(currentState, targetStep);

        // Execute callback if provided
        if (onCompleteStep) {
          await onCompleteStep(currentState);
        }

        updateStepperState(currentState);
        setCurrentStep(targetStep);
      } catch (error) {
        console.error('Error in step navigation:', error);
        // Don't re-throw the error, just log it
      } finally {
        setLoading(false);
      }
    },
    [
      stepperState,
      currentStep,
      updateStepsStatus,
      updateStepStates,
      calculateProgress,
      saveToLocalStorage,
      setLoading,
      updateStepperState,
      setCurrentStep,
    ],
  );

  const onNext = useCallback(
    async (args?: {
      onCompleteStep?: StepStateCallback<T>;
      updateStepsStatus?: UpdateStepInput[];
      updateGeneralStates?: UpdateGeneralStateInput<T>;
    }) => {
      if (currentStep >= stepperState.generalInfo.totalSteps) {
        console.warn('You are already on the last step.');
        return;
      }

      await executeStepNavigation(currentStep + 1, args);
    },
    [currentStep, stepperState.generalInfo.totalSteps, executeStepNavigation],
  );

  const onPrev = useCallback(
    async (args?: {
      onCompleteStep?: StepStateCallback<T>;
      updateStepsStatus?: UpdateStepInput[];
      updateGeneralStates?: UpdateGeneralStateInput<T>;
    }) => {
      if (currentStep === 0) {
        console.warn('You are already on the first step.');
        return;
      }

      await executeStepNavigation(currentStep - 1, args);
    },
    [currentStep, executeStepNavigation],
  );

  const goToStep = useCallback(
    async (
      nextStep: number,
      args?: {
        onCompleteStep?: StepStateCallback<T>;
        updateStepsStatus?: UpdateStepInput[];
        updateGeneralStates?: { stepIndex?: number; data: Partial<T> };
      },
    ) => {
      if (nextStep < 0 || nextStep >= stepperState.generalInfo.totalSteps) {
        throw new Error(`The step ${nextStep} does not exist.`);
      }

      if (nextStep === currentStep) return;

      const validationCanAccess =
        config?.validations?.goToStep?.canAccess ?? true;

      if (validationCanAccess && nextStep > currentStep) {
        if (!stepperState.steps[nextStep]?.canAccess) {
          console.warn(
            `The step ${nextStep} is not accessible because it is not available.`,
          );
          return;
        }
      }

      await executeStepNavigation(nextStep, args);
    },
    [currentStep, stepperState, config, executeStepNavigation],
  );

  return { onNext, onPrev, goToStep };
};
