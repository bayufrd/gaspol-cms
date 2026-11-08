const path = require('node:path');
const { spawnSync } = require('node:child_process');
const runId = `${Date.now()}-${process.pid}`;
const schema = Object.freeze({
  outletId: 4,
  create: { name: `QAQC Payment ${runId}` },
  update: { name: `QAQC Payment Edited ${runId}`, active: false }
});
module.exports = schema;
if (require.main === module) {
  const cmsRoot = path.resolve(__dirname, '../..');
  const cli = require.resolve('@playwright/test/cli');
  const result = spawnSync(process.execPath, [cli, 'test', '-c', 'QAQC/playwright.config.js', 'QAQC/tests/payment-type.spec.js', ...process.argv.slice(2)], { cwd: cmsRoot, stdio: 'inherit' });
  process.exit(result.status ?? 1);
}
