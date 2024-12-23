import React, { useState } from 'react';
import {
  StepperState,
  StepperContext,
  StepProvider,
  StepperConfig,
} from './types/StepTypes';
import { useStepsActions } from './useStepsActions';
import { useStepNavigation } from './useStepNavigation';

const initialState: StepperState<any> = {
  generalInfo: {
    totalSteps: 0,
    currentProgress: 0,
    completedProgress: 0,
    canAccessProgress: 0,
  },
  steps: [],
  generalState: {},
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
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stepperState, updateStepperState] = useState(initialState);
  const [config, setConfig] = useState<StepperConfig>(initialConfig);

  const {
    setStepsInfo,
    updateSteps,
    updateGeneralState,
    updateConfig,
    updateStateWithLocalStorage,
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

  return (
    <StepsContext.Provider
      value={{
        activeStep: {
          ...stepperState.steps[currentStep],
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
        updateStateWithLocalStorage,
        updateSteps,
        cleanLocalStorage,
      }}
    >
      {children}
    </StepsContext.Provider>
  );
};
