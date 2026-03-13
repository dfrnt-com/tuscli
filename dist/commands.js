"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileWoqlFile = exports.compileWoql = exports.executeWoqlFile = exports.executeWoql = exports.getBranches = exports.deleteBranch = exports.createBranch = exports.deleteDatabase = exports.createDatabase = exports.optimizeBranch = exports.deleteDocumentsIsaType = exports.deleteDocumentsOfType = exports.deleteDocument = exports.readDocument = exports.queryDocuments = exports.updateDocument = exports.createDocumentFromJson = exports.createDocument = exports.getSchemaFrame = exports.exportSchema = exports.getCommitGraph = exports.dumpProfile = void 0;
var tslib_1 = require("tslib");
var terminusdb_1 = require("terminusdb");
var node_fs_1 = tslib_1.__importDefault(require("node:fs"));
var connection_1 = require("./connection");
var woql_guard_1 = require("./woql-guard");
var normalizeWoql = function (str) { return str.replace(/\\n/g, " "); };
/**
 * Build a WOQL query object from a JS WOQL string.
 * The returned object has contains_update set by the WOQL library.
 */
var buildWoqlObject = function (woql) {
    return Function('"use strict";return ( function(WOQL, vars){return (' + normalizeWoql(woql) + ")});")()(terminusdb_1.WOQL);
};
/**
 * Parse a JS WOQL string directly into JSON AST.
 */
var parseWoql = function (woql) {
    return buildWoqlObject(woql).json();
};
var dumpProfile = function (connectionObject) {
    var dumpInfo = tslib_1.__assign({}, connectionObject);
    if (dumpInfo.key) {
        dumpInfo.key = "**** hidden ****";
    }
    if (dumpInfo.apikey) {
        dumpInfo.apikey = "**** hidden ****";
    }
    return {
        info: dumpInfo,
        exampleEnvString: '# export TUSPARAMS="$(echo ' + JSON.stringify(connection_1.exampleConnObject) + ' |base64)" ',
    };
};
exports.dumpProfile = dumpProfile;
// --- Commit Graph ---
var getCommitGraph = function (client, count, branch) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var defaultLength, commitBindings;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                defaultLength = 10;
                return [4 /*yield*/, client.query(terminusdb_1.WOQL.lib().commits(branch !== null && branch !== void 0 ? branch : undefined, typeof count === "string" ? count : defaultLength))];
            case 1:
                commitBindings = (_a.sent()).bindings;
                return [2 /*return*/, commitBindings];
        }
    });
}); };
exports.getCommitGraph = getCommitGraph;
// --- Schema ---
var exportSchema = function (client) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client.getSchema()];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.exportSchema = exportSchema;
var getSchemaFrame = function (client, type) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!type)
                    throw new Error("No documentId to get the frame for provided");
                return [4 /*yield*/, client.getSchemaFrame(type)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.getSchemaFrame = getSchemaFrame;
// --- Documents ---
var createDocument = function (client, filePaths, graphType) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var results, _i, filePaths_1, fileName, obj, result;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                results = [];
                _i = 0, filePaths_1 = filePaths;
                _a.label = 1;
            case 1:
                if (!(_i < filePaths_1.length)) return [3 /*break*/, 4];
                fileName = filePaths_1[_i];
                obj = (0, connection_1.getFileJson)(fileName);
                return [4 /*yield*/, client.addDocument(obj, { graph_type: graphType })];
            case 2:
                result = _a.sent();
                results.push(result);
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/, results];
        }
    });
}); };
exports.createDocument = createDocument;
var createDocumentFromJson = function (client, jsonStrings, graphType) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var results, _i, jsonStrings_1, obj, result;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                results = [];
                _i = 0, jsonStrings_1 = jsonStrings;
                _a.label = 1;
            case 1:
                if (!(_i < jsonStrings_1.length)) return [3 /*break*/, 4];
                obj = jsonStrings_1[_i];
                return [4 /*yield*/, client.addDocument(obj, { graph_type: graphType })];
            case 2:
                result = _a.sent();
                results.push(result);
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/, results];
        }
    });
}); };
exports.createDocumentFromJson = createDocumentFromJson;
var updateDocument = function (client, documentId, filePaths, graphType) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var results, _i, filePaths_2, fileName, obj, result;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                results = [];
                _i = 0, filePaths_2 = filePaths;
                _a.label = 1;
            case 1:
                if (!(_i < filePaths_2.length)) return [3 /*break*/, 4];
                fileName = filePaths_2[_i];
                obj = (0, connection_1.getFileJson)(fileName);
                return [4 /*yield*/, client.updateDocument(obj, { id: documentId, graph_type: graphType })];
            case 2:
                result = _a.sent();
                results.push(result);
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/, results];
        }
    });
}); };
exports.updateDocument = updateDocument;
var queryDocuments = function (client, queryTemplateJson, graphType) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!queryTemplateJson)
                    throw new Error("No query template provided");
                return [4 /*yield*/, client.queryDocument(JSON.parse(queryTemplateJson), { as_list: true, graph_type: graphType })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.queryDocuments = queryDocuments;
var readDocument = function (client, documentId, graphType) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!documentId)
                    throw new Error("No documentId to read provided");
                return [4 /*yield*/, client.getDocument({ id: documentId, graph_type: graphType })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.readDocument = readDocument;
var deleteDocument = function (client, documentId, graphType, message) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!documentId)
                    throw new Error("Document to delete was not provided");
                return [4 /*yield*/, client.deleteDocument({ id: [documentId], graph_type: graphType }, undefined, message || "delete document")];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.deleteDocument = deleteDocument;
