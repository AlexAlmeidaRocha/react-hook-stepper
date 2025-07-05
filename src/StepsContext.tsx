import React, { useState, useMemo } from 'react';
import {
  StepperState,
  StepperContext,
  StepProvider,
  StepperConfig,
} from './types/StepTypes';
import { useStepsActions } from './useStepsActions';
import { useStepNavigation } from './useStepNavigation';

const createInitialState = <T,>(
  config?: StepperConfig,
): { state: StepperState<T>; currentStep: number } => {
  const baseState: StepperState<T> = {
    generalInfo: {
      totalSteps: 0,
      currentProgress: 0,
      completedProgress: 0,
      canAccessProgress: 0,
    },
    steps: [],
    generalState: {} as T,
    isLoadedFromLocalStorage: false,
  };

  // Se saveLocalStorage está habilitado, tenta carregar do localStorage
  if (config?.saveLocalStorage) {
    try {
      const localStorageItem = localStorage.getItem('stepperState');
      if (localStorageItem) {
        const savedState: StepperState<T> = JSON.parse(localStorageItem);

        const completedSteps = savedState.steps.filter(
          (step) => step.isCompleted,
        ).length;

        return {
          state: {
            ...savedState,
            isLoadedFromLocalStorage: true,
          },
          currentStep: completedSteps,
        };
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }

  return {
    state: baseState,
    currentStep: 0,
  };
};

const defaultConfig: StepperConfig = {
  steps: [],
  saveLocalStorage: true,
};

export const StepsContext = React.createContext<StepperContext<any> | null>(
  null,
);

export const StepsProvider = <T,>({
  children,
  initialConfig = defaultConfig,
}: StepProvider<T>) => {
  // Carrega o estado inicial do localStorage se disponível
  const initialStateData = useMemo(
    () => createInitialState<T>(initialConfig),
    [initialConfig],
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
    cleanLocalStorage,
  } = useStepsActions<T>({
    updateStepperState,
    stepperState,
    currentStep,
    setCurrentStep,
    config,
    setConfig,
  });

  const { onNext, onPrev, goToStep } = useStepNavigation<T>({
    currentStep,
    setCurrentStep,
    stepperState,
    updateStepperState,
    setLoading,
    config,
  });

  const currentActiveStep = stepperState.steps[currentStep] || {
    name: '',
    canAccess: false,
    canEdit: false,
    isOptional: false,
    isCompleted: false,
  };

  return (
    <StepsContext.Provider
      value={{
        activeStep: {
          ...currentActiveStep,
          index: currentStep,
          isLastStep: currentStep === stepperState.generalInfo.totalSteps - 1,
          isFirstStep: currentStep === 0,
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
        cleanLocalStorage,
      }}
    >
      {children}
    </StepsContext.Provider>
  );
};
