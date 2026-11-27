/// <reference types="vite/client" />
/// <reference types="@testing-library/jest-dom/vitest" />

import 'vitest';
import type { AxeResults } from 'axe-core';

interface CustomMatchers<R = unknown> {
  toHaveNoViolations(): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
