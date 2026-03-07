import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ITerminusConnectionObject } from "../../connection";
import * as commands from "../../commands";

export function registerProfileTools(
  server: McpServer,
  connectionObject: ITerminusConnectionObject
) {
  server.tool(
    "dump_profile",
    `Show the current TerminusDB connection profile. Displays the server URL, user, organisation, database, and other connection settings. Sensitive fields like API keys are masked for security.

Use this to verify which database and server the MCP tools are connected to.

Example: Check the current connection
  (no parameters needed)

The response shows: url, user, organisation, db, and other connection fields.`,
    {},
    async () => {
      const profile = commands.dumpProfile(connectionObject);
      return {
        content: [{ type: "text", text: JSON.stringify(profile.info, null, 2) }],
      };
    }
  );
}
