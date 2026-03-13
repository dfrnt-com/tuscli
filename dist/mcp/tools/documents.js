"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDocumentTools = registerDocumentTools;
var tslib_1 = require("tslib");
var zod_1 = require("zod");
var commands = tslib_1.__importStar(require("../../commands"));
function registerDocumentTools(server, createClient) {
    var _this = this;
    server.tool("create_document", "Create a document in TerminusDB from a JSON string. Documents are JSON-LD objects that must include \"@type\" and typically \"@id\".\n\nUse graph_type \"schema\" to define schema classes, or \"instance\" (default) to add data documents that conform to the schema.\n\nIMPORTANT: The database must exist before creating documents. Use create_database first if needed.\nIMPORTANT: Schema classes must be created before instance documents that reference them.\n\nExample: Create a schema class (graph_type must be \"schema\")\n  document: '{\"@id\":\"Person\",\"@type\":\"Class\",\"name\":\"xsd:string\",\"age\":\"xsd:integer\",\"email\":{\"@type\":\"Optional\",\"@class\":\"xsd:string\"}}'\n  graph_type: \"schema\"\n\nExample: Create an instance document\n  document: '{\"@type\":\"Person\",\"@id\":\"Person/jane\",\"name\":\"Jane Doe\",\"age\":30,\"email\":\"jane@example.com\"}'\n\nExample: Create a schema enum\n  document: '{\"@id\":\"Color\",\"@type\":\"Enum\",\"@value\":[\"red\",\"green\",\"blue\"]}'\n  graph_type: \"schema\"\n\nExample: Create a document on a specific branch\n  document: '{\"@type\":\"Person\",\"@id\":\"Person/bob\",\"name\":\"Bob\",\"age\":25}'\n  branch: \"dev\"", {
        document: zod_1.z.string().describe('JSON string of the document to create. Must include "@type". For schema documents, include "@id" as the class name. For instance documents, "@id" is optional (auto-generated if omitted). Example: \'{"@type":"Person","@id":"Person/jane","name":"Jane"}\''),
        graph_type: zod_1.z.enum(["instance", "schema"]).optional().describe('Target graph: "instance" (default) for data documents, "schema" for class/type definitions. Schema classes must be created before instance documents.'),
        branch: zod_1.z.string().optional().describe("Branch to operate on. Defaults to the main branch from the connection profile."),
        message: zod_1.z.string().optional().describe("Commit message describing the change. Appears in the commit history. Default: 'Create document via MCP'."),
    }, function (_a) { return tslib_1.__awaiter(_this, [_a], void 0, function (_b) {
        var client, graphType, result;
        var document = _b.document, graph_type = _b.graph_type, branch = _b.branch, message = _b.message;
        return tslib_1.__generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    client = createClient({ branch: branch });
                    graphType = (graph_type || "instance");
                    return [4 /*yield*/, client.addDocument(JSON.parse(document), { graph_type: graphType }, undefined, message || "Create document via MCP")];
                case 1:
                    result = _c.sent();
                    return [2 /*return*/, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }];
            }
        });
    }); });
    server.tool("read_document", "Read a single document by its full ID. Returns the complete JSON-LD document.\n\nDocument IDs follow the pattern \"Type/identifier\" for instance documents, or just the class name for schema documents.\n\nExample: Read an instance document\n  id: \"Person/jane\"\n\nExample: Read a schema class definition\n  id: \"Person\"\n  graph_type: \"schema\"\n\nExample: Read from a specific branch\n  id: \"Person/jane\"\n  branch: \"dev\"", {
        id: zod_1.z.string().describe('Full document ID. Instance documents use "Type/id" format (e.g., "Person/jane"). Schema documents use the class name (e.g., "Person").'),
        graph_type: zod_1.z.enum(["instance", "schema"]).optional().describe('Graph to read from: "instance" (default) for data, "schema" for class definitions.'),
        branch: zod_1.z.string().optional().describe("Branch to read from. Defaults to the main branch."),
    }, function (_a) { return tslib_1.__awaiter(_this, [_a], void 0, function (_b) {
        var client, graphType, result;
        var id = _b.id, graph_type = _b.graph_type, branch = _b.branch;
        return tslib_1.__generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    client = createClient({ branch: branch });
                    graphType = (graph_type || "instance");
                    return [4 /*yield*/, commands.readDocument(client, id, graphType)];
                case 1:
                    result = _c.sent();
                    return [2 /*return*/, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }];
            }
        });
    }); });
    server.tool("update_document", "Replace an existing document with new JSON content. The document must already exist. The full document is replaced, not merged \u2014 include all fields in the update.\n\nExample: Update a person's age and email\n  id: \"Person/jane\"\n  document: '{\"@type\":\"Person\",\"@id\":\"Person/jane\",\"name\":\"Jane Doe\",\"age\":31,\"email\":\"jane.doe@example.com\"}'\n\nExample: Update a schema class to add a new property\n  id: \"Person\"\n  document: '{\"@id\":\"Person\",\"@type\":\"Class\",\"name\":\"xsd:string\",\"age\":\"xsd:integer\",\"email\":{\"@type\":\"Optional\",\"@class\":\"xsd:string\"},\"phone\":{\"@type\":\"Optional\",\"@class\":\"xsd:string\"}}'\n  graph_type: \"schema\"", {
        id: zod_1.z.string().describe('Document ID to update (e.g., "Person/jane" for instance, "Person" for schema).'),
        document: zod_1.z.string().describe('Complete JSON replacement document. Must include "@type" and "@id". All fields must be present — omitted fields will be removed.'),
        graph_type: zod_1.z.enum(["instance", "schema"]).optional().describe('Graph to update in: "instance" (default) or "schema".'),
        branch: zod_1.z.string().optional().describe("Branch to operate on. Defaults to the main branch."),
        message: zod_1.z.string().optional().describe("Commit message describing the change. Appears in the commit history. Default: 'Update document via MCP'."),
    }, function (_a) { return tslib_1.__awaiter(_this, [_a], void 0, function (_b) {
        var client, graphType, result;
        var id = _b.id, document = _b.document, graph_type = _b.graph_type, branch = _b.branch, message = _b.message;
        return tslib_1.__generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    client = createClient({ branch: branch });
                    graphType = (graph_type || "instance");
                    return [4 /*yield*/, client.updateDocument(JSON.parse(document), { id: id, graph_type: graphType }, undefined, message || "Update document via MCP")];
                case 1:
                    result = _c.sent();
                    return [2 /*return*/, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }];
            }
        });
    }); });
    server.tool("delete_document", "Delete a single document by its ID. This permanently removes the document from the current branch.\n\nExample: Delete an instance document\n  id: \"Person/jane\"\n\nExample: Delete a schema class (removes the class definition)\n  id: \"Person\"\n  graph_type: \"schema\"", {
        id: zod_1.z.string().describe('Document ID to delete (e.g., "Person/jane" for instance, "Person" for schema).'),
        graph_type: zod_1.z.enum(["instance", "schema"]).optional().describe('Graph to delete from: "instance" (default) or "schema".'),
        branch: zod_1.z.string().optional().describe("Branch to operate on. Defaults to the main branch."),
        message: zod_1.z.string().optional().describe("Commit message describing the change. Appears in the commit history. Default: 'Delete document via MCP'."),
    }, function (_a) { return tslib_1.__awaiter(_this, [_a], void 0, function (_b) {
        var client, graphType, result;
        var id = _b.id, graph_type = _b.graph_type, branch = _b.branch, message = _b.message;
        return tslib_1.__generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    client = createClient({ branch: branch });
                    graphType = (graph_type || "instance");
                    return [4 /*yield*/, commands.deleteDocument(client, id, graphType, message || "Delete document via MCP")];
                case 1:
                    result = _c.sent();
                    return [2 /*return*/, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }];
            }
        });
    }); });
    server.tool("query_documents", "Query and list documents by type. Returns all documents matching the query criteria as a JSON array.\n\nThe query is a JSON object with a \"type\" field specifying which document type to list.\n\nExample: List all Person documents\n  query: '{\"type\":\"Person\"}'\n\nExample: List all schema classes\n  query: '{\"type\":\"Class\"}'\n  graph_type: \"schema\"\n\nExample: List documents on a branch\n  query: '{\"type\":\"Person\"}'\n  branch: \"dev\"", {
        query: zod_1.z.string().describe('JSON query template with "type" field. Example: \'{"type":"Person"}\' to list all Person documents.'),
        graph_type: zod_1.z.enum(["instance", "schema"]).optional().describe('Graph to query: "instance" (default) for data, "schema" for class definitions.'),
        branch: zod_1.z.string().optional().describe("Branch to query. Defaults to the main branch."),
    }, function (_a) { return tslib_1.__awaiter(_this, [_a], void 0, function (_b) {
        var client, graphType, result;
        var query = _b.query, graph_type = _b.graph_type, branch = _b.branch;
        return tslib_1.__generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    client = createClient({ branch: branch });
                    graphType = (graph_type || "instance");
                    return [4 /*yield*/, commands.queryDocuments(client, query, graphType)];
                case 1:
                    result = _c.sent();
                    return [2 /*return*/, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }];
            }
        });
    }); });
    server.tool("delete_documents_of_type", "Delete ALL documents of a given type. This is a bulk operation that permanently removes every instance document of the specified type. Use with caution.\n\nExample: Delete all Person documents\n  type: \"Person\"\n\nExample: Delete all documents of a type on a branch\n  type: \"Person\"\n  branch: \"dev\"", {
        type: zod_1.z.string().describe('Document type name (e.g., "Person"). All instance documents of this type will be permanently deleted.'),
        branch: zod_1.z.string().optional().describe("Branch to operate on. Defaults to the main branch."),
        message: zod_1.z.string().optional().describe("Commit message describing the change. Appears in the commit history. Default: 'Delete documents of type via MCP'."),
    }, function (_a) { return tslib_1.__awaiter(_this, [_a], void 0, function (_b) {
        var client, result;
        var type = _b.type, branch = _b.branch, message = _b.message;
        return tslib_1.__generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    client = createClient({ branch: branch });
                    return [4 /*yield*/, commands.deleteDocumentsOfType(client, type, message || "Delete documents of type via MCP")];
                case 1:
                    result = _c.sent();
                    return [2 /*return*/, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }];
            }
        });
    }); });
}
