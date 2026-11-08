const { test, expect } = require('@playwright/test');
const { login } = require('../helpers/auth');
const { PaymentTypePage } = require('../helpers/payment-type-page');
const schema = require('../schema/04-payment-type');

test.describe.configure({ mode: 'serial' });

test.describe('Outlet 4 Payment Type validation and lifecycle', () => {
  test('validates, creates, edits category/status, reorders, and cleans up', async ({ page }) => {
    const paymentPage = new PaymentTypePage(page);
    let name = schema.create.name;
    let exists = false;
    let creates = 0;
    let originalOrder = [];
    const defects = [];
    page.on('request', (request) => {
      if (/\/payment-management\/?$/.test(new URL(request.url()).pathname) && request.method() === 'POST') creates += 1;
    });

    await test.step('login outlet 4 and remove stale QAQC records', async () => {
      await login(page, schema.outletId);
      await paymentPage.cleanupGenerated();
      originalOrder = paymentPage.paymentTypes.map(({ id }) => ({ id }));
    });

    try {
      await test.step('reject empty payment type name', async () => {
        const before = creates;
        await paymentPage.rejectEmptyName();
        expect(creates).toBe(before);
      });
      await test.step('create payment type with category', async () => {
        await paymentPage.create(schema.create);
        exists = true;
      });
      await test.step('edit name category and deactivate', async () => {
        if (await paymentPage.update(name, schema.update)) {
          name = schema.update.name;
        } else {
          defects.push('CMS opens Add Payment Type instead of Edit Payment Type when an existing row is clicked');
          await paymentPage.close();
        }
      });
      await test.step('reorder payment types', async () => {
        const result = await paymentPage.reorder();
        if (!result.ok) defects.push(`CMS payment reorder failed: HTTP ${result.status} ${result.body}`);
      });
      await test.step('delete unavailable in CMS and cleanup test data', async () => {
        await expect(page.getByRole('button', { name: /Hapus|Delete/ })).toHaveCount(0);
        await paymentPage.cleanupGenerated();
        exists = false;
      });
      expect(defects, defects.join('; ')).toEqual([]);
    } finally {
      await paymentPage.cleanupGenerated().catch(() => {});
      if (originalOrder.length) await paymentPage.restoreOrder(originalOrder).catch(() => {});
      exists = false;
    }
  });
});
