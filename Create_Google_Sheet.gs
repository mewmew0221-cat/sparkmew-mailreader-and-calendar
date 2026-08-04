/**
 * Google Apps Script (GAS) 自動建立智慧助手中央資料庫
 * 執行此程式碼後，會自動在您的 Google Drive 建立 `spark應用/智慧助手中央資料庫` 資料夾與配好的 Google Sheet！
 */
function setupSparkDatabase() {
  var rootFolderName = "spark應用";
  var subFolderName = "智慧助手中央資料庫";
  var sheetName = "智慧助手中央資料庫";

  // 1. 尋找或建立主資料夾
  var rootFolders = DriveApp.getFoldersByName(rootFolderName);
  var rootFolder = rootFolders.hasNext() ? rootFolders.next() : DriveApp.createFolder(rootFolderName);

  // 2. 尋找或建立子資料夾
  var subFolders = rootFolder.getFoldersByName(subFolderName);
  var subFolder = subFolders.hasNext() ? subFolders.next() : rootFolder.createFolder(subFolderName);

  // 3. 在子資料夾內建立 Google Sheet
  var files = subFolder.getFilesByName(sheetName);
  var ss;
  if (files.hasNext()) {
    ss = SpreadsheetApp.open(files.next());
    Logger.log("試算表已存在：" + ss.getUrl());
  } else {
    ss = SpreadsheetApp.create(sheetName);
    var file = DriveApp.getFileById(ss.getId());
    file.moveTo(subFolder);

    // 設定 4 個分頁與標題
    setupSheets(ss);
    Logger.log("成功建立全新試算表！網址：" + ss.getUrl());
  }
}