// --- Delete by type ---
var deleteDocumentsOfType = function (client, type, message) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var commitMsg, parsedWoql;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                commitMsg = message || "Delete documents of type " + type;
                parsedWoql = terminusdb_1.WOQL.and(terminusdb_1.WOQL.triple("v:DocumentId", "rdf:type", "@schema:" + type), terminusdb_1.WOQL.delete_document("v:DocumentId"));
                return [4 /*yield*/, client.query(parsedWoql, commitMsg)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.deleteDocumentsOfType = deleteDocumentsOfType;
var deleteDocumentsIsaType = function (client, type, message) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var commitMsg, parsedWoql;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                commitMsg = message || "Delete documents isa type " + type;
                parsedWoql = terminusdb_1.WOQL.and(terminusdb_1.WOQL.isa("v:DocumentId", type), terminusdb_1.WOQL.delete_document("v:DocumentId"));
                return [4 /*yield*/, client.query(parsedWoql, commitMsg)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.deleteDocumentsIsaType = deleteDocumentsIsaType;
// --- Optimize ---
var optimizeBranch = function (client, branch) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!branch)
                    throw new Error("What to optimize was not provided");
                return [4 /*yield*/, client.optimizeBranch(branch)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.optimizeBranch = optimizeBranch;
// --- Database ---
var createDatabase = function (client, dbName, createJsonString) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var createJson, databaseCreationOptions;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!dbName)
                    throw new Error("Database name to create was not provided");
                createJson = {};
                if (createJsonString) {
                    try {
                        createJson = JSON.parse(createJsonString);
                    }
                    catch (e) {
                        // fallback to empty
                    }
                }
                if (createJson.schema === "false") {
                    throw new Error('Error: schema element must be a boolean or undefined, and not "false". If undefined, it defaults to true.');
                }
                databaseCreationOptions = {
                    schema: typeof createJson.schema === "boolean" ? createJson.schema : true,
                    label: typeof createJson.label === "string" ? createJson.label : "",
                    comment: typeof createJson.comment === "string" ? createJson.comment : "",
                };
                return [4 /*yield*/, client.createDatabase(dbName, databaseCreationOptions)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.createDatabase = createDatabase;
var deleteDatabase = function (client, dbName, organisation) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!dbName)
                    throw new Error("Database name to delete/kill was not provided");
                return [4 /*yield*/, client.deleteDatabase(dbName, organisation)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.deleteDatabase = deleteDatabase;
// --- Branches ---
var createBranch = function (client_1, branchName_1) {
    var args_1 = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args_1[_i - 2] = arguments[_i];
    }
    return tslib_1.__awaiter(void 0, tslib_1.__spreadArray([client_1, branchName_1], args_1, true), void 0, function (client, branchName, empty) {
        if (empty === void 0) { empty = false; }
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.branch(branchName, empty)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
exports.createBranch = createBranch;
var deleteBranch = function (client, branchName) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client.deleteBranch(branchName)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.deleteBranch = deleteBranch;
var getBranches = function (client) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client.getBranches()];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.getBranches = getBranches;
// --- WOQL ---
var executeWoql = function (client_1, woqlString_1) {
    var args_1 = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args_1[_i - 2] = arguments[_i];
    }
    return tslib_1.__awaiter(void 0, tslib_1.__spreadArray([client_1, woqlString_1], args_1, true), void 0, function (client, woqlString, namedResourceData, readonly, message) {
        var commitMsg, woqlObject, suppliedWoql;
        if (namedResourceData === void 0) { namedResourceData = []; }
        if (readonly === void 0) { readonly = false; }
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    commitMsg = message || "WOQL query via MCP";
                    woqlObject = buildWoqlObject(woqlString);
                    if (readonly) {
                        (0, woql_guard_1.assertReadOnly)(woqlObject);
                    }
                    suppliedWoql = terminusdb_1.WOQL.json(woqlObject.json());
                    return [4 /*yield*/, client.query(suppliedWoql, commitMsg, false, { namedResourceData: namedResourceData })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
exports.executeWoql = executeWoql;
var executeWoqlFile = function (client_1, filePath_1) {
    var args_1 = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args_1[_i - 2] = arguments[_i];
    }
    return tslib_1.__awaiter(void 0, tslib_1.__spreadArray([client_1, filePath_1], args_1, true), void 0, function (client, filePath, namedResourceData, readonly, message) {
        var commitMsg, woql, woqlObject, suppliedWoql;
        if (namedResourceData === void 0) { namedResourceData = []; }
        if (readonly === void 0) { readonly = false; }
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    commitMsg = message || "WOQL file query via tuscli";
                    woql = node_fs_1.default.readFileSync(filePath, "utf8");
                    woqlObject = buildWoqlObject(woql);
                    if (readonly) {
                        (0, woql_guard_1.assertReadOnly)(woqlObject);
                    }
                    suppliedWoql = terminusdb_1.WOQL.json(woqlObject.json());
                    return [4 /*yield*/, client.query(suppliedWoql, commitMsg, false, { namedResourceData: namedResourceData })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
exports.executeWoqlFile = executeWoqlFile;
var compileWoql = function (woqlString) {
    var parsedWoql = parseWoql(woqlString);
    return terminusdb_1.WOQL.json(parsedWoql);
};
exports.compileWoql = compileWoql;
var compileWoqlFile = function (filePath) {
    var woql = node_fs_1.default.readFileSync(filePath, "utf8");
    var parsedWoql = parseWoql(woql);
    return terminusdb_1.WOQL.json(parsedWoql);
};
exports.compileWoqlFile = compileWoqlFile;
