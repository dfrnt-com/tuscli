import * as assert from 'assert';
import { runCli } from './helpers';

describe('Database operations', function () {
  this.timeout(30000);
  const tempDb = 'tuscli_test_temp';

  afterEach(function () {
    // Clean up temp database after each test
    runCli('--deleteDatabase ' + tempDb + ' --quiet');
  });

  it('should create a database', function () {
    const createJson = JSON.stringify({ schema: true, label: tempDb, comment: 'Temp test database' });
    const result = runCli("--createDatabase " + tempDb + " '" + createJson + "'");
    assert.strictEqual(result.exitCode, 0, 'Expected exit code 0, got: ' + result.exitCode + ' stderr: ' + result.stderr);
  });

  it('should create a database with label and comment', function () {
    const createJson = JSON.stringify({ schema: true, label: 'Test DB', comment: 'A test database' });
    const result = runCli("--createDatabase " + tempDb + " '" + createJson + "'");
    assert.strictEqual(result.exitCode, 0, 'Expected exit code 0, got: ' + result.exitCode + ' stderr: ' + result.stderr);
  });

  it('should delete a database', function () {
    const createJson = JSON.stringify({ schema: true, label: tempDb, comment: 'Temp test database' });
    runCli("--createDatabase " + tempDb + " '" + createJson + "' --quiet");
    const result = runCli('--deleteDatabase ' + tempDb);
    assert.strictEqual(result.exitCode, 0, 'Expected exit code 0, got: ' + result.exitCode + ' stderr: ' + result.stderr);
  });

  it('should fail to delete a non-existent database', function () {
    const result = runCli('--deleteDatabase tuscli_nonexistent_db_xyz');
    assert.notStrictEqual(result.exitCode, 0, 'Expected non-zero exit code for deleting non-existent database');
  });
});
