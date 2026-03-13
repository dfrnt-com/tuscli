#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var connection_1 = require("../connection");
var database_1 = require("./tools/database");
var documents_1 = require("./tools/documents");
var schema_1 = require("./tools/schema");
var branches_1 = require("./tools/branches");
var woql_1 = require("./tools/woql");
var commit_1 = require("./tools/commit");
var optimize_1 = require("./tools/optimize");
var profile_1 = require("./tools/profile");
var connectionObject = (0, connection_1.findConnectionConfiguration)("", "TUSPARAMS");
var createConfiguredClient = function (overrides) {
    var client = (0, connection_1.connectClient)(connectionObject);
    (0, connection_1.configureClient)(client, connectionObject, overrides || {});
    return client;
};
var server = new mcp_js_1.McpServer({
    name: "tuscli",
    version: "0.2.5",
});
(0, database_1.registerDatabaseTools)(server, createConfiguredClient, connectionObject);
(0, documents_1.registerDocumentTools)(server, createConfiguredClient);
(0, schema_1.registerSchemaTools)(server, createConfiguredClient);
(0, branches_1.registerBranchTools)(server, createConfiguredClient);
(0, woql_1.registerWoqlTools)(server, createConfiguredClient);
(0, commit_1.registerCommitTools)(server, createConfiguredClient);
(0, optimize_1.registerOptimizeTools)(server, createConfiguredClient);
(0, profile_1.registerProfileTools)(server, connectionObject);
function main() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var transport;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    transport = new stdio_js_1.StdioServerTransport();
                    return [4 /*yield*/, server.connect(transport)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (error) {
    console.error("MCP server error:", error);
    process.exit(1);
});
