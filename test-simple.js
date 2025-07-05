const { execSync } = require('child_process');

try {
  console.log('Running simple test...');
  const result = execSync('npx jest src/__tests__/useStepper.test.tsx --testNamePattern="should return stepper context when used within StepsProvider" --verbose', {
    cwd: '/home/alex/react-hook-stepper',
    timeout: 15000,
    encoding: 'utf8'
  });
  console.log('Test passed!');
  console.log(result);
} catch (error) {
  console.error('Test failed:', error.message);
  console.error('stdout:', error.stdout);
  console.error('stderr:', error.stderr);
}
