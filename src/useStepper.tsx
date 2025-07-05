import { useContext, useEffect, useRef } from 'react';
import { StepperConfig, StepperContext, StepperState } from './types/StepTypes';
import { StepsContext } from './StepsContext';

/**
 * Custom hook to access the steps context (StepsContext).
 *
 * @param config - Optional initial configuration object. Should only be passed in the component responsible for configuring the steps.
 * @returns The steps context, containing functions and states needed to manage the steps.
 * @throws An error if the hook is used outside of the StepsProvider.
 *
 * ### Examples:
 *
 * #### Without initial configuration:
 * Used in components that only consume the context, without managing the steps.
 * You can pass a generic type to type the step state.
 * ```tsx
 * const { onNext, activeStep } = useStepper<TGeneric>();
 *
 * const handleNext = () => {
 *   onNext();
 * };
 *
 * return (
 *   <div>
 *     <h1>Current Step: {activeStep?.name || 'None'}</h1>
 *     <button onClick={handleNext}>Next</button>
 *   </div>
 * );
 * ```
 *
 * #### With initial configuration:
 * Used in the component responsible for configuring and managing the steps.
 * ```tsx
 * const steps = [
 *   { name: 'Step 1', component: <div>Step 1</div> },
 *   { name: 'Step 2', component: <div>Step 2</div> },
 * ];
 * const { stepperState, goToStep } = useStepper({ steps });
 *
 * return (
 *   <div>
 *     {stepperState.steps.map((step, index) => (
 *       <button key={index} onClick={() => goToStep(index)}>
 *         {step.name}
 *       </button>
 *     ))}
 *   </div>
 * );
 * ```
 */

export const useStepper = <T,>(config?: StepperConfig) => {
  const context: StepperContext<T> | null = useContext(StepsContext);
  if (!context) {
    throw new Error('useStepper must be used within a StepProvider');
  }

  const { updateConfig, setStepsInfo, ...stepContext } = context;

  const configRef = useRef<StepperConfig | undefined>();

  useEffect(() => {
    if (!config) return;

    // Simple comparison to avoid JSON.stringify issues with circular references
    const hasConfigChanged = () => {
      const prev = configRef.current;
      if (!prev) return true;

      // Compare basic properties
      if (prev.saveLocalStorage !== config.saveLocalStorage) return true;

      // Compare steps array length and basic properties
      const prevSteps = prev.steps || [];
      const currentSteps = config.steps || [];

      if (prevSteps.length !== currentSteps.length) return true;

      // Compare step properties (excluding component which can have circular refs)
      for (let i = 0; i < currentSteps.length; i++) {
        const prevStep = prevSteps[i];
        const currentStep = currentSteps[i];

        if (!prevStep || !currentStep) return true;
        if (prevStep.name !== currentStep.name) return true;
        if (prevStep.canAccess !== currentStep.canAccess) return true;
        if (prevStep.canEdit !== currentStep.canEdit) return true;
        if (prevStep.isOptional !== currentStep.isOptional) return true;
        if (prevStep.isCompleted !== currentStep.isCompleted) return true;
      }

      // Compare validation config
      const prevValidations = prev.validations || {};
      const currentValidations = config.validations || {};

      // Compare validations object - we know it has a specific structure
      if (
        prevValidations.goToStep?.canAccess !==
        currentValidations.goToStep?.canAccess
      )
        return true;

      return false;
    };

    if (!hasConfigChanged()) return;

    configRef.current = config;

    // Apply config changes
    updateConfig(config);

    if (config.steps) {
      setStepsInfo(config.steps);
    }
  }, [config, updateConfig, setStepsInfo]);

  return stepContext;
};
