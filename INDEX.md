# spark 應用（SparkMew）・文件地圖

> 新 session 必讀順序：本檔 → HANDOFF.md → DECISIONS.md。其餘按需查閱，禁止全量載入。
> 規則：任何新紀錄檔建立的當下，必須同步在此登記一行。

## 1. 前端儀表板

- `index.html` — 三主頁面（今日/一週預覽、月曆與待審核、記帳/摘要/訂閱）+ 設定 Modal
- `styles.css` — 三套主題（🌌科技／🍃簡約／💎優雅）+ RWD

## 2. GAS 後端與雙向同步

- `Create_Google_Sheet.gs` — Sheet 建立腳本 + Web App 後端（`doGet`/`doPost`）
  - 讀：待審核行程、真實 Google 日曆（含私密行程）、記帳/摘要/訂閱
  - 寫：一鍵加日曆（真寫入 CalendarApp）、不加入、刪除條目（白名單限定 Receipts/Summaries/Subscriptions）

## 3. 資料提煉來源

（尚無本專案文件——由 Gemini 雲端 AI「Spark」功能處理 Gmail/排班表 → Pending_Schedule，不在本專案程式碼範圍內，運作機制未知）

## 4. 部署與發布

（尚無文件——進行中：GitHub Pages 部署 + 密碼保護，見 HANDOFF.md）

## 5. 記帳．摘要．訂閱

（尚無文件——現況見 `app.js` 第三頁相關 render 函式）

## 已歸檔

- `handover_notes.md` — Antigravity 原始交接文件，內容已拆分進 DECISIONS.md/HANDOFF.md，原檔縮減保留作歷史參考
