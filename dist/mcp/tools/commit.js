"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommitTools = registerCommitTools;
var tslib_1 = require("tslib");
var zod_1 = require("zod");
var commands = tslib_1.__importStar(require("../../commands"));
function registerCommitTools(server, createClient) {
    var _this = this;
    // @ts-ignore - MCP SDK type inference too deep for this signature
    server.tool("get_commit_graph", "Retrieve the commit history for the database. Each commit represents a change made to the data or schema, similar to Git commits.\n\nReturns a list of commits with timestamps, authors, and messages. Use this to inspect recent changes or audit the history.\n\nExample: Get the last 10 commits (default)\n  (no parameters needed)\n\nExample: Get the last 50 commits\n  count: 50\n\nExample: Get commits for a specific branch\n  branch: \"dev\"\n  count: 20", {
        count: zod_1.z.number().optional().describe("Number of recent commits to retrieve (default: 10). Increase for deeper history."),
        branch: zod_1.z.string().optional().describe("Branch to get commit history for. Defaults to the main branch."),
    }, function (_a) { return tslib_1.__awaiter(_this, [_a], void 0, function (_b) {
        var client, result;
        var count = _b.count, branch = _b.branch;
        return tslib_1.__generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    client = createClient({ branch: branch });
                    return [4 /*yield*/, commands.getCommitGraph(client, count || 10, branch)];
                case 1:
                    result = _c.sent();
                    return [2 /*return*/, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }];
            }
        });
    }); });
}
