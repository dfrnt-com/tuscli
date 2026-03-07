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
    `Create a document in TerminusDB from a JSON string. Documents are JSON-LD objects that must include "@type" and typically "@id".

Use graph_type "schema" to define schema classes, or "instance" (default) to add data documents that conform to the schema.

IMPORTANT: The database must exist before creating documents. Use create_database first if needed.
IMPORTANT: Schema classes must be created before instance documents that reference them.

Example: Create a schema class (graph_type must be "schema")
  document: '{"@id":"Person","@type":"Class","name":"xsd:string","age":"xsd:integer","email":{"@type":"Optional","@class":"xsd:string"}}'
  graph_type: "schema"

Example: Create an instance document
  document: '{"@type":"Person","@id":"Person/jane","name":"Jane Doe","age":30,"email":"jane@example.com"}'

Example: Create a schema enum
  document: '{"@id":"Color","@type":"Enum","@value":["red","green","blue"]}'
  graph_type: "schema"

Example: Create a document on a specific branch
  document: '{"@type":"Person","@id":"Person/bob","name":"Bob","age":25}'
  branch: "dev"`,
    {
      document: z.string().describe('JSON string of the document to create. Must include "@type". For schema documents, include "@id" as the class name. For instance documents, "@id" is optional (auto-generated if omitted). Example: \'{"@type":"Person","@id":"Person/jane","name":"Jane"}\''),
      graph_type: z.enum(["instance", "schema"]).optional().describe('Target graph: "instance" (default) for data documents, "schema" for class/type definitions. Schema classes must be created before instance documents.'),
      branch: z.string().optional().describe("Branch to operate on. Defaults to the main branch from the connection profile."),
      message: z.string().optional().describe("Commit message describing the change. Appears in the commit history. Default: 'Create document via MCP'."),
    },
    async ({ document, graph_type, branch, message }) => {
      const client = createClient({ branch });
      const graphType = (graph_type || "instance") as GraphSelection;
      const result = await client.addDocument(JSON.parse(document), { graph_type: graphType }, undefined, message || "Create document via MCP");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "read_document",
    `Read a single document by its full ID. Returns the complete JSON-LD document.

Document IDs follow the pattern "Type/identifier" for instance documents, or just the class name for schema documents.

Example: Read an instance document
  id: "Person/jane"

Example: Read a schema class definition
  id: "Person"
  graph_type: "schema"

Example: Read from a specific branch
  id: "Person/jane"
  branch: "dev"`,
    {
      id: z.string().describe('Full document ID. Instance documents use "Type/id" format (e.g., "Person/jane"). Schema documents use the class name (e.g., "Person").'),
      graph_type: z.enum(["instance", "schema"]).optional().describe('Graph to read from: "instance" (default) for data, "schema" for class definitions.'),
      branch: z.string().optional().describe("Branch to read from. Defaults to the main branch."),
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
    `Replace an existing document with new JSON content. The document must already exist. The full document is replaced, not merged — include all fields in the update.

Example: Update a person's age and email
  id: "Person/jane"
  document: '{"@type":"Person","@id":"Person/jane","name":"Jane Doe","age":31,"email":"jane.doe@example.com"}'

Example: Update a schema class to add a new property
  id: "Person"
  document: '{"@id":"Person","@type":"Class","name":"xsd:string","age":"xsd:integer","email":{"@type":"Optional","@class":"xsd:string"},"phone":{"@type":"Optional","@class":"xsd:string"}}'
  graph_type: "schema"`,
    {
      id: z.string().describe('Document ID to update (e.g., "Person/jane" for instance, "Person" for schema).'),
      document: z.string().describe('Complete JSON replacement document. Must include "@type" and "@id". All fields must be present — omitted fields will be removed.'),
      graph_type: z.enum(["instance", "schema"]).optional().describe('Graph to update in: "instance" (default) or "schema".'),
      branch: z.string().optional().describe("Branch to operate on. Defaults to the main branch."),
      message: z.string().optional().describe("Commit message describing the change. Appears in the commit history. Default: 'Update document via MCP'."),
    },
    async ({ id, document, graph_type, branch, message }) => {
      const client = createClient({ branch });
      const graphType = (graph_type || "instance") as GraphSelection;
      const result = await client.updateDocument(JSON.parse(document), { id, graph_type: graphType }, undefined, message || "Update document via MCP");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "delete_document",
    `Delete a single document by its ID. This permanently removes the document from the current branch.

Example: Delete an instance document
  id: "Person/jane"

Example: Delete a schema class (removes the class definition)
  id: "Person"
  graph_type: "schema"`,
    {
      id: z.string().describe('Document ID to delete (e.g., "Person/jane" for instance, "Person" for schema).'),
      graph_type: z.enum(["instance", "schema"]).optional().describe('Graph to delete from: "instance" (default) or "schema".'),
      branch: z.string().optional().describe("Branch to operate on. Defaults to the main branch."),
      message: z.string().optional().describe("Commit message describing the change. Appears in the commit history. Default: 'Delete document via MCP'."),
    },
    async ({ id, graph_type, branch, message }) => {
      const client = createClient({ branch });
      const graphType = (graph_type || "instance") as GraphSelection;
      const result = await commands.deleteDocument(client, id, graphType, message || "Delete document via MCP");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "query_documents",
    `Query and list documents by type. Returns all documents matching the query criteria as a JSON array.

The query is a JSON object with a "type" field specifying which document type to list.

Example: List all Person documents
  query: '{"type":"Person"}'

Example: List all schema classes
  query: '{"type":"Class"}'
  graph_type: "schema"

Example: List documents on a branch
  query: '{"type":"Person"}'
  branch: "dev"`,
    {
      query: z.string().describe('JSON query template with "type" field. Example: \'{"type":"Person"}\' to list all Person documents.'),
      graph_type: z.enum(["instance", "schema"]).optional().describe('Graph to query: "instance" (default) for data, "schema" for class definitions.'),
      branch: z.string().optional().describe("Branch to query. Defaults to the main branch."),
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
    `Delete ALL documents of a given type. This is a bulk operation that permanently removes every instance document of the specified type. Use with caution.

Example: Delete all Person documents
  type: "Person"

Example: Delete all documents of a type on a branch
  type: "Person"
  branch: "dev"`,
    {
      type: z.string().describe('Document type name (e.g., "Person"). All instance documents of this type will be permanently deleted.'),
      branch: z.string().optional().describe("Branch to operate on. Defaults to the main branch."),
      message: z.string().optional().describe("Commit message describing the change. Appears in the commit history. Default: 'Delete documents of type via MCP'."),
    },
    async ({ type, branch, message }) => {
      const client = createClient({ branch });
      const result = await commands.deleteDocumentsOfType(client, type, message || "Delete documents of type via MCP");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
