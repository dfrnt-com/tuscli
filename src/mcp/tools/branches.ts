import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as commands from "../../commands";

export function registerBranchTools(
  server: McpServer,
  createClient: (overrides?: any) => any
) {
  server.tool(
    "list_branches",
    `List all branches in the current database. TerminusDB supports Git-like branching for data — each branch is an independent line of changes.

The default branch is "main". Use this to discover available branches before switching to one.

Example: List all branches
  (no parameters needed)

Returns a JSON object with branch names as keys.`,
    {},
    async () => {
      const client = createClient();
      const result = await commands.getBranches(client);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "create_branch",
    `Create a new branch in the database. By default, the new branch is a copy of the current main branch. Set empty to true to create a branch with no data.

Branches work like Git branches for data — you can make changes on a branch without affecting main.

Example: Create a branch from main
  name: "dev"

Example: Create an empty branch (no data copied)
  name: "scratch"
  empty: true`,
    {
      name: z.string().describe('Branch name to create (e.g., "dev", "feature-xyz"). Must be a valid identifier.'),
      empty: z.boolean().optional().describe("If true, create an empty branch with no data. If false (default), branch copies the current main branch data."),
    },
    async ({ name, empty }) => {
      const client = createClient();
      const result = await commands.createBranch(client, name, empty || false);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "delete_branch",
    `Delete a branch from the database. This permanently removes the branch and its unique changes. Cannot delete the main branch.

Example: Delete a feature branch
  name: "dev"`,
    {
      name: z.string().describe('Branch name to delete (e.g., "dev"). The main branch cannot be deleted.'),
    },
    async ({ name }) => {
      const client = createClient();
      const result = await commands.deleteBranch(client, name);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
