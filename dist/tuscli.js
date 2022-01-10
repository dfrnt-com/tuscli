#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cli = void 0;
var tslib_1 = require("tslib");
var terminusdb_client_1 = (0, tslib_1.__importDefault)(require("@terminusdb/terminusdb-client"));
var commander_1 = require("commander");
var json_colorizer_1 = (0, tslib_1.__importDefault)(require("json-colorizer"));
var debug_1 = (0, tslib_1.__importDefault)(require("debug"));
var fs_1 = (0, tslib_1.__importDefault)(require("fs"));
var program = new commander_1.Command();
program
    .version("0.0.9")
    .description("TerminusDB Javascript cli: tuscli [options] <fileName(s)>")
    .option("-c, --create", "create document from provided file")
    .option("-r, --read <document-id>", "read document-id (Type/id)")
    .option("-s, --schemaFrame <document-id>", "get the schema frame for a type/subdoctype/enum")
    .option("-u, --update <document-id>", "update document")
    .option("-d, --delete <document-id>", "delete document")
    .option("-q, --query-documents <query-template-json>", 'list documents of type, example: {"type":"Person"}')
    .option("-e, --export-schema", "export/show instance schema JSON")
    .option("-p, --profile <json-file>", "JSON-formatted connection profile, or set env TUSPARAMS in base64 encoding")
    .option("-z, --dump-profile", "show the default or current connection profile, and how to set it")
    .option("-i, --instance <instance|schema>", "document instance, default is instance")
    .option("-x, --system", "connect to system database")
    .option("-o, --optimize <main>", "optimize and do delta rollups on a branch")
    .option("--createDatabase <database-id> <create-json>", 'create database/data product, default JSON: {"schema":true, "label": "", "comment":""}')
    .option("--deleteDatabase <database-id>", "delete database/data product")
    .parse(process.argv);
