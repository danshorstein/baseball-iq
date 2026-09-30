import { test, expect } from '@playwright/test';

test('generic home, mobile layout and position selector work under a GitHub project path', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('./');
  await expect(page).toHaveTitle('Baseball IQ');
  await expect(page.getByRole('heading', { name: 'BASEBALL IQ' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'PRACTICE A POSITION' }).click();
  await expect(page.getByRole('button', { name: 'CF Center Field', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'LCF Left Center', exact: true })).toHaveCount(0);
  await page.getByLabel('First name (optional)').fill('Sam');
  await page.getByRole('button', { name: 'CF Center Field', exact: true }).click();
  await expect(page.getByText('Question 1 of')).toBeVisible();
  await expect(page.getByText('Sam is playing', { exact: false })).toBeVisible();
  await expect(page.locator('.pm')).toHaveCount(9);
  expect(errors).toEqual([]);
});

test('age presets, overrides and settings persist after reload', async ({ page }) => {
  await page.goto('./#/coach');
  await page.getByLabel('Team name (optional)').fill('Ponte Vedra Sharks');
  await page.getByRole('combobox', { name: 'Age group', exact: true }).selectOption('8U');
  await expect(page.getByLabel('Defensive players')).toHaveValue('10');
  await page.getByLabel('Team type').selectOption('travel');
  await page.getByLabel('Defensive players').selectOption('9');
  await page.getByLabel('Leading off allowed', { exact: true }).check();
  await page.getByLabel('Stealing starts').selectOption('release');
  await page.reload();
  await expect(page.getByLabel('Team name (optional)')).toHaveValue('Ponte Vedra Sharks');
  await expect(page.getByLabel('Team type')).toHaveValue('travel');
  await expect(page.getByLabel('Defensive players')).toHaveValue('9');
  await expect(page.getByLabel('Leading off allowed', { exact: true })).toBeChecked();
  await expect(page.getByLabel('Stealing starts')).toHaveValue('release');
});

test('selected rule profile determines quiz answers and completes a session', async ({ page }) => {
  await page.goto('./#/rules');
  const answers = ['NO', 'AFTER THE PITCH REACHES HOME', 'NO', 'NO', 'NO', 'YES'];
  for (let i = 0; i < answers.length; i++) {
    const button = page.getByRole('button', { name: answers[i], exact: true });
    await expect(button).toBeEnabled(); await button.click();
    await expect(page.locator('.overlay-good')).toBeVisible();
    await page.getByRole('button', { name: i === answers.length - 1 ? 'Finish ▶' : 'Next ▶', exact: true }).click();
  }
  await expect(page.getByText('RULES CHECK COMPLETE!')).toBeVisible();
  await expect(page.locator('.score-num')).toContainText('6');
});

test('setup import/export round-trips and rejects malformed files', async ({ page }) => {
  await page.goto('./#/coach');
  await page.getByLabel('Team name (optional)').fill('Shared setup');
  await page.getByLabel('Color preset').selectOption('mets');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export setup' }).click();
  const download = await downloadEvent;
  const path = await download.path(); expect(path).toBeTruthy();
  await page.getByLabel('Team name (optional)').fill('Changed');
  await page.getByLabel('Color preset').selectOption('athletics');
  await page.getByLabel('Import setup', { exact: true }).setInputFiles(path!);
  await expect(page.getByLabel('Team name (optional)')).toHaveValue('Shared setup');
  await expect(page.getByLabel('Color preset')).toHaveValue('mets');
  await page.getByLabel('Import setup', { exact: true }).setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{}') });
  await expect(page.getByText('Choose a Baseball IQ setup export (version 1).')).toBeVisible();
  await expect(page.getByLabel('Team name (optional)')).toHaveValue('Shared setup');
});

test('team presets and custom colors style the site and field, persist, and survive both age selectors', async ({ page }) => {
  await page.goto('./#/coach');
  await expect(page.getByLabel('Color preset')).toHaveValue('sharks');
  await expect(page.getByLabel('Color preset').locator('option')).toHaveCount(17);
  await page.getByLabel('Color preset').selectOption('athletics');
  await expect(page.locator('.topbar')).toHaveCSS('background-color', 'rgb(0, 56, 49)');
  await page.getByLabel('Primary color', { exact: true }).fill('#ffffff');
  await page.getByLabel('Accent color', { exact: true }).fill('#000000');
  await expect(page.getByLabel('Color preset')).toHaveValue('custom');
  await expect(page.locator('.topbar')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.locator('.brand')).toHaveCSS('color', 'rgb(0, 0, 0)');
  await page.getByRole('combobox', { name: 'Age group', exact: true }).selectOption('8U');
  await expect(page.getByLabel('Primary color', { exact: true })).toHaveValue('#ffffff');
  await page.reload();
  await expect(page.getByLabel('Accent color', { exact: true })).toHaveValue('#000000');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Baseball IQ' }).click();
  await page.getByRole('combobox', { name: 'Age group', exact: true }).selectOption('10U');
  await expect(page.locator('.btn-accent').first()).toHaveCSS('background-color', 'rgb(0, 0, 0)');
  await expect(page.locator('.btn-accent').first()).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(page.locator('.bbb-step').nth(2)).toHaveCSS('color', 'rgb(255, 255, 255)');
  await page.goto('./#/play/gb-ss-empty');
  await expect(page.locator('.pm-token').first()).toHaveCSS('fill', 'rgb(255, 255, 255)');
  await expect(page.locator('.pm-pos').first()).toHaveCSS('fill', 'rgb(0, 0, 0)');
});

