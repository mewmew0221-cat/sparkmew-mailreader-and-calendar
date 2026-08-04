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
- [2026-08-03] 入口密碼採前端 SHA-256 雜湊比對 + localStorage 記住解鎖狀態，密碼與 GAS 網址一樣不寫進公開原始碼 ｜足夠擋隨手看的人，且不需要後端登入系統，符合單人使用工具的成本效益 ｜app.js、index.html、styles.css
- [2026-08-03] header 改為 `flex-wrap: wrap`，允許內容換行 ｜原本狀態燈+三統計+日曆連結+主題切換+三顆圖示按鈕擠一行，桌機視窗較窄時會超出畫面右側點不到 ｜styles.css
- [2026-08-04] Gemini「Spark」自動修改的三個檔案（app.js/index.html/styles.css）不整批採用，改為挑選合併手機版排版與新分頁想法，其餘捨棄重寫 ｜subagent 審視後發現：`postGasAction`/設定存檔/摘要刪除/記帳訂閱渲染等既有核心功能被整段刪除、`index.html.html` 是損毀的 Google 文件匯出格式非可用原始碼、內建通訊錄/公文是憑空編造的假資料 ｜對話紀錄（general-purpose subagent 審視報告）
- [2026-08-04] Google Sheet 新分頁 `Documents_and_Contracts` 併入既有第三頁（記帳/摘要/訂閱）成為 3.4 區塊，不新增第四個分頁導覽 ｜維持既有頁籤篇章結構，Spark 原版誤把它包成獨立第四頁且塞了假資料 ｜使用者確認，index.html
- [2026-08-04] GAS `getAllData()` 讀取加 `CacheService` 45 秒快取，`doPost` 寫入成功後主動清快取 ｜冷啟動+讀 5 個分頁+30 天日曆事件常要等將近 20 秒，快取可讓短時間內重複整理秒開；清快取確保使用者剛做的寫入動作不會被快取蓋掉 ｜Create_Google_Sheet.gs
- [2026-08-04] 月曆上下月切換按鈕維持不接功能，暫緩處理 ｜既有缺口非本次範圍，且要做到位需先改後端支援任意月份查日曆（目前寫死抓「今天起 30 天」），工程量較大 ｜使用者確認
