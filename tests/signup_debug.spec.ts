import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const LOG_FILE = path.join('C:', 'Users', 'lepap', 'Desktop', 'LUMINA', 'signup_debug.log');

const log = (msg: string) => {
    try {
        fs.appendFileSync(LOG_FILE, msg + '\n');
        console.log(msg);
    } catch (e) {
        console.error('Failed to write log:', e);
    }
};

test('signup page load and fill', async ({ page }) => {
    try {
        fs.writeFileSync(LOG_FILE, 'Starting test...\n');
    } catch (e) {
        console.error('Failed to init log file:', e);
    }

    page.on('console', msg => log(`BROWSER CONSOLE: ${msg.text()}`));
    page.on('pageerror', err => log(`BROWSER ERROR: ${err}`));

    try {
        log('Navigating to signup...');
        await page.goto('/signup');
        log('Page loaded.');
        const title = await page.title();
        log(`Title: ${title}`);
        await expect(page).toHaveTitle(/LUMINA/);
        log('Title check passed.');

        log('Waiting for form...');
        // Dump content before waiting
        const initialContent = await page.content();
        log('Initial content length: ' + initialContent.length);

        await page.waitForSelector('form', { timeout: 10000 });
        log('Form found.');

        log('Filling form...');
        await page.fill('input[name="name"]', 'Test User');
        await page.fill('input[name="username"]', `testuser${Date.now()}`);
        await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
        await page.fill('input[name="password"]', 'password123!');
        await page.fill('input[name="confirmPassword"]', 'password123!');
        log('Form filled.');

        log('Submitting...');
        await page.click('button[type="submit"]');
        log('Submitted.');

        await expect(page).toHaveURL('/', { timeout: 30000 });
        log('Redirected to home.');

    } catch (e) {
        log(`TEST FAILED: ${e}`);
        const content = await page.content();
        log('Final Page content snippet:');
        log(content.substring(0, 1000));
        throw e;
    }
});
