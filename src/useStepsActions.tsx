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
  const setStepsInfo = useCallback((steps: StepConfig[]) => {
    const newState = {
      ...stepperState,
      generalInfo: {
        totalSteps: steps.length,
        currentProgress: 0,
        completedProgress: 0,
        canAccessProgress: 0,
      },
      steps: steps.map((step: StepConfig) => ({
        name: step.name,
        canAccess: step.canAccess || false,
        canEdit: step.canEdit || false,
        isOptional: step.isOptional || false,
        isCompleted: step.isCompleted || false,
      })),
    };
    updateStepperState(newState);
  }, []);

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
          canAccess: step.canAccess || false,
          canEdit: step.canEdit || false,
          isOptional: step.isOptional || false,
          isCompleted: step.isCompleted || false,
        })),
        generalState: stepperState.generalState,
      };
      setCurrentStep(
        stepperState.steps.filter((step) => step.isCompleted === true).length ||
          0,
      );
      updateStepperState(newState);
    },
    [],
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

      if (config.saveLocalStorage) {
        localStorage.setItem('stepperState', JSON.stringify(newState));
      }

      return newState;
    },
    [currentStep, stepperState],
  );

  const updateSteps = useCallback(
    (updates: UpdateStepInput[]): StepperState<T> => {
      const validKeys: (keyof StepState)[] = [
        'canAccess',
        'canEdit',
        'isOptional',
        'isCompleted',
      ];

      updates.forEach(({ data }) => {
        const isValidData = Object.keys(data).every((key) =>
          validKeys.includes(key as keyof StepState),
        );

        if (!isValidData) {
          throw new Error(
            `Invalid data provided: ${JSON.stringify(data)}. Valid keys are: ${validKeys.join(', ')}`,
          );
        }
      });

      const updatedSteps = [...stepperState.steps];
      updates.forEach(({ stepIndex, data }) => {
        if (stepIndex < 0 || stepIndex >= updatedSteps.length) {
          throw new Error(`Invalid stepIndex: ${stepIndex}.`);
        }
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

      if (config.saveLocalStorage) {
        localStorage.setItem('stepperState', JSON.stringify(newState));
      }

      return newState;
    },
    [currentStep, stepperState],
  );

  // const addError = useCallback(
  //   (stepIndex: number, message: string) => {
  //     if (
  //       stepperState.errors?.find(
  //         (error) => error.step === stepIndex && error.message === message,
  //       )
  //     ) {
  //       return;
  //     }
  //     const newState = {
  //       ...stepperState,
  //       errors: [
  //         ...(stepperState.errors || []),
  //         {
  //           step: stepIndex,
  //           message,
  //         },
  //       ],
  //     };

  //     if (config.saveLocalStorage) {
  //       localStorage.setItem('stepperState', JSON.stringify(newState));
  //     }

  //     updateStepperState(newState);
  //   },
  //   [currentStep, stepperState],
  // );

  // const removeError = useCallback(
  //   (stepIndex: number) => {
  //     updateStepperState((prevState) => {
  //       const newState = {
  //         ...prevState,
  //         errors:
  //           prevState.errors?.filter((error) => error.step !== stepIndex),
  //       };

  //       if (config.saveLocalStorage) {
  //         localStorage.setItem('stepperState', JSON.stringify(newState));
  //       }

  //       return newState; // Retornando o novo estado para ser aplicado corretamente
  //     });
  //   },
  //   [currentStep, stepperState],
  // );

  const updateConfig = useCallback((config: ValidationConfigStepper) => {
    setConfig((prev) => ({
      ...prev,
      ...config,
    }));
  }, []);

  return {
    setStepsInfo,
    updateStateWithLocalStorage,
    updateGeneralState,
    updateSteps,
    updateConfig,
    cleanLocalStorage,
  };
};
