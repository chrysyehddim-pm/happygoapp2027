const assert=require('assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE});try{
const page=await browser.newPage({viewport:{width:1100,height:1100}});
await page.goto(process.env.DEMO_URL||'http://127.0.0.1:4180/');
for(const action of ['selection','choose-play'])await page.locator(`[data-action="${action}"]`).first().click();
const dimensions=()=>page.locator('.warrior-character').evaluate(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return{width:r.width,height:r.height,x:r.x,y:r.y,transform:s.transform};});
const before=await dimensions();await page.locator('.warrior-character').hover();assert.deepEqual(await dimensions(),before);
// Image helper extensions can insert a control after the image on hover.
await page.locator('.warrior-stage').evaluate(e=>{const helper=document.createElement('button');helper.textContent='image helper';helper.style.cssText='position:absolute;top:0;right:0';e.append(helper);});
assert.deepEqual(await dimensions(),before);await page.mouse.move(0,0);assert.deepEqual(await dimensions(),before);
await page.setViewportSize({width:390,height:844});const mobile=await dimensions();await page.locator('.warrior-character').hover();assert.deepEqual(await dimensions(),mobile);
await page.screenshot({path:'test-results/warrior-hover-mobile.png'});
await page.locator('[data-action="invoice-forest"]').click();assert.match(await page.locator('#screen').innerText(),/發票森林/);
console.log('PASS: warrior dimensions stable before/during/after hover, appended image-helper control, mobile viewport, forest navigation.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
