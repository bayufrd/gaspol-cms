const { expect } = require('@playwright/test');

class PaymentTypePage {
  constructor(page) { this.page = page; }
  get modal() { return this.page.locator('#inlineForm.show'); }

  async goto() {
    const responsePromise = this.page.waitForResponse((res) =>
      /\/payment-management\/?$/.test(new URL(res.url()).pathname) && res.request().method() === 'GET'
    );
    await this.page.goto('/payment-type');
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    this.apiBaseUrl = new URL('.', response.url()).href.replace(/\/$/, '');
    this.paymentTypes = body.data.payment_type;
    await expect(this.page.getByRole('heading', { name: 'Management Payment Types' })).toBeVisible();
  }

  async authHeaders() {
    const token = await this.page.evaluate(() => localStorage.getItem('token'));
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async cleanupGenerated(prefix = 'QAQC Payment') {
    await this.goto();
    const generated = this.paymentTypes.filter((item) => String(item.name).startsWith(prefix));
    const headers = await this.authHeaders();
    for (const item of generated) {
      const response = await this.page.request.delete(`${this.apiBaseUrl}/payment-management/${item.id}`, { headers });
      expect(response.ok(), `Cleanup failed for payment type ${item.name}: HTTP ${response.status()}`).toBeTruthy();
    }
    await this.goto();
    expect(this.paymentTypes.filter((item) => String(item.name).startsWith(prefix))).toHaveLength(0);
  }

  async restoreOrder(items) {
    const headers = await this.authHeaders();
    const response = await this.page.request.put(`${this.apiBaseUrl}/update-payment-order`, {
      headers,
      data: {
        paymentTypesOrder: items.map((item, index) => ({ id: item.id, order: index + 1 })),
        outlet_id: 4
      }
    });
    expect(response.ok(), `Payment order restore failed: HTTP ${response.status()} ${await response.text()}`).toBeTruthy();
    await this.goto();
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
    await row.click();
    await expect(this.modal).toBeVisible();
    if (await this.modal.getByRole('heading', { name: 'Add Payment Type' }).isVisible()) {
      return false;
    }
    await expect(this.modal.getByRole('heading', { name: 'Edit Payment Type' })).toBeVisible();
    await expect(this.modal.getByPlaceholder('Nama')).toHaveValue(name);
    return true;
  }

  async close() {
    await this.modal.locator('button.btn-light-secondary', { hasText: 'Close' }).click();
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
    const responsePromise = this.page.waitForResponse((res) => /\/payment-management\/?$/.test(new URL(res.url()).pathname) && res.request().method() === 'POST');
    await this.modal.getByRole('button', { name: 'Submit', exact: true }).click();
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    const id = body?.data?.id ?? body?.data?.payment_type?.id ?? body?.id;
    if (id) this.detailUrl = new URL(`/payment-management/${id}`, response.url()).href;
    await expect(this.modal).toBeHidden();
    await this.dismissAlert();
    await expect(this.row(data.name)).toBeVisible();
  }

  async update(currentName, data) {
    if (!await this.open(currentName)) return false;
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
    const responsePromise = this.page.waitForResponse((res) => /\/payment-management\/\d+$/.test(new URL(res.url()).pathname) && res.request().method() === 'PATCH');
    await this.modal.getByRole('button', { name: 'Submit', exact: true }).click();
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();
    this.detailUrl = response.url();
    await expect(this.modal).toBeHidden();
    await this.dismissAlert();
    const row = this.row(data.name);
    await expect(row).toBeVisible();
    await expect(row.getByText(data.active ? 'Aktif' : 'Tidak Aktif', { exact: true })).toBeVisible();
    return true;
  }

  async reorder() {
    await this.page.getByRole('button', { name: /Ubah Urutan/ }).click();
    const rows = this.page.locator('.desktop-view .payment-type-row');
    await expect(rows.first().getByTitle('Turun')).toBeVisible();
    await rows.first().getByTitle('Turun').click();
    const responsePromise = this.page.waitForResponse((res) => new URL(res.url()).pathname.endsWith('/update-payment-order') && res.request().method() === 'PUT');
    await this.page.getByRole('button', { name: /Simpan Urutan/ }).click();
    const response = await responsePromise;
    const body = await response.text();
    await this.dismissAlert();
    return { ok: response.ok(), status: response.status(), body };
  }

  async dismissAlert() {
    const alert = this.page.locator('.swal2-container');
    if (await alert.count()) await expect(alert).toBeHidden({ timeout: 10_000 });
  }

  async cleanup(name) {
    await this.goto();
    if (await this.row(name).count() === 0) return;
    if (!this.detailUrl) throw new Error('Payment type detail URL not captured from create/update');
    const response = await this.page.request.delete(this.detailUrl, { headers: await this.authHeaders() });
    expect(response.ok()).toBeTruthy();
    if (await this.modal.count()) await this.close();
    await this.page.reload();
    await expect(this.row(name)).toHaveCount(0);
  }
}

module.exports = { PaymentTypePage };
