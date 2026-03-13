"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchemaTools = registerSchemaTools;
var tslib_1 = require("tslib");
var zod_1 = require("zod");
var commands = tslib_1.__importStar(require("../../commands"));
function registerSchemaTools(server, createClient) {
    var _this = this;
    server.tool("export_schema", "Export the full schema of the database as a JSON array. Returns all class definitions, enums, and type hierarchies.\n\nUse this to inspect the current data model before creating or updating documents. The result is a JSON array of schema class objects.\n\nExample: Export the schema of the current database\n  (no parameters needed)\n\nExample: Export schema from a specific branch\n  branch: \"dev\"\n\nThe response will be a JSON array like:\n[\n  {\"@id\":\"Person\",\"@type\":\"Class\",\"name\":\"xsd:string\",\"age\":\"xsd:integer\"},\n  {\"@id\":\"Color\",\"@type\":\"Enum\",\"@value\":[\"red\",\"green\",\"blue\"]}\n]", {
        branch: zod_1.z.string().optional().describe("Branch to export schema from. Defaults to the main branch."),
    }, function (_a) { return tslib_1.__awaiter(_this, [_a], void 0, function (_b) {
        var client, result;
        var branch = _b.branch;
        return tslib_1.__generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    client = createClient({ branch: branch });
                    return [4 /*yield*/, commands.exportSchema(client)];
                case 1:
                    result = _c.sent();
                    return [2 /*return*/, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }];
            }
        });
    }); });
    server.tool("get_schema_frame", "Get the detailed schema frame for a specific type, subdocument, or enum. Returns the full type definition including all properties, their types, and constraints.\n\nUse this to understand the shape of a type before creating or updating documents of that type.\n\nExample: Get the frame for Person\n  type: \"Person\"\n\nExample: Get an enum's allowed values\n  type: \"Color\"\n\nThe response includes property names, their XSD types (xsd:string, xsd:integer, xsd:dateTime, etc.), and cardinality (Optional, Set, List, Array).", {
        type: zod_1.z.string().describe('Type/class name to inspect (e.g., "Person", "Color"). Returns the full property definitions for the type.'),
        branch: zod_1.z.string().optional().describe("Branch to read from. Defaults to the main branch."),
    }, function (_a) { return tslib_1.__awaiter(_this, [_a], void 0, function (_b) {
        var client, result;
        var type = _b.type, branch = _b.branch;
        return tslib_1.__generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    client = createClient({ branch: branch });
                    return [4 /*yield*/, commands.getSchemaFrame(client, type)];
                case 1:
                    result = _c.sent();
                    return [2 /*return*/, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }];
            }
        });
    }); });
}
