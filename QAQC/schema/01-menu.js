const path = require('node:path');
const { spawnSync } = require('node:child_process');

const runId = `${Date.now()}-${process.pid}`;

const schema = Object.freeze({
  outletId: 4,
  negative: {
    menuName: `QAQC Invalid Menu ${runId}`,
    price: -1,
    variantName: `QAQC Invalid Variant ${runId}`
  },
  menu: {
    create: {
      name: `QAQC Menu ${runId}`,
      type: 'Makanan',
      price: 31000,
      active: true
    },
    update: {
      name: `QAQC Menu Edited ${runId}`,
      type: 'Minuman',
      active: true
    }
  },
  variant: {
    create: {
      name: `Regular ${runId}`,
      prices: {
        'Dine In': 32000,
        'Take Away': 32500,
        'Delivery Service': 33000,
        GoFood: 34000,
        GrabFood: 35000,
        ShopeeFood: 36000
      }
    },
    update: {
      name: `Large ${runId}`,
      prices: {
        'Dine In': 42000,
        'Take Away': 42500,
        'Delivery Service': 43000,
        GoFood: 44000,
        GrabFood: 45000,
        ShopeeFood: 46000
      }
    }
  }
});

module.exports = schema;

if (require.main === module) {
  const cmsRoot = path.resolve(__dirname, '../..');
  const playwrightCli = require.resolve('@playwright/test/cli');
  const result = spawnSync(
    process.execPath,
    [playwrightCli, 'test', '-c', 'QAQC/playwright.config.js', 'QAQC/tests/menu.spec.js', ...process.argv.slice(2)],
    { cwd: cmsRoot, stdio: 'inherit' }
  );

  process.exit(result.status ?? 1);
}
