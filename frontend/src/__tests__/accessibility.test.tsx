import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { axe } from 'vitest-axe';
import App from '../App';
import { ScanProvider } from '../context/ScanContext';
import { ThemeProvider } from '../context/ThemeContext';

describe('WCAG 2.1 AA / AAA Automated Accessibility Audit', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  const renderApp = () =>
    render(
      <ThemeProvider>
        <ScanProvider>
          <App />
        </ScanProvider>
      </ThemeProvider>
    );

  it('verifies Dashboard view has no a11y violations in Dark mode', async () => {
    const { container } = renderApp();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('verifies Light Mode has no a11y violations', async () => {
    const user = userEvent.setup();
    const { container } = renderApp();

    const themeToggle = screen.getByRole('button', { name: /switch to (light|dark) mode/i });
    await act(async () => {
      await user.click(themeToggle);
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('verifies Scanner view has no a11y violations', async () => {
    const user = userEvent.setup();
    const { container } = renderApp();

    const scannerTab = screen.getByRole('tab', { name: /^Scanner/i });
    await act(async () => {
      await user.click(scannerTab);
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('verifies Audit view has no a11y violations', async () => {
    const user = userEvent.setup();
    const { container } = renderApp();

    const auditTab = screen.getByRole('tab', { name: /^Audit/i });
    await act(async () => {
      await user.click(auditTab);
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('verifies Sanitize view has no a11y violations', async () => {
    const user = userEvent.setup();
    const { container } = renderApp();

    const sanitizeTab = screen.getByRole('tab', { name: /^Sanitize/i });
    await act(async () => {
      await user.click(sanitizeTab);
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('verifies Logs view has no a11y violations', async () => {
    const user = userEvent.setup();
    const { container } = renderApp();

    const logsTab = screen.getByRole('tab', { name: /^Logs/i });
    await act(async () => {
      await user.click(logsTab);
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('verifies Settings view has no a11y violations', async () => {
    const user = userEvent.setup();
    const { container } = renderApp();

    const settingsTab = screen.getByRole('tab', { name: /^Settings/i });
    await act(async () => {
      await user.click(settingsTab);
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
