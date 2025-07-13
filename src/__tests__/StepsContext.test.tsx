import React from "react";
import { act, render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";

import { useContext } from "react";

import { StepsContext, StepsProvider } from "../StepsContext";
import { StepperConfig } from "../types/StepTypes";
import { useStepper } from "../useStepper";

// Mock components
const TestComponent = () => {
  const context = useContext(StepsContext);

  if (!context) {
    return <div>No context</div>;
  }

  return (
    <div>
      <div data-testid="total-steps">
        {context.stepperState.generalInfo.totalSteps}
      </div>
      <div data-testid="current-step">{context.activeStep.index}</div>
      <div data-testid="active-step-name">{context.activeStep.name}</div>
      <div data-testid="is-first-step">
        {context.activeStep.isFirstStep.toString()}
      </div>
      <div data-testid="is-last-step">
        {context.activeStep.isLastStep.toString()}
      </div>
      <div data-testid="loading">{context.loading.toString()}</div>
      <button data-testid="next-button" onClick={() => context.onNext()}>
        Next
      </button>
      <button data-testid="prev-button" onClick={() => context.onPrev()}>
        Previous
      </button>
      <button data-testid="goto-button" onClick={() => context.goToStep(1)}>
        Go to Step 1
      </button>
    </div>
  );
};

const mockSteps = [
  { name: "Step 1", component: <div>Step 1</div> },
  { name: "Step 2", component: <div>Step 2</div> },
  { name: "Step 3", component: <div>Step 3</div> }
];

const mockConfig: StepperConfig = {
  steps: mockSteps,
  saveLocalStorage: false
};

describe("StepsContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should provide initial context values", () => {
    render(
      <StepsProvider>
        <TestComponent />
      </StepsProvider>
    );

    expect(screen.getByTestId("total-steps")).toHaveTextContent("0");
    expect(screen.getByTestId("current-step")).toHaveTextContent("0");
    expect(screen.getByTestId("is-first-step")).toHaveTextContent("true");
    expect(screen.getByTestId("is-last-step")).toHaveTextContent("false");
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
  });

  it("should provide context with initial config", () => {
    const TestComponentWithStepper = () => {
      const context = useContext(StepsContext);
      useStepper(mockConfig);

      if (!context) {
        return <div>No context</div>;
      }

      return (
        <div>
          <div data-testid="total-steps">
            {context.stepperState.generalInfo.totalSteps}
          </div>
          <div data-testid="current-step">{context.activeStep.index}</div>
          <div data-testid="active-step-name">{context.activeStep.name}</div>
          <div data-testid="is-first-step">
            {context.activeStep.isFirstStep.toString()}
          </div>
          <div data-testid="is-last-step">
            {context.activeStep.isLastStep.toString()}
          </div>
        </div>
      );
    };

    render(
      <StepsProvider initialConfig={mockConfig}>
        <TestComponentWithStepper />
      </StepsProvider>
    );

    expect(screen.getByTestId("total-steps")).toHaveTextContent("3");
    expect(screen.getByTestId("active-step-name")).toHaveTextContent("Step 1");
    expect(screen.getByTestId("is-first-step")).toHaveTextContent("true");
    expect(screen.getByTestId("is-last-step")).toHaveTextContent("false");
  });

  it("should handle navigation between steps", async () => {
    const TestComponentWithStepper = () => {
      const context = useContext(StepsContext);
      useStepper(mockConfig);

      if (!context) {
        return <div>No context</div>;
      }

      return (
        <div>
          <div data-testid="current-step">{context.activeStep.index}</div>
          <div data-testid="active-step-name">{context.activeStep.name}</div>
          <div data-testid="is-first-step">
            {context.activeStep.isFirstStep.toString()}
          </div>
          <div data-testid="is-last-step">
            {context.activeStep.isLastStep.toString()}
          </div>
          <button data-testid="next-button" onClick={() => context.onNext()}>
            Next
          </button>
        </div>
      );
    };

    render(
      <StepsProvider>
        <TestComponentWithStepper />
      </StepsProvider>
    );

    // Wait for initialization
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Initial state
    expect(screen.getByTestId("current-step")).toHaveTextContent("0");
    expect(screen.getByTestId("active-step-name")).toHaveTextContent("Step 1");

    // Navigate to next step
    await act(async () => {
      screen.getByTestId("next-button").click();
    });

    expect(screen.getByTestId("current-step")).toHaveTextContent("1");
    expect(screen.getByTestId("active-step-name")).toHaveTextContent("Step 2");
    expect(screen.getByTestId("is-first-step")).toHaveTextContent("false");
    expect(screen.getByTestId("is-last-step")).toHaveTextContent("false");
  });

  it("should handle navigation to last step", async () => {
    // Config with validation disabled for direct navigation
    const configWithoutValidation: StepperConfig = {
      ...mockConfig,
      validations: {
        goToStep: {
          canAccess: false // Disable access validation
        }
      }
    };

    const TestComponentWithStepper = () => {
      const context = useContext(StepsContext);
      useStepper(configWithoutValidation);

      if (!context) {
        return <div>No context</div>;
      }

      return (
        <div>
          <div data-testid="current-step">{context.activeStep.index}</div>
          <div data-testid="active-step-name">{context.activeStep.name}</div>
          <div data-testid="is-first-step">
            {context.activeStep.isFirstStep.toString()}
          </div>
          <div data-testid="is-last-step">
            {context.activeStep.isLastStep.toString()}
          </div>
          <div data-testid="total-steps">
            {context.stepperState.generalInfo.totalSteps}
          </div>
          <button data-testid="next-button" onClick={() => context.onNext()}>
            Next
          </button>
          <button data-testid="goto-button" onClick={() => context.goToStep(2)}>
            Go to Step 2
          </button>
        </div>
      );
    };

    render(
      <StepsProvider>
        <TestComponentWithStepper />
      </StepsProvider>
    );

    // Wait for initialization
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Check that steps are loaded
    expect(screen.getByTestId("total-steps")).toHaveTextContent("3");

    // Navigate to last step
    await act(async () => {
      screen.getByTestId("goto-button").click();
    });

    expect(screen.getByTestId("current-step")).toHaveTextContent("2");
    expect(screen.getByTestId("active-step-name")).toHaveTextContent("Step 3");
    expect(screen.getByTestId("is-first-step")).toHaveTextContent("false");
    expect(screen.getByTestId("is-last-step")).toHaveTextContent("true");
  });

  it("should handle previous navigation", async () => {
    const TestComponentWithStepper = () => {
      const context = useContext(StepsContext);
      useStepper(mockConfig);

      if (!context) {
        return <div>No context</div>;
      }

      return (
        <div>
          <div data-testid="current-step">{context.activeStep.index}</div>
          <div data-testid="active-step-name">{context.activeStep.name}</div>
          <div data-testid="is-first-step">
            {context.activeStep.isFirstStep.toString()}
          </div>
          <button data-testid="next-button" onClick={() => context.onNext()}>
            Next
          </button>
          <button data-testid="prev-button" onClick={() => context.onPrev()}>
            Previous
          </button>
        </div>
      );
    };

    render(
      <StepsProvider>
        <TestComponentWithStepper />
      </StepsProvider>
    );

    // Wait for initialization
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Navigate to step 1 first
    await act(async () => {
      screen.getByTestId("next-button").click();
    });

    expect(screen.getByTestId("current-step")).toHaveTextContent("1");

    // Navigate back to previous step
    await act(async () => {
      screen.getByTestId("prev-button").click();
    });

    expect(screen.getByTestId("current-step")).toHaveTextContent("0");
    expect(screen.getByTestId("active-step-name")).toHaveTextContent("Step 1");
    expect(screen.getByTestId("is-first-step")).toHaveTextContent("true");
  });

  it("should show loading state during navigation", async () => {
    const TestComponentWithStepper = () => {
      const context = useContext(StepsContext);
      useStepper(mockConfig);

      if (!context) {
        return <div>No context</div>;
      }

      return (
        <div>
          <div data-testid="loading">{context.loading.toString()}</div>
          <button data-testid="next-button" onClick={() => context.onNext()}>
            Next
          </button>
        </div>
      );
    };

    render(
      <StepsProvider>
        <TestComponentWithStepper />
      </StepsProvider>
    );

    // Wait for initialization
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(screen.getByTestId("loading")).toHaveTextContent("false");

    // Start navigation
    await act(async () => {
      screen.getByTestId("next-button").click();
    });

    // Loading should be false after navigation completes
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
  });

  it("should handle empty steps array", () => {
    const emptyConfig: StepperConfig = {
      steps: [],
      saveLocalStorage: false
    };

    render(
      <StepsProvider initialConfig={emptyConfig}>
        <TestComponent />
      </StepsProvider>
    );

    expect(screen.getByTestId("total-steps")).toHaveTextContent("0");
    expect(screen.getByTestId("current-step")).toHaveTextContent("0");
    expect(screen.getByTestId("active-step-name")).toHaveTextContent("");
    expect(screen.getByTestId("is-first-step")).toHaveTextContent("true");
    expect(screen.getByTestId("is-last-step")).toHaveTextContent("false");
  });

  it("should provide all required context methods", () => {
    const MethodTestComponent = () => {
      const context = useContext(StepsContext);

      if (!context) {
        return <div>No context</div>;
      }

      return (
        <div>
          <div data-testid="has-onNext">
            {typeof context.onNext === "function" ? "true" : "false"}
          </div>
          <div data-testid="has-onPrev">
            {typeof context.onPrev === "function" ? "true" : "false"}
          </div>
          <div data-testid="has-goToStep">
            {typeof context.goToStep === "function" ? "true" : "false"}
          </div>
          <div data-testid="has-updateGeneralState">
            {typeof context.updateGeneralState === "function"
              ? "true"
              : "false"}
          </div>
          <div data-testid="has-updateConfig">
            {typeof context.updateConfig === "function" ? "true" : "false"}
          </div>
          <div data-testid="has-setStepsInfo">
            {typeof context.setStepsInfo === "function" ? "true" : "false"}
          </div>
          <div data-testid="has-updateSteps">
            {typeof context.updateSteps === "function" ? "true" : "false"}
          </div>
          <div data-testid="has-cleanLocalStorage">
            {typeof context.cleanLocalStorage === "function" ? "true" : "false"}
          </div>
        </div>
      );
    };

    render(
      <StepsProvider>
        <MethodTestComponent />
      </StepsProvider>
    );

    expect(screen.getByTestId("has-onNext")).toHaveTextContent("true");
    expect(screen.getByTestId("has-onPrev")).toHaveTextContent("true");
    expect(screen.getByTestId("has-goToStep")).toHaveTextContent("true");
    expect(screen.getByTestId("has-updateGeneralState")).toHaveTextContent(
      "true"
    );
    expect(screen.getByTestId("has-updateConfig")).toHaveTextContent("true");
    expect(screen.getByTestId("has-setStepsInfo")).toHaveTextContent("true");
    expect(screen.getByTestId("has-updateSteps")).toHaveTextContent("true");
    expect(screen.getByTestId("has-cleanLocalStorage")).toHaveTextContent(
      "true"
    );
  });
});
