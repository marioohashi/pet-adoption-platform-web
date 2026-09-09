export function Calculator() {
  const sum = (a: number, b: number): number => a + b;
  const subtract = (a: number, b: number): number => a - b;
  const multiply = (a: number, b: number): number => a * b;
  const divide = (a: number, b: number): number => {
    if (b === 0) throw new Error("Cannot divide by zero");
    return a / b;
  };

  return { sum, subtract, multiply, divide };
}