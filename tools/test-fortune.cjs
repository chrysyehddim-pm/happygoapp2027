const assert=require('assert/strict'),path=require('path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE});try{
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 const act=async a=>page.locator(`[data-action="${a}"]`).first().click();
 const base=process.env.DEMO_URL||'http://127.0.0.1:4174/';await page.goto(base);
 for(const a of ['selection','choose-play','eggs','egg-task','task-detail','sign','signed-confirm','claim-points'])await act(a);
 const url=page.url();await act('fortune');const lucky=page.frameLocator('.fortune-frame');
 assert.equal(context.pages().length,1);assert.equal(page.url(),url);
 await lucky.locator('#drawBtn').click();await lucky.locator('#resultView:not(.hidden)').waitFor();
 const name=await lucky.locator('#resultName').innerText();assert(name.length>0);
 assert.match(await lucky.locator('#resultScore').innerText(),/%/);
 assert(await lucky.locator('#resultGif').evaluate(async e=>{await e.decode();return e.naturalWidth>0;}));
 await page.screenshot({path:path.resolve('test-results/fortune-inline-mobile.png')});
 await lucky.locator('#backBtn').click();await page.locator('.category[data-type="play"]').waitFor();
 assert.match(await page.locator('.egg').innerText(),/你的驚喜已收下/);
 await act('fortune');assert.equal(await lucky.locator('#resultName').innerText(),name);
 await lucky.locator('#resetBtn').click();assert(await lucky.locator('#drawView').isVisible());
 await lucky.locator('#headerBackBtn').click();await page.locator('.category[data-type="play"]').waitFor();
 await act('ai');if(await page.locator('#ai-text').count()===0)await act('ai');await page.locator('#ai-text').fill('我有多少點數？');await page.locator('#ai-text').press('Enter');
 await page.waitForTimeout(800);assert.match(await page.locator('#conversation').innerText(),/810/);
 await act('back');await act('fortune');await lucky.locator('#drawBtn').click();await lucky.locator('#resultView:not(.hidden)').waitFor();
 await page.evaluate(()=>localStorage.setItem('unrelated-test-value','keep'));
 await page.locator('#restart').click();for(const a of ['selection','choose-play','fortune'])await act(a);
 assert(await lucky.locator('#drawView').isVisible());assert(await lucky.locator('#resultView').isHidden());
 assert.equal(await page.evaluate(()=>localStorage.getItem('unrelated-test-value')),'keep');
 await lucky.locator('#drawBtn').click();await lucky.locator('#resultView:not(.hidden)').waitFor();
 const freshName=await lucky.locator('#resultName').innerText();await page.reload();for(const a of ['selection','choose-play','fortune'])await act(a);
 assert.equal(await lucky.locator('#resultName').innerText(),freshName);
 // Standalone URL continues to support its own return to the demo.
 await page.goto(new URL('fortune/',base).href);if(await page.locator('#drawView').isVisible()){await page.locator('#drawBtn').click();await page.locator('#resultView:not(.hidden)').waitFor();}
 await page.locator('#backBtn').click();await page.waitForURL(u=>!u.pathname.includes('/fortune/'));assert.equal(await page.locator('#phone').count(),1);
 assert.deepEqual(errors,[]);console.log('PASS: embedded fortune keeps one tab and URL, draw and GIF, daily result, reset, both return controls, claimed points preserved, standalone fallback.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
