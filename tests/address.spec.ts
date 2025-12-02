import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const LOG_FILE = path.join('C:', 'Users', 'lepap', 'Desktop', 'LUMINA', 'test_debug.log');

const log = (msg: string) => {
    try {
        fs.appendFileSync(LOG_FILE, msg + '\n');
        console.log(msg);
    } catch (e) {
        console.error('Failed to write log:', e);
    }
};

test('signup and add address', async ({ page }) => {
    test.setTimeout(60000);

    try {
        fs.writeFileSync(LOG_FILE, 'Starting test...\n');
    } catch (e) {
        console.error('Failed to init log file:', e);
    }

    try {
        const timestamp = Date.now();
        const username = `testuser${timestamp}`;
        const email = `test${timestamp}@example.com`;
        const password = 'password123!';
        const name = 'Test User';

        await test.step('Navigate to Signup', async () => {
            log('Navigating to signup...');
            await page.goto('/signup');
            log('Page loaded. Checking title...');
            const title = await page.title();
            log(`Page title: ${title}`);
        });

        await test.step('Fill Signup Form', async () => {
            log('Filling signup form...');
            try {
                // Try to wait for the form specifically
                await page.waitForSelector('form', { timeout: 10000 });

                await page.fill('input[name="name"]', name);
                await page.fill('input[name="username"]', username);
                await page.fill('input[name="email"]', email);
                await page.fill('input[name="password"]', password);
                await page.fill('input[name="confirmPassword"]', password);
            } catch (e) {
                log(`Failed to fill form. Dumping content...`);
                const content = await page.content();
                fs.writeFileSync('error_page_content.html', content);
                log('Content dumped to error_page_content.html');
                throw e;
            }

            log('Submitting signup...');
            await page.click('button[type="submit"]');
        });

        await test.step('Wait for Redirect', async () => {
            log('Waiting for redirect to home...');
            await expect(page).toHaveURL('/', { timeout: 15000 });
        });

        await test.step('Navigate to Settings', async () => {
            log('Navigating to My Page...');
            await page.goto('/mypage');
            log('Clicking Settings...');
            await page.click('text=계정 설정');
        });

        await test.step('Add Address', async () => {
            log('Opening Add Address Modal...');
            await page.click('text=새 배송지 추가');

            log('Mocking Daum Postcode...');
            await page.evaluate(() => {
                window.daum = {
                    Postcode: class {
                        constructor(options: any) {
                            this.options = options;
                        }
                        open() {
                            this.options.oncomplete({
                                zonecode: '12345',
                                address: '서울 강남구 테헤란로 123',
                                addressType: 'R',
                                bname: '',
                                buildingName: '테스트빌딩'
                            });
                        }
                        options: any;
                    }
                } as any;
            });

            log('Filling Address Form...');
            await page.fill('input[data-field="name"]', 'Home');
            await page.fill('input[data-field="recipient"]', 'Me');
            await page.fill('input[data-field="phone"]', '010-1234-5678');

            log('Clicking Search...');
            await page.click('text=주소 검색');

            log('Filling Detail Address...');
            await page.fill('input[data-field="detailAddress"]', '101호');

            log('Saving...');
            await page.click('text=추가하기');
        });

        await test.step('Verify Address', async () => {
            log('Verifying Address...');
            await expect(page.locator('text=서울 강남구 테헤란로 123')).toBeVisible({ timeout: 10000 });
            await expect(page.locator('text=Home')).toBeVisible();
        });

        log('Test Complete!');
    } catch (e) {
        log(`TEST FAILED: ${e}`);
        throw e;
    }
});
