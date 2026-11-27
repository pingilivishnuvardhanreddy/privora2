import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ScanProvider } from './context/ScanContext';
import { Header } from './components/Header';
import { NavigationTab } from './types/navigation';
import { DashboardView } from './views/DashboardView';
import { DocumentScannerView } from './views/DocumentScannerView';
import { PrivacyAuditView } from './views/PrivacyAuditView';
import { SanitizationView } from './views/SanitizationView';
import { ActivityLogsView } from './views/ActivityLogsView';
import { SettingsView } from './views/SettingsView';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const { theme } = useTheme();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={setActiveTab} />;
      case 'scanner':
        return <DocumentScannerView />;
      case 'audit':
        return <PrivacyAuditView />;
      case 'sanitize':
        return <SanitizationView />;
      case 'logs':
        return <ActivityLogsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={setActiveTab} />;
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col transition-colors duration-200 relative ${
        theme === 'dark'
          ? 'bg-[#060811] bg-dot-grid-dark text-slate-100'
          : 'bg-[#F5F7FF] bg-dot-grid-light text-slate-900'
      }`}
    >
      {/* WCAG 2.1 AA: Visually-hidden-until-focused Skip Link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-500 focus:text-slate-950 focus:font-bold focus:rounded-xl focus:shadow-2xl focus:ring-2 focus:ring-cyan-400"
      >
        Skip to main content
      </a>

      {/* Ambient multi-hue aurora glow backdrop */}
      <div 
        className={`absolute inset-0 pointer-events-none z-0 ${
          theme === 'dark' ? 'bg-aurora-dark' : 'bg-aurora-light'
        }`} 
      />

      {/* Floating Glass-Metal Top Command Header (Replaces Left Sidebar) */}
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Workspace Area (Full width max-w-[1440px] mx-auto px-6) */}
      <main 
        id="main-content" 
        role="main" 
        tabIndex={-1} 
        aria-label="Privacy Workspace Content" 
        className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-4 pb-12 relative z-10 focus:outline-none"
      >
        <div id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
          {renderActiveView()}
        </div>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ScanProvider>
        <AppContent />
      </ScanProvider>
    </ThemeProvider>
  );
};

export default App;
