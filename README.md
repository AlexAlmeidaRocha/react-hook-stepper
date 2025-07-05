# React Hook Stepper

A powerful, flexible, and type-safe React hook for managing multi-step workflows with ease.

[![npm version](https://badge.fury.io/js/react-hook-stepper.svg)](https://badge.fury.io/js/react-hook-stepper)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

## ✨ Features

- 🎯 **Type-safe** - Full TypeScript support with generic state typing
- 🔄 **Flexible Navigation** - Go forward, backward, or jump to any step
- 💾 **Local Storage** - Optional persistence across browser sessions
- 🎨 **Customizable** - Extensive configuration options for step behavior
- 🔧 **Validation** - Built-in step access control and validation
- 📦 **Lightweight** - Minimal dependencies, maximum performance
- 🧪 **Well-tested** - Comprehensive test coverage

## 🚀 Quick Start

### Installation

```bash
# npm
npm install react-hook-stepper

# pnpm
pnpm add react-hook-stepper

# yarn
yarn add react-hook-stepper
```

> **Note**: TypeScript types are included! No need to install `@types/react-hook-stepper` separately.

### Basic Usage

```tsx
import React from 'react';
import { StepsProvider, useStepper } from 'react-hook-stepper';

// Step Components
const Step1 = () => {
  const { onNext, activeStep } = useStepper();

  return (
    <div>
      <h2>Welcome to Step 1</h2>
      <p>
        Step {activeStep.index + 1} of {stepperState.generalInfo.totalSteps}
      </p>
      <button onClick={() => onNext()}>Next</button>
    </div>
  );
};

const Step2 = () => {
  const { onNext, onPrev, activeStep } = useStepper();

  return (
    <div>
      <h2>Step 2 - Configuration</h2>
      <button onClick={() => onPrev()}>Previous</button>
      <button onClick={() => onNext()}>Next</button>
    </div>
  );
};

const Step3 = () => {
  const { onNext, onPrev, activeStep } = useStepper();

  return (
    <div>
      <h2>Step 3 - Confirmation</h2>
      <button onClick={() => onPrev()}>Previous</button>
      <button onClick={() => onNext()}>Next</button>
    </div>
  );
};

// Main Component
const StepperApp = () => {
  const steps = [
    { name: 'Welcome', component: <Step1 /> },
    { name: 'Configuration', component: <Step2 /> },
    { name: 'Confirmation', component: <Step3 /> },
  ];

  const { stepperState, activeStep, goToStep } = useStepper({ steps });

  return (
    <div>
      {/* Step Navigation */}
      <nav>
        {stepperState.steps.map((step, index) => (
          <button
            key={index}
            onClick={() => goToStep(index)}
            disabled={!step.canAccess}
            className={activeStep.index === index ? 'active' : ''}
          >
            {step.name}
          </button>
        ))}
      </nav>

      {/* Current Step Content */}
      <main>{steps[activeStep.index]?.component}</main>
    </div>
  );
};

// App with Provider
const App = () => (
  <StepsProvider>
    <StepperApp />
  </StepsProvider>
);

export default App;
```

## 📚 API Reference

### Hook Returns

The `useStepper` hook returns an object with the following properties:

#### `stepperState`

The complete state of the stepper including steps configuration and general information.

```tsx
interface StepperState<T> {
  generalInfo: {
    totalSteps: number;
    currentProgress: number;
    completedProgress: number;
    canAccessProgress: number;
  };
  steps: StepState[];
  generalState: T; // Your custom state type
}
```

#### `activeStep`

Information about the currently active step:

```tsx
interface ActiveStep {
  name: string;
  canAccess: boolean;
  canEdit: boolean;
  isOptional: boolean;
  isCompleted: boolean;
  index: number;
  isLastStep: boolean;
  isFirstStep: boolean;
}
```

#### `loading`

Boolean indicating if any navigation operation is in progress.

### Navigation Functions

#### `onNext(options?)`

Moves to the next step with optional configuration.

```tsx
const { onNext } = useStepper();

// Simple navigation
onNext();

// With custom logic
onNext({
  updateStepsStatus: [
    { stepIndex: 2, data: { canAccess: true, canEdit: true } },
  ],
  updateGeneralStates: {
    data: { userData: { name: 'John', email: 'john@example.com' } },
  },
  onCompleteStep: async (state) => {
    // Custom async logic
    await saveUserData(state.generalState);
    console.log('Step completed!');
  },
});
```

#### `onPrev(options?)`

Moves to the previous step with the same options as `onNext`.

```tsx
const { onPrev } = useStepper();

onPrev({
  updateStepsStatus: [{ stepIndex: 0, data: { canEdit: true } }],
});
```

#### `goToStep(index, options?)`

Navigates directly to a specific step by index.

```tsx
const { goToStep } = useStepper();

// Jump to step 3
goToStep(2, {
  onCompleteStep: (state) => {
    console.log('Navigated to step 3');
  },
});
```

### State Management Functions

#### `updateGeneralState(update)`

Updates the general state shared across all steps.

```tsx
const { updateGeneralState } = useStepper<UserData>();

const updatedState = updateGeneralState({
  data: {
    user: { name: 'Jane', age: 25 },
    preferences: { theme: 'dark' },
  },
});
```

#### `updateSteps(updates)`

Updates configuration for one or more steps.

```tsx
const { updateSteps } = useStepper();

updateSteps([
  { stepIndex: 1, data: { canAccess: true, isCompleted: true } },
  { stepIndex: 2, data: { canEdit: false } },
]);
```

#### `cleanLocalStorage()`

Clears step-related data from localStorage.

```tsx
const { cleanLocalStorage } = useStepper();

const handleReset = () => {
  cleanLocalStorage();
  // Optionally reset to first step
  goToStep(0);
};
```

## 🎯 TypeScript Support

### Generic State Typing

Type your step data with TypeScript generics for better development experience:

```tsx
// Define your step data types
interface FormData {
  personalInfo: {
    name: string;
    email: string;
    age: number;
  };
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
  confirmation: {
    terms: boolean;
    newsletter: boolean;
  };
}

// Use with your components
const PersonalInfoStep = () => {
  const { onNext, stepperState } = useStepper<FormData>();

  const handleNext = (formData: FormData['personalInfo']) => {
    onNext({
      updateGeneralStates: {
        data: { personalInfo: formData },
      },
    });
  };

  return <form onSubmit={handleNext}>{/* Your form fields */}</form>;
};
```

### Progressive Type Building

Build your types progressively as you add steps:

```tsx
// Base type
interface Step1Data {
  step1: {
    username: string;
    email: string;
  };
}

// Extend for step 2
interface Step2Data extends Step1Data {
  step2: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
}

// Extend for step 3
interface Step3Data extends Step2Data {
  step3: {
    preferences: {
      theme: string;
      language: string;
    };
  };
}
```

## ⚙️ Configuration Options

### Step Validation Configuration

Control step behavior with detailed validation options:

```tsx
const config = {
  steps: [
    { name: 'Personal Info', component: <PersonalInfoStep /> },
    { name: 'Preferences', component: <PreferencesStep /> },
    { name: 'Review', component: <ReviewStep /> },
  ],
  // Navigation behavior configuration
  next: {
    currentStep: {
      canAccess: true,
      canEdit: true,
      isCompleted: true,
    },
    nextStep: {
      canAccess: true,
      canEdit: false,
    },
  },
  prev: {
    currentStep: {
      canEdit: true,
      isCompleted: false,
    },
    prevStep: {
      canAccess: true,
      canEdit: true,
    },
  },
  goToStep: {
    currentStep: {
      isCompleted: true,
    },
    nextStep: {
      canAccess: true,
    },
  },
  validations: {
    goToStep: {
      canAccess: true, // Only allow navigation to accessible steps
    },
  },
  saveLocalStorage: true, // Enable persistence
};

const { stepperState } = useStepper(config);
```

### Configuration Properties

| Property                         | Type                 | Default | Description                                              |
| -------------------------------- | -------------------- | ------- | -------------------------------------------------------- |
| `steps`                          | `StepConfig[]`       | `[]`    | Array of step configurations                             |
| `saveLocalStorage`               | `boolean`            | `true`  | Enable localStorage persistence                          |
| `validations.goToStep.canAccess` | `boolean`            | `true`  | Validate step access on navigation                       |
| `next.currentStep`               | `Partial<StepState>` | `{}`    | Properties to set on current step when going forward     |
| `next.nextStep`                  | `Partial<StepState>` | `{}`    | Properties to set on next step when navigating to it     |
| `prev.currentStep`               | `Partial<StepState>` | `{}`    | Properties to set on current step when going back        |
| `prev.prevStep`                  | `Partial<StepState>` | `{}`    | Properties to set on previous step when navigating to it |

## 💾 Local Storage Integration

The library automatically handles state persistence:

```tsx
const StepperWithPersistence = () => {
  const { stepperState, cleanLocalStorage } = useStepper({
    steps: mySteps,
    saveLocalStorage: true, // Enable persistence
  });

  // Data is automatically saved and restored
  // Clear manually if needed
  const handleReset = () => {
    cleanLocalStorage();
    // Optionally refresh the page or reset state
  };

  return (
    <div>
      <button onClick={handleReset}>Reset Progress</button>
      {/* Your stepper UI */}
    </div>
  );
};
```

**Note:** localStorage is automatically cleared when the user completes the final step.

## 🔧 Usage Patterns

### Using StepsProvider (Recommended)

The provider pattern gives you full control over the stepper configuration:

```tsx
import { StepsProvider, useStepper } from 'react-hook-stepper';

const MultiStepForm = () => {
  const steps = [
    { name: 'Personal Info', component: <PersonalInfoStep /> },
    { name: 'Address', component: <AddressStep /> },
    { name: 'Payment', component: <PaymentStep /> },
    { name: 'Review', component: <ReviewStep /> },
  ];

  const { stepperState, activeStep, goToStep } = useStepper({ steps });

  return (
    <div className="stepper-container">
      {/* Progress Indicator */}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${stepperState.generalInfo.currentProgress}%` }}
        />
      </div>

      {/* Step Navigation */}
      <div className="step-tabs">
        {stepperState.steps.map((step, index) => (
          <button
            key={index}
            onClick={() => goToStep(index)}
            disabled={!step.canAccess}
            className={`step-tab ${activeStep.index === index ? 'active' : ''} ${step.isCompleted ? 'completed' : ''}`}
          >
            <span className="step-number">{index + 1}</span>
            <span className="step-name">{step.name}</span>
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="step-content">{steps[activeStep.index]?.component}</div>
    </div>
  );
};

const App = () => (
  <StepsProvider>
    <MultiStepForm />
  </StepsProvider>
);
```

### Using StepsWithProvider (HOC Pattern)

For simpler integration, use the Higher-Order Component pattern:

```tsx
import { StepsWithProvider, useStepper } from 'react-hook-stepper';

const SimpleStepperApp = () => {
  const steps = [
    { name: 'Welcome', component: <WelcomeStep /> },
    { name: 'Setup', component: <SetupStep /> },
    { name: 'Complete', component: <CompleteStep /> },
  ];

  const { stepperState, activeStep } = useStepper({ steps });

  return (
    <div>
      <h1>
        Step {activeStep.index + 1}: {activeStep.name}
      </h1>
      <div>{steps[activeStep.index]?.component}</div>
    </div>
  );
};

// Wrap your component with the HOC
export default StepsWithProvider(SimpleStepperApp);
```

### Real-World Example: User Registration Flow

```tsx
import React, { useState } from 'react';
import { StepsProvider, useStepper } from 'react-hook-stepper';

// Type definitions
interface RegistrationData {
  personal: {
    firstName: string;
    lastName: string;
    email: string;
  };
  account: {
    username: string;
    password: string;
  };
  preferences: {
    newsletter: boolean;
    theme: 'light' | 'dark';
  };
}

// Step 1: Personal Information
const PersonalInfoStep = () => {
  const { onNext, stepperState } = useStepper<RegistrationData>();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  const handleNext = async () => {
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email) {
      alert('Please fill all fields');
      return;
    }

    // Move to next step with data
    onNext({
      updateGeneralStates: {
        data: { personal: formData },
      },
      onCompleteStep: async (state) => {
        console.log('Personal info saved:', state.generalState.personal);
        // You could save to API here
      },
    });
  };

  return (
    <div>
      <h2>Personal Information</h2>
      <input
        type="text"
        placeholder="First Name"
        value={formData.firstName}
        onChange={(e) =>
          setFormData({ ...formData, firstName: e.target.value })
        }
      />
      <input
        type="text"
        placeholder="Last Name"
        value={formData.lastName}
        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <button onClick={handleNext}>Next</button>
    </div>
  );
};