test('blocked storage is explained while practice remains usable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } });
  });
  await page.goto('./#/coach');
  await page.getByRole('combobox', { name: 'Age group', exact: true }).selectOption('8U');
  await expect(page.getByText('Browser storage is unavailable.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Baseball IQ' }).click();
  await page.getByRole('button', { name: 'All plays' }).click();
  await page.getByRole('button', { name: 'BASES EMPTY GROUND BALL TO SHORTSTOP', exact: false }).first().click();
  await expect(page.locator('.pm')).toHaveCount(10);
  await page.getByRole('button', { name: 'SS (SS): show job', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.explain-job')).toHaveText('Field ball');
});

test('destination quiz can be answered with keyboard, and replay runs past the freeze point', async ({ page }) => {
  // Speed up the animation clock to make this regression fast without changing app code.
  await page.addInitScript(() => {
    const original = performance.now.bind(performance);
    const origin = original();
    Object.defineProperty(performance, 'now', { value: () => origin + (original() - origin) * 100 });
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (callback) => raf(() => callback(performance.now()));
  });
  await page.goto('./#/play/gb-ss-empty');
  await page.getByRole('button', { name: 'Quiz me!' }).click();
  const targets = page.locator('.pin[tabindex="0"]');
  await expect(targets.first()).toBeVisible();
  // This scenario asks SS to field the ball first. Use the named control.
  await page.getByRole('button', { name: 'The ball', exact: true }).focus(); await page.keyboard.press('Enter');
  await expect(page.locator('.overlay-good')).toBeVisible();
  const replay = page.getByRole('button', { name: 'Watch again' });
  await expect(replay).toBeVisible({ timeout: 30000 });
  await replay.click();
  await expect(replay).toBeVisible({ timeout: 30000 });
  await expect(page.locator('.pin')).toHaveCount(0);
});

test('legacy entry point redirects while preserving the chosen play', async ({ page }) => {
  await page.goto('./cubs-baseball-iq.html#/play/gb-1b-near');
  await expect(page).toHaveURL(/index\.html#\/play\/gb-1b-near$/);
  await expect(page.locator('.situation-2')).toContainText('FIRST');
});


test('every lesson has a useful intro and can proceed without an MP4', async ({ page }) => {
  for (const id of ['cover-your-base','back-it-up','get-it-in','hold-the-ball','force-or-tag','call-it','runner-on-third','hit-to-me']) {
    await page.goto(`./#/lesson/${id}`);
    await expect(page.getByRole('region', { name: 'Lesson introduction' })).toBeVisible();
    await page.locator('.intro-transcript summary').click();
    await expect(page.locator('.intro-transcript p')).toBeVisible();
    await page.getByRole('button', { name: /Start lesson|Continue to practice/ }).click();
    await expect(page.getByRole('button', { name: 'Quiz me!' })).toBeVisible();
    await expect(page.locator('.pm')).toHaveCount(9);
  }
});

if (process.env.TEST_LESSON_VIDEO) test('MP4 intro supports captions and a transcript without autoplay', async ({ page }) => {
  await page.goto('./#/lesson/cover-your-base');
  const video = page.locator('video');
  await expect(video).toBeVisible();
  await expect(video).toHaveAttribute('controls', '');
  await expect(video).not.toHaveAttribute('autoplay');
  await expect(video.locator('track')).toHaveAttribute('kind', 'captions');
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThanOrEqual(1);
  await video.evaluate((v: HTMLVideoElement) => v.play());
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Continue to practice' }).click();
  await expect(page.getByRole('button', { name: 'Quiz me!' })).toBeVisible();
});

if (process.env.TEST_LESSON_VIDEO) test('failed MP4 keeps the transcript and lesson available', async ({ page }) => {
  await page.route('**/videos/cover-your-base.mp4', (route) => route.abort());
  await page.goto('./#/lesson/cover-your-base');
  await expect(page.getByText('The video could not load.', { exact: false })).toBeVisible();
  await page.locator('.intro-transcript summary').click();
  await expect(page.locator('.intro-transcript p')).toBeVisible();
  await page.getByRole('button', { name: 'Continue to practice' }).click();
  await expect(page.getByRole('button', { name: 'Quiz me!' })).toBeVisible();
});
