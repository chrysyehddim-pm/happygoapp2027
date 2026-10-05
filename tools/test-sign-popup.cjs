const assert=require('assert/strict'),path=require('path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const act=async a=>page.locator(`[data-action="${a}"]`).first().click();
 await page.goto(process.env.DEMO_URL||'http://127.0.0.1:4174/');
 for(const a of ['selection','choose-shop','eggs','egg-task','task-detail','sign'])await act(a);
 const dialog=page.locator('.sign-complete');assert.equal(await dialog.count(),1);
 assert.equal(await dialog.evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 255, 255)');
 assert.deepEqual(await dialog.locator('button').allTextContents(),['確定','看更多']);
 assert.equal(await dialog.locator('h2').evaluate(e=>getComputedStyle(e).color),'rgb(17, 17, 17)');
 assert(await dialog.locator('.dialog-actions').evaluate(e=>parseFloat(getComputedStyle(e).borderTopWidth)>0));
 await page.screenshot({path:path.resolve('test-results/sign-white-mobile.png')});
 await act('signed-more');assert.equal(await dialog.count(),1);
 await act('signed-confirm');assert.match(await page.locator('.reward-modal').innerText(),/10/);
 await act('claim-points');assert.equal(await page.locator('#overlay .sign-complete').count(),0);
 assert.deepEqual(errors,[]);console.log('PASS: white sign completion popup, native two-button actions, more and claim journey, mobile.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
