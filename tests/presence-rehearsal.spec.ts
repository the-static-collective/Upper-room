import { expect, test } from '@playwright/test';

test('two same-browser reading windows remain sovereign', async ({ context, page }) => {
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Your name' }).fill('Lu');
  await page.getByRole('button', { name: 'Open local room' }).click();
  await expect(page.getByRole('navigation', { name: 'Reading windows' })).toBeVisible();

  const other = await context.newPage();
  try {
    await other.goto(page.url());
    await other.getByRole('textbox', { name: 'Your name' }).fill('Paula');
    await other.getByRole('button', { name: 'Open local room' }).click();

    const paulaTab = page.getByRole('button', { name: /Paula/ });
    await expect(paulaTab).toBeVisible();
    await expect(other.getByRole('button', { name: /Lu/ })).toBeVisible();

    await paulaTab.click();
    await expect(paulaTab).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: /Me/ })).toHaveAttribute('aria-pressed', 'false');

    await other.locator('#JHN-1-5').scrollIntoViewIfNeeded();
    await expect(page.getByRole('button', { name: /Paula/ })).toContainText('JHN 1:');

    await page.getByRole('button', { name: /Me/ }).click();
    await expect(page.getByRole('button', { name: /Me/ })).toHaveAttribute('aria-pressed', 'true');

    await other.getByRole('button', { name: 'Leave local room' }).click();
    await expect(page.getByRole('button', { name: /Paula/ })).toContainText('offline');
  } finally {
    if (!other.isClosed()) await other.close();
  }
});
