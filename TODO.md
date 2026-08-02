# 待辦事項

> 篇章順序與 INDEX.md 一致。格式：`- [ ] 事項 ｜優先度(高/中/低)｜相關檔案`
> 與 HANDOFF 分工：HANDOFF「下一步」只放本次 session 的 1–5 條，完整清單在本檔。

## 1. 前端儀表板

（無待辦）

## 2. GAS 後端與雙向同步

- [ ] Receipts／Subscriptions 頁面補上刪除按鈕（後端 `deleteEntry` 已支援，只差前端接線） ｜中｜app.js renderReceipts()/renderSubscriptions()

## 3. 資料提煉來源

- [ ] 了解 Gemini「Spark」如何把 Gmail/排班表寫入 Pending_Schedule，有無可調整空間 ｜低

## 4. 部署與發布

- [ ] push 到 `github.com/mewmew0221-cat/sparkmew-mailreader-and-calendar` ｜高
- [ ] 啟用 GitHub Pages ｜高
- [ ] 加密碼保護（公開頁會曝光行程/記帳等個人資訊） ｜高
- [ ] 手機瀏覽器測試 + 加入主畫面 ｜中

## 5. 記帳．摘要．訂閱

（無待辦，摘要牆刪除功能已完成，見已完成）

## 已完成

- [x] GAS Web App 雙向同步建置與除錯（讀日曆、寫日曆、CORS/逾時排查） ｜2026-08-02～03｜Create_Google_Sheet.gs、app.js
- [x] 待審核卡片 id 遺失 bug 修復 ｜2026-08-03｜app.js
- [x] 摘要牆刪除功能（含後端白名單保護） ｜2026-08-03｜Create_Google_Sheet.gs、app.js
- [x] xlsx 轉正為 Google Sheets 原生格式，舊檔清除 ｜2026-08-03
- [x] 開案骨架五檔補建（/upgrade-project） ｜2026-08-03
