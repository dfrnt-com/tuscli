#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cli = void 0;
var tslib_1 = require("tslib");
var terminusdb_client_1 = tslib_1.__importStar(require("@terminusdb/terminusdb-client"));
var commander_1 = require("commander");
var json_colorizer_1 = tslib_1.__importDefault(require("json-colorizer"));
var debug_1 = tslib_1.__importDefault(require("debug"));
var fs_1 = tslib_1.__importDefault(require("fs"));
var program = new commander_1.Command();
program
    .version("0.2.3")
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
    .option("--woqlFile <example.woql.js>", "Execute JS WOQL (from a file)")
    .option("--woqlCompile <example.woql.js>", "Compile JS WOQL into JSON WOQL (from a file)")
    .parse(process.argv);
var GraphSelection;
(function (GraphSelection) {
    GraphSelection["SCHEMA"] = "schema";
    GraphSelection["INSTANCE"] = "instance";
})(GraphSelection || (GraphSelection = {}));
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
var showOutput = true;
var btoa = function (b) { return Buffer.from(b, "base64").toString("binary"); };
var getFileJson = function (path) {
    try {
        var fileAtPath = path === "-" ? "/dev/stdin" : path;
        if (!fs_1.default.existsSync(fileAtPath)) {
            throw new Error("File does not exist");
        }
        try {
            return JSON.parse(fs_1.default.readFileSync(fileAtPath, { encoding: "utf-8" }).toString());
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
var findConnectionConfiguration = function (file, envName) {
    var envParameters = process.env[envName];
    if (file) {
        debug("Provided configuration information from file: " + file);
        return getFileJson(file);
    }
    else if (envParameters) {
        try {
            debug("Provided configuration infomation from TUSPARAMS: " + btoa(envParameters));
            return JSON.parse(btoa(envParameters));
        }
        catch (e) {
            console.error(envName + " environment variable not with proper base64 encoded JSON string");
        }
    }
    debug("No provided connection information");
    return {};
};
var exampleConnObject = JSON.stringify({
    url: "http://localhost:6363",
    apikey: "password",
    organisation: "admin",
    db: "mydb",
    user: "john.doe@example.com",
});
var connectionObject = findConnectionConfiguration(options.jsonFile, "TUSPARAMS");
var remoteObject = findConnectionConfiguration(options.jsonFile, "TUSREMOTE");
debug(exampleConnObject);
var consoleDumpJson = function (obj) {
    var json = JSON.stringify(obj, null, 2);
    if (options.nocolor) {
        console.log(json);
    }
    else {
        console.log((0, json_colorizer_1.default)(json, { pretty: true }));
    }
};
if (options.dumpProfile) {
    var dumpInfo = Object.assign({}, connectionObject);
    if (dumpInfo.key) {
        dumpInfo.key = "**** hidden ****";
    }
    if (dumpInfo.apikey) {
        dumpInfo.apikey = "**** hidden ****";
    }
    console.warn("To set the environment variable in bash, use TUSREMOTE to remote services:");
    console.warn('# export TUSPARAMS="$(echo ' + JSON.stringify(exampleConnObject) + ' |base64)" ');
    console.log("To debug, export DEBUG='*'");
    console.log("");
    console.warn("Current profile (except for keys):");
    consoleDumpJson(dumpInfo);
    process.exit(0);
}
var connectClient = function (connInfo) {
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
            user: connInfo.user,
            organisation: connInfo.organisation,
        });
    }
};
var cli = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var client, selectGraph, database, defaultLength, commitBindings, _a, _b, _c, _d, _e, _f, createJsonFromFileNameParameter_1, createJson, databaseCreationOptions, result, result, createEmptyBranch, result, result, result, _g, parseWoql, comment, parsedWoql, result, comment, parsedWoql, result, comment, parsedWoql, suppliedWoql, result, comment, woql, parsedWoql, suppliedWoql, result, woql, parsedWoql, suppliedWoql, parsedWoql, suppliedWoql;
    var _h;
    return tslib_1.__generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                debug("Options: ", options);
                debug("Remaining arguments: ", program.args);
                client = connectClient(connectionObject);
                // Make local and remote authentication
                // Convert to new connection object for the TUSPARAMS
                // client.remoteAuth({"key":"randomkey","type":"jwt"})
                if ("apikey" in connectionObject) {
                    client.setApiKey(connectionObject.apikey);
                }
                else if ("jwt" in connectionObject) {
                    client.localAuth({ "key": connectionObject.jwt, "type": "jwt" });
                }
                client.organization(connectionObject.organisation);
                client.db(connectionObject.db);
                if (options.dataProduct) {
                    client.db(options.dataProduct);
                }
                selectGraph = function (selectedGraph) {
                    switch (selectedGraph) {
                        case "schema":
                            return selectedGraph;
                        case "instance":
                            return selectedGraph;
                        default:
                            if (typeof selectedGraph === "string") {
                                return selectedGraph;
                            }
                            else {
                                return GraphSelection.INSTANCE;
                            }
                    }
                };
                database = selectGraph(options.instance);
                if (options.quiet) {
                    showOutput = false;
                }
                if (options.system) {
                    client.setSystemDb();
                }
                if (options.branch) {
                    client.checkout(options.branch);
                }
                if (options.commit) {
                    client.ref(options.commit);
                }
                if (!options.commitGraph) return [3 /*break*/, 2];
                defaultLength = 10;
                return [4 /*yield*/, client.query(terminusdb_client_1.WOQL.lib().commits((_h = options.branch) !== null && _h !== void 0 ? _h : undefined, typeof options.commitGraph === "string" ? options.commitGraph : defaultLength))];
            case 1:
                commitBindings = (_j.sent()).bindings;
                consoleDumpJson(commitBindings);
                _j.label = 2;
            case 2:
                if (!options.exportSchema) return [3 /*break*/, 4];
                _a = consoleDumpJson;
                return [4 /*yield*/, client.getSchema()];
            case 3:
                _a.apply(void 0, [_j.sent()]);
                _j.label = 4;
            case 4:
                if (options.create) {
                    debug(program.args
                        .map(function (fileName) { return getFileJson(fileName); })
                        .map(function (obj) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                        return tslib_1.__generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, client.addDocument(obj, { graph_type: database })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); }));
                }
                if (options.createFromJson) {
                    debug(program.args
                        .map(function (obj) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                        return tslib_1.__generator(this, function (_a) {
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
                        .map(function (obj) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                        return tslib_1.__generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, client.updateDocument(obj, { id: options.update, graph_type: database })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); }));
                }
                if (!(typeof options.queryDocuments === "string")) return [3 /*break*/, 6];
                if (!options.queryDocuments)
                    throw new Error("No query template provided");
                _b = consoleDumpJson;
                return [4 /*yield*/, client.queryDocument(JSON.parse(options.queryDocuments), { as_list: true, graph_type: database })];
            case 5:
                _b.apply(void 0, [_j.sent()]);
                _j.label = 6;
            case 6:
                if (!(typeof options.read === "string")) return [3 /*break*/, 8];
                if (!options.read)
                    throw new Error("No documentId to read provided");
                _c = consoleDumpJson;
                return [4 /*yield*/, client.getDocument({ id: options.read, graph_type: database })];
            case 7:
                _c.apply(void 0, [_j.sent()]);
                _j.label = 8;
            case 8:
                if (!(typeof options.schemaFrame === "string")) return [3 /*break*/, 10];
                if (!options.schemaFrame)
                    throw new Error("No documentId to get the frame for provided");
                _d = consoleDumpJson;
                return [4 /*yield*/, client.getSchemaFrame(options.schemaFrame)];
            case 9:
                _d.apply(void 0, [_j.sent()]);
                _j.label = 10;
            case 10:
                if (!(typeof options.delete === "string")) return [3 /*break*/, 12];
                if (!options.delete)
                    throw new Error("Document to delete was not provided");
                _e = consoleDumpJson;
                return [4 /*yield*/, client.deleteDocument({ id: [options.delete], graph_type: database })];
            case 11:
                _e.apply(void 0, [_j.sent()]);
                _j.label = 12;
            case 12:
                if (!(typeof options.optimize === "string")) return [3 /*break*/, 14];
                if (!options.optimize)
                    throw new Error("What to optimize was not provided");
                _f = consoleDumpJson;
                return [4 /*yield*/, client.optimizeBranch(options.optimize)];
            case 13:
                _f.apply(void 0, [_j.sent()]);
                _j.label = 14;
            case 14:
                if (!(typeof options.createDatabase === "string")) return [3 /*break*/, 17];
                createJsonFromFileNameParameter_1 = program.args[0];
                if (!options.createDatabase)
                    throw new Error("Database name to create was not provided");
                return [4 /*yield*/, (function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
                        return [2 /*return*/, JSON.parse(createJsonFromFileNameParameter_1)];
                    }); }); })()
                        .then(function (res) { return res; })
                        .catch(function () { return ({}); })];
            case 15:
                createJson = _j.sent();
                if (createJson.schema === "false") {
                    throw new Error('Error: schema element must be a boolean or undefined, and not "false". If undefined, it defaults to true.');
                }
                databaseCreationOptions = {
                    schema: typeof createJson.schema === "boolean" ? createJson.schema : true,
                    label: typeof createJson.label === "string" ? createJson.label : "",
                    comment: typeof createJson.comment === "string" ? createJson.comment : "",
                };
                return [4 /*yield*/, client.createDatabase(options.createDatabase, databaseCreationOptions)];
            case 16:
                result = _j.sent();
                showOutput && consoleDumpJson(result);
                _j.label = 17;
            case 17:
                if (!(typeof options.deleteDatabase === "string")) return [3 /*break*/, 19];
                if (!options.deleteDatabase)
                    throw new Error("Database name to delete/kill was not provided");
                return [4 /*yield*/, client.deleteDatabase(options.deleteDatabase, connectionObject.organisation)];
            case 18:
                result = _j.sent();
                showOutput && consoleDumpJson(result);
                _j.label = 19;
            case 19:
                if (!(typeof options.createBranch === "string")) return [3 /*break*/, 23];
                createEmptyBranch = program.args[0];
                if (!(createEmptyBranch === "true")) return [3 /*break*/, 21];
                return [4 /*yield*/, client.branch(options.createBranch, true)];
            case 20:
                result = _j.sent();
                showOutput && consoleDumpJson(result);
                return [3 /*break*/, 23];
            case 21: return [4 /*yield*/, client.branch(options.createBranch, false)];
            case 22:
                result = _j.sent();
                showOutput && consoleDumpJson(result);
                _j.label = 23;
            case 23:
                if (!(typeof options.deleteBranch === "string")) return [3 /*break*/, 25];
                return [4 /*yield*/, client.deleteBranch(options.deleteBranch)];
            case 24:
                result = _j.sent();
                showOutput && consoleDumpJson(result);
                _j.label = 25;
            case 25:
                if (!options.branches) return [3 /*break*/, 27];
                _g = consoleDumpJson;
                return [4 /*yield*/, client.getBranches()];
            case 26:
                _g.apply(void 0, [_j.sent()]);
                _j.label = 27;
            case 27:
                parseWoql = function (woql) {
                    var normalizeWoql = function (str) { return str.replace(/\\n/g, " "); };
                    return Function('"use strict";return ( function(WOQL, vars){return (' + normalizeWoql(woql) + ").json()});")()(terminusdb_client_1.WOQL);
                };
                if (!(typeof options.deleteDocumentsOfType === "string")) return [3 /*break*/, 29];
                comment = typeof process.argv[0] === "string" ? process.argv[0] : "tuscli";
                parsedWoql = terminusdb_client_1.WOQL.and(terminusdb_client_1.WOQL.triple("v:DocumentId", "rdf:type", "@schema:" + options.deleteDocumentsOfType), terminusdb_client_1.WOQL.delete_document("v:DocumentId"));
                return [4 /*yield*/, client.query(parsedWoql, comment)];
            case 28:
                result = _j.sent();
                showOutput && consoleDumpJson(result);
                _j.label = 29;
            case 29:
                if (!(typeof options.deleteDocumentsIsaType === "string")) return [3 /*break*/, 31];
                comment = typeof process.argv[0] === "string" ? process.argv[0] : "tuscli";
                parsedWoql = terminusdb_client_1.WOQL.and(terminusdb_client_1.WOQL.isa("v:DocumentId", options.deleteDocumentsIsaType), terminusdb_client_1.WOQL.delete_document("v:DocumentId"));
                return [4 /*yield*/, client.query(parsedWoql, comment)];
            case 30:
                result = _j.sent();
                showOutput && consoleDumpJson(result);
                _j.label = 31;
            case 31:
                if (!(typeof options.woql === "string")) return [3 /*break*/, 33];
                comment = typeof process.argv[0] === "string" ? process.argv[0] : "tuscli";
                parsedWoql = parseWoql(options.woql);
                suppliedWoql = terminusdb_client_1.WOQL.json(parsedWoql);
                return [4 /*yield*/, client.query(suppliedWoql, comment)];
            case 32:
                result = _j.sent();
                showOutput && consoleDumpJson(result);
                _j.label = 33;
            case 33:
                if (!(typeof options.woqlFile === "string")) return [3 /*break*/, 35];
                comment = typeof process.argv[0] === "string" ? process.argv[0] : "tuscli";
                woql = fs_1.default.readFileSync(options.woqlFile, "utf8");
                parsedWoql = parseWoql(woql);
                suppliedWoql = terminusdb_client_1.WOQL.json(parsedWoql);
                return [4 /*yield*/, client.query(suppliedWoql, { comment: comment, author: "bun" })];
            case 34:
                result = _j.sent();
                showOutput && consoleDumpJson(result);
                _j.label = 35;
            case 35:
                if (typeof options.woqlCompile === "string") {
                    woql = fs_1.default.readFileSync(options.woqlCompile, "utf8");
                    parsedWoql = parseWoql(woql);
                    suppliedWoql = terminusdb_client_1.WOQL.json(parsedWoql);
                    consoleDumpJson(suppliedWoql);
                }
                if (typeof options.compileWoql === "string") {
                    parsedWoql = parseWoql(options.compileWoql);
                    suppliedWoql = terminusdb_client_1.WOQL.json(parsedWoql);
                    consoleDumpJson(suppliedWoql);
                }
                return [2 /*return*/];
        }
    });
}); };
exports.cli = cli;
(0, exports.cli)();
