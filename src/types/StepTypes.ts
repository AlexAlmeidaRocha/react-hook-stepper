export interface GeneralInfo {
  totalSteps: number;
  currentProgress: number;
  completedProgress: number;
  canAccessProgress: number;
}

export interface StepState {
  name: string;
  canAccess: boolean;
  canEdit: boolean;
  isOptional: boolean;
  isCompleted: boolean;
}

export interface ActiveStep extends StepState {
  isLastStep: boolean;
  isFirstStep: boolean;
  index: number;
}

export interface StepConfig extends Partial<StepState> {
  name: string;
  component: React.ReactNode;
}

export interface StepperState<T> {
  generalInfo: GeneralInfo;
  steps: StepState[];
  generalState: T;
}

export interface StepperContext<T> {
  activeStep: ActiveStep;
  onNext: (args?: {
    onCompleteStep?: StepStateCallback<T>;
    updateStepsStatus?: UpdateStepInput[];
    updateGeneralStates?: UpdateGeneralStateInput<T>;
  }) => void;
  onPrev: (args?: {
    onCompleteStep?: StepStateCallback<T>;
    updateStepsStatus?: UpdateStepInput[];
    updateGeneralStates?: UpdateGeneralStateInput<T>;
  }) => void;
  goToStep: (
    nextStep: number,
    args?: {
      onCompleteStep?: StepStateCallback<T>;
      updateStepsStatus?: UpdateStepInput[];
      updateGeneralStates?: UpdateGeneralStateInput<T>;
    },
  ) => void;
  loading: boolean;
  stepperState: StepperState<T>;
  updateGeneralState: (args: UpdateGeneralStateInput<T>) => StepperState<T>;
  updateConfig: (config: ValidationConfigStepper) => void;
  updateSteps: (updateSteps: UpdateStepInput[]) => StepperState<T>;
  setStepsInfo: (steps: StepConfig[]) => void;
  updateStateWithLocalStorage: (state: StepperState<T>) => void;
  cleanLocalStorage: () => void;
}

export interface UseStepNavigationProps<T> {
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  stepperState: StepperState<T>;
  updateStepperState: React.Dispatch<React.SetStateAction<StepperState<T>>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  config: StepperConfig;
}

export interface UseStepsActionsProps<T> {
  updateStepperState: React.Dispatch<React.SetStateAction<StepperState<T>>>;
  stepperState: StepperState<T>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  setConfig: React.Dispatch<React.SetStateAction<StepperConfig>>;
  config: StepperConfig;
}

export type StepStateCallback<T> = (
  state: StepperState<T>,
) => Promise<void> | void;
export type StepStateCallback2<T> = (formData: T) => Promise<void> | void;
export type UpdateStepInput = {
  stepIndex: number;
  data: Partial<
    Pick<StepState, 'canAccess' | 'canEdit' | 'isOptional' | 'isCompleted'>
  >;
};
export type UpdateGeneralStateInput<T> = {
  stepIndex?: number;
  data: Partial<T>;
};

export interface StepperConfig extends ValidationConfigStepper {
  steps: StepConfig[];
}

export interface ValidationConfigStepper {
  validations?: {
    goToStep?: {
      canAccess?: boolean;
    };
  };
  next?: {
    currentStep?: Partial<Omit<StepState, 'name'>>;
    nextStep?: Partial<Omit<StepState, 'name'>>;
  };
  prev?: {
    currentStep?: Partial<Omit<StepState, 'name'>>;
    prevStep?: Partial<Omit<StepState, 'name'>>;
  };
  goToStep?: {
    currentStep?: Partial<Omit<StepState, 'name'>>;
    nextStep?: Partial<Omit<StepState, 'name'>>;
  };
  saveLocalStorage?: boolean;
}

export interface StepProvider<T> {
  children: React.ReactNode;
  initialConfig?: StepperConfig;
}
