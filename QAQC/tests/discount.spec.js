const { test, expect } = require('@playwright/test');
const { login } = require('../helpers/auth');
const { DiscountPage } = require('../helpers/discount-page');
const schema = require('../schema/02-discount');

test.describe.configure({ mode: 'serial' });

test.describe('Outlet 4 Discount validation and CRUD', () => {
  test('rejects invalid boundaries, then creates, edits dates, and deletes a discount', async ({ page }) => {
    const discountPage = new DiscountPage(page);
    const valid = schema.discount.create;
    let code = valid.code;
    let exists = false;
    let mutations = 0;

    page.on('request', (request) => {
      const path = new URL(request.url()).pathname;
      if (/\/discount\/?(?:\d+)?$/.test(path) && ['POST', 'PATCH'].includes(request.method())) mutations += 1;
    });

    async function reject(name, configure, message) {
      await test.step(name, async () => {
        const before = mutations;
        await discountPage.openCreate();
        await configure();
        await discountPage.submitExpectError(message);
        expect(mutations).toBe(before);
        await discountPage.close();
      });
    }

    await test.step('login outlet 4', async () => {
      await login(page, schema.outletId);
      await discountPage.goto();
    });

    try {
      await reject('reject required fields', async () => {}, 'Kode diskon harus diisi');

      await reject('reject percentage above 100', async () => {
        await discountPage.fill({ ...valid, value: schema.negative.percentageOver100 });
      }, 'Diskon persentase tidak boleh lebih dari 100%');

      await reject('reject zero discount value', async () => {
        await discountPage.fill({ ...valid, value: schema.negative.zeroValue });
      }, 'Nilai diskon tidak boleh kurang dari 1');

      await reject('reject negative discount value', async () => {
        await discountPage.fill({ ...valid, value: schema.negative.negativeValue });
      }, 'Nilai diskon tidak boleh kurang dari 1');

      await reject('reject negative minimum purchase', async () => {
        await discountPage.fill({ ...valid, minPurchase: schema.negative.negativeMinPurchase });
      }, 'Minimal pembelian tidak boleh negatif');

      await reject('reject negative maximum discount', async () => {
        await discountPage.fill({ ...valid, maxDiscount: schema.negative.negativeMaxDiscount });
      }, 'Maksimal diskon tidak boleh negatif');

      await reject('reject end date before start date', async () => {
        await discountPage.fill({
          ...valid,
          startDate: '2026-11-20 22:00',
          endDate: '2026-11-10 08:00'
        });
      }, 'Tanggal berakhir tidak boleh lebih kecil dari tanggal mulai');

      await test.step('create valid discount', async () => {
        await discountPage.create(valid);
        exists = true;
      });

      await test.step('edit discount dates and properties', async () => {
        await discountPage.update(code, schema.discount.update);
        code = schema.discount.update.code;
        await discountPage.openDiscount(code);
        await expect(discountPage.field('Pilih tanggal mulai')).toHaveValue(schema.discount.update.startDate);
        await expect(discountPage.field('Pilih tanggal berakhir')).toHaveValue(schema.discount.update.endDate);
        await expect(discountPage.modal.locator('select').nth(0)).toHaveValue('0');
        await expect(discountPage.modal.locator('select').nth(1)).toHaveValue('0');
        await discountPage.close();
      });

      await test.step('delete discount', async () => {
        await discountPage.delete(code);
        exists = false;
      });
    } finally {
      if (exists) {
        await test.step('delete discount (cleanup)', async () => {
          await page.goto('/discount');
          await discountPage.delete(code);
          exists = false;
        }).catch(() => {});
      }
    }
  });
});
