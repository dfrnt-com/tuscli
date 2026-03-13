import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { WOQL } from "terminusdb";
import * as commands from "../../commands";

// Internal helpers not useful as WOQL predicates
const woqlInternalMethods = new Set([
  "json", "query", "lib", "client", "star", "all", "nuke", "node", "iri",
  "string", "boolean", "value", "link", "literal", "doc", "emerge",
  "vars", "vars_unique", "vars_unique_reset_start",
  "Vars", "VarsUnique",
  "true",
]);

function getWoqlVocabulary(): string[] {
  return Object.keys(WOQL)
    .filter(k => typeof (WOQL as any)[k] === "function" && !woqlInternalMethods.has(k))
    .sort();
}

function buildWoqlDescription(): string {
  const vocab = getWoqlVocabulary();
  const vocabList = vocab.map(m => `WOQL.${m}`).join(", ");

  return `Execute a WOQL (Web Object Query Language) query using JavaScript WOQL syntax. WOQL is a powerful query language for graph data in TerminusDB.

By default, queries run in READ-ONLY mode — destructive operations (insert, delete, update) are blocked. Set readonly to false to allow write operations.

The query parameter uses JavaScript WOQL builder syntax. The WOQL object is available in scope.

Example: Find all documents of type Person
  query: 'WOQL.triple("v:X", "rdf:type", "@schema:Person")'

Example: Find persons with their names
  query: 'WOQL.and(WOQL.triple("v:X", "rdf:type", "@schema:Person"), WOQL.triple("v:X", "@schema:name", "v:Name"))'

Example: Count documents of a type
  query: 'WOQL.count("v:Count", WOQL.triple("v:X", "rdf:type", "@schema:Person"))'

Example: Insert a document (requires readonly: false)
  query: 'WOQL.insert_document(WOQL.doc({"@type":"Person","name":"Alice","age":30}))'
  readonly: false

Example: Query on a specific branch
  query: 'WOQL.triple("v:X", "rdf:type", "@schema:Person")'
  branch: "dev"

Common WOQL patterns:
- WOQL.triple(subject, predicate, object) — match a triple
- WOQL.and(...queries) — combine multiple conditions
- WOQL.or(...queries) — match any condition
- WOQL.select(vars...).query — select specific variables
- WOQL.count(countVar, query) — count results
- WOQL.insert_document(doc) — insert (needs readonly: false)
- WOQL.delete_document(id) — delete (needs readonly: false)

Arithmetic evaluation:
- WOQL.eval(WOQL.plus(a, b), "v:Result") — addition
- WOQL.eval(WOQL.minus(a, b), "v:Result") — subtraction
- WOQL.eval(WOQL.times(a, b), "v:Result") — multiplication
- WOQL.eval(WOQL.divide(a, b), "v:Result") — division (real/float)
- WOQL.eval(WOQL.div(a, b), "v:Result") — integer division (floor)

Example: Compute a value from document fields
  query: 'WOQL.and(WOQL.triple("v:X", "@schema:price", "v:Price"), WOQL.triple("v:X", "@schema:quantity", "v:Qty"), WOQL.eval(WOQL.times("v:Price", "v:Qty"), "v:Total"))'

Arithmetic expressions can be nested:
  WOQL.eval(WOQL.plus(WOQL.times("v:A", "v:B"), "v:C"), "v:Result")

IMPORTANT — WOQL is a declarative datalog, not an imperative language:
WOQL is based on Prolog and datalog. It works through unification and pattern matching, not sequential execution. Understanding this is essential to writing correct queries.

- Variables are UNIFIED, not assigned. A variable like "v:X" is bound once per solution through pattern matching. You cannot reassign a variable or mutate it.
- There are NO loops. No while, no for, no iteration counters. Instead, WOQL finds ALL solutions that match your pattern. If a triple pattern matches 50 documents, you get 50 result rows automatically.
- WOQL.eq(a, b) is UNIFICATION, not assignment. It binds variables: WOQL.eq("v:Name", "Alice") unifies v:Name with "Alice". Use eq to bind computed values to variables.
- WOQL.as is for CSV column mapping (used with WOQL.get/put for data import/export), NOT for variable binding or projection. Never use as to "assign" values to variables.
- Think declaratively: describe WHAT you want to match, not HOW to compute it step by step. "Find all persons whose age is greater than 30" is a pattern, not a loop.
- Predicates are both GENERATORS and MATCHERS depending on which arguments are open (unbound) variables vs bound values. WOQL.triple("v:X", "rdf:type", "@schema:Person") with v:X open generates all persons. WOQL.triple("Person/jane", "rdf:type", "v:Type") with a bound subject matches and returns the type. WOQL.triple("Person/jane", "rdf:type", "@schema:Person") with all bound succeeds or fails as a check. This applies broadly: eq, isa, path, sub, member, and many others behave this way.

Example — WRONG (imperative thinking):
  WOQL.eval(0, "v:Counter"), WOQL.while(WOQL.lt("v:Counter", 10), ...)
  This is wrong. There is no WOQL.while. Variables cannot be incremented.

Example — RIGHT (declarative pattern matching):
  WOQL.and(WOQL.triple("v:X", "rdf:type", "@schema:Person"), WOQL.triple("v:X", "@schema:age", "v:Age"), WOQL.gt("v:Age", 30))
  This finds all persons with age > 30 in one declarative pattern.

Example — Binding a computed value with eq:
  WOQL.and(WOQL.triple("v:X", "@schema:price", "v:Price"), WOQL.eval(WOQL.times("v:Price", 1.2), "v:WithTax"), WOQL.eq("v:Label", "incl. tax"))

Variables use the "v:" prefix, e.g., "v:X", "v:Name".
Schema types use the "@schema:" prefix, e.g., "@schema:Person".

CRITICAL: The vocabulary list below is EXHAUSTIVE. It is dynamically generated from the actual JS client connected to this instance. Do NOT invent or guess predicate names that are not in this list — they will fail with "not a function". If unsure whether a predicate exists, use compile_woql first to verify your query compiles before executing it.

Complete WOQL vocabulary (${vocab.length} predicates): ${vocabList}

For detailed documentation on each predicate, see: https://terminusdb.org/docs/javascript`;
}

