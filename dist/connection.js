"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectGraph = exports.configureClient = exports.connectClient = exports.exampleConnObject = exports.findConnectionConfiguration = exports.getFileJson = exports.RepoType = exports.GraphSelection = void 0;
var tslib_1 = require("tslib");
var terminusdb_1 = tslib_1.__importDefault(require("terminusdb"));
var debug_1 = tslib_1.__importDefault(require("debug"));
var node_fs_1 = tslib_1.__importDefault(require("node:fs"));
var debug = (0, debug_1.default)("Zebra CLI");
var GraphSelection;
(function (GraphSelection) {
    GraphSelection["SCHEMA"] = "schema";
    GraphSelection["INSTANCE"] = "instance";
})(GraphSelection || (exports.GraphSelection = GraphSelection = {}));
var RepoType;
(function (RepoType) {
    RepoType["local"] = "local";
    RepoType["remote"] = "remote";
})(RepoType || (exports.RepoType = RepoType = {}));
var btoa = function (b) { return Buffer.from(b, "base64").toString("binary"); };
var getFileJson = function (path) {
    try {
        var fileAtPath = path === "-" ? "/dev/stdin" : path;
        if (!node_fs_1.default.existsSync(fileAtPath)) {
            throw new Error("File does not exist");
        }
        try {
            return JSON.parse(node_fs_1.default.readFileSync(fileAtPath, { encoding: "utf-8" }).toString());
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
exports.getFileJson = getFileJson;
var findConnectionConfiguration = function (file, envName) {
    var envParameters = process.env[envName];
    if (file) {
        debug("Provided configuration information from file: " + file);
        return (0, exports.getFileJson)(file);
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
    // Docker secrets: check /run/secrets/<envName_lowercase>
    var secretPath = "/run/secrets/" + envName.toLowerCase();
    if (node_fs_1.default.existsSync(secretPath)) {
        try {
            var secretContent = node_fs_1.default.readFileSync(secretPath, "utf-8").trim();
            debug("Provided configuration from Docker secret: " + secretPath);
            return JSON.parse(btoa(secretContent));
        }
        catch (e) {
            console.error("Docker secret at " + secretPath + " is not a proper base64 encoded JSON string");
        }
    }
    debug("No provided connection information");
    return {};
};
exports.findConnectionConfiguration = findConnectionConfiguration;
exports.exampleConnObject = JSON.stringify({
    url: "http://localhost:6363",
    apikey: "password",
    organisation: "admin",
    db: "mydb",
    user: "john.doe@example.com",
});
var connectClient = function (connInfo) {
    if ("key" in connInfo) {
        return new terminusdb_1.default.WOQLClient(connInfo.url, {
            db: connInfo.db,
            key: connInfo.key,
            user: connInfo.user,
            organization: connInfo.organisation,
        });
    }
    else {
        return new terminusdb_1.default.WOQLClient(connInfo.url, {
            user: connInfo.user,
            organization: connInfo.organisation,
        });
    }
};
exports.connectClient = connectClient;
/**
 * Configure the client with auth, organisation, db, branch, commit, and system overrides.
 */
var configureClient = function (client, connInfo, overrides) {
    if (overrides === void 0) { overrides = {}; }
    if ("apikey" in connInfo) {
        client.setApiKey(connInfo.apikey);
    }
    else if ("jwt" in connInfo) {
        client.localAuth({ key: connInfo.jwt, type: "jwt" });
    }
    client.organization(connInfo.organisation);
    client.db(overrides.dataProduct || connInfo.db);
    if (overrides.system) {
        client.setSystemDb();
    }
    if (overrides.branch) {
        client.checkout(overrides.branch);
    }
    if (overrides.commit) {
        client.ref(overrides.commit);
    }
    if (connInfo.author) {
        client.set({ user: connInfo.author });
    }
};
exports.configureClient = configureClient;
var selectGraph = function (selectedGraph) {
    switch (selectedGraph) {
        case "schema":
            return GraphSelection.SCHEMA;
        case "instance":
            return GraphSelection.INSTANCE;
        default:
            if (typeof selectedGraph === "string") {
                return selectedGraph;
            }
            else {
                return GraphSelection.INSTANCE;
            }
    }
};
exports.selectGraph = selectGraph;
