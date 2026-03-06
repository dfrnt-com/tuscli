import * as assert from 'assert';
import { runCli, parseJsonOutput, fixturePath, ensureTestDatabase, deleteTestDatabase, pushSchema } from './helpers';

describe('Document operations', function () {
  this.timeout(30000);

  before(function () {
    deleteTestDatabase();
    ensureTestDatabase();
    pushSchema('schema.json');
  });

  after(function () {
    deleteTestDatabase();
  });

  describe('create and read', function () {
    it('should create a document from a file', function () {
      const result = runCli('-c ' + fixturePath('entity1.json'));
      assert.strictEqual(result.exitCode, 0, 'Create failed, stderr: ' + result.stderr);
    });

    it('should read a document by id', function () {
      const result = runCli('-r Entity/1');
      assert.strictEqual(result.exitCode, 0, 'Read failed, stderr: ' + result.stderr);
      const doc = parseJsonOutput(result.stdout);
      assert.strictEqual(doc['@type'], 'Entity');
      assert.strictEqual(doc.name, 'Test Entity');
    });
  });

  describe('update', function () {
    it('should update a document from a file', function () {
      const result = runCli('-u Entity/1 ' + fixturePath('entity1_updated.json'));
      assert.strictEqual(result.exitCode, 0, 'Update failed, stderr: ' + result.stderr);
    });

    it('should reflect the updated values when read', function () {
      const result = runCli('-r Entity/1');
      assert.strictEqual(result.exitCode, 0, 'Read after update failed, stderr: ' + result.stderr);
      const doc = parseJsonOutput(result.stdout);
      assert.strictEqual(doc.name, 'Updated Entity');
      assert.strictEqual(doc.value, 'updated_value');
    });
  });

  describe('query-documents', function () {
    before(function () {
      // Ensure a second document exists for query testing
      runCli('-c ' + fixturePath('entity2.json'));
    });

    it('should query documents by type', function () {
      const result = runCli('-q \'{"type":"Entity"}\'');
      assert.strictEqual(result.exitCode, 0, 'Query failed, stderr: ' + result.stderr);
      const docs = parseJsonOutput(result.stdout);
      assert.ok(Array.isArray(docs), 'Query result should be an array');
      assert.ok(docs.length >= 1, 'Should return at least one document');
    });
  });

  describe('delete', function () {
    it('should delete a document by id', function () {
      const result = runCli('-d Entity/2');
      assert.strictEqual(result.exitCode, 0, 'Delete failed, stderr: ' + result.stderr);
    });

    it('should fail to read a deleted document', function () {
      const result = runCli('-r Entity/2');
      // The CLI may exit 0 but return an error response body for 404
      const output = result.stdout + ' ' + result.stderr;
      assert.ok(
        result.exitCode !== 0 || output.includes('DocumentNotFound') || output.includes('not_found'),
        'Expected error or not-found response when reading deleted document'
      );
    });
  });

  describe('deleteDocumentsOfType', function () {
    before(function () {
      // Create documents to delete
      runCli('-c ' + fixturePath('entity2.json'));
    });

    it('should delete all documents of a given type', function () {
      const result = runCli('--deleteDocumentsOfType Entity');
      assert.strictEqual(result.exitCode, 0, 'deleteDocumentsOfType failed, stderr: ' + result.stderr);
    });

    it('should return empty results after deleting all documents of a type', function () {
      const result = runCli('-q \'{"type":"Entity"}\'');
      assert.strictEqual(result.exitCode, 0);
      const docs = parseJsonOutput(result.stdout);
      assert.ok(Array.isArray(docs), 'Query result should be an array');
      assert.strictEqual(docs.length, 0, 'No documents should remain');
    });
  });
});
