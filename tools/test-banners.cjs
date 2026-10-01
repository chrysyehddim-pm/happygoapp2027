const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 try {
  const page=await browser.newPage({viewport:{width:1100,height:1100}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
  const act=async a=>page.locator(`[data-action="${a}"]`).first().click();
  const capture=async name=>{await page.evaluate(async()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));await page.screenshot({path:path.resolve(__dirname,'../test-results/'+name+'.png')});};
  await page.goto(process.env.DEMO_URL||'http://127.0.0.1:4174/');
  assert.equal(await page.locator('.home-services-label').innerText(),'熱門服務');
  await capture('banner-home');await act('selection');await act('choose-shop');
  assert.match(await page.locator('.deadline').innerText(),/2026\/10\/31/);
  await act('campaign-info');assert.match(await page.locator('#overlay').innerText(),/2026\/10\/31/);await act('close');
  assert(await page.locator('.primary-card').evaluate(e=>{const c=e.getBoundingClientRect();return [...e.querySelectorAll('.campaign-footer button,.deadline,.campaign-art')].every(item=>{const r=item.getBoundingClientRect();return r.left>=c.left+12&&r.right<=c.right-12&&r.bottom<=c.bottom-12;});}));
  const sizes=[],positions=[];
  for(const type of ['shop','play','life']) {
   await page.locator(`[data-action="tab"][data-type="${type}"]`).click();
   positions.push(await page.locator('.egg').evaluate(e=>e.offsetTop));
   if(type==='life') {
    await page.evaluate(async()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));
    const top=await page.locator('.life-grid .tile:nth-child(-n+2) .banner-link').evaluateAll(es=>es.map(e=>({w:e.offsetWidth,h:e.offsetHeight,fit:getComputedStyle(e.querySelector('img')).objectFit,natural:[e.querySelector('img').naturalWidth,e.querySelector('img').naturalHeight]})));
    assert.deepEqual(top[0],top[1]);assert.equal(top[0].fit,'contain');assert.deepEqual(top[0].natural,[800,560]);
   }
   for(let i=0;i<3;i++) {
    for(const tile of await page.locator('[data-banner]').all())await tile.locator(`[data-action="banner-slide"][data-index="${i}"]`).click();
    await capture(`banner-${type}-${i+1}`);
    for(const img of await page.locator('[data-banner] .banner-link img').all()) {
     const data=await img.evaluate(e=>({w:e.naturalWidth,h:e.naturalHeight,fit:getComputedStyle(e).objectFit,frame:[e.parentElement.offsetWidth,e.parentElement.offsetHeight]}));
     assert.equal(data.w,800);assert.equal(data.h,500);assert.equal(data.fit,'contain');sizes.push(data.frame);
    }
    assert.equal(await page.locator('.banner-caption').count(),0);
   }
  }
  assert.equal(new Set(positions).size,1);assert(sizes.every(s=>s[0]===sizes[0][0]&&s[1]===sizes[0][1]));
  await page.setViewportSize({width:390,height:844});await capture('banner-mobile');
  assert.deepEqual(errors,[]);console.log('PASS: homepage label, 10/31 deadline, campaign safe padding, all 18 carousel frames 800x500 and contain, equal ticket images, fixed skeleton, no 404/JS errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
