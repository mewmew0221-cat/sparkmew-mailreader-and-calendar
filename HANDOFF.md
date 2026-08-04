# Session 交接（最後更新：2026-08-04）

## 目前進行中

- 本次 session：審視並處理 Gemini「Spark」自動改的三個檔案（放在 `0804 spark 修改/`，
  使用者事後已自行刪除該資料夾）。不整批採用，改為挑選合併：第三頁新增「文件與
  合約牆」串接 Sheet 新分頁 `Documents_and_Contracts`、合併手機版排版強化，其餘
  （Spark 誤刪的核心功能、損毀的 index.html、憑空編造的假通訊錄/公文資料）捨棄。
  另外修了月曆格子手機版橫向溢出，並幫 GAS 加了 45 秒讀取快取加速連線。
  全部功能經使用者本人在 GitHub Pages 網址 + 手機瀏覽器實測通過，session 到此收工。

## 下一步

- 目前沒有阻塞事項。有空時可做（見 TODO.md）：
  - 月曆上下月切換按鈕（`cal-prev-month`/`cal-next-month`）尚未接功能，使用者選擇先擱置；
    要做到位需先改後端 `readRealCalendarEvents_` 支援指定月份查詢
  - Receipts／Subscriptions 頁面補上刪除按鈕（後端已支援，只差前端接線，舊有待辦）

## 未解決問題

- 資料提煉來源（Gmail/排班表圖片 → Pending_Schedule）由 Gemini 雲端 AI
  「Spark」功能處理，不在本專案程式碼範圍內，運作機制未知。
- GAS Web App 網址與密碼解鎖狀態存在 `localStorage`，依網站來源分別儲存，
  換裝置/清快取/切換 file:// 與 GitHub Pages 都要重新設定一次（刻意設計，非 bug）。
- **手機瀏覽器容易快取住舊的 `styles.css`／`app.js`**：這次 session 中使用者第一次
  測試「手機排版沒變化」，重新整理後才發現其實已生效——之後每次改完前端檔案，
  提醒使用者在手機上務必強制重新整理／清快取再測。

## 本次 session 動過的檔案

- `Create_Google_Sheet.gs`：新增 `Documents_and_Contracts` 讀取（`getAllData`）、
  納入刪除白名單（`DELETABLE_SHEETS_`）、`setupSheets` 補建範本；新增
  `CacheService` 45 秒讀取快取（`getCachedAllData_`/`invalidateCache_`），
  `doPost` 寫入成功後主動清快取
- `app.js`：新增 `renderDocuments()`/`deleteDocument()`，接入 `renderAllViews()`
  與 `window.SparkMewApp` 匯出
- `index.html`：第三頁新增 3.4「文件與合約牆」區塊（`documents-list-container`）
- `styles.css`：手機版 media query 換成更完整的斷點版本（時間軸/月曆格/header
  多項調整）；`.month-grid-container` 的 `grid-template-columns` 改
  `repeat(7, minmax(0, 1fr))` 修正手機版橫向溢出
- `TODO.md`／`DECISIONS.md`：同步記錄本次完成項目與決策

## ⚠ 提醒

- 修改 `Create_Google_Sheet.gs` 後，「部署」→「管理部署作業」必須選
  「新版本」，單純存檔不會讓網址生效新程式碼（本次 session 使用者一度忘記，
  導致文件牆一開始沒資料，重新部署後解決）。
- GAS Web App 網址目前設定為「任何人」可呼叫並寫入日曆/刪除資料，
  外流等於讓陌生人能操控使用者的日曆與 Sheet，不可公開分享。
- 入口密碼（雜湊值存在 `app.js` 常數 `LOCK_PASSWORD_HASH`）只是前端層級
  保護，擋隨手看的人，非真正安全機制，懂開發者工具的人仍可繞過。
- Google Sheet 若又新增分頁想接進儀表板，流程：後端 `getAllData()` 加
  `readSheetAsObjects_()` 讀取＋視需要加進 `DELETABLE_SHEETS_`；前端在對應頁籤
  加 render 函式並掛進 `renderAllViews()`；不要隨意新增第四個分頁導覽，
  優先併入既有頁籤篇章結構（見 DECISIONS.md 2026-08-04 決策）。

## 🕐 最後更新

- 時間：2026-08-04
- 更新者：Claude Sonnet 5 (Claude Code) @ 本機
- Git push：✅ 已推（`sparkmew-mailreader-and-calendar` 獨立 repo，共 3 次 commit：
  文件牆+手機排版、月曆溢出修正、GAS 快取）
- 收工狀態：**功能全部經使用者實測通過，無阻塞事項，可正常收工**。
