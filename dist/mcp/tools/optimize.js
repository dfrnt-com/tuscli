"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOptimizeTools = registerOptimizeTools;
var tslib_1 = require("tslib");
var zod_1 = require("zod");
var commands = tslib_1.__importStar(require("../../commands"));
function registerOptimizeTools(server, createClient) {
    var _this = this;
    server.tool("optimize_branch", "Optimize a branch by performing delta rollups. This compacts the internal storage layers, improving query performance after many writes.\n\nRun this periodically on branches with heavy write activity, or after bulk data imports.\n\nExample: Optimize the main branch\n  branch: \"main\"\n\nExample: Optimize a feature branch\n  branch: \"dev\"", {
        branch: zod_1.z.string().describe('Branch name to optimize (e.g., "main"). Compacts storage layers for better query performance.'),
    }, function (_a) { return tslib_1.__awaiter(_this, [_a], void 0, function (_b) {
        var client, result;
        var branch = _b.branch;
        return tslib_1.__generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    client = createClient();
                    return [4 /*yield*/, commands.optimizeBranch(client, branch)];
                case 1:
                    result = _c.sent();
                    return [2 /*return*/, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }];
            }
        });
    }); });
}
