const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const schemaDir = path.resolve(__dirname, 'schema');
const schemas = fs.readdirSync(schemaDir)
  .filter((file) => /^\d{2}-.+\.js$/.test(file))
  .sort();

if (schemas.length === 0) {
  console.error('No QAQC schemas found in QAQC/schema.');
  process.exit(1);
}

for (const schema of schemas) {
  console.log(`\n=== Running ${schema} ===`);
  const result = spawnSync(
    process.execPath,
    [path.join(schemaDir, schema), ...process.argv.slice(2)],
    { stdio: 'inherit' }
  );

  if (result.status !== 0) process.exit(result.status ?? 1);
}
