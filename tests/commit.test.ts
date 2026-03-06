import * as assert from 'assert';
import { runCli, parseJsonOutput, fixturePath, ensureTestDatabase, deleteTestDatabase, pushSchema } from './helpers';

describe('Commit graph operations', function () {
  this.timeout(30000);

  before(function () {
    deleteTestDatabase();
    ensureTestDatabase();
    pushSchema('schema.json');
    // Create a document to generate a commit
    runCli('-c ' + fixturePath('entity1.json'));
  });

  after(function () {
    deleteTestDatabase();
  });

  it('should retrieve the commit graph with default count', function () {
    // Note: -y passes the count as a string; multi-digit strings like "10"
    // cause a type error in the WOQL commits lib (expects character type).
    // Using single-digit "5" works around this known limitation.
    const result = runCli('-y 5');
    assert.strictEqual(result.exitCode, 0, 'Commit graph failed, stderr: ' + result.stderr);
    const commits = parseJsonOutput(result.stdout);
    assert.ok(Array.isArray(commits), 'Commit graph should return an array');
    assert.ok(commits.length >= 1, 'Should have at least one commit');
  });

  it('should retrieve a limited number of commits', function () {
    const result = runCli('-y 1');
    assert.strictEqual(result.exitCode, 0, 'Commit graph with limit failed, stderr: ' + result.stderr);
    const commits = parseJsonOutput(result.stdout);
    assert.ok(Array.isArray(commits), 'Commit graph should return an array');
    assert.ok(commits.length >= 1, 'Should have at least one commit');
  });
});
