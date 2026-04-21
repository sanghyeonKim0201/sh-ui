#!/usr/bin/env node

import { argv } from 'node:process';
import { createProject, addApp, addComponent } from '../src/generator.js';

const command = argv[2];

if (command === 'add-app') {
  await addApp();
} else if (command === 'add-component') {
  const componentName = argv[3];
  const appFlag = argv.indexOf('--app');
  const appName = appFlag !== -1 ? argv[appFlag + 1] : undefined;
  await addComponent(componentName, appName);
} else {
  await createProject();
}
