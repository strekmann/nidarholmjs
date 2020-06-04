import fs from "fs";
import path from "path";

import { graphql } from "graphql";
import { printSchema, getIntrospectionQuery } from "graphql";

import schema from "../src/server/schema";

// Save JSON of full schema introspection for Babel Relay Plugin to use
(async () => {
  const iq = getIntrospectionQuery();
  const result = await graphql(schema, iq);
  if (result.errors) {
    console.error(
      "ERROR introspecting schema: ",
      JSON.stringify(result.errors, null, 2),
    );
  } else {
    fs.writeFileSync(
      path.join(__dirname, "../src/server", "schema.json"),
      JSON.stringify(result, null, 2),
    );
  }
})();

// Save user readable type system shorthand of schema
fs.writeFileSync(
  path.join(__dirname, "../src/server", "schema.graphql"),
  printSchema(schema),
);
