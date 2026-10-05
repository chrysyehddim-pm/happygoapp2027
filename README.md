# GO驚喜｜個人專屬 Prototype

2027 會員新生活策略會議展示用。保留原 Prototype 的旅程、狀態與 AI 預設回覆腳本，套用提供的五張確認視覺參考。

## 展示

直接開啟 `index.html`，或以靜態伺服器開啟；不需要後端、API 金鑰或 npm build。桌機提供全螢幕與重新開始。

三種類型共用相同垂直骨架：會員問候 → 類型分頁 → 主內容 → 兩個輪播 banner → 今日彩蛋 → 自訂小工具。主內容保留各類型差異。Banner 每 4.5 秒輪播，可點圓點切換；彈窗開啟或頁面不在前景時暫停更新。

AI 入口約 4 秒後靠右收合。點擊收合入口先展開，再點進入對話；鍵盤聚焦也會展開。返回類型頁會重新計時。

## 建議展演順序（約 3 分鐘）

1. 首頁 GO驚喜 → 消費購物，切換遊戲玩樂與生活娛樂，展示固定骨架。
2. 今日彩蛋 → 完成指定任務 → 蘭蔻簽到 → 立即簽到 → 確定 → 收下驚喜。
3. AI 點數管家 → 推薦我可以兌換的商品，展示 810 點連動。
4. 輸入「以後多推薦美食，少推薦遊戲活動」，送出並展示偏好確認。
5. 返回 GO驚喜 → 今日彩蛋 → 兌換指定票券 → 份數 → 兌換確認 → 兌換完成 → 領取 10% 點數回饋券 → 我的票券。
6. 載具重新綁定支線會解鎖專屬優惠。

## 可互動的 AI 對話頁

完整頁面使用 HTML 表單、文字輸入框、送出按鈕、快捷問題、訊息泡泡與推薦卡重建。插畫取自參考圖局部，沒有使用整張 AI 對話截圖或透明熱區。

支援 Enter、送出按鈕、快捷問題、點數／到期查詢、商品推薦、任務、生活優惠與偏好確認。對話保留於本輪；返回時未完成的回覆會顯示中斷提示。重新開始清除本輪狀態。輸入內容先轉義再呈現。

## 示範範圍

- 初始模擬點數 800；任務彩蛋一次 +10；兌換會扣點並累計活動進度。
- AI 為本地預設腳本，未串接真實會員資料或真實 AI。
- 偏好目前展示對話確認，尚未實作真實推薦排序。
- 生活票券 500 點是示範卡；外部服務以簡短承接頁展示。
- 活動圖像中的日期沿用原素材，仅用於策略展示。
- 首頁、選擇頁及原 App 商品／簽到頁沿用既有圖像與入口操作。
- `prefers-reduced-motion` 會停用 CSS 動畫及轉場。

## 測試

部署前已取得《Demo 最終規格 v1.1》全文，核對固定骨架、輪播、彩蛋旅程與 AI 元件要求；12 組瀏覽器回歸測試已通過，詳見 `TESTING.md`。

瀏覽器測試：`node tools/test-demo.cjs`，需可用的 Playwright。可用 `PLAYWRIGHT_MODULE` 指向已安裝套件，`BROWSER_EXECUTABLE` 指向 Chrome／Edge；省略後者使用 Playwright 自帶 Chromium。测试會產出 `test-results/results.json` 與各頁截圖。

## GitHub Pages 展示準備

執行 `node tools/build-pages.cjs` 產生 `dist/`，內含公開展示所需的入口、程式、樣式、圖片、字型與 `.nojekyll`。`GO-surprise-pages.zip` 是相同內容的上傳包。

已附 `.github/workflows/pages.yml`：推送至 `main` 或手動啟動流程即可建立 Pages 部署。先在 repository Settings → Pages 將 Source 選為 GitHub Actions。若使用其他分支，修改 workflow 的 `branches`。

也可解壓展示包到 repository 根目錄，在 Pages 選擇 Deploy from a branch，指定分支及 /(root)。程式使用相對路徑，可部署在 repository 子目錄網址。

已連結 https://github.com/chrysyehddim-pm/happygoapp2027 。GitHub Pages 使用 GitHub Actions 部署；展示網址：https://chrysyehddim-pm.github.io/happygoapp2027/ 。推送至 main 後會自動更新展示。

## 素材與檔案

- `app.js`：既有旅程、狀態、互動與 AI 腳本。
- `style.css`：共用骨架、新視覺、動畫及響應縮放。
- `assets/visual/`：參考圖局部插畫與 banner；`tools/extract-art.py` 可重建裁切素材。
- `assets/fonts/LICENSE.txt`：Noto Sans TC 字型授權。
- `tools/build-pages.cjs`：公開展示包建置。
- `tools/test-demo.cjs`：瀏覽器旅程回歸測試。



求個好運獨立 Demo：`fortune/index.html`，公開路徑 `https://chrysyehddim-pm.github.io/happygoapp2027/fortune/`。圖片與動畫位於 `fortune/assets/`，與主 Demo 一起建置及部署。

求個好運小工具目前以同頁手機外框內嵌方式開啟，返回保留遊戲玩樂與點數狀態；獨立網址仍可直接使用。
