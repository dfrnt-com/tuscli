import * as assert from 'assert';
import { runCli, parseJsonOutput, ensureTestDatabase, deleteTestDatabase, pushSchema } from './helpers';

describe('Branch operations', function () {
  this.timeout(30000);

  before(function () {
    deleteTestDatabase();
    ensureTestDatabase();
    pushSchema('schema.json');
  });

  after(function () {
    deleteTestDatabase();
  });

  it('should list branches', function () {
    const result = runCli('--branches');
    assert.strictEqual(result.exitCode, 0, 'List branches failed, stderr: ' + result.stderr);
    const branches = parseJsonOutput(result.stdout);
    assert.ok(typeof branches === 'object' || Array.isArray(branches), 'Branches should be JSON');
  });

  it('should create a branch', function () {
    const result = runCli('--createBranch testbranch');
    assert.strictEqual(result.exitCode, 0, 'Create branch failed, stderr: ' + result.stderr);
  });

  it('should list the new branch after creation', function () {
    const result = runCli('--branches');
    assert.strictEqual(result.exitCode, 0);
    const branches = parseJsonOutput(result.stdout);
    const hasBranch = JSON.stringify(branches).includes('testbranch');
    assert.ok(hasBranch, 'Branch list should include testbranch');
  });

  it('should create an empty branch', function () {
    const result = runCli('--createBranch emptybranch true');
    assert.strictEqual(result.exitCode, 0, 'Create empty branch failed, stderr: ' + result.stderr);
  });

  it('should delete a branch', function () {
    const result = runCli('--deleteBranch testbranch');
    assert.strictEqual(result.exitCode, 0, 'Delete branch failed, stderr: ' + result.stderr);
  });

  it('should delete the empty branch', function () {
    const result = runCli('--deleteBranch emptybranch');
    assert.strictEqual(result.exitCode, 0, 'Delete empty branch failed, stderr: ' + result.stderr);
  });
});