export function registerWoqlTools(
  server: McpServer,
  createClient: (overrides?: any) => any
) {
  server.tool(
    "execute_woql",
    buildWoqlDescription(),
    {
      query: z.string().describe('WOQL query in JavaScript builder syntax. The WOQL object is in scope. Example: \'WOQL.triple("v:X", "rdf:type", "@schema:Person")\''),
      branch: z.string().optional().describe("Branch to query against. Defaults to the main branch."),
      readonly: z.boolean().optional().describe("Block destructive operations (default: true). Set to false to allow insert/delete/update queries."),
      message: z.string().optional().describe("Commit message for write queries. Appears in the commit history. Default: 'WOQL query via MCP'."),
    },
    async ({ query, branch, readonly, message }) => {
      const client = createClient({ branch });
      const isReadonly = readonly !== false;
      const result = await commands.executeWoql(client, query, [], isReadonly, message);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "compile_woql",
    `Compile a WOQL query from JavaScript syntax to its JSON AST representation WITHOUT executing it. Useful for debugging queries or inspecting the query structure.

Example: Compile a triple query
  query: 'WOQL.triple("v:X", "rdf:type", "@schema:Person")'

Example: Compile a complex query to inspect its structure
  query: 'WOQL.and(WOQL.triple("v:X", "rdf:type", "@schema:Person"), WOQL.triple("v:X", "@schema:name", "v:Name"))'`,
    {
      query: z.string().describe('WOQL query in JavaScript builder syntax to compile into JSON. Example: \'WOQL.triple("v:X", "rdf:type", "@schema:Person")\''),
    },
    async ({ query }) => {
      const result = commands.compileWoql(query);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
