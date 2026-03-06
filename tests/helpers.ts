import { execSync, ExecSyncOptionsWithStringEncoding } from 'child_process';
import * as path from 'path';

export const SERVER_URL = process.env.TERMINUSDB_URL || 'http://localhost:6363';
export const USER = process.env.TERMINUSDB_USER || 'admin';
export const KEY = process.env.TERMINUSDB_KEY || 'root';
export const ORGANISATION = process.env.TERMINUSDB_ORG || 'admin';
export const DB = process.env.TERMINUSDB_DB || 'tuscli';

export interface ConnectionConfig {
  url: string;
  key: string;
  user: string;
  organisation: string;
  db: string;
}

export const connectionConfig: ConnectionConfig = {
  url: SERVER_URL,
  key: KEY,
  user: USER,
  organisation: ORGANISATION,
  db: DB,
};

export const TUSPARAMS = Buffer.from(JSON.stringify(connectionConfig)).toString('base64');
export const CLI_PATH = path.resolve(__dirname, '..', 'dist', 'tuscli.js');
export const FIXTURES_PATH = path.resolve(__dirname, 'fixtures');
export const PROJECT_ROOT = path.resolve(__dirname, '..');

export interface CliResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  error?: Error;
}

export interface RunCliOptions {
  env?: Record<string, string>;
  timeout?: number;
  cwd?: string;
}

/**
 * Run the tuscli CLI with the given arguments.
 * Returns { stdout, stderr, exitCode }.
 * Non-zero exit codes do NOT throw; the caller decides what to assert.
 */
export function runCli(args: string, options: RunCliOptions = {}): CliResult {
  const env: Record<string, string> = {
    ...process.env as Record<string, string>,
    TUSPARAMS,
    ...(options.env || {}),
  };

  const cmd = `node ${CLI_PATH} --nocolor ${args}`;
  try {
    const stdout = execSync(cmd, {
      env,
      encoding: 'utf-8',
      timeout: options.timeout || 30000,
      cwd: options.cwd || PROJECT_ROOT,
      stdio: ['pipe', 'pipe', 'pipe'],
    } as ExecSyncOptionsWithStringEncoding);
    return { stdout: (stdout || '').trim(), stderr: '', exitCode: 0 };
  } catch (error: any) {
    return {
      stdout: (error.stdout || '').trim(),
      stderr: (error.stderr || '').trim(),
      exitCode: error.status || 1,
      error,
    };
  }
}

/**
 * Run the CLI targeting a specific database (overrides the default db in TUSPARAMS).
 */
export function runCliWithDb(args: string, dbName: string, options: RunCliOptions = {}): CliResult {
  const config: ConnectionConfig = { ...connectionConfig, db: dbName };
  const tusparams = Buffer.from(JSON.stringify(config)).toString('base64');
  return runCli(args, { ...options, env: { ...options.env, TUSPARAMS: tusparams } });
}

/**
 * Parse JSON from CLI stdout, stripping ANSI codes if any remain.
 */
export function parseJsonOutput(output: string): any {
  const clean = output.replace(/\x1b\[[0-9;]*m/g, '');
  return JSON.parse(clean);
}

/**
 * Return the absolute path to a test fixture file.
 */
export function fixturePath(filename: string): string {
  return path.resolve(FIXTURES_PATH, filename);
}

/**
 * Ensure the test database exists. Idempotent: ignores errors if it already exists.
 */
export function ensureTestDatabase(dbName?: string): CliResult {
  const name = dbName || DB;
  const createJson = JSON.stringify({ schema: true, label: name, comment: 'Test database' });
  const result = runCli("--createDatabase " + name + " '" + createJson + "' --quiet");
  // Ignore errors (db may already exist)
  return result;
}

/**
 * Delete the test database. Ignores errors if it does not exist.
 */
export function deleteTestDatabase(): CliResult {
  const result = runCli('--deleteDatabase ' + DB + ' --quiet');
  return result;
}

/**
 * Push a schema document to the test database.
 */
export function pushSchema(schemaFile: string): CliResult {
  return runCli('-c -i schema ' + fixturePath(schemaFile));
}
