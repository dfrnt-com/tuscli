import * as assert from 'assert';
import { runCli, parseJsonOutput, fixturePath, ensureTestDatabase, deleteTestDatabase, pushSchema } from './helpers';

describe('WOQL operations', function () {
  this.timeout(30000);

  before(function () {
    deleteTestDatabase();
    ensureTestDatabase();
    pushSchema('schema.json');
    // Insert a document so WOQL queries return results
    runCli('-c ' + fixturePath('entity1.json'));
  });

  after(function () {
    deleteTestDatabase();
  });

  describe('woql inline', function () {
    it('should execute a WOQL query from an argument', function () {
      const woql = 'WOQL.triple("v:X", "rdf:type", "@schema:Entity")';
      const result = runCli("--woql '" + woql + "'");
      assert.strictEqual(result.exitCode, 0, 'WOQL query failed, stderr: ' + result.stderr);
      const output = parseJsonOutput(result.stdout);
      assert.ok(output.bindings || output['api:variable_names'], 'WOQL result should contain bindings');
    });
  });

  describe('woqlFile', function () {
    it('should execute a WOQL query from a file', function () {
      const result = runCli('--woqlFile ' + fixturePath('query_triples.woql.js'));
      assert.strictEqual(result.exitCode, 0, 'WOQL file query failed, stderr: ' + result.stderr);
      const output = parseJsonOutput(result.stdout);
      assert.ok(output.bindings || output['api:variable_names'], 'WOQL result should contain bindings');
    });
  });

  describe('compileWoql', function () {
    it('should compile inline WOQL to JSON without executing', function () {
      const woql = 'WOQL.triple("v:X", "rdf:type", "@schema:Entity")';
      const result = runCli("--compileWoql '" + woql + "'");
      assert.strictEqual(result.exitCode, 0, 'compileWoql failed, stderr: ' + result.stderr);
      const compiled = parseJsonOutput(result.stdout);
      assert.ok(typeof compiled === 'object', 'Compiled WOQL should be a JSON object');
    });
  });

  describe('woqlCompile', function () {
    it('should compile WOQL from a file to JSON without executing', function () {
      const result = runCli('--woqlCompile ' + fixturePath('query_triples.woql.js'));
      assert.strictEqual(result.exitCode, 0, 'woqlCompile failed, stderr: ' + result.stderr);
      const compiled = parseJsonOutput(result.stdout);
      assert.ok(typeof compiled === 'object', 'Compiled WOQL should be a JSON object');
    });
  });
});