function setupSheets(ss) {
  var config = [
    {
      title: "Pending_Schedule",
      headers: ["日期", "時間", "行程名稱", "地點", "狀態", "郵件主旨", "備註/連結"],
      sample: ["2026-08-05", "14:00 - 15:30", "跨部門智慧醫療與AI專案研討會", "線上 (Meet)", "待確認", "Re: 8/5 研討會時間確認信", "等待確認加日曆"]
    },
    {
      title: "Receipts",
      headers: ["交易日期", "店家/項目", "金額", "分類", "發票號碼/備註", "記錄時間"],
      sample: ["2026-08-02", "Google Cloud 訂閱月費", 450, "設備/軟體", "INV-2026-0801", "2026-08-02 10:15"]
    },
    {
      title: "Summaries",
      headers: ["日期", "類型", "主旨/論文名稱", "一句話懶人包", "詳細摘要/重點連結"],
      sample: ["2026-08-01", "公文", "衛福部醫事人員繼續教育積分新制開辦通知", "115年起醫事人員繼續教育積分採線上雙重認證，開課前14天需登錄系統。", "詳見內部公文檔案 NO.115-089"]
    },
    {
      title: "Subscriptions",
      headers: ["服務名稱", "下次扣款日", "扣款金額", "扣款週期", "狀態", "備註"],
      sample: ["Gemini Advanced 訂閱", "2026-08-15", 650, "每月", "續訂中", "信用卡末四碼 8888"]
    },
    {
      title: "Documents_and_Contracts",
      headers: ["日期", "分類", "主旨/文件名稱", "重點摘要與截止日", "備註/連結"],
      sample: ["2026-07-29", "線上合約", "Lokelma 演講合約 E-1007051", "AstraZeneca 演講合約 completed", "Adobe Sign (Completed)"]
    }
  ];

  // 刪除預設的 Sheet1
  var sheets = ss.getSheets();
  
  for (var i = 0; i < config.length; i++) {
    var sheet = ss.insertSheet(config[i].title);
    sheet.appendRow(config[i].headers);
    sheet.appendRow(config[i].sample);
    
    // 美化標題列
    var headerRange = sheet.getRange(1, 1, 1, config[i].headers.length);
    headerRange.setBackground("#1F4E78");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  
  if (sheets.length > 0) {
    ss.deleteSheet(sheets[0]);
  }
}

/**
 * ============================================================================
 * SparkMew Web App 後端 (方案 1：GAS 雙向同步服務)
 * ----------------------------------------------------------------------------
 * 部署方式：
 * 1. 打開你的「智慧助手中央資料庫」Google Sheet
 * 2. 上方選單「擴充功能」→「Apps Script」，貼入本檔全部內容（含上方 setup 函式）
 * 3. 右上角「部署」→「新增部署作業」→ 類型選「網頁應用程式」
 *    - 執行身分：我 (你自己的帳號)
 *    - 存取權：任何人
 * 4. 部署後複製「網頁應用程式網址」，貼到 SparkMew 儀表板設定的
 *    「GAS Web App 網址」欄位
 * 5. 之後修改程式碼要記得「管理部署作業」→ 編輯 → 更新版本，網址才會生效新程式碼
 * ============================================================================
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'getData';
  var result;
  if (action === 'getData') {
    result = getAllData();
  } else {
    result = { error: '未知的 action: ' + action };
  }
  return jsonOutput(result);
}

function doPost(e) {
  var body = {};
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOutput({ success: false, error: '無法解析請求內容' });
  }

  var result;
  if (body.action === 'addEvent') {
    result = addCalendarEvent(body.item || {});
  } else if (body.action === 'rejectEvent') {
    result = updatePendingStatus(body.row, '不加入');
  } else if (body.action === 'deleteEntry') {
    result = deleteSheetRow(body.sheetName, body.row);
  } else {
    result = { success: false, error: '未知的 action: ' + body.action };
  }
  return jsonOutput(result);
}

// 刪除記帳/摘要/訂閱其中一列（白名單限制可刪除的分頁，避免誤刪 Pending_Schedule）
var DELETABLE_SHEETS_ = ['Receipts', 'Summaries', 'Subscriptions', 'Documents_and_Contracts'];

function deleteSheetRow(sheetName, row) {
  if (DELETABLE_SHEETS_.indexOf(sheetName) === -1) {
    return { success: false, error: '此分頁不支援刪除: ' + sheetName };
  }
  var sheet = getSparkSheet_(sheetName);
  if (!sheet) return { success: false, error: '找不到分頁: ' + sheetName };
  var row_ = parseInt(row, 10);
  if (!row_ || row_ < 2) return { success: false, error: '無效的列號' };

  sheet.deleteRow(row_);
  return { success: true };
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSparkSheet_(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

// 讀取待審核行程、真實 Google 日曆行程、記帳、摘要、訂閱
function getAllData() {
  var pendingSchedules = readPendingSchedules_();
  var calendarEvents = readRealCalendarEvents_();
  var receipts = readSheetAsObjects_('Receipts', ['date', 'vendor', 'amount', 'category', 'notes', 'recordedAt']);
  var summaries = readSheetAsObjects_('Summaries', ['date', 'type', 'subject', 'oneLiner', 'linkText']);
  var subscriptions = readSheetAsObjects_('Subscriptions', ['name', 'dueDate', 'amount', 'cycle', 'status', 'notes']);
  var documents = readSheetAsObjects_('Documents_and_Contracts', ['date', 'category', 'subject', 'summary', 'notes']);

  return {
    success: true,
    generatedAt: new Date().toISOString(),
    pendingSchedules: pendingSchedules,
    calendarEvents: calendarEvents,
    receipts: receipts,
    summaries: summaries,
    subscriptions: subscriptions,
    documents: documents
  };
}

function readPendingSchedules_() {
  var sheet = getSparkSheet_('Pending_Schedule');
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  var out = [];
  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    var status = (r[4] || '').toString().trim();
    if (status === '' || status === '待確認') {
      out.push({
        row: i + 1, // 實際 Sheet 列號，寫回時要用
        date: formatCellAsDate_(r[0]),
        time: (r[1] || '').toString(),
        title: (r[2] || '').toString(),
        location: (r[3] || '').toString(),
        status: status || '待確認',
        subject: (r[5] || '').toString(),
        notes: (r[6] || '').toString()
      });
    }
  }
  return out;
}

function readSheetAsObjects_(sheetName, keys) {
  var sheet = getSparkSheet_(sheetName);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  var out = [];
  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    if (!r[1] && !r[0]) continue; // 跳過空白列
    var obj = { row: i + 1 };
    for (var k = 0; k < keys.length; k++) {
      var val = r[k];
      obj[keys[k]] = (val instanceof Date) ? formatCellAsDate_(val) : val;
    }
    out.push(obj);
  }
  return out;
}

function formatCellAsDate_(val) {
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return (val || '').toString();
}

// 讀取用戶「真實」Google 日曆（含私密行程），未來 30 天內
function readRealCalendarEvents_() {
  var tz = Session.getScriptTimeZone();
  var now = new Date();
  var start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var end = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);

  var cal = CalendarApp.getDefaultCalendar();
  var events = cal.getEvents(start, end);

  return events.map(function (ev) {
    var isAllDay = ev.isAllDayEvent();
    return {
      id: ev.getId(),
      title: ev.getTitle(),
      date: Utilities.formatDate(ev.getStartTime(), tz, 'yyyy-MM-dd'),
      time: isAllDay
        ? '全天'
        : Utilities.formatDate(ev.getStartTime(), tz, 'HH:mm') + ' - ' + Utilities.formatDate(ev.getEndTime(), tz, 'HH:mm'),
      location: ev.getLocation() || '',
      isAllDay: isAllDay,
      source: 'google_calendar'
    };
  });
}

// 把待審核行程「真的」寫入 Google 日曆，並回寫 Sheet 狀態
function addCalendarEvent(item) {
  if (!item || !item.title || !item.date) {
    return { success: false, error: '缺少必要欄位 (title / date)' };
  }

  try {
    var cal = CalendarApp.getDefaultCalendar();
    var description = (item.notes || '') + '\n\n(由 SparkMew 智慧助手寫入)';
    var newEvent;

    var timeRange = parseTimeRange_(item.date, item.time);
    if (!timeRange) {
      // 全天或無法解析時間 -> 建立全天事件
      var dayDate = parseDateOnly_(item.date);
      newEvent = cal.createAllDayEvent(item.title, dayDate, {
        location: item.location || '',
        description: description
      });
    } else {
      newEvent = cal.createEvent(item.title, timeRange.start, timeRange.end, {
        location: item.location || '',
        description: description
      });
    }

    if (item.row) {
      updatePendingStatus(item.row, '已加入');
    }

    return { success: true, eventId: newEvent.getId() };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function updatePendingStatus(row, statusText) {
  var sheet = getSparkSheet_('Pending_Schedule');
  if (!sheet || !row) return { success: false, error: '找不到 Pending_Schedule 或缺少列號' };
  sheet.getRange(row, 5).setValue(statusText); // 第 5 欄 = 狀態
  return { success: true };
}

function parseDateOnly_(dateStr) {
  var parts = dateStr.split('-');
  return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
}

// 解析 "14:00 - 15:30" 這種時間字串，回傳 {start, end}；無法解析（如"全天"）回傳 null
function parseTimeRange_(dateStr, timeStr) {
  if (!timeStr || timeStr.indexOf('-') === -1 || !/\d/.test(timeStr)) return null;

  var parts = timeStr.split('-');
  var startParts = parts[0].trim().split(':');
  var endParts = parts[1].trim().split(':');
  if (startParts.length < 2 || endParts.length < 2) return null;

  var baseDate = parseDateOnly_(dateStr);
  var start = new Date(baseDate);
  start.setHours(parseInt(startParts[0], 10), parseInt(startParts[1], 10), 0, 0);
  var end = new Date(baseDate);
  end.setHours(parseInt(endParts[0], 10), parseInt(endParts[1], 10), 0, 0);

  if (end <= start) end = new Date(start.getTime() + 60 * 60 * 1000); // 保底 1 小時

  return { start: start, end: end };
}
