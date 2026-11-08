const { test, expect } = require('@playwright/test');
const { login } = require('../helpers/auth');
const { MenuPage } = require('../helpers/menu-page');
const schema = require('../schema/01-menu');

test.describe.configure({ mode: 'serial' });

test.describe('Outlet 4 Menu CRUD', () => {
  test('creates, edits, and deletes a menu and its variant', async ({ page }) => {
    const menuPage = new MenuPage(page);
    let menuName = schema.menu.create.name;
    let menuExists = false;
    const validationDefects = [];

    await test.step('login outlet 4', async () => {
      await login(page, schema.outletId);
      await menuPage.goto();
    });

    try {
      await test.step('reject missing menu name', async () => {
        await menuPage.expectCreateValidation({
          price: schema.menu.create.price,
          message: 'Nama menu harus diisi'
        });
      });

      await test.step('reject missing menu price', async () => {
        await menuPage.expectCreateValidation({
          name: schema.negative.menuName,
          message: 'Harga menu harus diisi'
        });
      });

      await test.step('reject negative menu price', async () => {
        let submitted = false;
        const blockInvalid = async (route) => {
          submitted = true;
          await route.abort();
        };
        await page.route('**/v2/menu', blockInvalid);
        await menuPage.openCreate();
        await menuPage.editor.getByPlaceholder('Masukkan nama menu').fill(schema.negative.menuName);
        await menuPage.editor.getByPlaceholder('Masukkan harga menu').fill(String(schema.negative.price));
        await menuPage.editor.getByRole('button', { name: 'Simpan', exact: true }).click();
        await page.waitForTimeout(500);
        await page.unroute('**/v2/menu', blockInvalid);
        if (submitted) validationDefects.push('CMS submitted a negative menu price');
        await expect(menuPage.editor).toBeVisible();
        await menuPage.closeEditor();
      });

      await test.step('create menu', async () => {
        await menuPage.createMenu(schema.menu.create);
        menuExists = true;
      });

      await test.step('edit menu', async () => {
        await menuPage.updateMenu(menuName, schema.menu.update);
        menuName = schema.menu.update.name;
        await menuPage.expectMenu(menuName);
      });

      await test.step('reject negative variant price', async () => {
        await menuPage.openMenu(menuName);
        await menuPage.editor.getByRole('button', { name: /Tambah Varian/ }).click();
        const modal = menuPage.variantModal('Tambah Varian Menu');
        await expect(modal).toBeVisible();
        await modal.getByPlaceholder('Contoh: Regular, Large, Extra').fill(schema.negative.variantName);
        const price = modal.locator('input[type="number"]').first();
        await price.fill(String(schema.negative.price));
        await modal.getByRole('button', { name: 'Simpan', exact: true }).click();
        if (await modal.count() === 0) validationDefects.push('CMS accepted a negative variant price');
        else await modal.getByRole('button', { name: 'Batal', exact: true }).click();
        await menuPage.editor.getByRole('button', { name: 'Batal', exact: true }).click();
      });

      await test.step('add variant', async () => {
        await menuPage.addVariant(menuName, schema.variant.create);
        await menuPage.openMenu(menuName);
        await expect(menuPage.variantRow(schema.variant.create.name)).toBeVisible();
        await menuPage.editor.getByRole('button', { name: 'Batal', exact: true }).click();
      });

      await test.step('edit variant name and prices', async () => {
        await menuPage.editVariant(menuName, schema.variant.create.name, schema.variant.update);
        await menuPage.openMenu(menuName);
        await expect(menuPage.variantRow(schema.variant.update.name)).toBeVisible();
        await expect(menuPage.variantRow(schema.variant.create.name)).toHaveCount(0);
        await menuPage.editor.getByRole('button', { name: 'Batal', exact: true }).click();
      });

      await test.step('delete variant', async () => {
        await menuPage.deleteVariant(menuName, schema.variant.update.name);
        await menuPage.openMenu(menuName);
        await expect(menuPage.variantRow(schema.variant.update.name)).toHaveCount(0);
        await menuPage.editor.getByRole('button', { name: 'Batal', exact: true }).click();
      });

      await test.step('delete menu', async () => {
        await menuPage.deleteMenu(menuName);
        menuExists = false;
      });

      await test.step('assert negative prices are rejected', async () => {
        expect(validationDefects, validationDefects.join('; ')).toEqual([]);
      });
    } finally {
      if (menuExists) {
        await test.step('delete menu (cleanup)', async () => {
          await page.goto('/menu');
          await menuPage.deleteMenu(menuName);
          menuExists = false;
        }).catch(() => {});
      }
    }
  });
});
