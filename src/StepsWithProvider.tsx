import React from 'react';
import { StepsProvider } from './StepsContext';
import { StepProvider } from './types/StepTypes';

/**
 * HOC (Higher-Order Component) to wrap a component with the StepsProvider.
 *
 * @param Component - The React component to be wrapped by the StepsProvider.
 * @returns A new component with the StepsProvider as context.
 */

export const StepsWithProvider = <P extends object>(
  Component: React.ComponentType<P>,
) => {
  return function WrapperComponent(props: P & Partial<StepProvider<any>>) {
    const { initialConfig, ...rest } = props;

    return (
      <StepsProvider initialConfig={initialConfig}>
        <Component {...(rest as P)} />
      </StepsProvider>
    );
  };
};
