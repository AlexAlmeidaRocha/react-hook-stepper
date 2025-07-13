/* eslint-disable no-console */
import { useCallback, useMemo } from "react";

import {
  StepperState,
  StepStateCallback,
  UpdateGeneralStateInput,
  UpdateStepInput,
  UseStepNavigationProps
} from "./types/StepTypes";

export const useStepNavigation = <T,>({
  currentStep,
  setCurrentStep,
  stepperState,
  updateStepperState,
  setLoading,
  config
}: UseStepNavigationProps<T>) => {
  // Helper functions to reduce code duplication
  const calculateProgress = useMemo(() => {
    return (
      steps: { isCompleted?: boolean; canAccess?: boolean }[],
      totalSteps: number
    ) => ({
      completedProgress:
        steps.filter((item) => item.isCompleted === true).length /
        (totalSteps || 1),
      canAccessProgress:
        steps.filter((item) => item.canAccess === true).length /
        (totalSteps || 1)
    });
  }, []);

  const updateStepsStatus = useCallback(
    (currentState: StepperState<T>, updates: UpdateStepInput[] = []) => {
      const updatedSteps = [...currentState.steps];
      updates.forEach((updateStep) => {
        updatedSteps[updateStep.stepIndex] = {
          ...currentState.steps[updateStep.stepIndex],
          ...updateStep.data
        };
      });

      return updatedSteps;
    },
    []
  );

  const updateStepStates = useCallback(
    (
      steps: StepperState<T>["steps"],
      currentStepIndex: number,
      targetStepIndex?: number,
      isMovingForward = true
    ) => {
      return steps.map((step, index) => {
        const isCurrentStep = index === currentStepIndex;
        const isTargetStep =
          targetStepIndex !== undefined && index === targetStepIndex;

        if (isCurrentStep && isMovingForward) {
          // When moving forward, mark current step as completed
          return {
            ...step,
            canAccess: config.next?.currentStep?.canAccess ?? step.canAccess,
            isCompleted: config.next?.currentStep?.isCompleted ?? true,
            isOptional: config.next?.currentStep?.isOptional ?? step.isOptional,
            canEdit: config.next?.currentStep?.canEdit ?? step.canEdit
          };
        }

        if (isCurrentStep && !isMovingForward) {
          // When moving backward, use prev config
          return {
            ...step,
            canAccess: config.prev?.currentStep?.canAccess ?? step.canAccess,
            isCompleted:
              config.prev?.currentStep?.isCompleted ?? step.isCompleted,
            isOptional: config.prev?.currentStep?.isOptional ?? step.isOptional,
            canEdit: config.prev?.currentStep?.canEdit ?? step.canEdit
          };
        }

        if (isTargetStep && isMovingForward) {
          // When moving forward, allow access to next step
          return {
            ...step,
            canAccess: config.next?.nextStep?.canAccess ?? true,
            isCompleted: config.next?.nextStep?.isCompleted ?? step.isCompleted,
            isOptional: config.next?.nextStep?.isOptional ?? step.isOptional,
            canEdit: config.next?.nextStep?.canEdit ?? step.canEdit
          };
        }

        if (isTargetStep && !isMovingForward) {
          // When moving backward, use prev config for target step
          return {
            ...step,
            canAccess: config.prev?.prevStep?.canAccess ?? step.canAccess,
            isCompleted: config.prev?.prevStep?.isCompleted ?? step.isCompleted,
            isOptional: config.prev?.prevStep?.isOptional ?? step.isOptional,
            canEdit: config.prev?.prevStep?.canEdit ?? step.canEdit
          };
        }

        return step;
      });
    },
    [config]
  );

  const saveToLocalStorage = useCallback(
    (state: StepperState<T>) => {
      if (config.saveLocalStorage) {
        localStorage.setItem("stepperState", JSON.stringify(state));
      }
    },
    [config.saveLocalStorage]
  );

  const executeStepNavigation = useCallback(
    async (
      targetStep: number,
      args?: {
        onCompleteStep?: StepStateCallback<T>;
        updateStepsStatus?: UpdateStepInput[];
        updateGeneralStates?: UpdateGeneralStateInput<T>;
      }
    ) => {
      const {
        onCompleteStep,
        updateStepsStatus: statusUpdates,
        updateGeneralStates
      } = args || {};

      setLoading(true);

      try {
        let currentState = stepperState;

        // Update steps status if provided
        const updatedSteps = updateStepsStatus(currentState, statusUpdates);

        // Update step states based on navigation
        const isMovingForward = targetStep > currentStep;
        const finalSteps = updateStepStates(
          updatedSteps,
          currentStep,
          targetStep,
          isMovingForward
        );

        // Calculate progress
        const progress = calculateProgress(
          finalSteps,
          currentState.generalInfo.totalSteps
        );

        // Create new state
        currentState = {
          ...currentState,
          steps: finalSteps,
          generalInfo: {
            ...currentState.generalInfo,
            currentProgress:
              (targetStep + 1) / (currentState.generalInfo.totalSteps || 1),
            ...progress
          },
          generalState: {
            ...currentState.generalState,
            ...(updateGeneralStates?.data || {})
          }
        };

        // Save to localStorage
        saveToLocalStorage(currentState);

        // Execute callback if provided
        if (onCompleteStep) {
          await onCompleteStep(currentState);
        }

        updateStepperState(currentState);
        setCurrentStep(targetStep);
      } catch (error) {
        console.error("Error in step navigation:", error);
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
      setCurrentStep
    ]
  );

  const onNext = useCallback(
    async (args?: {
      onCompleteStep?: StepStateCallback<T>;
      updateStepsStatus?: UpdateStepInput[];
      updateGeneralStates?: UpdateGeneralStateInput<T>;
    }) => {
      // If we're already on the last step and trying to go next,
      // execute onCompleteStep and clean localStorage
      if (currentStep >= stepperState.generalInfo.totalSteps - 1) {
        if (config.saveLocalStorage) {
          localStorage.removeItem("stepperState");
        }

        if (args?.onCompleteStep) {
          await args.onCompleteStep(stepperState);
        }

        console.warn("You are already on the last step.");

        return;
      }

      await executeStepNavigation(currentStep + 1, args);
    },
    [currentStep, executeStepNavigation, config.saveLocalStorage, stepperState]
  );

  const onPrev = useCallback(
    async (args?: {
      onCompleteStep?: StepStateCallback<T>;
      updateStepsStatus?: UpdateStepInput[];
      updateGeneralStates?: UpdateGeneralStateInput<T>;
    }) => {
      if (currentStep === 0) {
        console.warn("You are already on the first step.");

        return;
      }

      await executeStepNavigation(currentStep - 1, args);
    },
    [currentStep, executeStepNavigation]
  );

  const goToStep = useCallback(
    async (
      nextStep: number,
      args?: {
        onCompleteStep?: StepStateCallback<T>;
        updateStepsStatus?: UpdateStepInput[];
        updateGeneralStates?: { stepIndex?: number; data: Partial<T> };
      }
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
            `The step ${nextStep} is not accessible because it is not ` +
              "available."
          );

          return;
        }
      }

      await executeStepNavigation(nextStep, args);
    },
    [currentStep, stepperState, config, executeStepNavigation]
  );

  return { onNext, onPrev, goToStep };
};
