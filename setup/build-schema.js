import fs from 'fs';
import path from 'path';
import schema from '../src/server/schema';
import { graphql }  from 'graphql';
import { introspectionQuery, printSchema } from 'graphql/utilities';

// Save JSON of full schema introspection for Babel Relay Plugin to use
(async () => {
    const result = await (graphql(schema, introspectionQuery));
    if (result.errors) {
        console.error(
            'ERROR introspecting schema: ',
            JSON.stringify(result.errors, null, 2)
        );
    } else {
        fs.writeFileSync(
            path.join(__dirname, '../src/server', 'schema.json'),
            JSON.stringify(result, null, 2)
        );
    }
})();

// Save user readable type system shorthand of schema
fs.writeFileSync(
    path.join(__dirname, '../src/server', 'schema.graphql'),
    printSchema(schema)
);
