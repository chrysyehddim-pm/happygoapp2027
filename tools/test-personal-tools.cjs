const assert=require('assert/strict'),path=require('path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE});try{
 const page=await browser.newPage({viewport:{width:1100,height:1100}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 const act=async a=>page.locator(`[data-action="${a}"]`).first().click();
 const decode=()=>page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));
 const capture=async name=>{await decode();await page.screenshot({path:path.resolve('test-results/'+name+'.png')});};
 await page.goto(process.env.DEMO_URL||'http://127.0.0.1:4174/');await act('selection');await act('choose-shop');
 assert.match(await page.locator('.campaign-info h3').innerText(),/【鑽點購物紅包】/);assert.match(await page.locator('.progress-value').innerText(),/2\s*／\s*7/);
 await decode();assert.equal(await page.locator('.campaign-art img').evaluate(e=>e.naturalWidth),1040);assert.match(await page.locator('.campaign-art img').getAttribute('src'),/campaign-redpacket/);
 await act('campaign-info');assert.match(await page.locator('#overlay h2').innerText(),/鑽點購物紅包/);await act('close');
 const labels={shop:['點數安全鎖','附近店家','免運到貨','領神券'],play:['會員權益','新聞快報','星座運勢','求個好運'],life:['熱門兌換','點數放大','永續生活','便利服務']},positions=[];
 for(const type of ['shop','play','life']){
  await page.locator(`[data-action="tab"][data-type="${type}"]`).click();await decode();
  assert.deepEqual(await page.locator('.tool-label').allTextContents(),labels[type]);assert.equal(await page.locator('.tool-circle img').count(),4);
  positions.push(await page.locator('.egg').evaluate(e=>e.offsetTop));
  for(let i=0;i<4;i++){const entry=page.locator('.tool-grid button,.tool-grid a').nth(i);if(type==='play'&&i===3){await entry.click();assert.equal(await page.locator('.fortune-frame').count(),1);await page.frameLocator('.fortune-frame').locator('#headerBackBtn').click();await page.locator('.category[data-type="play"]').waitFor();}else{await entry.click();assert.match(await page.locator('.topbar').innerText(),new RegExp(labels[type][i]));await act('back');}}
  await act('edit-tools');const editText=await page.locator('#overlay').innerText();assert(labels[type].every(label=>editText.includes(label)));await act('close');
  if(type==='life'){
   assert.equal(await page.locator('[data-banner="utag"] h2').innerText(),'旅遊交通');await act('utag');assert.match(await page.locator('.topbar').innerText(),/旅遊交通/);await act('back');
   assert.equal(await page.locator('.ticket-combined').count(),1);assert.deepEqual(await page.locator('.ticket-pane h2').allTextContents(),['兌點加碼活動','推薦票券 800點內']);
   assert(await page.locator('.ticket-combined').evaluate(e=>{const r=e.getBoundingClientRect();return [...e.querySelectorAll('h2,.ticket-banner,.ticket-description,.ticket-footer')].every(i=>{const b=i.getBoundingClientRect();return b.left>=r.left&&b.right<=r.right+1&&b.bottom<=r.bottom+1;});}));
   await act('ticket-event');assert.match(await page.locator('#overlay').innerText(),/240/);await act('close');await act('coco-detail');assert.match(await page.locator('.page-content h2').innerText(),/CoCo/);await act('back');
  }
  await page.setViewportSize({width:1100,height:1100});await capture('personal-'+type);await page.setViewportSize({width:390,height:844});await capture('personal-'+type+'-mobile');
 }
 assert.equal(new Set(positions).size,1);assert.deepEqual(errors,[]);console.log('PASS: 12 uploaded tool icons and all entries, category defaults/edit labels, supplied redpacket image/title, 2/7, unified ticket container and original actions, fixed skeleton, desktop/mobile, no errors.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
