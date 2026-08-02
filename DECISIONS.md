# 決策紀錄（append-only）

> 格式：`- [YYYY-MM-DD] 決策一句話 ｜理由一句話 ｜來源/相關檔案`
> 只收已定案事項；討論中的放 TODO 或主題檔。

- [2026-08-02] 純前端無法可靠讀取/寫入 Google Calendar ｜`file://` 下 CORS 常擋、CSV/iCal 代理不穩、「一鍵加日曆」原本只是開預填頁面要手動存檔 ｜對話紀錄、handover_notes.md
- [2026-08-02] 採用 GAS Web App 作為後端（CalendarApp 讀寫 + Sheet CRUD），取代純前端 CORS/iCal 方案 ｜GAS 執行在使用者帳號下無 CORS 問題，且能真正寫入私密日曆 ｜Create_Google_Sheet.gs
- [2026-08-02] 待審核卡片 id 改用 Sheet 列號衍生（`gas_row_{row}`） ｜GAS 回傳資料原本沒有 id 欄位，前端比對永遠失敗，導致按鈕點了沒反應 ｜app.js applyGasData()
- [2026-08-02] GAS 讀取逾時由 6 秒放寬到 20 秒，寫入失敗時 2 秒後自動重試一次 ｜冷啟動+讀 30 天日曆事件較久，且 Google 偶發回傳 HTML 忙線頁而非 JSON ｜app.js fetchGasData()/postGasAction()
- [2026-08-03] 刪除功能白名單限定 Receipts/Summaries/Subscriptions，不含 Pending_Schedule ｜避免通用刪除機制誤刪待審核行程主資料 ｜Create_Google_Sheet.gs DELETABLE_SHEETS_
- [2026-08-03] 原始 `智慧助手中央資料庫.xlsx` 已轉為 Google Sheets 原生格式使用，舊 xlsx 刪除 ｜xlsx（Office 相容模式）無法正常「發布到網路」，Apps Script 功能也受限 ｜使用者確認
- [2026-08-03] 資料提煉來源（Gmail/排班表 → Pending_Schedule）由 Gemini 雲端 AI「Spark」功能處理，非本專案自寫程式碼 ｜使用者說明 ｜對話紀錄
- [2026-08-03] 決定發布到 GitHub Pages，且需加密碼保護 ｜公開網址會曝光行程/記帳等個人資訊 ｜使用者確認，repo: github.com/mewmew0221-cat/sparkmew-mailreader-and-calendar
