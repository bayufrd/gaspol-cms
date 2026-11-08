const { test, expect } = require('@playwright/test');
const { login } = require('../helpers/auth');
const { ServingTypePage } = require('../helpers/serving-type-page');
const schema = require('../schema/03-serving-type');

test.describe.configure({ mode: 'serial' });

test.describe('Outlet 4 Serving Type validation and lifecycle', () => {
  test('validates, creates, edits, protects defaults, and cleans up', async ({ page }) => {
    const servingPage = new ServingTypePage(page);
    let name = schema.create.name;
    let exists = false;
    let creates = 0;

    page.on('request', (request) => {
      if (/\/serving-type\/?$/.test(new URL(request.url()).pathname) && request.method() === 'POST') creates += 1;
    });

    await test.step('login outlet 4', async () => {
      await login(page, schema.outletId);
      await servingPage.goto();
    });

    try {
      await test.step('reject empty serving type name', async () => {
        const before = creates;
        await servingPage.rejectEmptyName();
        expect(creates).toBe(before);
      });

      await test.step('create active serving type', async () => {
        await servingPage.create(schema.create);
        exists = true;
      });

      await test.step('edit name and deactivate serving type', async () => {
        await servingPage.update(name, schema.update);
        name = schema.update.name;
      });

      await test.step('protect Dine In serving type', async () => {
        await servingPage.expectProtected(schema.protectedName);
      });

      await test.step('delete unavailable in CMS and cleanup test data', async () => {
        await servingPage.open(name);
        await expect(servingPage.modal.getByRole('button', { name: /Hapus|Delete/ })).toHaveCount(0);
        await servingPage.close();
        await servingPage.cleanup(name);
        exists = false;
      });
    } finally {
      if (exists) await servingPage.cleanup(name).catch(() => {});
    }
  });
});
