// utils/validateSchema.js
//
// Small helper that wraps Ajv (a JSON Schema validator) so our tests can
// assert "does this response body match the shape I expect?" in one line.
// This is called "contract testing" — it catches cases where an API
// silently changes its response shape (e.g. renames a field, drops a field,
// changes a type) without changing the status code.

const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv); // enables "format": "email" / "uri" checks used in our schemas

function validateSchema(schema, data) {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  return {
    valid,
    errors: validate.errors || [],
  };
}

module.exports = { validateSchema };
