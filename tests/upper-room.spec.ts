import { expect, test } from '@playwright/test';

test('opens the phone-first Scripture surface on WEB John 1', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('main[data-surface="scripture"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'John 1' })).toBeVisible();
  await expect(page.getByText('World English Bible')).toBeVisible();
  await expect(page.getByText(/In the beginning was the Word/)).toBeVisible();
});
