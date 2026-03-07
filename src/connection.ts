import TerminusClient from "terminusdb";
import Debug from "debug";
import fs from "node:fs";

const debug = Debug("Zebra CLI");

export enum GraphSelection {
  SCHEMA = "schema",
  INSTANCE = "instance",
}

export enum RepoType {
  local = "local",
  remote = "remote",
}

export interface ITerminusConnectionObject {
  url: string;
  key?: string;
  apikey?: string;
  jwt?: string;
  user?: string;
  author?: string;
  organisation: string;
  db: string;
  repo?: RepoType | string;
  branch?: string;
  ref?: string;
  default_branch_id?: string;
}

const btoa = (b: string) => Buffer.from(b, "base64").toString("binary");

export const getFileJson = (path: string) => {
  try {
    const fileAtPath = path === "-" ? "/dev/stdin" : path;
    if (!fs.existsSync(fileAtPath)) {
      throw new Error("File does not exist");
    }
    try {
      return JSON.parse(fs.readFileSync(fileAtPath, { encoding: "utf-8" }).toString());
    } catch (e) {
      throw new Error("Could not parse the file correctly, likely bad JSON");
    }
  } catch (e) {
    console.error("Could handle input file correctly: ", path);
    console.log(e);
    process.exit(1);
  }
};

export const findConnectionConfiguration = (file: string, envName: string): ITerminusConnectionObject => {
  const envParameters = process.env[envName];

  if (file) {
    debug("Provided configuration information from file: " + file);
    return <ITerminusConnectionObject>getFileJson(file);
  } else if (envParameters) {
    try {
      debug("Provided configuration infomation from TUSPARAMS: " + btoa(envParameters));
      return <ITerminusConnectionObject>JSON.parse(btoa(envParameters));
    } catch (e) {
      console.error(envName + " environment variable not with proper base64 encoded JSON string");
    }
  }

  // Docker secrets: check /run/secrets/<envName_lowercase>
  const secretPath = "/run/secrets/" + envName.toLowerCase();
  if (fs.existsSync(secretPath)) {
    try {
      const secretContent = fs.readFileSync(secretPath, "utf-8").trim();
      debug("Provided configuration from Docker secret: " + secretPath);
      return <ITerminusConnectionObject>JSON.parse(btoa(secretContent));
    } catch (e) {
      console.error("Docker secret at " + secretPath + " is not a proper base64 encoded JSON string");
    }
  }

  debug("No provided connection information");
  return <ITerminusConnectionObject>{};
};

export const exampleConnObject = JSON.stringify({
  url: "http://localhost:6363",
  apikey: "password",
  organisation: "admin",
  db: "mydb",
  user: "john.doe@example.com",
});

export const connectClient = (connInfo: ITerminusConnectionObject): any => {
  if ("key" in connInfo) {
    return new TerminusClient.WOQLClient(connInfo.url, {
      db: connInfo.db,
      key: connInfo.key,
      user: connInfo.user,
      organization: connInfo.organisation,
    });
  } else {
    return new TerminusClient.WOQLClient(connInfo.url, {
      user: connInfo.user,
      organization: connInfo.organisation,
    });
  }
};

/**
 * Configure the client with auth, organisation, db, branch, commit, and system overrides.
 */
export const configureClient = (
  client: any,
  connInfo: ITerminusConnectionObject,
  overrides: {
    dataProduct?: string;
    system?: boolean;
    branch?: string;
    commit?: string;
  } = {}
): void => {
  if ("apikey" in connInfo) {
    client.setApiKey(connInfo.apikey);
  } else if ("jwt" in connInfo) {
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

export const selectGraph = (selectedGraph: GraphSelection | string): GraphSelection => {
  switch (selectedGraph) {
    case "schema":
      return GraphSelection.SCHEMA;
    case "instance":
      return GraphSelection.INSTANCE;
    default:
      if (typeof selectedGraph === "string") {
        return selectedGraph as GraphSelection;
      } else {
        return GraphSelection.INSTANCE;
      }
  }
};
