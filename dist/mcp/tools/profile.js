"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerProfileTools = registerProfileTools;
var tslib_1 = require("tslib");
var commands = tslib_1.__importStar(require("../../commands"));
function registerProfileTools(server, connectionObject) {
    var _this = this;
    server.tool("dump_profile", "Show the current TerminusDB connection profile. Displays the server URL, user, organisation, database, and other connection settings. Sensitive fields like API keys are masked for security.\n\nUse this to verify which database and server the MCP tools are connected to.\n\nExample: Check the current connection\n  (no parameters needed)\n\nThe response shows: url, user, organisation, db, and other connection fields.", {}, function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var profile;
        return tslib_1.__generator(this, function (_a) {
            profile = commands.dumpProfile(connectionObject);
            return [2 /*return*/, {
                    content: [{ type: "text", text: JSON.stringify(profile.info, null, 2) }],
                }];
        });
    }); });
}
