import React, { useEffect, useMemo, useState } from "react";

import {
  StepperConfig,
  StepperContext,
  StepperState,
  StepProvider
} from "./types/StepTypes";
import { useStepNavigation } from "./useStepNavigation";
import { useStepsActions } from "./useStepsActions";

const createInitialState = <T,>(
  config?: StepperConfig
): { state: StepperState<T>; currentStep: number } => {
  const baseState: StepperState<T> = {
    generalInfo: {
      totalSteps: 0,
      currentProgress: 0,
      completedProgress: 0,
      canAccessProgress: 0
    },
    steps: [],
    generalState: {} as T,
    isLoadedFromLocalStorage: false
  };

  // Se saveLocalStorage está habilitado, tenta carregar do localStorage
  if (config?.saveLocalStorage) {
    try {
      const localStorageItem = localStorage.getItem("stepperState");

      if (localStorageItem) {
        const savedState: StepperState<T> = JSON.parse(localStorageItem);

        const completedSteps = savedState.steps.filter(
          (step) => step.isCompleted
        ).length;

        return {
          state: {
            ...savedState,
            isLoadedFromLocalStorage: true
          },
          currentStep: completedSteps
        };
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error loading from localStorage:", error);
    }
  }

  return {
    state: baseState,
    currentStep: 0
  };
};

const defaultConfig: StepperConfig = {
  steps: [],
  saveLocalStorage: true
};

export const StepsContext = React.createContext<StepperContext<unknown> | null>(
  null
);

export const StepsProvider = <T,>({
  children,
  initialConfig = defaultConfig
}: StepProvider<T>) => {
  const initialStateData = useMemo(
    () => createInitialState<T>(initialConfig),
    [initialConfig]
  );

  const [currentStep, setCurrentStep] = useState(initialStateData.currentStep);
  const [loading, setLoading] = useState(false);
  const [stepperState, updateStepperState] = useState(initialStateData.state);
  const [config, setConfig] = useState<StepperConfig>(initialConfig);

  const {
    setStepsInfo,
    updateSteps,
    updateGeneralState,
    updateConfig,
    cleanLocalStorage
  } = useStepsActions<T>({
    updateStepperState,
    stepperState,
    currentStep,
    setCurrentStep,
    config,
    setConfig
  });

  const { onNext, onPrev, goToStep } = useStepNavigation<T>({
    currentStep,
    setCurrentStep,
    stepperState,
    updateStepperState,
    setLoading,
    config
  });

  const currentActiveStep = stepperState.steps[currentStep] || {
    name: "",
    canAccess: false,
    canEdit: false,
    isOptional: false,
    isCompleted: false
  };

  // Inicializa steps automaticamente a partir do initialConfig
  useEffect(() => {
    if (initialConfig.steps && initialConfig.steps.length > 0) {
      setStepsInfo(initialConfig.steps);
    }
  }, [initialConfig.steps, setStepsInfo]);

  return (
    <StepsContext.Provider
      value={{
        activeStep: {
          ...currentActiveStep,
          index: currentStep,
          isLastStep: currentStep === stepperState.generalInfo.totalSteps - 1,
          isFirstStep: currentStep === 0
        },
        onNext,
        onPrev,
        goToStep,
        loading,
        stepperState,
        updateGeneralState,
        updateConfig,
        setStepsInfo,
        updateSteps,
        cleanLocalStorage
      }}
    >
      {children}
    </StepsContext.Provider>
  );
};
