/**
 * WOQL read-only guard.
 *
 * The WOQL library sets contains_update to true on individual operations
 * that are destructive (InsertDocument, DeleteDocument, UpdateDocument,
 * AddTriple, DeleteTriple, AddQuad, DeleteQuad). However, combinators
 * like and() do not propagate this flag. We therefore also scan the
 * compiled JSON AST for destructive @type values as a fallback.
 */

const DESTRUCTIVE_TYPES: Record<string, boolean> = {
  DeleteDocument: true,
  InsertDocument: true,
  UpdateDocument: true,
  AddTriple: true,
  DeleteTriple: true,
  AddQuad: true,
  DeleteQuad: true,
};

function hasDestructiveType(ast: any): boolean {
  if (ast === null || ast === undefined || typeof ast !== "object") {
    return false;
  }
  if (Array.isArray(ast)) {
    for (let i = 0; i < ast.length; i++) {
      if (hasDestructiveType(ast[i])) return true;
    }
    return false;
  }
  if (typeof ast["@type"] === "string" && DESTRUCTIVE_TYPES[ast["@type"]]) {
    return true;
  }
  const keys = Object.keys(ast);
  for (let i = 0; i < keys.length; i++) {
    if (hasDestructiveType(ast[keys[i]])) return true;
  }
  return false;
}

/**
 * Assert that a WOQL query object does not contain update operations.
 * Checks the contains_update flag first, then scans the JSON AST as a fallback.
 * Throws an error if the query is destructive and read-only mode is active.
 */
export function assertReadOnly(woqlObject: any): void {
  if (woqlObject && woqlObject.contains_update === true) {
    throw new Error(
      "Read-only mode: query contains destructive operations and cannot be executed"
    );
  }
  // Fallback: scan the JSON AST for combinators like and() that don't propagate the flag
  if (woqlObject && typeof woqlObject.json === "function") {
    if (hasDestructiveType(woqlObject.json())) {
      throw new Error(
        "Read-only mode: query contains destructive operations and cannot be executed"
      );
    }
  } else if (hasDestructiveType(woqlObject)) {
    throw new Error(
      "Read-only mode: query contains destructive operations and cannot be executed"
    );
  }
}
