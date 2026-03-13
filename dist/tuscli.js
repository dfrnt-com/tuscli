#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var commander_1 = require("commander");
var json_colorizer_1 = tslib_1.__importDefault(require("json-colorizer"));
var debug_1 = tslib_1.__importDefault(require("debug"));
var node_fs_1 = tslib_1.__importDefault(require("node:fs"));
var connection_1 = require("./connection");
var commands_1 = require("./commands");
var program = new commander_1.Command();
var collect = function (value, previous) { return previous.concat([value]); };
program
    .version("0.2.5")
    .description("TerminusDB Javascript cli: tuscli [options] <fileName(s)>")
    .option("-c, --create", "create document from provided file")
    .option("--createFromJson", "create document from supplied JSON, like '{\"@id\":\"Entity/1\", \"@type\":\"Entity\"}'")
    .option("-r, --read <document-id>", "read document-id (Type/id)")
    .option("-s, --schemaFrame <document-id>", "get the schema frame for a type/subdoctype/enum")
    .option("-u, --update <document-id>", "update document")
    .option("-d, --delete <document-id>", "delete document")
    .option("-q, --query-documents <query-template-json>", 'list documents of type, example: {"type":"Person"}')
    .option("-e, --export-schema", "export/show instance schema JSON")
    .option("-p, --profile <json-file>", "JSON-formatted connection profile, or set env TUSPARAMS in base64 encoding")
    .option("-z, --dump-profile", "show the default or current connection profile, and how to set it")
    .option("-o, --optimize <main>", "optimize and do delta rollups on a branch")
    .option("--createDatabase <dataproduct-id> <create-json>", 'create data product, default JSON: {"schema":true, "label": "", "comment":""}')
    .option("--deleteDatabase <dataproduct-id>", "delete database/data product")
    .option("--deleteDocumentsOfType <type>", "delete all documents of a type")
    .option("--deleteDocumentsIsaType <type>", "delete documents that are is-a type")
    .option("--dataProduct <dataproduct-id>", "override dataproduct to use")
    .option("--createBranch <branch-id> <true/false>", "create branch, true for empty branch")
    .option("--deleteBranch <branch-id>", "delete branch")
    .option("--branches", "pull list of branches in the data product")
    .option("--nocolor", "disable the colorize filter of output")
    .option("--quiet", "disable diagnostic outputs")
    .option("-x, --system", "connect to system database")
    .option("-y, --commitGraph <count>", "get the 10 last commits, supply an argument for more")
    .option("-i, --instance <instance|schema>", "document instance, default is instance")
    .option("-b, --branch <branch-id>", "use/select active branch")
    .option("-t, --commit <commit-id>", "use/select specific commit")
    .option("--woql <WOQL>", "Execute JS WOQL query (as an argument)")
    .option("--compileWoql <WOQL>", "Compile JS WOQL (as an argument) into JSON WOQL")
    .option("--woqlResource <file>", "named file resource(s) to attach to WOQL query (such as csv)", collect, [])
    .option("--woqlFile <example.woql.js>", "Execute JS WOQL (from a file)")
    .option("--woqlCompile <example.woql.js>", "Compile JS WOQL into JSON WOQL (from a file)")
    .option("--mcp", "Launch as an MCP (Model Context Protocol) server over stdio")
    .parse(process.argv);
