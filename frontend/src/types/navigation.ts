export type NavigationTab = 
  | 'dashboard'
  | 'scanner'
  | 'audit'
  | 'sanitize'
  | 'logs'
  | 'settings';

export interface NavItemConfig {
  id: NavigationTab;
  label: string;
  description: string;
  badge?: string;
}
