import * as assert from 'assert';
import { runCli, parseJsonOutput, ensureTestDatabase, deleteTestDatabase, pushSchema } from './helpers';

describe('Schema operations', function () {
  this.timeout(30000);

  before(function () {
    deleteTestDatabase();
    ensureTestDatabase();
    pushSchema('schema.json');
  });

  after(function () {
    deleteTestDatabase();
  });

  describe('export-schema', function () {
    it('should export the instance schema as JSON', function () {
      const result = runCli('--export-schema');
      assert.strictEqual(result.exitCode, 0, 'Expected exit code 0, stderr: ' + result.stderr);
      const schema = parseJsonOutput(result.stdout);
      assert.ok(Array.isArray(schema) || typeof schema === 'object', 'Schema should be JSON');
    });

    it('should contain the Entity class in the exported schema', function () {
      const result = runCli('--export-schema');
      assert.strictEqual(result.exitCode, 0);
      const schema = parseJsonOutput(result.stdout);
      const schemaArray: any[] = Array.isArray(schema) ? schema : [schema];
      const entityClass = schemaArray.find(function (item: any) {
        return item['@id'] === 'Entity' || item['@id'] === 'terminusdb:///schema#Entity';
      });
      assert.ok(entityClass, 'Schema should contain the Entity class');
    });
  });

  describe('schemaFrame', function () {
    it('should get the schema frame for a type', function () {
      const result = runCli('--schemaFrame Entity');
      assert.strictEqual(result.exitCode, 0, 'Expected exit code 0, stderr: ' + result.stderr);
      const frame = parseJsonOutput(result.stdout);
      assert.ok(typeof frame === 'object', 'Frame should be a JSON object');
    });
  });
});
