const assert=require('assert/strict'),path=require('path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE});try{
const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
const click=async a=>page.locator(`[data-action="${a}"]`).first().click();
await page.goto(process.env.DEMO_URL||'http://127.0.0.1:4180/');await click('selection');await click('choose-shop');await click('ai');
await page.locator('#ai-text').fill('今日還有什麼任務');await page.locator('#ai-form button').click();
await page.locator('[data-action="diamond-task"]').waitFor();assert.match(await page.locator('.recommendations').innerText(),/蘭蔻/);
await click('diamond-task');assert.match(await page.locator('#screen').innerText(),/2026\/11\/04/);await click('diamond-sign');await click('close');assert(await page.locator('[data-action="diamond-sign"]').isDisabled());
await page.screenshot({path:path.resolve('test-results/ai-diamond-mobile.png')});await click('back');await click('diamond-task');assert(await page.locator('[data-action="diamond-sign"]').isDisabled());await click('back');
await page.locator('#ai-text').fill('推薦我可以兌換的商品');await page.locator('#ai-form button').click();await page.locator('[data-action="megacity-detail"]').waitFor();assert(!/示範推薦/.test(await page.locator('.recommendations').last().innerText()));
await click('megacity-detail');assert.match(await page.locator('#screen').innerText(),/不可跨店/);await page.screenshot({path:path.resolve('test-results/ai-megacity-mobile.png')});await click('quantity-megacity');assert.match(await page.locator('.wallet-card').innerText(),/板橋大遠百/);await click('plus');assert.equal(await page.locator('#total').innerText(),'Ⓟ 400');await click('redeem-confirm');await click('redeem');assert.match(await page.locator('#overlay').innerText(),/板橋大遠百/);await click('redemption-next');await click('return-category');await click('ai');await page.locator('#ai-text').fill('我有多少點數');await page.locator('#ai-form button').click();await page.waitForTimeout(750);assert.match(await page.locator('.bubble').last().innerText(),/400/);
assert.deepEqual(errors,[]);console.log('PASS: both AI task cards, native diamond sign-in and repeat protection without point credit, Megacity detail, quantity and 400-point deduction, chat balance, mobile screenshots, no load errors.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
