import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { CREATE_PLATFORMS, CREATE_STRUCTURES } from '../src/constants.js';

describe('MCP sh_ui_create_project — vite acceptance', () => {
  it('CREATE_PLATFORMS exposes vite to MCP schema', () => {
    const schema = z.enum(CREATE_PLATFORMS);
    expect(schema.safeParse('vite').success).toBe(true);
  });

  it('structure enum accepts standalone and monorepo for vite', () => {
    const schema = z.enum(CREATE_STRUCTURES);
    expect(schema.safeParse('standalone').success).toBe(true);
    expect(schema.safeParse('monorepo').success).toBe(true);
  });
});
