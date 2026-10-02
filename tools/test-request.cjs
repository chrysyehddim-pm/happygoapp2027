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
  await act('selection');await act('choose-shop');
  assert.match(await page.locator('.section-label').innerText(),/^消費加碼活動\s+今日精選$/);
  assert.match(await page.locator('.campaign-info h3').innerText(),/消費滿7筆贈100點/);
  assert.match(await page.locator('.progress-value').innerText(),/2\s*／\s*7 筆/);
  assert.match(await page.locator('.campaign-art img').getAttribute('src'),/campaign-redpacket/);
  const width=await page.locator('.progress').evaluate(e=>e.firstElementChild.getBoundingClientRect().width/e.getBoundingClientRect().width);
  assert(Math.abs(width-2/7)<.01);
  await act('campaign-progress');assert.match(await page.locator('#overlay').innerText(),/2／7 筆，還差 5 筆/);await act('close');
  await act('campaign-info');assert.match(await page.locator('#overlay').innerText(),/消費滿7筆贈100點/);assert.doesNotMatch(await page.locator('#overlay').innerText(),/2000/);await act('close');
  await capture('requested-shopping');
  const positions=[];
  for(const type of ['shop','play','life']) {
   await page.locator(`[data-action="tab"][data-type="${type}"]`).click();
   positions.push(await page.locator('.egg').evaluate(e=>e.offsetTop));
   const gap=await page.locator('.tools').evaluate(e=>e.getBoundingClientRect().bottom-Math.max(...[...e.querySelectorAll('.tool-grid button')].map(b=>b.getBoundingClientRect().bottom)));
   assert(gap>=25,`Bottom label whitespace: ${gap}`);
  }
  assert.equal(new Set(positions).size,1);
  assert.equal(await page.locator('.ticket-pane h2').first().innerText(),'兌點加碼活動');
  await act('ticket-event');assert.match(await page.locator('#overlay h2').innerText(),/兌點加碼活動/);await act('close');
  await capture('requested-lifestyle');await act('eggs');await act('egg-task');
  assert.equal(await page.locator('.task-list-art image').count(),1);
  assert.equal(await page.locator('.task-list-art svg').getAttribute('viewBox'),'44 318 780 401');
  assert(await page.locator('.task-list-card').evaluate(e=>{const img=e.querySelector('.task-list-art').getBoundingClientRect(),btn=e.querySelector('button').getBoundingClientRect(),card=e.getBoundingClientRect();return btn.top>img.bottom&&btn.bottom<card.bottom&&btn.left>card.left&&btn.right<card.right;}));
  await capture('requested-lancome');
  await page.setViewportSize({width:390,height:844});await capture('requested-lancome-mobile');
  await act('task-detail');await act('sign');await act('signed-confirm');await act('claim-points');
  await page.locator('[data-action="tab"][data-type="shop"]').click();
  assert.match(await page.locator('.progress-value').innerText(),/2\s*／\s*7 筆/);
  assert.deepEqual(errors,[]);
  console.log('PASS: new labels, campaign 2/7, progress CTA, image reference, fixed skeleton, tool whitespace, Lancome standalone art/button, signing journey.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
