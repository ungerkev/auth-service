const parentDirFinder = require('find-parent-dir');
import { join } from 'path';

/**
 * General configuration
 */
export const appPort = process.env.HTTP_PORT || 3000;
export const oneYearInMs = 31536000000;// 1 * 365 * 24 * 60 * 60 * 1000
export const nodeEnv = process.env.NODE_ENV;
export const sessionSecret: any = process.env.SESSION_SECRET;

export const ACCESS_TOKEN_SECRET: any = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET: any = process.env.REFRESH_TOKEN_SECRET;

export const ACCESS_TOKEN_LIFETIME: any = process.env.ACCESS_TOKEN_LIFETIME;
export const REFRESH_TOKEN_LIFETIME: any = process.env.REFRESH_TOKEN_LIFETIME;

// DB paths
export const modelsDir = join(parentDirFinder.sync(__dirname, 'db_models'), 'db_models');
