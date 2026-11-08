const path = require('node:path');
const { spawnSync } = require('node:child_process');

const runId = `${Date.now()}-${process.pid}`;

const schema = Object.freeze({
  outletId: 4,
  negative: {
    percentageOver100: 101,
    zeroValue: 0,
    negativeValue: -1,
    negativeMinPurchase: -1,
    negativeMaxDiscount: -1
  },
  discount: {
    create: {
      code: `QAQC-DISC-${runId}`,
      startDate: '2026-11-10 08:00',
      endDate: '2026-11-20 22:00',
      isPercent: true,
      isCart: true,
      value: 15,
      minPurchase: 50000,
      maxDiscount: 25000,
      unlimitedMaxDiscount: false
    },
    update: {
      code: `QAQC-DISC-EDITED-${runId}`,
      startDate: '2026-12-01 09:30',
      endDate: '2026-12-31 23:00',
      isPercent: false,
      isCart: false,
      value: 12000,
      minPurchase: 75000,
      unlimitedMaxDiscount: true
    }
  }
});

module.exports = schema;

if (require.main === module) {
  const cmsRoot = path.resolve(__dirname, '../..');
  const playwrightCli = require.resolve('@playwright/test/cli');
  const result = spawnSync(
    process.execPath,
    [playwrightCli, 'test', '-c', 'QAQC/playwright.config.js', 'QAQC/tests/discount.spec.js', ...process.argv.slice(2)],
    { cwd: cmsRoot, stdio: 'inherit' }
  );

  process.exit(result.status ?? 1);
}
