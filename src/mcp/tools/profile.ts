import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ITerminusConnectionObject } from "../../connection";
import * as commands from "../../commands";

export function registerProfileTools(
  server: McpServer,
  connectionObject: ITerminusConnectionObject
) {
  server.tool(
    "dump_profile",
    "Show the current connection profile with sensitive keys masked",
    {},
    async () => {
      const profile = commands.dumpProfile(connectionObject);
      return {
        content: [{ type: "text", text: JSON.stringify(profile.info, null, 2) }],
      };
    }
  );
}
