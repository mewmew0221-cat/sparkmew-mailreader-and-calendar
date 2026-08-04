# 待辦事項

> 篇章順序與 INDEX.md 一致。格式：`- [ ] 事項 ｜優先度(高/中/低)｜相關檔案`
> 與 HANDOFF 分工：HANDOFF「下一步」只放本次 session 的 1–5 條，完整清單在本檔。

## 1. 前端儀表板

- [ ] 月曆上下月切換按鈕（`cal-prev-month`/`cal-next-month`）尚未接功能，點擊無反應 ｜低｜index.html、app.js（既有缺口，2026-08-04 發現，後端 `readRealCalendarEvents_` 目前只抓「今天起 30 天」也需一併改才有意義，使用者選擇先擱置）

## 2. GAS 後端與雙向同步

- [ ] Receipts／Subscriptions 頁面補上刪除按鈕（後端 `deleteEntry` 已支援，只差前端接線） ｜中｜app.js renderReceipts()/renderSubscriptions()

## 3. 資料提煉來源

- [ ] 了解 Gemini「Spark」如何把 Gmail/排班表寫入 Pending_Schedule，有無可調整空間 ｜低

## 4. 部署與發布

- [ ] 確認 GitHub repo public/private 取捨（public 才能免費用 Pages，但程式碼會公開可見；GAS 網址本身不在程式碼裡，安全性不受影響） ｜低

## 5. 記帳．摘要．訂閱

（無待辦，摘要牆刪除功能已完成，見已完成）

## 已完成

- [x] GAS Web App 雙向同步建置與除錯（讀日曆、寫日曆、CORS/逾時排查） ｜2026-08-02～03｜Create_Google_Sheet.gs、app.js
- [x] 待審核卡片 id 遺失 bug 修復 ｜2026-08-03｜app.js
- [x] 摘要牆刪除功能（含後端白名單保護） ｜2026-08-03｜Create_Google_Sheet.gs、app.js
- [x] xlsx 轉正為 Google Sheets 原生格式，舊檔清除 ｜2026-08-03
- [x] 開案骨架五檔補建（/upgrade-project） ｜2026-08-03
- [x] push 到 `github.com/mewmew0221-cat/sparkmew-mailreader-and-calendar`（獨立 repo） ｜2026-08-03
- [x] 入口密碼保護（SHA-256 雜湊 + localStorage 記住） ｜2026-08-03｜app.js、index.html、styles.css
- [x] 啟用 GitHub Pages（使用者手動於 repo Settings 完成） ｜2026-08-03
- [x] header 排版修正：允許換行，避免右側按鈕超出畫面點不到 ｜2026-08-03｜styles.css
- [x] 手機瀏覽器（GitHub Pages 網址）測試通過，含 GAS 重新連線設定 ｜2026-08-03
- [x] 第三頁新增「文件與合約牆」，串接 Sheet 新分頁 `Documents_and_Contracts` ｜2026-08-04｜index.html、app.js、Create_Google_Sheet.gs
- [x] 手機版排版強化（直式時間軸/月曆格子/header 多項斷點調整） ｜2026-08-04｜styles.css
- [x] 月曆格子手機版橫向溢出修正（grid-template-columns 改 minmax(0,1fr)） ｜2026-08-04｜styles.css
- [x] GAS 讀取加 45 秒 CacheService 快取，減少每次冷啟動+重算全部分頁的等待 ｜2026-08-04｜Create_Google_Sheet.gs
