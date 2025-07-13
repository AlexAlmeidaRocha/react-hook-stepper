import { useCallback } from "react";

import {
  StepConfig,
  StepperState,
  StepState,
  UpdateGeneralStateInput,
  UpdateStepInput,
  UseStepsActionsProps,
  ValidationConfigStepper
} from "./types/StepTypes";

export const useStepsActions = <T,>({
  updateStepperState,
  stepperState,
  setConfig,
  config
}: UseStepsActionsProps<T>) => {
  const saveToLocalStorage = useCallback(
    (state: StepperState<T>) => {
      if (config.saveLocalStorage) {
        localStorage.setItem("stepperState", JSON.stringify(state));
      }
    },
    [config.saveLocalStorage]
  );

  const setStepsInfo = useCallback(
    (steps: StepConfig[]) => {
      updateStepperState((prevState) => ({
        ...prevState,
        generalInfo: {
          totalSteps: steps.length,
          currentProgress: 0,
          completedProgress: 0,
          canAccessProgress: steps.length > 0 ? 1 / steps.length : 0 // Only first step should be accessible
        },
        steps: steps.map((step: StepConfig, index) => ({
          name: step.name,
          canAccess:
            step.canAccess !== undefined ? step.canAccess : index === 0, // Only first step is accessible by default
          canEdit: step.canEdit !== undefined ? step.canEdit : false, // Default to false
          isOptional: step.isOptional || false,
          isCompleted: step.isCompleted || false
        }))
      }));
    },
    [updateStepperState]
  );

  const cleanLocalStorage = useCallback(() => {
    localStorage.removeItem("stepperState");
  }, []);

  const updateGeneralState = useCallback(
    ({ data }: UpdateGeneralStateInput<T>): StepperState<T> => {
      const newState: StepperState<T> = {
        ...stepperState,
        generalState: {
          ...stepperState.generalState,
          ...data
        }
      };

      updateStepperState(newState);
      saveToLocalStorage(newState);

      return newState;
    },
    [stepperState, updateStepperState, saveToLocalStorage]
  );

  const updateSteps = useCallback(
    (updates: UpdateStepInput[]): StepperState<T> => {
      const validKeys: (keyof StepState)[] = [
        "canAccess",
        "canEdit",
        "isOptional",
        "isCompleted"
      ];

      // Validate all updates before applying any
      updates.forEach(({ data, stepIndex }) => {
        const isValidData = Object.keys(data).every((key) =>
          validKeys.includes(key as keyof StepState)
        );

        if (!isValidData) {
          throw new Error(
            `Invalid data provided: ${JSON.stringify(data)}. Valid keys are: ${validKeys.join(", ")}`
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
          ...data
        };
      });

      const newState = {
        ...stepperState,
        steps: updatedSteps
      };

      updateStepperState(newState);
      saveToLocalStorage(newState);

      return newState;
    },
    [stepperState, updateStepperState, saveToLocalStorage]
  );

  const updateConfig = useCallback(
    (newConfig: ValidationConfigStepper) => {
      setConfig((prev) => {
        const newConfigCombined = { ...prev, ...newConfig };

        // Simple comparison to avoid JSON.stringify issues with circular references
        const hasConfigChanged = () => {
          // Compare basic properties
          if (prev.saveLocalStorage !== newConfigCombined.saveLocalStorage)
            return true;

          // Compare steps array length and basic properties
          const prevSteps = prev.steps || [];
          const newSteps = newConfigCombined.steps || [];

          if (prevSteps.length !== newSteps.length) return true;

          // Compare step properties (excluding component which can have circular refs)
          for (let i = 0; i < newSteps.length; i++) {
            const prevStep = prevSteps[i];
            const newStep = newSteps[i];

            if (!prevStep || !newStep) return true;
            if (prevStep.name !== newStep.name) return true;
            if (prevStep.canAccess !== newStep.canAccess) return true;
            if (prevStep.canEdit !== newStep.canEdit) return true;
            if (prevStep.isOptional !== newStep.isOptional) return true;
            if (prevStep.isCompleted !== newStep.isCompleted) return true;
          }

          // Compare validation config
          const prevValidations = prev.validations || {};
          const newValidations = newConfigCombined.validations || {};

          // Compare validations object - we know it has a specific structure
          if (
            prevValidations.goToStep?.canAccess !==
            newValidations.goToStep?.canAccess
          )
            return true;

          return false;
        };

        if (!hasConfigChanged()) {
          return prev; // Return the same reference to prevent unnecessary re-renders
        }

        return newConfigCombined;
      });
    },
    [setConfig]
  );

  return {
    setStepsInfo,
    updateGeneralState,
    updateSteps,
    updateConfig,
    cleanLocalStorage
  };
};