// Step 2: Account Setup
const AccountSetupStep = () => {
  const { onNext, onPrev, stepperState } = useStepper<RegistrationData>();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleNext = () => {
    onNext({
      updateGeneralStates: {
        data: { account: formData },
      },
    });
  };

  return (
    <div>
      <h2>Account Setup</h2>
      <p>Welcome, {stepperState.generalState?.personal?.firstName}!</p>
      <input
        type="text"
        placeholder="Username"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      <button onClick={() => onPrev()}>Previous</button>
      <button onClick={handleNext}>Next</button>
    </div>
  );
};

// Step 3: Preferences
const PreferencesStep = () => {
  const { onNext, onPrev, stepperState } = useStepper<RegistrationData>();
  const [preferences, setPreferences] = useState<{
    newsletter: boolean;
    theme: 'light' | 'dark';
  }>({
    newsletter: false,
    theme: 'light',
  });

  const handleComplete = async () => {
    onNext({
      updateGeneralStates: {
        data: { preferences },
      },
      onCompleteStep: async (state) => {
        // Final step - save complete registration
        console.log('Complete registration data:', state.generalState);

        // API call to save user
        try {
          await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state.generalState),
          });
          alert('Registration successful!');
        } catch (error) {
          console.error('Registration failed:', error);
        }
      },
    });
  };

  return (
    <div>
      <h2>Preferences</h2>
      <label>
        <input
          type="checkbox"
          checked={preferences.newsletter}
          onChange={(e) =>
            setPreferences({ ...preferences, newsletter: e.target.checked })
          }
        />
        Subscribe to newsletter
      </label>
      <label>
        Theme:
        <select
          value={preferences.theme}
          onChange={(e) =>
            setPreferences({
              ...preferences,
              theme: e.target.value as 'light' | 'dark',
            })
          }
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
      <button onClick={() => onPrev()}>Previous</button>
      <button onClick={handleComplete}>Complete Registration</button>
    </div>
  );
};

