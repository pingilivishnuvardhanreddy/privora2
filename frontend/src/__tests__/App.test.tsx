import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

describe('PRIVORA App Full Integration & Navigation Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('1. renders PRIVORA brand, title, and initial Dashboard view', () => {
    render(<App />);

    // Brand and security tags
    expect(screen.getAllByText('PRIVORA')[0]).toBeInTheDocument();
    expect(screen.getByText(/Next-Gen Client-Side Privacy Defense/i)).toBeInTheDocument();
    expect(screen.getAllByText(/0 B Egress/i).length).toBeGreaterThanOrEqual(1);
  });

  it('2. navigates between all 6 workspace tabs seamlessly', async () => {
    render(<App />);

    // 1. Scanner tab
    const scannerTab = screen.getByRole('tab', { name: /Scanner/i });
    fireEvent.click(scannerTab);
    expect(screen.getByText(/Client-Side Document & Stream Scanner/i)).toBeInTheDocument();

    // 2. Audit tab
    const auditTab = screen.getByRole('tab', { name: /Audit/i });
    fireEvent.click(auditTab);
    expect(screen.getByText(/Privacy Posture & Regulatory Risk Audit/i)).toBeInTheDocument();

    // 3. Sanitize tab
    const sanitizeTab = screen.getByRole('tab', { name: /Sanitize/i });
    fireEvent.click(sanitizeTab);
    expect(screen.getByText(/Data Sanitization & Side-by-Side Diff Workspace/i)).toBeInTheDocument();

    // 4. Logs tab
    const logsTab = screen.getByRole('tab', { name: /Logs/i });
    fireEvent.click(logsTab);
    expect(screen.getByText(/Session Activity Log Stream/i)).toBeInTheDocument();

    // 5. Settings tab
    const settingsTab = screen.getByRole('tab', { name: /Settings/i });
    fireEvent.click(settingsTab);
    expect(screen.getByText(/6-Category Detection Engine Switches/i)).toBeInTheDocument();

    // 6. Return to Dashboard tab
    const dashboardTab = screen.getByRole('tab', { name: /Dashboard/i });
    fireEvent.click(dashboardTab);
    expect(screen.getByText(/Next-Gen Client-Side Privacy Defense/i)).toBeInTheDocument();
  });

  it('3. toggles between Dark and Light mode properly', () => {
    render(<App />);
    const themeToggle = screen.getByTitle(/Switch to light mode|Switch to dark mode/i);

    // Initial load is Dark mode
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Click toggle -> switches to light mode
    fireEvent.click(themeToggle);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('privora-theme')).toBe('light');

    // Click toggle again -> switches back to dark mode
    fireEvent.click(themeToggle);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('privora-theme')).toBe('dark');
  });

  it('4. loads sample CSV directly and switches to Scanner view', async () => {
    render(<App />);

    const loadCsvButton = screen.getByRole('button', { name: /Load Sample CSV/i });
    fireEvent.click(loadCsvButton);

    await waitFor(() => {
      // Must transition to Scanner view and show filename
      expect(screen.getByText(/Client-Side Document & Stream Scanner/i)).toBeInTheDocument();
      expect(screen.getByText(/sample_customers.csv/i)).toBeInTheDocument();
    });
  });

  it('5. loads sample TXT directly and switches to Scanner view', async () => {
    render(<App />);

    const loadTxtButton = screen.getByRole('button', { name: /Load Sample TXT/i });
    fireEvent.click(loadTxtButton);

    await waitFor(() => {
      expect(screen.getByText(/Client-Side Document & Stream Scanner/i)).toBeInTheDocument();
      expect(screen.getByText(/synthetic_incident_log.txt/i)).toBeInTheDocument();
    });
  });

  it('6. executes quick RAM purge and reflects in in-memory state', async () => {
    render(<App />);

    // First load sample
    const loadTxtButton = screen.getByRole('button', { name: /Load Sample TXT/i });
    fireEvent.click(loadTxtButton);

    // Click Quick Purge button
    const purgeButton = screen.getByTitle(/Quick Purge Session RAM/i);
    fireEvent.click(purgeButton);

    // Must show purge confirmation
    await waitFor(() => {
      expect(screen.getByTitle(/RAM Cleared!/i)).toBeInTheDocument();
    });
  });
});
