# spark 應用（SparkMew）

## 正本引用

規則正本在根目錄 canon/。開工先讀 canon/PRINCIPLES.md、canon/JUDGMENT.md，
再讀本專案 INDEX.md 與 HANDOFF.md。規則衝突時以 canon/ 為準。

## 本專案篇章（開案時定案，不任意改名）

1. 前端儀表板
2. GAS 後端與雙向同步
3. 資料提煉來源
4. 部署與發布
5. 記帳．摘要．訂閱

## 本專案特例

- **GAS Web App 網址等同半個密鑰**：目前部署為「任何人」可呼叫，能寫入日曆、
  刪除 Sheet 資料。不可公開分享此網址；若要發布到 GitHub Pages，前端需另加
  密碼保護層。
- 修改 `Create_Google_Sheet.gs` 後，Apps Script「部署」→「管理部署作業」
  必須選「新版本」，單純存檔不會讓已部署的網址生效新程式碼。
- 資料提煉來源（Gmail/排班表圖片 → Pending_Schedule）由 Gemini 雲端 AI
  「Spark」功能處理，非本專案自寫程式碼，運作機制未知——若要調整這塊
  行為，須先向使用者確認其運作方式，不可憑猜測修改。