// Main Registration Component
const UserRegistration = () => {
  const steps = [
    { name: 'Personal Info', component: <PersonalInfoStep /> },
    { name: 'Account Setup', component: <AccountSetupStep /> },
    { name: 'Preferences', component: <PreferencesStep /> },
  ];

  const { stepperState, activeStep, loading } = useStepper({
    steps,
    saveLocalStorage: true, // Save progress
  });

  if (loading) {
    return <div>Processing...</div>;
  }

  return (
    <div>
      <div className="progress">
        Step {activeStep.index + 1} of {stepperState.generalInfo.totalSteps}
      </div>
      {steps[activeStep.index]?.component}
    </div>
  );
};

// App with Provider
const App = () => (
  <StepsProvider>
    <UserRegistration />
  </StepsProvider>
);

export default App;
```

## 🎨 Advanced Examples

### Conditional Steps

Create dynamic workflows with conditional step logic:

```tsx
const ConditionalStepperApp = () => {
  const { stepperState, activeStep, updateSteps } = useStepper<{
    userType: 'basic' | 'premium';
  }>();

  const handleUserTypeChange = (userType: 'basic' | 'premium') => {
    // Enable/disable steps based on user type
    updateSteps([
      { stepIndex: 2, data: { canAccess: userType === 'premium' } },
      { stepIndex: 3, data: { isOptional: userType === 'basic' } },
    ]);
  };

  return <div>{/* Your stepper UI */}</div>;
};
```

### Async Step Validation

Handle asynchronous operations during step transitions:

```tsx
const AsyncValidationStep = () => {
  const { onNext, loading } = useStepper();

  const handleNext = async () => {
    onNext({
      onCompleteStep: async (state) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Validate with server
        const response = await fetch('/api/validate', {
          method: 'POST',
          body: JSON.stringify(state.generalState),
        });

        if (!response.ok) {
          throw new Error('Validation failed');
        }

        console.log('Step validated successfully');
      },
    });
  };

  return (
    <div>
      <h2>Validation Step</h2>
      <button onClick={handleNext} disabled={loading}>
        {loading ? 'Validating...' : 'Next'}
      </button>
    </div>
  );
};
```

### Step Progress Indicator

Create a visual progress indicator:

```tsx
const ProgressIndicator = () => {
  const { stepperState, activeStep, goToStep } = useStepper();

  return (
    <div className="progress-indicator">
      {stepperState.steps.map((step, index) => (
        <div
          key={index}
          className={`step-indicator ${
            index === activeStep.index ? 'active' : ''
          } ${step.isCompleted ? 'completed' : ''}`}
          onClick={() => step.canAccess && goToStep(index)}
        >
          <div className="step-circle">
            {step.isCompleted ? '✓' : index + 1}
          </div>
          <div className="step-label">{step.name}</div>
        </div>
      ))}
    </div>
  );
};
```

### Custom Step Transitions

Create custom animations or transitions between steps:

```tsx
const AnimatedStepper = () => {
  const { stepperState, activeStep } = useStepper();
  const [slideDirection, setSlideDirection] = useState('right');

  const steps = [
    { name: 'Step 1', component: <Step1 /> },
    { name: 'Step 2', component: <Step2 /> },
    { name: 'Step 3', component: <Step3 /> },
  ];

  useEffect(() => {
    // Determine slide direction based on step changes
    const prevIndex = stepperState.steps.findIndex((s) => s.isCompleted);
    setSlideDirection(activeStep.index > prevIndex ? 'right' : 'left');
  }, [activeStep.index]);

  return (
    <div className="animated-stepper">
      <div className={`step-content slide-${slideDirection}`}>
        {steps[activeStep.index]?.component}
      </div>
    </div>
  );
};
```

## 🚨 Common Pitfalls & Solutions

### 1. Using useStepper Outside Provider

```tsx
// ❌ This will throw an error
const BadComponent = () => {
  const { onNext } = useStepper(); // Error: must be used within StepProvider
  return <div>...</div>;
};