var DatabaseSelection;
(function (DatabaseSelection) {
    DatabaseSelection["SCHEMA"] = "schema";
    DatabaseSelection["INSTANCE"] = "instance";
})(DatabaseSelection || (DatabaseSelection = {}));
var RepoType;
(function (RepoType) {
    RepoType["local"] = "local";
    RepoType["remote"] = "remote";
})(RepoType || (RepoType = {}));
var options = program.opts();
var debug = (0, debug_1.default)("Zebra CLI");
if (Object.keys(options).length === 0) {
    program.help();
}
var btoa = function (b) { return Buffer.from(b, "base64").toString("binary"); };
var getFileJson = function (path) {
    try {
        if (!fs_1.default.existsSync(path)) {
            throw new Error("File does not exist");
        }
        try {
            return JSON.parse(fs_1.default.readFileSync(path).toString());
        }
        catch (e) {
            throw new Error("Could not parse the file correctly, likely bad JSON");
        }
    }
    catch (e) {
        console.error("Could handle input file correctly: ", path);
        console.log(e);
        process.exit(1);
    }
};
var findConnectionConfiguration = function (file) {
    var _a;
    if (file) {
        debug("Provided configuration information from file: " + file);
        return getFileJson(file);
    }
    else if (process.env.TUSPARAMS) {
        try {
            debug("Provided configuration infomation from TUSPARAMS: " + btoa(process.env.TUSPARAMS));
            return JSON.parse(btoa((_a = process.env.TUSPARAMS) !== null && _a !== void 0 ? _a : ""));
        }
        catch (e) {
            console.error("TUSPARAMS environment variable not proper base64 encoded JSON string");
        }
    }
    debug("No provided connection information");
    return {};
};
var exampleConnObject = JSON.stringify({
    url: "http://localhost:6363",
    key: "password",
    user: "admin",
    organisation: "admin",
    db: "mydb",
});
var connectionObject = findConnectionConfiguration(options.jsonFile);
debug(exampleConnObject);
var consoleDumpJson = function (obj) {
    var json = JSON.stringify(obj, null, 2);
    console.log((0, json_colorizer_1.default)(json, { pretty: true }));
};
if (options.dumpProfile) {
    var dumpInfo = Object.assign({}, connectionObject);
    if (dumpInfo.key) {
        dumpInfo.key = "**** hidden ****";
    }
    if (dumpInfo.apikey) {
        dumpInfo.apikey = "**** hidden ****";
    }
    console.warn("To set the environment variable in bash:");
    console.warn('# export TUSPARAMS="$(echo ' + JSON.stringify(exampleConnObject) + ' |base64)" ');
    console.log("To debug, export DEBUG='*'");
    console.log("");
    console.warn("Current profile (except for keys):");
    consoleDumpJson(dumpInfo);
    process.exit(0);
}
var cli = function () { return (0, tslib_1.__awaiter)(void 0, void 0, void 0, function () {
    var connectClient, client, selectDatabase, database, _a, _b, _c, _d, _e, _f, createJsonFromFileNameParameter_1, createJson, databaseCreationOptions, _g, _h;
    return (0, tslib_1.__generator)(this, function (_j) {
        switch (_j.label) {
            case 0:
                debug("Options: ", options);
                debug("Remaining arguments: ", program.args);
                connectClient = function (connInfo) {
                    if ("key" in connInfo) {
                        return new terminusdb_client_1.default.WOQLClient(connInfo.url, {
                            db: connInfo.db,
                            key: connInfo.key,
                            user: connInfo.user,
                            organisation: connInfo.organisation,
                        });
                    }
                    else {
                        return new terminusdb_client_1.default.WOQLClient(connInfo.url, {
                            db: connInfo.db,
                            user: connInfo.user,
                            organisation: connInfo.organisation,
                        });
                    }
                };
                client = connectClient(connectionObject);
                if ("apikey" in connectionObject) {
                    client.setApiKey(connectionObject.apikey);
                }
                return [4 /*yield*/, client.connect()];
            case 1:
                _j.sent();
                selectDatabase = function (selectedDatabase) {
                    switch (selectedDatabase) {
                        case "schema":
                            return selectedDatabase;
                        case "instance":
                            return selectedDatabase;
                        default:
                            return DatabaseSelection.INSTANCE;
                    }
                };
                database = selectDatabase(options.instance);
                if (options.system) {
                    client.setSystemDb();
                }
                if (!options.exportSchema) return [3 /*break*/, 3];
                _a = consoleDumpJson;
                return [4 /*yield*/, client.getSchema()];
            case 2:
                _a.apply(void 0, [_j.sent()]);
                _j.label = 3;
            case 3:
                if (options.create) {
                    debug(program.args
                        .map(function (fileName) { return getFileJson(fileName); })
                        .map(function (obj) { return (0, tslib_1.__awaiter)(void 0, void 0, void 0, function () {
                        return (0, tslib_1.__generator)(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, client.addDocument(obj, { graph_type: database })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); }));
                }
                if (options.update) {
                    debug(program.args
                        .map(function (fileName) { return getFileJson(fileName); })
                        .map(function (obj) { return (0, tslib_1.__awaiter)(void 0, void 0, void 0, function () {
                        return (0, tslib_1.__generator)(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, client.updateDocument(obj, { id: options.update, graph_type: database })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); }));
                }
                if (!(typeof options.queryDocuments === "string")) return [3 /*break*/, 5];
                if (!options.queryDocuments)
                    throw new Error("No query template provided");
                _b = consoleDumpJson;
                return [4 /*yield*/, client.queryDocument(JSON.parse(options.queryDocuments), { as_list: true, graph_type: database })];
            case 4:
                _b.apply(void 0, [_j.sent()]);
                _j.label = 5;
            case 5:
                if (!(typeof options.read === "string")) return [3 /*break*/, 7];
                if (!options.read)
                    throw new Error("No documentId to read provided");
                _c = consoleDumpJson;
                return [4 /*yield*/, client.getDocument({ id: options.read, graph_type: database })];
            case 6:
                _c.apply(void 0, [_j.sent()]);
                _j.label = 7;
            case 7:
                if (!(typeof options.schemaFrame === "string")) return [3 /*break*/, 9];
                if (!options.schemaFrame)
                    throw new Error("No documentId to get the frame for provided");
                _d = consoleDumpJson;
                return [4 /*yield*/, client.getSchemaFrame(options.schemaFrame)];
            case 8:
                _d.apply(void 0, [_j.sent()]);
                _j.label = 9;
            case 9:
                if (!(typeof options.delete === "string")) return [3 /*break*/, 11];
                if (!options.delete)
                    throw new Error("Document to delete was not provided");
                _e = consoleDumpJson;
                return [4 /*yield*/, client.deleteDocument({ id: [options.delete], graph_type: database })];
            case 10:
                _e.apply(void 0, [_j.sent()]);
                _j.label = 11;
            case 11:
                if (!(typeof options.optimize === "string")) return [3 /*break*/, 13];
                if (!options.optimize)
                    throw new Error("What to optimize was not provided");
                _f = consoleDumpJson;
                return [4 /*yield*/, client.optimizeBranch(options.optimize)];
            case 12:
                _f.apply(void 0, [_j.sent()]);
                _j.label = 13;
            case 13:
                if (!(typeof options.createDatabase === "string")) return [3 /*break*/, 16];
                createJsonFromFileNameParameter_1 = program.args[0];
                if (!options.createDatabase)
                    throw new Error("Database name to create was not provided");
                return [4 /*yield*/, (function () { return (0, tslib_1.__awaiter)(void 0, void 0, void 0, function () { return (0, tslib_1.__generator)(this, function (_a) {
                        return [2 /*return*/, JSON.parse(createJsonFromFileNameParameter_1)];
                    }); }); })()
                        .then(function (res) { return res; })
                        .catch(function () { return ({}); })];
            case 14:
                createJson = _j.sent();
                if (createJson.schema === "false") {
                    throw new Error('Error: schema element must be a boolean or undefined, and not "false". If undefined, it defaults to true.');
                }
                databaseCreationOptions = {
                    schema: typeof createJson.schema === "boolean" ? createJson.schema : true,
                    label: typeof createJson.label === "string" ? createJson.label : "",
                    comment: typeof createJson.comment === "string" ? createJson.comment : "",
                };
                _g = consoleDumpJson;
                return [4 /*yield*/, client.createDatabase(options.createDatabase, databaseCreationOptions)];
            case 15:
                _g.apply(void 0, [_j.sent()]);
                _j.label = 16;
            case 16:
                if (!(typeof options.deleteDatabase === "string")) return [3 /*break*/, 18];
                if (!options.deleteDatabase)
                    throw new Error("Database name to delete/kill was not provided");
                _h = consoleDumpJson;
                return [4 /*yield*/, client.deleteDatabase(options.deleteDatabase, connectionObject.organisation)];
            case 17:
                _h.apply(void 0, [_j.sent()]);
                _j.label = 18;
            case 18: return [2 /*return*/];
        }
    });
}); };
exports.cli = cli;
(0, exports.cli)();
