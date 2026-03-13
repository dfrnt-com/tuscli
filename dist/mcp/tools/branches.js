"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerBranchTools = registerBranchTools;
var tslib_1 = require("tslib");
var zod_1 = require("zod");
var commands = tslib_1.__importStar(require("../../commands"));
function registerBranchTools(server, createClient) {
    var _this = this;
    server.tool("list_branches", "List all branches in the current database. TerminusDB supports Git-like branching for data \u2014 each branch is an independent line of changes.\n\nThe default branch is \"main\". Use this to discover available branches before switching to one.\n\nExample: List all branches\n  (no parameters needed)\n\nReturns a JSON object with branch names as keys.", {}, function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var client, result;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    client = createClient();
                    return [4 /*yield*/, commands.getBranches(client)];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }];
            }
        });
    }); });
    server.tool("create_branch", "Create a new branch in the database. By default, the new branch is a copy of the current main branch. Set empty to true to create a branch with no data.\n\nBranches work like Git branches for data \u2014 you can make changes on a branch without affecting main.\n\nExample: Create a branch from main\n  name: \"dev\"\n\nExample: Create an empty branch (no data copied)\n  name: \"scratch\"\n  empty: true", {
        name: zod_1.z.string().describe('Branch name to create (e.g., "dev", "feature-xyz"). Must be a valid identifier.'),
        empty: zod_1.z.boolean().optional().describe("If true, create an empty branch with no data. If false (default), branch copies the current main branch data."),
    }, function (_a) { return tslib_1.__awaiter(_this, [_a], void 0, function (_b) {
        var client, result;
        var name = _b.name, empty = _b.empty;
        return tslib_1.__generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    client = createClient();
                    return [4 /*yield*/, commands.createBranch(client, name, empty || false)];
                case 1:
                    result = _c.sent();
                    return [2 /*return*/, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }];
            }
        });
    }); });
    server.tool("delete_branch", "Delete a branch from the database. This permanently removes the branch and its unique changes. Cannot delete the main branch.\n\nExample: Delete a feature branch\n  name: \"dev\"", {
        name: zod_1.z.string().describe('Branch name to delete (e.g., "dev"). The main branch cannot be deleted.'),
    }, function (_a) { return tslib_1.__awaiter(_this, [_a], void 0, function (_b) {
        var client, result;
        var name = _b.name;
        return tslib_1.__generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    client = createClient();
                    return [4 /*yield*/, commands.deleteBranch(client, name)];
                case 1:
                    result = _c.sent();
                    return [2 /*return*/, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }];
            }
        });
    }); });
}
