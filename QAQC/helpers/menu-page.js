const { expect } = require('@playwright/test');

class MenuPage {
  constructor(page) {
    this.page = page;
    this.search = page.getByPlaceholder('Search by name, type or price');
  }

  get editor() {
    return this.page.locator('.menu-editor-modal.show');
  }

  variantModal(title) {
    return this.page.locator('.modal.show').filter({
      has: this.page.getByRole('heading', { name: title, exact: typeof title === 'string' })
    });
  }

  async goto() {
    await this.page.goto('/menu');
    await expect(this.page.getByRole('heading', { name: 'Management Menu' })).toBeVisible();
  }

  async waitForAlertsToClose() {
    const alert = this.page.locator('.swal2-container');
    if (await alert.count()) await expect(alert).toBeHidden({ timeout: 10_000 });
  }

  async searchFor(name) {
    await this.waitForAlertsToClose();
    await this.search.fill(name);
  }

  menuCard(name) {
    return this.page.getByRole('button', { name: `Buka detail menu ${name}`, exact: true });
  }

  async expectMenu(name, visible = true) {
    await this.searchFor(name);
    const card = this.menuCard(name);
    if (visible) await expect(card).toBeVisible();
    else await expect(card).toHaveCount(0);
  }

  async openMenu(name) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      await this.expectMenu(name);
      await this.waitForAlertsToClose();