// ✅ Correct usage
const GoodComponent = () => (
  <StepsProvider>
    <ComponentThatUsesStep />
  </StepsProvider>
);
```

### 2. Mutating State Directly

```tsx
// ❌ Don't mutate state directly
const BadStep = () => {
  const { stepperState } = useStepper();

  const handleClick = () => {
    stepperState.generalState.someValue = 'new value'; // Don't do this!
  };

  return <button onClick={handleClick}>Bad Update</button>;
};

// ✅ Use proper update functions
const GoodStep = () => {
  const { updateGeneralState } = useStepper();

  const handleClick = () => {
    updateGeneralState({
      data: { someValue: 'new value' },
    });
  };

  return <button onClick={handleClick}>Good Update</button>;
};
```

## 🔧 Troubleshooting

### TypeScript Issues

#### "Cannot find module 'react-hook-stepper' or its corresponding type declarations"

This library includes TypeScript declarations built-in. If you're seeing this error:

1. **Don't install `@types/react-hook-stepper`** - it doesn't exist and isn't needed
2. **Make sure you have the latest version**:
   ```bash
   npm install react-hook-stepper@latest
   ```
3. **Check your TypeScript configuration** - ensure `moduleResolution` is set to `"node"` in `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "node"
     }
   }
   ```
4. **Restart your TypeScript server** in VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

#### Generic Type Issues

If you're having issues with generic types, make sure to provide the type parameter:

```tsx
// ❌ This might cause type issues
const { stepperState } = useStepper();

