const assert=require('assert/strict'),path=require('path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE});try{
 const page=await browser.newPage({viewport:{width:1100,height:1100}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 const act=async a=>page.locator(`[data-action="${a}"]`).first().click();
 const decode=()=>page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));
 await page.goto(process.env.DEMO_URL||'http://127.0.0.1:4174/');await act('selection');await act('choose-shop');
 const egg=await page.locator('.egg').evaluate(e=>e.offsetTop);
 await page.locator('[data-type="play"][data-action="tab"]').click();await decode();
 assert.equal(await page.locator('.egg').evaluate(e=>e.offsetTop),egg);
 assert.equal(await page.locator('.play-service-stack>.tile').count(),3);
 assert.equal(await page.locator('.play-task-card .dot').count(),0);
 assert(await page.locator('.play-task-card').evaluate(e=>{const title=e.querySelector('h2').getBoundingClientRect(),image=e.querySelector('.banner-link').getBoundingClientRect(),footer=e.querySelector('.play-card-footer').getBoundingClientRect(),small=e.querySelector('small').getBoundingClientRect(),card=e.getBoundingClientRect();return title.bottom<=image.top&&image.bottom<=footer.top&&small.right<=card.right-4&&footer.bottom<=card.bottom-4;}),'Task image must leave clear space for both labels');
 assert.equal(await page.locator('.warrior-stage>img').count(),2);
 assert.match(await page.locator('.warrior-stage>img').first().getAttribute('src'),/invoice-forest-background/);
 assert(await page.locator('.play-service-grid').evaluate(e=>{const left=e.querySelector('.warrior-card').getBoundingClientRect(),right=e.querySelector('.play-service-stack').getBoundingClientRect(),cards=[...e.querySelectorAll('.play-service-stack>.tile')].map(i=>i.getBoundingClientRect());return Math.abs(left.top-right.top)<1&&Math.abs(left.bottom-right.bottom)<1&&cards.every(c=>Math.abs(c.width-cards[0].width)<1&&Math.abs(c.height-cards[0].height)<1);}));
 assert(await page.locator('.play-service-grid').evaluate(e=>{const r=e.getBoundingClientRect();return [...e.querySelectorAll('h2,.banner-link,.forest-entry,.warrior-stage')].every(i=>{const b=i.getBoundingClientRect();return b.left>=r.left&&b.right<=r.right+1&&b.top>=r.top&&b.bottom<=r.bottom+1;});}));
 const titles={game:['玩遊戲，點數兩倍贈','限時遊戲任務','探索新遊戲'],health:['首玩加碼','健康小學堂','每天動腦']};
 for(let i=0;i<3;i++){for(const tile of await page.locator('[data-banner]').all()){await tile.locator(`[data-index="${i}"]`).click();assert.match(await tile.locator('.banner-link img').getAttribute('alt'),new RegExp(titles[await tile.getAttribute('data-banner')][i]));assert.equal(await tile.locator('.play-promotion').count(),0);}await decode();assert(await page.locator('[data-banner] img').evaluateAll(es=>es.every(e=>e.naturalWidth===1000&&e.naturalHeight===360&&getComputedStyle(e).objectFit==='contain')));await page.screenshot({path:path.resolve(`test-results/forest-copy-${i}.png`)});}
 assert.notEqual(await page.locator('.forest-entry').evaluate(e=>getComputedStyle(e).boxShadow),'none');
 await page.screenshot({path:path.resolve('test-results/forest-desktop.png')});
 await act('invoice-forest');assert.equal(await page.locator('.forest-panel').count(),1);await act('invoice');assert.match(await page.locator('.invoice-panel').innerText(),/手機條碼載具/);await act('back');await act('back');
 await act('daily-task-info');assert.match(await page.locator('#overlay').innerText(),/點數補給計畫/);await act('close');await act('games');assert.match(await page.locator('.topbar').innerText(),/遊戲樂園/);await act('back');await act('health');assert.match(await page.locator('.topbar').innerText(),/GO HEALTH/);await act('back');
 await page.setViewportSize({width:390,height:844});await decode();await page.screenshot({path:path.resolve('test-results/forest-mobile.png')});assert(await page.locator('#phone').evaluate(e=>e.getBoundingClientRect().right<=innerWidth+1));
 assert.deepEqual(errors,[]);console.log('PASS: forest entry and return, original service journeys, six compact carousel assets, safe bounds, fixed skeleton, mobile, no errors.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
