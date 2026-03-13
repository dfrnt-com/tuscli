"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDatabaseTools = registerDatabaseTools;
var tslib_1 = require("tslib");
var zod_1 = require("zod");
var commands = tslib_1.__importStar(require("../../commands"));
function registerDatabaseTools(server, createClient, connectionObject) {
    var _this = this;
    // @ts-ignore - MCP SDK type inference too deep for this signature
    server.tool("create_database", "Create a new TerminusDB database (also called a data product). This must be called before any document or schema operations on a new database.\n\nTypical workflow:\n1. create_database \u2014 create the database\n2. create_document with graph_type \"schema\" \u2014 define your schema classes\n3. create_document \u2014 add instance documents conforming to the schema\n\nExample: Create a database called \"myproject\"\n  name: \"myproject\"\n  label: \"My Project\"\n  comment: \"Project knowledge graph\"\n\nExample: Create a database with no schema graph\n  name: \"scratch\"\n  schema: false", {
        name: zod_1.z.string().describe("Database name/identifier (e.g., 'myproject'). Must be a valid identifier without spaces."),
        label: zod_1.z.string().optional().describe("Human-readable display label for the database. Defaults to the name if not provided."),
        comment: zod_1.z.string().optional().describe("Description or comment about the database purpose."),
        schema: zod_1.z.boolean().optional().describe("Whether to create with a schema graph (default: true). Set to false for schema-free databases."),
    }, function (_a) { return tslib_1.__awaiter(_this, [_a], void 0, function (_b) {
        var client, createJson, result;
        var name = _b.name, label = _b.label, comment = _b.comment, schema = _b.schema;
        return tslib_1.__generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    client = createClient();
                    createJson = JSON.stringify({
                        schema: schema !== undefined ? schema : true,
                        label: label || name,
                        comment: comment || "",
                    });
                    return [4 /*yield*/, commands.createDatabase(client, name, createJson)];
                case 1:
                    result = _c.sent();
                    return [2 /*return*/, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }];
            }
        });
    }); });
    server.tool("delete_database", "Permanently delete a TerminusDB database and all its data, branches, and history. This action cannot be undone.\n\nExample: Delete a database called \"scratch\"\n  name: \"scratch\"", {
        name: zod_1.z.string().describe("Database name/identifier to delete (e.g., 'scratch'). The database and all its contents will be permanently removed."),
    }, function (_a) { return tslib_1.__awaiter(_this, [_a], void 0, function (_b) {
        var client, result;
        var name = _b.name;
        return tslib_1.__generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    client = createClient();
                    return [4 /*yield*/, commands.deleteDatabase(client, name, connectionObject.organisation)];
                case 1:
                    result = _c.sent();
                    return [2 /*return*/, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }];
            }
        });
    }); });
}
