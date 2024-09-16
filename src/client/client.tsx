import React from 'react';
import { Plugin } from '@botmate/client';
// import { ShieldIcon } from 'lucide-react';
// import { BrowserRouter as Router } from 'react-router-dom';
import SettingsPage from './settings';

export class CommandManager extends Plugin {
  displayName = 'Command Manager';
  path = this.displayName.toLowerCase();

  async beforeLoad() {
    /*
    this.addToSidebar({
      label: this.displayName,
      icon: ShieldIcon,
      path: `/${this.path}`,
      regex: new RegExp(`^/${this.path}`),
    });
    
    this.addRoute({
      path: `/${this.path}/*`,
      element: (
        <Router>
          <SettingsPage />
        </Router>
      ),
    });
    */
    
    this.provideSettings(<SettingsPage />);
  }
}