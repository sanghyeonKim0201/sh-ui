#!/usr/bin/env node

import { argv, exit } from 'node:process';
import { parseArgs } from '../src/cli-args.js';
import { createProject, addApp, addComponent } from '../src/generator.js';

let parsed;
try {
  parsed = parseArgs(argv);
} catch (e) {
  console.error(`❌ ${e.message}`);
  exit(1);
}

const { command, flags, positional } = parsed;

try {
  if (command === 'add-app') {
    await addApp();
  } else if (command === 'add-component') {
    const componentName = positional[0];
    await addComponent(componentName, flags.app);
  } else {
    await createProject({
      name: positional[0],
      platform: flags.platform,
      structure: flags.structure,
      plugins: flags.plugins,
      theme: flags.theme,
      yes: flags.yes,
    });
  }
} catch (e) {
  console.error(`❌ ${e.message}`);
  exit(1);
}
