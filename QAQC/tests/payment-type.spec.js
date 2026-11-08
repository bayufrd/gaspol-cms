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
    page.on('request', (request) => {
      if (/\/payment-management\/?$/.test(new URL(request.url()).pathname) && request.method() === 'POST') creates += 1;
    });

    await test.step('login outlet 4', async () => {
      await login(page, schema.outletId);
      await paymentPage.goto();
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
        await paymentPage.update(name, schema.update);
        name = schema.update.name;
      });
      await test.step('reorder payment types', async () => {
        await paymentPage.reorder();
      });
      await test.step('delete unavailable in CMS and cleanup test data', async () => {
        await paymentPage.open(name);
        await expect(paymentPage.modal.getByRole('button', { name: /Hapus|Delete/ })).toHaveCount(0);
        await paymentPage.close();
        await paymentPage.cleanup(name);
        exists = false;
      });
    } finally {
      if (exists) await paymentPage.cleanup(name).catch(() => {});
    }
  });
});