var options = program.opts();
var debug = (0, debug_1.default)("Zebra CLI");
if (options.mcp) {
    // Launch MCP server — dynamic import to avoid loading MCP deps for normal CLI usage
    require("./mcp/server");
}
else {
    // Normal CLI mode
    if (Object.keys(options).length === 0) {
        program.help();
    }
    var showOutput_1 = true;
    var connectionObject_1 = (0, connection_1.findConnectionConfiguration)(options.jsonFile, "TUSPARAMS");
    debug(connection_1.exampleConnObject);
    var consoleDumpJson_1 = function (obj) {
        var json = JSON.stringify(obj, null, 2);
        if (options.nocolor) {
            console.log(json);
        }
        else {
            console.log((0, json_colorizer_1.default)(json, { pretty: true }));
        }
    };
    if (options.dumpProfile) {
        var profile = (0, commands_1.dumpProfile)(connectionObject_1);
        console.warn("To set the environment variable in bash, use TUSREMOTE to remote services:");
        console.warn(profile.exampleEnvString);
        console.log("To debug, export DEBUG='*'");
        console.log("");
        console.warn("Current profile (except for keys):");
        consoleDumpJson_1(profile.info);
        process.exit(0);
    }
    var namedResourceData_1 = [];
    var cli = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var client, database, _i, _a, filename, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, createJsonFromFileNameParameter, result, result, createEmptyBranch, result, result, _m, result, result, result, result;
        return tslib_1.__generator(this, function (_o) {
            switch (_o.label) {
                case 0:
                    debug("Options: ", options);
                    debug("Remaining arguments: ", program.args);
                    client = (0, connection_1.connectClient)(connectionObject_1);
                    (0, connection_1.configureClient)(client, connectionObject_1, {
                        dataProduct: options.dataProduct,
                        system: options.system,
                        branch: options.branch,
                        commit: options.commit,
                    });
                    database = (0, connection_1.selectGraph)(options.instance);
                    if (options.quiet) {
                        showOutput_1 = false;
                    }
                    if (options.woqlResource) {
                        for (_i = 0, _a = options.woqlResource; _i < _a.length; _i++) {
                            filename = _a[_i];
                            if (typeof filename !== "string") {
                                continue;
                            }
                            namedResourceData_1.push({
                                filename: filename,
                                data: node_fs_1.default.createReadStream(filename),
                            });
                        }
                    }
                    if (!options.commitGraph) return [3 /*break*/, 2];
                    _b = consoleDumpJson_1;
                    return [4 /*yield*/, (0, commands_1.getCommitGraph)(client, options.commitGraph, options.branch)];
                case 1:
                    _b.apply(void 0, [_o.sent()]);
                    _o.label = 2;
                case 2:
                    if (!options.exportSchema) return [3 /*break*/, 4];
                    _c = consoleDumpJson_1;
                    return [4 /*yield*/, (0, commands_1.exportSchema)(client)];
                case 3:
                    _c.apply(void 0, [_o.sent()]);
                    _o.label = 4;
                case 4:
                    if (!options.create) return [3 /*break*/, 6];
                    _d = debug;
                    return [4 /*yield*/, (0, commands_1.createDocument)(client, program.args, database)];
                case 5:
                    _d.apply(void 0, [_o.sent()]);
                    _o.label = 6;
                case 6:
                    if (!options.createFromJson) return [3 /*break*/, 8];
                    _e = debug;
                    return [4 /*yield*/, (0, commands_1.createDocumentFromJson)(client, program.args, database)];
                case 7:
                    _e.apply(void 0, [_o.sent()]);
                    _o.label = 8;
                case 8:
                    if (!options.update) return [3 /*break*/, 10];
                    _f = debug;
                    return [4 /*yield*/, (0, commands_1.updateDocument)(client, options.update, program.args, database)];
                case 9:
                    _f.apply(void 0, [_o.sent()]);
                    _o.label = 10;
                case 10:
                    if (!(typeof options.queryDocuments === "string")) return [3 /*break*/, 12];
                    _g = consoleDumpJson_1;
                    return [4 /*yield*/, (0, commands_1.queryDocuments)(client, options.queryDocuments, database)];
                case 11:
                    _g.apply(void 0, [_o.sent()]);
                    _o.label = 12;
                case 12:
                    if (!(typeof options.read === "string")) return [3 /*break*/, 14];
                    _h = consoleDumpJson_1;
                    return [4 /*yield*/, (0, commands_1.readDocument)(client, options.read, database)];
                case 13:
                    _h.apply(void 0, [_o.sent()]);
                    _o.label = 14;
                case 14:
                    if (!(typeof options.schemaFrame === "string")) return [3 /*break*/, 16];
                    _j = consoleDumpJson_1;
                    return [4 /*yield*/, (0, commands_1.getSchemaFrame)(client, options.schemaFrame)];
                case 15:
                    _j.apply(void 0, [_o.sent()]);
                    _o.label = 16;
                case 16:
                    if (!(typeof options.delete === "string")) return [3 /*break*/, 18];
                    _k = consoleDumpJson_1;
                    return [4 /*yield*/, (0, commands_1.deleteDocument)(client, options.delete, database)];
                case 17:
                    _k.apply(void 0, [_o.sent()]);
                    _o.label = 18;
                case 18:
                    if (!(typeof options.optimize === "string")) return [3 /*break*/, 20];
                    _l = consoleDumpJson_1;
                    return [4 /*yield*/, (0, commands_1.optimizeBranch)(client, options.optimize)];
                case 19:
                    _l.apply(void 0, [_o.sent()]);
                    _o.label = 20;
                case 20:
                    if (!(typeof options.createDatabase === "string")) return [3 /*break*/, 22];
                    createJsonFromFileNameParameter = program.args[0];
                    return [4 /*yield*/, (0, commands_1.createDatabase)(client, options.createDatabase, createJsonFromFileNameParameter)];
                case 21:
                    result = _o.sent();
                    showOutput_1 && consoleDumpJson_1(result);
                    _o.label = 22;
                case 22:
                    if (!(typeof options.deleteDatabase === "string")) return [3 /*break*/, 24];
                    return [4 /*yield*/, (0, commands_1.deleteDatabase)(client, options.deleteDatabase, connectionObject_1.organisation)];
                case 23:
                    result = _o.sent();
                    showOutput_1 && consoleDumpJson_1(result);
                    _o.label = 24;
                case 24:
                    if (!(typeof options.createBranch === "string")) return [3 /*break*/, 26];
                    createEmptyBranch = program.args[0];
                    return [4 /*yield*/, (0, commands_1.createBranch)(client, options.createBranch, createEmptyBranch === "true")];
                case 25:
                    result = _o.sent();
                    showOutput_1 && consoleDumpJson_1(result);
                    _o.label = 26;
                case 26:
                    if (!(typeof options.deleteBranch === "string")) return [3 /*break*/, 28];
                    return [4 /*yield*/, (0, commands_1.deleteBranch)(client, options.deleteBranch)];
                case 27:
                    result = _o.sent();
                    showOutput_1 && consoleDumpJson_1(result);
                    _o.label = 28;
                case 28:
                    if (!options.branches) return [3 /*break*/, 30];
                    _m = consoleDumpJson_1;
                    return [4 /*yield*/, (0, commands_1.getBranches)(client)];
                case 29:
                    _m.apply(void 0, [_o.sent()]);
                    _o.label = 30;
                case 30:
                    if (!(typeof options.deleteDocumentsOfType === "string")) return [3 /*break*/, 32];
                    return [4 /*yield*/, (0, commands_1.deleteDocumentsOfType)(client, options.deleteDocumentsOfType)];
                case 31:
                    result = _o.sent();
                    showOutput_1 && consoleDumpJson_1(result);
                    _o.label = 32;
                case 32:
                    if (!(typeof options.deleteDocumentsIsaType === "string")) return [3 /*break*/, 34];
                    return [4 /*yield*/, (0, commands_1.deleteDocumentsIsaType)(client, options.deleteDocumentsIsaType)];
                case 33:
                    result = _o.sent();
                    showOutput_1 && consoleDumpJson_1(result);
                    _o.label = 34;
                case 34:
                    if (!(typeof options.woql === "string")) return [3 /*break*/, 36];
                    return [4 /*yield*/, (0, commands_1.executeWoql)(client, options.woql, namedResourceData_1)];
                case 35:
                    result = _o.sent();
                    showOutput_1 && consoleDumpJson_1(result);
                    _o.label = 36;
                case 36:
                    if (!(typeof options.woqlFile === "string")) return [3 /*break*/, 38];
                    return [4 /*yield*/, (0, commands_1.executeWoqlFile)(client, options.woqlFile, namedResourceData_1)];
                case 37:
                    result = _o.sent();
                    showOutput_1 && consoleDumpJson_1(result);
                    _o.label = 38;
                case 38:
                    if (typeof options.woqlCompile === "string") {
                        consoleDumpJson_1((0, commands_1.compileWoqlFile)(options.woqlCompile));
                    }
                    if (typeof options.compileWoql === "string") {
                        consoleDumpJson_1((0, commands_1.compileWoql)(options.compileWoql));
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    cli();
}
