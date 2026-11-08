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

    await test.step('login outlet 4', async () => {
      await login(page, schema.outletId);
      await menuPage.goto();
    });

    try {
      await test.step('create menu', async () => {
        await menuPage.createMenu(schema.menu.create);
        menuExists = true;
      });

      await test.step('edit menu', async () => {
        await menuPage.updateMenu(menuName, schema.menu.update);
        menuName = schema.menu.update.name;
        await menuPage.expectMenu(menuName);
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
