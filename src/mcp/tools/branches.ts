import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as commands from "../../commands";

export function registerBranchTools(
  server: McpServer,
  createClient: (overrides?: any) => any
) {
  server.tool(
    "list_branches",
    "List all branches in the data product",
    {},
    async () => {
      const client = createClient();
      const result = await commands.getBranches(client);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "create_branch",
    "Create a new branch",
    {
      name: z.string().describe("Branch name to create"),
      empty: z.boolean().optional().describe("Create an empty branch (default: false)"),
    },
    async ({ name, empty }) => {
      const client = createClient();
      const result = await commands.createBranch(client, name, empty || false);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "delete_branch",
    "Delete a branch",
    {
      name: z.string().describe("Branch name to delete"),
    },
    async ({ name }) => {
      const client = createClient();
      const result = await commands.deleteBranch(client, name);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
