const { expect } = require('@playwright/test');

class PaymentTypePage {
  constructor(page) { this.page = page; }
  get modal() { return this.page.locator('#inlineForm.show'); }

  async goto() {
    await this.page.goto('/payment-type');
    await expect(this.page.getByRole('heading', { name: 'Management Payment Types' })).toBeVisible();
  }

  row(name) {
    return this.page.locator('.desktop-view .payment-type-row').filter({ has: this.page.locator('.payment-type-name-cell', { hasText: name }) });
  }

  async openCreate() {
    await this.page.getByRole('button', { name: /Tambah Data/ }).click();
    await expect(this.modal.getByRole('heading', { name: 'Add Payment Type' })).toBeVisible();
  }

  async open(name) {
    const row = this.row(name);
    await expect(row).toBeVisible();
    const response = this.page.waitForResponse((res) => /\/payment-management\/\d+$/.test(new URL(res.url()).pathname) && res.request().method() === 'GET');
    await row.click();
    expect((await response).ok()).toBeTruthy();
    await expect(this.modal.getByRole('heading', { name: 'Edit Payment Type' })).toBeVisible();
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

  async categorySelect() { return this.modal.locator('select').last(); }

  async create(data) {
    await this.openCreate();
    const category = await this.categorySelect();
    await expect(category.locator('option')).not.toHaveCount(0);
    const categoryValue = await category.locator('option').first().getAttribute('value');
    await category.selectOption(categoryValue);
    await this.modal.getByPlaceholder('Nama').fill(data.name);
    const response = this.page.waitForResponse((res) => /\/payment-management\/?$/.test(new URL(res.url()).pathname) && res.request().method() === 'POST');
    await this.modal.getByRole('button', { name: 'Submit', exact: true }).click();
    expect((await response).ok()).toBeTruthy();
    await expect(this.modal).toBeHidden();
    await this.dismissAlert();
    await expect(this.row(data.name)).toBeVisible();
  }

  async update(currentName, data) {
    await this.open(currentName);
    const selects = this.modal.locator('select');
    await selects.first().selectOption(data.active ? '1' : '0');
    const category = selects.last();
    const options = category.locator('option');
    const count = await options.count();
    const current = await category.inputValue();
    let target = current;
    for (let index = 0; index < count; index += 1) {
      const value = await options.nth(index).getAttribute('value');
      if (value !== current) { target = value; break; }
    }
    await category.selectOption(target);
    await this.modal.getByPlaceholder('Nama').fill(data.name);
    const response = this.page.waitForResponse((res) => /\/payment-management\/\d+$/.test(new URL(res.url()).pathname) && res.request().method() === 'PATCH');
    await this.modal.getByRole('button', { name: 'Submit', exact: true }).click();
    expect((await response).ok()).toBeTruthy();
    await expect(this.modal).toBeHidden();
    await this.dismissAlert();
    const row = this.row(data.name);
    await expect(row).toBeVisible();
    await expect(row.getByText(data.active ? 'Aktif' : 'Tidak Aktif', { exact: true })).toBeVisible();
  }

  async reorder() {
    await this.page.getByRole('button', { name: /Ubah Urutan/ }).click();
    const rows = this.page.locator('.desktop-view .payment-type-row');
    await expect(rows.first().getByTitle('Turun')).toBeVisible();
    await rows.first().getByTitle('Turun').click();
    const response = this.page.waitForResponse((res) => new URL(res.url()).pathname.endsWith('/update-payment-order') && res.request().method() === 'PUT');
    await this.page.getByRole('button', { name: /Simpan Urutan/ }).click();
    expect((await response).ok()).toBeTruthy();
    await this.dismissAlert();
  }

  async dismissAlert() {
    const alert = this.page.locator('.swal2-container');
    if (await alert.count()) await expect(alert).toBeHidden({ timeout: 10_000 });
  }

  async cleanup(name) {
    await this.goto();
    if (await this.row(name).count() === 0) return;
    await this.open(name);
    const detailUrl = await this.modal.evaluate(() => performance.getEntriesByType('resource').map((e) => e.name).reverse().find((url) => /\/payment-management\/\d+$/.test(new URL(url).pathname)));
    if (!detailUrl) throw new Error('Payment type detail request not found');
    const response = await this.page.request.delete(detailUrl);
    expect(response.ok()).toBeTruthy();
    await this.close();
    await this.page.reload();
    await expect(this.row(name)).toHaveCount(0);
  }
}

module.exports = { PaymentTypePage };