      try {
        const responsePromise = this.page.waitForResponse((res) =>
          /\/v3\/menu\/\d+/.test(new URL(res.url()).pathname) && res.request().method() === 'GET',
        { timeout: 15_000 });
        await this.menuCard(name).click();
        expect((await responsePromise).ok()).toBeTruthy();
        await expect(this.editor.getByRole('heading', { name: 'Edit Menu' })).toBeVisible();
        return;
      } catch (error) {
        if (attempt === 3) throw error;
        await this.page.reload();
        await expect(this.page.getByRole('heading', { name: 'Management Menu' })).toBeVisible();
        await this.page.waitForTimeout(attempt * 1_000);
      }
    }
  }

  async openCreate() {
    await this.page.getByRole('button', { name: /Tambah Data/ }).click();
    await expect(this.editor.getByRole('heading', { name: 'Tambah Menu' })).toBeVisible();
  }

  async closeEditor() {
    await this.editor.getByRole('button', { name: 'Batal', exact: true }).click();
    await expect(this.editor).toBeHidden();
  }

  async expectCreateValidation({ name = '', price = '', message }) {
    await this.openCreate();
    if (name) await this.editor.getByPlaceholder('Masukkan nama menu').fill(name);
    if (price !== '') await this.editor.getByPlaceholder('Masukkan harga menu').fill(String(price));
    await this.editor.getByRole('button', { name: 'Simpan', exact: true }).click();
    await expect(this.editor.getByText(message, { exact: true })).toBeVisible();
    await this.closeEditor();
  }

  async createMenu(data) {
    await this.openCreate();
    await this.editor.getByPlaceholder('Masukkan nama menu').fill(data.name);
    await this.editor.locator('select').nth(0).selectOption(data.type);
    await this.editor.getByPlaceholder('Masukkan harga menu').fill(String(data.price));
    await this.editor.locator('select').nth(1).selectOption(data.active ? '1' : '0');

    const response = this.page.waitForResponse((res) =>
      res.url().includes('/v2/menu') && res.request().method() === 'POST'
    );
    await this.editor.getByRole('button', { name: 'Simpan', exact: true }).click();
    expect((await response).ok()).toBeTruthy();
    await expect(this.editor).toBeHidden();
    await this.waitForAlertsToClose();
    await this.expectMenu(data.name);
  }

  async updateMenu(currentName, data) {
    await this.openMenu(currentName);
    await this.editor.getByPlaceholder('Masukkan nama menu').fill(data.name);
    await this.editor.locator('select').nth(0).selectOption(data.type);
    await this.editor.locator('select').nth(1).selectOption(data.active ? '1' : '0');

    const response = this.page.waitForResponse((res) =>
      /\/v2\/menu\/\d+/.test(res.url()) && res.request().method() === 'PATCH'
    );
    await this.editor.getByRole('button', { name: 'Simpan', exact: true }).click();
    expect((await response).ok()).toBeTruthy();
    await expect(this.editor).toBeHidden();
    await this.waitForAlertsToClose();
    await this.expectMenu(data.name);
  }

  async fillVariant(modal, data) {
    const nameInput = modal.getByPlaceholder('Contoh: Regular, Large, Extra');
    await expect(nameInput).toBeVisible();
    await nameInput.fill(data.name);
    await expect(nameInput).toHaveValue(data.name);

    for (const [servingType, price] of Object.entries(data.prices)) {
      const row = modal.locator('.list-group-item').filter({ hasText: servingType });
      await expect(row).toBeVisible();
      const priceInput = row.locator('input[type="number"]');
      await priceInput.fill(String(price));
      await expect(priceInput).toHaveValue(String(price));
    }
  }

  async addVariant(menuName, data) {
    await this.openMenu(menuName);
    await this.editor.getByRole('button', { name: /Tambah Varian/ }).click();
    const modal = this.variantModal('Tambah Varian Menu');
    await expect(modal).toBeVisible();
    await this.fillVariant(modal, data);
    const save = modal.getByRole('button', { name: 'Simpan', exact: true });
    await expect(save).toBeEnabled();
    await save.click();
    await expect(modal).toHaveCount(0);
    await expect(this.editor.getByText(data.name, { exact: true })).toBeVisible();
    await this.saveEditorAndWait();
  }

  variantRow(name) {
    return this.editor.locator('.list-group-item').filter({ has: this.page.getByText(name, { exact: true }) });
  }

  async editVariant(menuName, currentName, data) {
    await this.openMenu(menuName);
    const row = this.variantRow(currentName);
    await row.getByTitle('Edit varian').click();
    const modal = this.variantModal(new RegExp(`Edit Harga Varian: ${escapeRegex(currentName)}`));
    await expect(modal).toBeVisible();
    await this.fillVariant(modal, data);

    const response = this.page.waitForResponse((res) =>
      res.url().includes('/v2/custom-menu-price/') && res.request().method() === 'PATCH'
    );
    const save = modal.getByRole('button', { name: 'Simpan', exact: true });
    await expect(save).toBeEnabled();
    await save.click();
    expect((await response).ok()).toBeTruthy();
    await expect(modal).toHaveCount(0);
    await expect(this.editor.getByText(data.name, { exact: true })).toBeVisible();
    await this.editor.getByRole('button', { name: 'Batal', exact: true }).click();
  }

  async deleteVariant(menuName, variantName) {
    await this.openMenu(menuName);
    await this.variantRow(variantName).getByTitle('Hapus varian').click();
    await expect(this.editor.getByText(variantName, { exact: true })).toHaveCount(0);
    await this.saveEditorAndWait();
  }

  async saveEditorAndWait() {
    const response = this.page.waitForResponse((res) =>
      /\/v2\/menu\/\d+/.test(res.url()) && res.request().method() === 'PATCH'
    );
    await this.editor.getByRole('button', { name: 'Simpan', exact: true }).click();
    expect((await response).ok()).toBeTruthy();
    await expect(this.editor).toBeHidden();
  }

  async deleteMenu(name) {
    await this.openMenu(name);
    await this.editor.getByRole('button', { name: /Hapus Menu/ }).click();
    const confirmation = this.page.locator('#deleteConfirmationModal');
    await expect(confirmation).toBeVisible();

    const response = this.page.waitForResponse((res) =>
      /\/menu\/\d+/.test(res.url()) && res.request().method() === 'DELETE'
    );
    await confirmation.getByRole('button', { name: 'Hapus', exact: true }).click();
    expect((await response).ok()).toBeTruthy();
    await expect(this.editor).toBeHidden();
    await this.expectMenu(name, false);
  }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { MenuPage };
