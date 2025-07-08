import { renderHook } from "@testing-library/react";

import { useStepperSync } from "../useStepperSync";

describe("useStepperSync", () => {
  test("should be defined", () => {
    expect(useStepperSync).toBeDefined();
  });

  test("should return expected structure", () => {
    const { result } = renderHook(() => useStepperSync());

    expect(result.current).toHaveProperty("saveToLocalStorage");
    expect(result.current).toHaveProperty("loadFromLocalStorage");
    expect(result.current).toHaveProperty("clearFromLocalStorage");

    expect(typeof result.current.saveToLocalStorage).toBe("function");
    expect(typeof result.current.loadFromLocalStorage).toBe("function");
    expect(typeof result.current.clearFromLocalStorage).toBe("function");
  });
});
