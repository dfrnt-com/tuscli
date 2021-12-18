#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cli = void 0;
var terminusdb_client_1 = __importDefault(require("@terminusdb/terminusdb-client"));
var commander_1 = require("commander");
var debug_1 = __importDefault(require("debug"));
var fs_1 = __importDefault(require("fs"));
var program = new commander_1.Command();
program
    .version('0.0.3')
    .description("TerminusDB Javascript cli: tuscli [options] <fileName(s)>")
    .option('-c, --create', 'Create document from provided file')
    .option('-r, --read <document-id>', 'Read document-id (Type/id)')
    .option('-s, --schemaFrame <document-id>', 'Get the schema frame for a type/subdoctype/enum')
    .option('-u, --update <document-id>', 'Update document')
    .option('-d, --delete <document-id>', 'Delete document')
    .option('-q, --query-documents <query-template-json>', 'List documents of type, example: {"type":"Person"}')
    .option('-e, --export-schema', 'Export/show instance schema JSON')
    .option('-p, --profile <json-file>', 'JSON-formatted connection profile, or set env TUSPARAMS in base64 encoding')
    .option('-z, --dump-profile', 'Show the default or current connection profile, and how to set it')
    .option('-i, --instance <instance|schema>', 'Document instance, default is instance')
    .option('-x, --system', 'Connect to system database')
    .option('-o, --optimize <main>', 'Optimize and do delta rollups on a branch')
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
var btoa = function (b) { return Buffer.from(b, 'base64').toString('binary'); };
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
    db: "mydb"
});
var connectionObject = findConnectionConfiguration(options.jsonFile);
debug(exampleConnObject);
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
    console.log(dumpInfo);
    process.exit(0);
}
var cli = function () { return __awaiter(void 0, void 0, void 0, function () {
    var connectClient, client, selectDatabase, database, _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    return __generator(this, function (_o) {
        switch (_o.label) {
            case 0:
                debug('Options: ', options);
                debug('Remaining arguments: ', program.args);
                connectClient = function (connInfo) {
                    if ("key" in connInfo) {
                        return new terminusdb_client_1.default.WOQLClient(connInfo.url, { db: connInfo.db, key: connInfo.key, user: connInfo.user, organisation: connInfo.organisation, });
                    }
                    else {
                        return new terminusdb_client_1.default.WOQLClient(connInfo.url, { db: connInfo.db, user: connInfo.user, organisation: connInfo.organisation, });
                    }
                };
                client = connectClient(connectionObject);
                if ("apikey" in connectionObject) {
                    client.setApiKey(connectionObject.apikey);
                }
                return [4 /*yield*/, client.connect()];
            case 1:
                _o.sent();
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
                _b = (_a = console).log;
                return [4 /*yield*/, client.getSchema()];
            case 2:
                _b.apply(_a, [_o.sent()]);
                _o.label = 3;
            case 3:
                if (options.create) {
                    debug(program.args
                        .map(function (fileName) { return getFileJson(fileName); })
                        .map(function (obj) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, client.addDocument(obj, { graph_type: database })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    }); }); }));
                }
                if (options.update) {
                    debug(program.args
                        .map(function (fileName) { return getFileJson(fileName); })
                        .map(function (obj) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, client.updateDocument(obj, { id: options.update, graph_type: database })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    }); }); }));
                }
                if (!options.queryDocuments) return [3 /*break*/, 5];
                if (!options.queryDocuments)
                    throw new Error("No query template provided");
                _d = (_c = console).log;
                return [4 /*yield*/, client.queryDocument(JSON.parse(options.queryDocuments), { "as_list": true, graph_type: database })];
            case 4:
                _d.apply(_c, [_o.sent()]);
                _o.label = 5;
            case 5:
                if (!options.read) return [3 /*break*/, 7];
                if (!options.read)
                    throw new Error("No documentId to read provided");
                _f = (_e = console).log;
                return [4 /*yield*/, client.getDocument({ id: options.read, graph_type: database })];
            case 6:
                _f.apply(_e, [_o.sent()]);
                _o.label = 7;
            case 7:
                if (!options.schemaFrame) return [3 /*break*/, 9];
                if (!options.schemaFrame)
                    throw new Error("No documentId to get the frame for provided");
                _h = (_g = console).log;
                return [4 /*yield*/, client.getSchemaFrame(options.schemaFrame)];
            case 8:
                _h.apply(_g, [_o.sent()]);
                _o.label = 9;
            case 9:
                if (!options.delete) return [3 /*break*/, 11];
                if (!options.delete)
                    throw new Error("Document to delete was not provided");
                _k = (_j = console).log;
                return [4 /*yield*/, client.deleteDocument({ id: [options.delete], graph_type: database })];
            case 10:
                _k.apply(_j, [_o.sent()]);
                _o.label = 11;
            case 11:
                if (!options.optimize) return [3 /*break*/, 13];
                if (!options.optimize)
                    throw new Error("What to optimize was not provided");
                _m = (_l = console).log;
                return [4 /*yield*/, client.optimizeBranch(options.optimize)];
            case 12:
                _m.apply(_l, [_o.sent()]);
                _o.label = 13;
            case 13: return [2 /*return*/];
        }
    });
}); };
exports.cli = cli;
(0, exports.cli)();
