import * as assert from 'assert';
import { runCli, ensureTestDatabase, deleteTestDatabase, pushSchema } from './helpers';

describe('Optimize operations', function () {
  this.timeout(30000);

  before(function () {
    deleteTestDatabase();
    ensureTestDatabase();
    pushSchema('schema.json');
  });

  after(function () {
    deleteTestDatabase();
  });

  it('should optimize the main branch', function () {
    const result = runCli('-o main');
    assert.strictEqual(result.exitCode, 0, 'Optimize failed, stderr: ' + result.stderr);
  });
});
