const path = require('node:path');
const { spawnSync } = require('node:child_process');

const runId = `${Date.now()}-${process.pid}`;

const schema = Object.freeze({
  outletId: 4,
  create: { name: `QAQC Serving ${runId}`, active: true },
  update: { name: `QAQC Serving Edited ${runId}`, active: false },
  protectedName: 'Dine In'
});

module.exports = schema;

if (require.main === module) {
  const cmsRoot = path.resolve(__dirname, '../..');
  const playwrightCli = require.resolve('@playwright/test/cli');
  const result = spawnSync(
    process.execPath,
    [playwrightCli, 'test', '-c', 'QAQC/playwright.config.js', 'QAQC/tests/serving-type.spec.js', ...process.argv.slice(2)],
    { cwd: cmsRoot, stdio: 'inherit' }
  );
  process.exit(result.status ?? 1);
}
