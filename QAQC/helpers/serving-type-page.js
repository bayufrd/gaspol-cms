const { expect } = require('@playwright/test');

class ServingTypePage {
  constructor(page) {
    this.page = page;
  }

  get modal() {
    return this.page.locator('#inlineForm.show');
  }

  async goto() {
    await this.page.goto('/serving-type');
    await expect(this.page.getByRole('heading', { name: 'Management Serving Types' })).toBeVisible();
  }

  row(name) {
    return this.page.locator('.desktop-view .serving-type-row').filter({
      has: this.page.locator('.serving-type-name-cell', { hasText: name })
    });
  }

  async openCreate() {
    await this.page.getByRole('button', { name: /Tambah Data/ }).click();
    await expect(this.modal.getByRole('heading', { name: 'Add Serving Type' })).toBeVisible();
  }

  async open(name) {
    const row = this.row(name);
    await expect(row).toBeVisible();
    const response = this.page.waitForResponse((res) =>
      /\/serving-type\/\d+$/.test(new URL(res.url()).pathname) && res.request().method() === 'GET'
    );
    await row.click();
    expect((await response).ok()).toBeTruthy();
    await expect(this.modal.getByRole('heading', { name: 'Edit Serving Type' })).toBeVisible();
    await expect(this.modal.getByPlaceholder('Nama')).toHaveValue(name);
  }

  async close() {
    await this.modal.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(this.modal).toBeHidden();
  }

  async rejectEmptyName() {
    await this.openCreate();
    await this.modal.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(this.modal.getByText('Nama harus diisi', { exact: true })).toBeVisible();
    await this.close();
  }

  async create(data) {
    await this.openCreate();
    await this.modal.getByPlaceholder('Nama').fill(data.name);
    await this.modal.locator('select').selectOption(data.active ? '1' : '0');
    const response = this.page.waitForResponse((res) =>
      /\/serving-type\/?$/.test(new URL(res.url()).pathname) && res.request().method() === 'POST'
    );
    await this.modal.getByRole('button', { name: 'Submit', exact: true }).click();
    expect((await response).ok()).toBeTruthy();
    await expect(this.modal).toBeHidden();
    await this.dismissAlert();
    await expect(this.row(data.name)).toBeVisible();
  }

  async update(currentName, data) {
    await this.open(currentName);
    await this.modal.getByPlaceholder('Nama').fill(data.name);
    await this.modal.locator('select').selectOption(data.active ? '1' : '0');
    const response = this.page.waitForResponse((res) =>
      /\/serving-type\/\d+$/.test(new URL(res.url()).pathname) && res.request().method() === 'PATCH'
    );
    await this.modal.getByRole('button', { name: 'Submit', exact: true }).click();
    expect((await response).ok()).toBeTruthy();
    await expect(this.modal).toBeHidden();
    await this.dismissAlert();
    const row = this.row(data.name);
    await expect(row).toBeVisible();
    await expect(row.getByText(data.active ? 'Aktif' : 'Tidak Aktif', { exact: true })).toBeVisible();
  }

  async expectProtected(name) {
    await this.open(name);
    await expect(this.modal.getByPlaceholder('Nama')).toBeDisabled();
    await expect(this.modal.locator('select')).toBeDisabled();
    await this.close();
  }

  async dismissAlert() {
    const alert = this.page.locator('.swal2-container');
    if (await alert.count()) await expect(alert).toBeHidden({ timeout: 10_000 });
  }

  async cleanup(name) {
    await this.goto();
    const row = this.row(name);
    if (await row.count() === 0) return;
    await this.open(name);
    const detailUrl = await this.openDetailUrl();
    const response = await this.page.request.delete(detailUrl);
    expect(response.ok()).toBeTruthy();
    await this.close();
    await this.page.reload();
    await expect(this.row(name)).toHaveCount(0);
  }

  async openDetailUrl() {
    return this.modal.evaluate(() => {
      const entries = performance.getEntriesByType('resource').map((entry) => entry.name).reverse();
      const url = entries.find((value) => /\/serving-type\/\d+$/.test(new URL(value).pathname));
      if (!url) throw new Error('Serving type detail request not found');
      return url;
    });
  }
}

module.exports = { ServingTypePage };
