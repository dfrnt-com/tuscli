import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { GraphSelection } from "../../connection";
import * as commands from "../../commands";

export function registerDocumentTools(
  server: McpServer,
  createClient: (overrides?: any) => any
) {
  server.tool(
    "create_document",
    "Create a document in the database from JSON content",
    {
      document: z.string().describe("JSON document content to create"),
      graph_type: z.enum(["instance", "schema"]).optional().describe("Graph type: instance (default) or schema"),
      branch: z.string().optional().describe("Branch to operate on"),
    },
    async ({ document, graph_type, branch }) => {
      const client = createClient({ branch });
      const graphType = (graph_type || "instance") as GraphSelection;
      const result = await client.addDocument(JSON.parse(document), { graph_type: graphType });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "read_document",
    "Read a document by its ID",
    {
      id: z.string().describe("Document ID to read (e.g., Type/id)"),
      graph_type: z.enum(["instance", "schema"]).optional().describe("Graph type: instance (default) or schema"),
      branch: z.string().optional().describe("Branch to read from"),
    },
    async ({ id, graph_type, branch }) => {
      const client = createClient({ branch });
      const graphType = (graph_type || "instance") as GraphSelection;
      const result = await commands.readDocument(client, id, graphType);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "update_document",
    "Update an existing document with new JSON content",
    {
      id: z.string().describe("Document ID to update"),
      document: z.string().describe("JSON document content with updated fields"),
      graph_type: z.enum(["instance", "schema"]).optional().describe("Graph type: instance (default) or schema"),
      branch: z.string().optional().describe("Branch to operate on"),
    },
    async ({ id, document, graph_type, branch }) => {
      const client = createClient({ branch });
      const graphType = (graph_type || "instance") as GraphSelection;
      const result = await client.updateDocument(JSON.parse(document), { id, graph_type: graphType });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "delete_document",
    "Delete a document by its ID",
    {
      id: z.string().describe("Document ID to delete"),
      graph_type: z.enum(["instance", "schema"]).optional().describe("Graph type: instance (default) or schema"),
      branch: z.string().optional().describe("Branch to operate on"),
    },
    async ({ id, graph_type, branch }) => {
      const client = createClient({ branch });
      const graphType = (graph_type || "instance") as GraphSelection;
      const result = await commands.deleteDocument(client, id, graphType);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "query_documents",
    "Query documents by type or other criteria",
    {
      query: z.string().describe('JSON query template, e.g., {"type":"Person"}'),
      graph_type: z.enum(["instance", "schema"]).optional().describe("Graph type: instance (default) or schema"),
      branch: z.string().optional().describe("Branch to query"),
    },
    async ({ query, graph_type, branch }) => {
      const client = createClient({ branch });
      const graphType = (graph_type || "instance") as GraphSelection;
      const result = await commands.queryDocuments(client, query, graphType);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "delete_documents_of_type",
    "Delete all documents of a given type",
    {
      type: z.string().describe("Document type to delete all instances of"),
      branch: z.string().optional().describe("Branch to operate on"),
    },
    async ({ type, branch }) => {
      const client = createClient({ branch });
      const result = await commands.deleteDocumentsOfType(client, type);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
