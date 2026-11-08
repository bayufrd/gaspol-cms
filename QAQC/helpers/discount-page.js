const { expect } = require('@playwright/test');

class DiscountPage {
  constructor(page) {
    this.page = page;
    this.search = page.getByPlaceholder('Cari discount (kode, tanggal, nilai, dll.)');
  }

  get modal() {
    return this.page.locator('.discount-modal.is-active');
  }

  async goto() {
    await this.page.goto('/discount');
    await expect(this.page.getByRole('heading', { name: 'Management Discounts' })).toBeVisible();
  }

  async waitForAlertsToClose() {
    const alert = this.page.locator('.swal2-container');
    if (await alert.count()) await expect(alert).toBeHidden({ timeout: 10_000 });
  }

  async openCreate() {
    await this.waitForAlertsToClose();
    await this.page.getByRole('button', { name: /Tambah Data/ }).click();
    await expect(this.modal.getByRole('heading', { name: 'Tambah Diskon' })).toBeVisible();
  }

  async close() {
    await this.modal.locator('.modal-close').click();
    await expect(this.modal).toHaveCount(0);
  }

  async searchFor(code) {
    await this.waitForAlertsToClose();
    await this.search.fill(code);
  }

  card(code) {
    return this.page.locator('.discount-card').filter({ has: this.page.getByText(code, { exact: true }) });
  }

  async expectDiscount(code, visible = true) {
    await this.searchFor(code);
    if (visible) await expect(this.card(code)).toBeVisible();
    else await expect(this.card(code)).toHaveCount(0);
  }

  async openDiscount(code) {
    await this.expectDiscount(code);
    const response = this.page.waitForResponse((res) =>
      /\/discount\/\d+$/.test(new URL(res.url()).pathname) && res.request().method() === 'GET'
    );
    await this.card(code).click();
    expect((await response).ok()).toBeTruthy();
    await expect(this.modal.getByRole('heading', { name: 'Edit Diskon' })).toBeVisible();
  }

  field(placeholder) {
    return this.modal.getByPlaceholder(placeholder);
  }

  async setDate(placeholder, value) {
    const input = this.field(placeholder);
    await expect(input).toBeVisible();
    await input.evaluate((element, date) => {
      if (!element._flatpickr) throw new Error(`Flatpickr unavailable for ${element.placeholder}`);
      element._flatpickr.setDate(date, true, 'Y-m-d H:i');
    }, value);
    await expect(input).toHaveValue(value);
  }

  async setNumber(placeholder, value) {
    const input = this.field(placeholder);
    await input.evaluate((element, nextValue) => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(element, String(nextValue));
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }, value);
    await expect(input).toHaveValue(String(value));
  }

  async fill(data) {
    await this.field('Masukkan kode diskon').fill(data.code);
    await this.setDate('Pilih tanggal mulai', data.startDate);
    await this.setDate('Pilih tanggal berakhir', data.endDate);
    await this.modal.locator('select').nth(0).selectOption(data.isPercent ? '1' : '0');
    await this.modal.locator('select').nth(1).selectOption(data.isCart ? '1' : '0');
    await this.setNumber('Masukkan nilai diskon', data.value);
    await this.setNumber('Masukkan minimal pembelian', data.minPurchase);

    const unlimited = this.modal.locator('#unlimitedMaxDiscount');
    if (await unlimited.count()) {
      if (data.unlimitedMaxDiscount) await unlimited.check();
      else {
        await unlimited.uncheck();
        await this.setNumber('Masukkan maksimal diskon', data.maxDiscount);
      }
    }
  }

  async submitExpectError(message) {
    await this.modal.locator('form').evaluate((form) => { form.noValidate = true; });
    await this.modal.getByRole('button', { name: 'Simpan', exact: true }).click();
    await expect(this.modal.getByText(message, { exact: true })).toBeVisible();
    await expect(this.modal).toBeVisible();
  }

  async create(data) {
    await this.openCreate();
    await this.fill(data);
    const response = this.page.waitForResponse((res) =>
      /\/discount\/?$/.test(new URL(res.url()).pathname) && res.request().method() === 'POST'
    );
    await this.modal.getByRole('button', { name: 'Simpan', exact: true }).click();
    expect((await response).ok()).toBeTruthy();
    await expect(this.modal).toHaveCount(0);
    await this.waitForAlertsToClose();
    await this.expectDiscount(data.code);
  }

  async update(currentCode, data) {
    await this.openDiscount(currentCode);
    await this.fill(data);
    const response = this.page.waitForResponse((res) =>
      /\/discount\/\d+$/.test(new URL(res.url()).pathname) && res.request().method() === 'PATCH'
    );
    await this.modal.getByRole('button', { name: 'Simpan', exact: true }).click();
    expect((await response).ok()).toBeTruthy();
    await expect(this.modal).toHaveCount(0);
    await this.waitForAlertsToClose();
    await this.expectDiscount(data.code);
  }

  async delete(code) {
    await this.openDiscount(code);
    await this.modal.getByRole('button', { name: 'Hapus', exact: true }).click();
    const confirmation = this.page.locator('#deleteConfirmationModal');
    await expect(confirmation).toBeVisible();
    const response = this.page.waitForResponse((res) =>
      /\/discount\/\d+$/.test(new URL(res.url()).pathname) && res.request().method() === 'DELETE'
    );
    await confirmation.getByRole('button', { name: 'Hapus', exact: true }).click();
    expect((await response).ok()).toBeTruthy();
    await expect(this.modal).toHaveCount(0);
    await this.waitForAlertsToClose();
    await this.expectDiscount(code, false);
  }
}

module.exports = { DiscountPage };
