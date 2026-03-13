"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerWoqlTools = registerWoqlTools;
var tslib_1 = require("tslib");
var zod_1 = require("zod");
var terminusdb_1 = require("terminusdb");
var commands = tslib_1.__importStar(require("../../commands"));
// Internal helpers not useful as WOQL predicates
var woqlInternalMethods = new Set([
    "json", "query", "lib", "client", "star", "all", "nuke", "node", "iri",
    "string", "boolean", "value", "link", "literal", "doc", "emerge",
    "vars", "vars_unique", "vars_unique_reset_start",
    "Vars", "VarsUnique",
    "true",
]);
function getWoqlVocabulary() {
    return Object.keys(terminusdb_1.WOQL)
        .filter(function (k) { return typeof terminusdb_1.WOQL[k] === "function" && !woqlInternalMethods.has(k); })
        .sort();
}
function buildWoqlDescription() {
    var vocab = getWoqlVocabulary();
    var vocabList = vocab.map(function (m) { return "WOQL.".concat(m); }).join(", ");
    return "Execute a WOQL (Web Object Query Language) query using JavaScript WOQL syntax. WOQL is a powerful query language for graph data in TerminusDB.\n\nBy default, queries run in READ-ONLY mode \u2014 destructive operations (insert, delete, update) are blocked. Set readonly to false to allow write operations.\n\nThe query parameter uses JavaScript WOQL builder syntax. The WOQL object is available in scope.\n\nExample: Find all documents of type Person\n  query: 'WOQL.triple(\"v:X\", \"rdf:type\", \"@schema:Person\")'\n\nExample: Find persons with their names\n  query: 'WOQL.and(WOQL.triple(\"v:X\", \"rdf:type\", \"@schema:Person\"), WOQL.triple(\"v:X\", \"@schema:name\", \"v:Name\"))'\n\nExample: Count documents of a type\n  query: 'WOQL.count(\"v:Count\", WOQL.triple(\"v:X\", \"rdf:type\", \"@schema:Person\"))'\n\nExample: Insert a document (requires readonly: false)\n  query: 'WOQL.insert_document(WOQL.doc({\"@type\":\"Person\",\"name\":\"Alice\",\"age\":30}))'\n  readonly: false\n\nExample: Query on a specific branch\n  query: 'WOQL.triple(\"v:X\", \"rdf:type\", \"@schema:Person\")'\n  branch: \"dev\"\n\nCommon WOQL patterns:\n- WOQL.triple(subject, predicate, object) \u2014 match a triple\n- WOQL.and(...queries) \u2014 combine multiple conditions\n- WOQL.or(...queries) \u2014 match any condition\n- WOQL.select(vars...).query \u2014 select specific variables\n- WOQL.count(countVar, query) \u2014 count results\n- WOQL.insert_document(doc) \u2014 insert (needs readonly: false)\n- WOQL.delete_document(id) \u2014 delete (needs readonly: false)\n\nArithmetic evaluation:\n- WOQL.eval(WOQL.plus(a, b), \"v:Result\") \u2014 addition\n- WOQL.eval(WOQL.minus(a, b), \"v:Result\") \u2014 subtraction\n- WOQL.eval(WOQL.times(a, b), \"v:Result\") \u2014 multiplication\n- WOQL.eval(WOQL.divide(a, b), \"v:Result\") \u2014 division (real/float)\n- WOQL.eval(WOQL.div(a, b), \"v:Result\") \u2014 integer division (floor)\n\nExample: Compute a value from document fields\n  query: 'WOQL.and(WOQL.triple(\"v:X\", \"@schema:price\", \"v:Price\"), WOQL.triple(\"v:X\", \"@schema:quantity\", \"v:Qty\"), WOQL.eval(WOQL.times(\"v:Price\", \"v:Qty\"), \"v:Total\"))'\n\nArithmetic expressions can be nested:\n  WOQL.eval(WOQL.plus(WOQL.times(\"v:A\", \"v:B\"), \"v:C\"), \"v:Result\")\n\nIMPORTANT \u2014 WOQL is a declarative datalog, not an imperative language:\nWOQL is based on Prolog and datalog. It works through unification and pattern matching, not sequential execution. Understanding this is essential to writing correct queries.\n\n- Variables are UNIFIED, not assigned. A variable like \"v:X\" is bound once per solution through pattern matching. You cannot reassign a variable or mutate it.\n- There are NO loops. No while, no for, no iteration counters. Instead, WOQL finds ALL solutions that match your pattern. If a triple pattern matches 50 documents, you get 50 result rows automatically.\n- WOQL.eq(a, b) is UNIFICATION, not assignment. It binds variables: WOQL.eq(\"v:Name\", \"Alice\") unifies v:Name with \"Alice\". Use eq to bind computed values to variables.\n- WOQL.as is for CSV column mapping (used with WOQL.get/put for data import/export), NOT for variable binding or projection. Never use as to \"assign\" values to variables.\n- Think declaratively: describe WHAT you want to match, not HOW to compute it step by step. \"Find all persons whose age is greater than 30\" is a pattern, not a loop.\n- Predicates are both GENERATORS and MATCHERS depending on which arguments are open (unbound) variables vs bound values. WOQL.triple(\"v:X\", \"rdf:type\", \"@schema:Person\") with v:X open generates all persons. WOQL.triple(\"Person/jane\", \"rdf:type\", \"v:Type\") with a bound subject matches and returns the type. WOQL.triple(\"Person/jane\", \"rdf:type\", \"@schema:Person\") with all bound succeeds or fails as a check. This applies broadly: eq, isa, path, sub, member, and many others behave this way.\n\nExample \u2014 WRONG (imperative thinking):\n  WOQL.eval(0, \"v:Counter\"), WOQL.while(WOQL.lt(\"v:Counter\", 10), ...)\n  This is wrong. There is no WOQL.while. Variables cannot be incremented.\n\nExample \u2014 RIGHT (declarative pattern matching):\n  WOQL.and(WOQL.triple(\"v:X\", \"rdf:type\", \"@schema:Person\"), WOQL.triple(\"v:X\", \"@schema:age\", \"v:Age\"), WOQL.gt(\"v:Age\", 30))\n  This finds all persons with age > 30 in one declarative pattern.\n\nExample \u2014 Binding a computed value with eq:\n  WOQL.and(WOQL.triple(\"v:X\", \"@schema:price\", \"v:Price\"), WOQL.eval(WOQL.times(\"v:Price\", 1.2), \"v:WithTax\"), WOQL.eq(\"v:Label\", \"incl. tax\"))\n\nVariables use the \"v:\" prefix, e.g., \"v:X\", \"v:Name\".\nSchema types use the \"@schema:\" prefix, e.g., \"@schema:Person\".\n\nCRITICAL: The vocabulary list below is EXHAUSTIVE. It is dynamically generated from the actual JS client connected to this instance. Do NOT invent or guess predicate names that are not in this list \u2014 they will fail with \"not a function\". If unsure whether a predicate exists, use compile_woql first to verify your query compiles before executing it.\n\nComplete WOQL vocabulary (".concat(vocab.length, " predicates): ").concat(vocabList, "\n\nFor detailed documentation on each predicate, see: https://terminusdb.org/docs/javascript");
}
function registerWoqlTools(server, createClient) {
    var _this = this;
    server.tool("execute_woql", buildWoqlDescription(), {
        query: zod_1.z.string().describe('WOQL query in JavaScript builder syntax. The WOQL object is in scope. Example: \'WOQL.triple("v:X", "rdf:type", "@schema:Person")\''),
        branch: zod_1.z.string().optional().describe("Branch to query against. Defaults to the main branch."),
        readonly: zod_1.z.boolean().optional().describe("Block destructive operations (default: true). Set to false to allow insert/delete/update queries."),
        message: zod_1.z.string().optional().describe("Commit message for write queries. Appears in the commit history. Default: 'WOQL query via MCP'."),
    }, function (_a) { return tslib_1.__awaiter(_this, [_a], void 0, function (_b) {
        var client, isReadonly, result;
        var query = _b.query, branch = _b.branch, readonly = _b.readonly, message = _b.message;
        return tslib_1.__generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    client = createClient({ branch: branch });
                    isReadonly = readonly !== false;
                    return [4 /*yield*/, commands.executeWoql(client, query, [], isReadonly, message)];
                case 1:
                    result = _c.sent();
                    return [2 /*return*/, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }];
            }
        });
    }); });
    server.tool("compile_woql", "Compile a WOQL query from JavaScript syntax to its JSON AST representation WITHOUT executing it. Useful for debugging queries or inspecting the query structure.\n\nExample: Compile a triple query\n  query: 'WOQL.triple(\"v:X\", \"rdf:type\", \"@schema:Person\")'\n\nExample: Compile a complex query to inspect its structure\n  query: 'WOQL.and(WOQL.triple(\"v:X\", \"rdf:type\", \"@schema:Person\"), WOQL.triple(\"v:X\", \"@schema:name\", \"v:Name\"))'", {
        query: zod_1.z.string().describe('WOQL query in JavaScript builder syntax to compile into JSON. Example: \'WOQL.triple("v:X", "rdf:type", "@schema:Person")\''),
    }, function (_a) { return tslib_1.__awaiter(_this, [_a], void 0, function (_b) {
        var result;
        var query = _b.query;
        return tslib_1.__generator(this, function (_c) {
            result = commands.compileWoql(query);
            return [2 /*return*/, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }];
        });
    }); });
}
