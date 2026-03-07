import * as assert from 'assert';
import { assertReadOnly } from '../src/woql-guard';

// Use require to get the WOQL builder from the terminusdb library
const { WOQL } = require('terminusdb');

describe('WOQL read-only guard', function () {
  this.timeout(10000);

  describe('read-only queries', function () {
    it('should allow a simple triple query', function () {
      const q = WOQL.triple('v:X', 'rdf:type', '@schema:Entity');
      assert.doesNotThrow(() => assertReadOnly(q));
    });

    it('should allow a select query', function () {
      const q = WOQL.select('v:X').triple('v:X', 'rdf:type', '@schema:Entity');
      assert.doesNotThrow(() => assertReadOnly(q));
    });

    it('should allow an and query with only reads', function () {
      const q = WOQL.and(
        WOQL.triple('v:X', 'rdf:type', '@schema:Entity'),
        WOQL.triple('v:X', '@schema:name', 'v:Name')
      );
      assert.doesNotThrow(() => assertReadOnly(q));
    });
  });

  describe('destructive queries', function () {
    it('should block delete_document', function () {
      const q = WOQL.and(
        WOQL.triple('v:X', 'rdf:type', '@schema:Entity'),
        WOQL.delete_document('v:X')
      );
      assert.throws(
        () => assertReadOnly(q),
        /Read-only mode: query contains destructive operations/
      );
    });

    it('should block insert_document', function () {
      const q = WOQL.insert_document(WOQL.doc({ '@type': 'Entity', '@id': 'Entity/test', name: 'test' }));
      assert.throws(
        () => assertReadOnly(q),
        /Read-only mode: query contains destructive operations/
      );
    });

    it('should block add_triple', function () {
      const q = WOQL.add_triple('doc:x', 'rdf:type', 'owl:Thing');
      assert.throws(
        () => assertReadOnly(q),
        /Read-only mode: query contains destructive operations/
      );
    });

    it('should block delete_triple', function () {
      const q = WOQL.delete_triple('doc:x', 'rdf:type', 'owl:Thing');
      assert.throws(
        () => assertReadOnly(q),
        /Read-only mode: query contains destructive operations/
      );
    });
  });

  describe('nested destructive queries', function () {
    it('should block delete_document nested inside and()', function () {
      const q = WOQL.and(
        WOQL.triple('v:X', 'rdf:type', '@schema:Entity'),
        WOQL.and(
          WOQL.triple('v:X', '@schema:name', 'v:N'),
          WOQL.delete_document('v:X')
        )
      );
      assert.throws(
        () => assertReadOnly(q),
        /Read-only mode: query contains destructive operations/
      );
    });

    it('should block delete_document inside select().and()', function () {
      const q = WOQL.select('v:X').and(
        WOQL.triple('v:X', 'rdf:type', '@schema:Entity'),
        WOQL.delete_document('v:X')
      );
      assert.throws(
        () => assertReadOnly(q),
        /Read-only mode: query contains destructive operations/
      );
    });
  });

  describe('contains_update flag', function () {
    it('should have contains_update=false for a read query', function () {
      const q = WOQL.triple('v:X', 'rdf:type', '@schema:Entity');
      assert.strictEqual(q.contains_update, false);
    });

    it('should have contains_update=true for a write query', function () {
      const q = WOQL.delete_document('v:X');
      assert.strictEqual(q.contains_update, true);
    });

    it('should have contains_update=false on and() even when it wraps a destructive query', function () {
      const q = WOQL.and(
        WOQL.triple('v:X', 'rdf:type', '@schema:Entity'),
        WOQL.delete_document('v:X')
      );
      // The WOQL library does not propagate the flag through combinators
      assert.strictEqual(q.contains_update, false,
        'and() does not propagate contains_update — the AST fallback catches this');
    });
  });
});