// ✅ Provide your state type
interface MyStepData {
  user: { name: string; email: string };
  preferences: { theme: string };
}

const { stepperState } = useStepper<MyStepData>();
```

### Runtime Issues

#### "useStepper must be used within a StepProvider"

Make sure your component is wrapped with `StepsProvider`:

```tsx
// ❌ This will throw an error
const MyComponent = () => {
  const { onNext } = useStepper(); // Error!
  return <div>...</div>;
};

// ✅ Wrap with provider
const App = () => (
  <StepsProvider>
    <MyComponent />
  </StepsProvider>
);
```

### Performance Issues

#### Steps re-rendering too often

If you notice performance issues, make sure you're not recreating the steps array on every render:

```tsx
// ❌ This creates a new array every render
const MyComponent = () => {
  const steps = [
    { name: 'Step 1', component: <Step1 /> },
    { name: 'Step 2', component: <Step2 /> },
  ];

  const { stepperState } = useStepper({ steps });
  // ...
};

// ✅ Move steps outside or use useMemo
const steps = [
  { name: 'Step 1', component: <Step1 /> },
  { name: 'Step 2', component: <Step2 /> },
];

const MyComponent = () => {
  const { stepperState } = useStepper({ steps });
  // ...
};
```

## 📋 Best Practices

1. **Use TypeScript** - Define your step data types for better development experience
2. **Validate Early** - Check form data before allowing navigation
3. **Handle Loading States** - Show loading indicators during async operations
4. **Provide Clear Navigation** - Make it obvious how users can move between steps
5. **Save Progress** - Use localStorage for complex multi-step forms
6. **Error Handling** - Implement proper error boundaries and validation
7. **Accessibility** - Ensure your stepper is keyboard navigable and screen reader friendly

<!-- ## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details. -->

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing hooks API
- TypeScript team for excellent type support
- All contributors who helped make this library better

---

Made with ❤️ by [Alex Almeida Rocha](https://github.com/alexalmeidarocha)
