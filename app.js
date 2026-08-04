/**
 * SparkMew AI Assistant Dashboard - Main Engine
 * Real Sheet Integration & Fallback Hydration (Zero Blank Screen)
 */

(function () {
  'use strict';

  const DEFAULT_USER_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ99-idNM-8gvWkw1k4HchJ3cNVbOMPJnNT4hJfpX_en7vD9s9L54f2RyKk0dXkRg/pub?output=csv';

  // 🔒 入口密碼鎖定（純前端層級，避免路人猜到網址直接看到個資，非真正安全機制）
  const LOCK_PASSWORD_HASH = 'fbfaf62d74859537294f90e854fffe82b56bd478f5ffafb32a77918ea2166d31';
  const LOCK_STORAGE_KEY = 'sparkmew_unlocked';

  async function sha256Hex(text) {
    const bytes = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function initLockScreen() {
    if (localStorage.getItem(LOCK_STORAGE_KEY) === '1') {
      document.body.classList.remove('locked');
    }

    const form = document.getElementById('lock-form');
    const input = document.getElementById('lock-password-input');
    const errorMsg = document.getElementById('lock-error-msg');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const hash = await sha256Hex(input.value);
      if (hash === LOCK_PASSWORD_HASH) {
        localStorage.setItem(LOCK_STORAGE_KEY, '1');
        document.body.classList.remove('locked');
        errorMsg.style.display = 'none';
      } else {
        errorMsg.style.display = 'block';
        input.value = '';
        input.focus();
      }
    });
  }

  function lockApp() {
    localStorage.removeItem(LOCK_STORAGE_KEY);
    document.body.classList.add('locked');
    const input = document.getElementById('lock-password-input');
    if (input) { input.value = ''; input.focus(); }
  }

  initLockScreen();

  // 10 Real Items extracted from user's published Google Sheet
  const realSheetFallbackData = [
    { id: 'p1', date: '2026-08-05', time: '14:00 - 15:30', title: '跨部門智慧醫療與AI專案研討會', location: '線上 (Meet)', status: '待確認', subject: 'Re: 8/5 研討會時間確認信', notes: '待確認加日曆' },
    { id: 'p2', date: '2026-08-23', time: '10:00 - 11:30', title: 'FORward 核心開創系列討論會', location: '線上 (Webex 平台)', status: '待確認', subject: '邀請您參加2026/08/23(日)FORward 核心開創系列討論會', notes: '請點擊連結報名' },
    { id: 'p3', date: '2026-11-05', time: '全天', title: 'ASN Kidney Week 2026 國際腎臟學研討會', location: '腎臟學會 (ASN)', status: '待確認', subject: "What's on the Plenary Stage at ASN Kidney Week 2026?", notes: '全球腎臟學專家盛會' },
    { id: 'p4', date: '2026-08-05', time: '08:00 - 08:30', title: '晨會 - 科務會議', location: '會議室', status: '待確認', subject: '2026-08月 科排班表', notes: '排班表提煉行程' },
    { id: 'p5', date: '2026-08-07', time: '08:00 - 08:30', title: '晨會 - 晨會 (蔡醫師)', location: '會議室', status: '待確認', subject: '2026-08月 科排班表', notes: '排班表提煉行程' },
    { id: 'p6', date: '2026-08-12', time: '08:00 - 08:30', title: '晨會 - 業務會議', location: '會議室', status: '待確認', subject: '2026-08月 科排班表', notes: '排班表提煉行程' },
    { id: 'p7', date: '2026-08-14', time: '08:00 - 08:30', title: '晨會 - 讀書會 (江醫師)', location: '會議室', status: '待確認', subject: '2026-08月 科排班表', notes: '排班表提煉行程' },
    { id: 'p8', date: '2026-08-19', time: '08:00 - 08:30', title: '晨會 - CPC/SPC討論會', location: '會議室', status: '待確認', subject: '2026-08月 科排班表', notes: '排班表提煉行程' },
    { id: 'p9', date: '2026-08-21', time: '08:00 - 08:30', title: '晨會 - 專題 (廖醫師)', location: '會議室', status: '待確認', subject: '2026-08月 科排班表', notes: '排班表提煉行程' },
    { id: 'p10', date: '2026-08-28', time: '08:00 - 08:30', title: '晨會 - 病友會 (黃醫師)', location: '會議室', status: '待確認', subject: '2026-08月 科排班表', notes: '排班表提煉行程' }
  ];

  const state = {
    theme: localStorage.getItem('sparkmew_theme') || 'tech',
    activeTab: 'tab-home',
    selectedCalendarDay: new Date().getDate(),
    isLiveConnected: true,
    config: JSON.parse(localStorage.getItem('sparkmew_config') || '{}') || {
      sheetCsvUrl: DEFAULT_USER_SHEET_URL,
      iCalUrl: '',
      gasUrl: '',
      routines: []
    },
    demoData: {
      pendingSchedules: [],
      todayEvents: [],
      tomorrowEvents: [],
      nextWeekEvents: [],
      monthCalendarDays: [],
      receipts: [],
      summaries: [],
      subscriptions: [],
      documents: []
    }
  };

  if (!state.config.sheetCsvUrl) state.config.sheetCsvUrl = DEFAULT_USER_SHEET_URL;
  if (!state.config.routines || !Array.isArray(state.config.routines)) state.config.routines = [];
  if (!state.config.gasUrl) state.config.gasUrl = '';

  // Populate Real Sheet Fallback Items to ensure zero blank screen
  function hydrateRealSheetFallback() {
    state.demoData.pendingSchedules = [...realSheetFallbackData];

    const monthEvMap = {};
    realSheetFallbackData.forEach(item => {
      if (item.date && item.date.includes('-')) {
        const dayNum = parseInt(item.date.split('-')[2]);
        if (!isNaN(dayNum)) {
          if (!monthEvMap[dayNum]) monthEvMap[dayNum] = [];
          monthEvMap[dayNum].push({
            name: item.title.substring(0, 8),
            time: item.time,
            type: item.title.includes('門診') ? 'dot-clinic' : 'dot-meeting',
            location: item.location
          });
        }
      }
    });

    state.demoData.monthCalendarDays = [];
    for (let d = 1; d <= 31; d++) {
      if (monthEvMap[d]) {
        state.demoData.monthCalendarDays.push({
          date: d,
          events: monthEvMap[d]
        });
      }
    }
  }

  // Hydrate immediately
  hydrateRealSheetFallback();

  // Real-time Date Header Formatter
  function updateRealtimeDates() {
    const now = new Date();
    const daysArr = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

    const todayStr = `${now.getFullYear()} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日 (${daysArr[now.getDay()]})`;

    const tom = new Date(now);
    tom.setDate(now.getDate() + 1);
    const tomStr = `${tom.getFullYear()} 年 ${tom.getMonth() + 1} 月 ${tom.getDate()} 日 (${daysArr[tom.getDay()]}) 明天預覽`;

    const todayElem = document.getElementById('today-full-date');
    const tomElem = document.getElementById('tomorrow-full-date');
    const monthHeaderElem = document.getElementById('month-calendar-header-title');
    const monthTitleElem = document.getElementById('month-title-label');

    if (todayElem) todayElem.innerText = todayStr;
    if (tomElem) tomElem.innerText = tomStr;
    if (monthHeaderElem) monthHeaderElem.innerText = `${now.getFullYear()} 年 ${now.getMonth() + 1} 月 行程月曆`;
    if (monthTitleElem) monthTitleElem.innerText = `${now.getFullYear()} 年 ${now.getMonth() + 1} 月`;
  }

  // Generate Google Calendar Link
  function generateGoogleCalendarUrl(event) {
    const title = encodeURIComponent(event.title || event.name || '新行程');
    const details = encodeURIComponent((event.notes || '') + '\n\n(由 SparkMew 智慧助手開啟)');
    const location = encodeURIComponent(event.location || '');
    let datesParam = '';
    try {
      const now = new Date();
      const yr = now.getFullYear();
      const mo = String(now.getMonth() + 1).padStart(2, '0');
      const dy = String(now.getDate()).padStart(2, '0');
      const cleanDate = (event.date || `${yr}-${mo}-${dy}`).replace(/-/g, '');
      let startTime = '090000';
      let endTime = '100000';
      if (event.time && event.time.includes('-')) {
        const parts = event.time.split('-');
        startTime = parts[0].trim().replace(':', '') + '00';
        endTime = parts[1].trim().replace(':', '') + '00';
      }
      datesParam = `&dates=${cleanDate}T${startTime}/${cleanDate}T${endTime}`;
    } catch (e) {
      datesParam = '';
    }
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}${datesParam}`;
  }

  // Theme Init
  function initTheme() {
    document.documentElement.className = `theme-${state.theme}`;
    const buttons = document.querySelectorAll('.theme-btn');
    buttons.forEach(btn => {
      if (btn.dataset.theme === state.theme) btn.classList.add('active');
      else btn.classList.remove('active');
      btn.addEventListener('click', () => {
        state.theme = btn.dataset.theme;
        localStorage.setItem('sparkmew_theme', state.theme);
        document.documentElement.className = `theme-${state.theme}`;
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  // Tabs Init
  function initTabs() {
    const tabNavBtns = document.querySelectorAll('.tab-nav-btn');
    const tabPages = document.querySelectorAll('.tab-page-content');

    tabNavBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        state.activeTab = targetTab;
        tabNavBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        tabPages.forEach(page => {
          if (page.id === targetTab) {
            page.classList.add('active');
          } else {
            page.classList.remove('active');
          }
        });
      });
    });
  }

  // Fast fetcher with 2.5s timeout
  async function fetchWithTimeout(url, timeoutMs = 2500) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) return await res.text();
    } catch (e) {
      clearTimeout(timer);
    }
    return null;
  }

  async function fetchCsvWithFallback(targetUrl) {
    if (!targetUrl) return null;

    let text = await fetchWithTimeout(targetUrl, 2000);
    if (text && text.trim().length > 10) return text;

    text = await fetchWithTimeout('https://api.allorigins.win/raw?url=' + encodeURIComponent(targetUrl), 2500);
    if (text && text.trim().length > 10) return text;

    text = await fetchWithTimeout('https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(targetUrl), 2500);
    if (text && text.trim().length > 10) return text;

    return null;
  }

  // Native iCal / ICS Parser
  function parseICalContent(icsText) {
    if (!icsText) return [];
    const events = [];
    const vevents = icsText.split('BEGIN:VEVENT');

    vevents.slice(1).forEach(block => {
      const lines = block.split(/\r?\n/);
      let summary = '';
      let dtstart = '';
      let dtend = '';
      let location = '';
      let description = '';

      lines.forEach(line => {
        if (line.startsWith('SUMMARY:')) {
          summary = line.replace('SUMMARY:', '').trim();
        } else if (line.startsWith('DTSTART')) {
          dtstart = line.split(':')[1] || '';
        } else if (line.startsWith('DTEND')) {
          dtend = line.split(':')[1] || '';
        } else if (line.startsWith('LOCATION:')) {
          location = line.replace('LOCATION:', '').trim();
        } else if (line.startsWith('DESCRIPTION:')) {
          description = line.replace('DESCRIPTION:', '').trim();
        }
      });

      if (summary) {
        let dateStr = '';
        let timeStr = '全天';

        if (dtstart.length >= 8) {
          const yr = dtstart.substring(0, 4);
          const mo = dtstart.substring(4, 6);
          const dy = dtstart.substring(6, 8);
          dateStr = `${yr}-${mo}-${dy}`;

          if (dtstart.includes('T') && dtstart.length >= 13) {
            const hh1 = dtstart.substring(9, 11);
            const mm1 = dtstart.substring(11, 13);
            let hh2 = '';
            let mm2 = '';
            if (dtend.includes('T') && dtend.length >= 13) {
              hh2 = dtend.substring(9, 11);
              mm2 = dtend.substring(11, 13);
              timeStr = `${hh1}:${mm1} - ${hh2}:${mm2}`;
            } else {
              timeStr = `${hh1}:${mm1}`;
            }
          }
        }

        events.push({
          title: summary,
          date: dateStr,
          time: timeStr,
          location: location,
          type: 'calendar',
          tag: 'Google Calendar',
          notes: description
        });
      }
    });

    return events;
  }

  // Load Real Google Calendar iCal Feed
  async function loadLiveCalendarIfConfigured() {
    const icalUrl = state.config.iCalUrl;
    if (!icalUrl) return false;

    try {
      const icsText = await fetchCsvWithFallback(icalUrl);
      if (icsText && icsText.includes('BEGIN:VCALENDAR')) {
        const calEvents = parseICalContent(icsText);
        if (calEvents.length > 0) {
          const now = new Date();
          const yr = now.getFullYear();
          const mo = String(now.getMonth() + 1).padStart(2, '0');
          const dy = String(now.getDate()).padStart(2, '0');
          const todayISO = `${yr}-${mo}-${dy}`;

          const tom = new Date(now);
          tom.setDate(now.getDate() + 1);
          const tomYr = tom.getFullYear();
          const tomMo = String(tom.getMonth() + 1).padStart(2, '0');
          const tomDy = String(tom.getDate()).padStart(2, '0');
          const tomISO = `${tomYr}-${tomMo}-${tomDy}`;

          state.demoData.todayEvents = calEvents.filter(e => e.date === todayISO);
          state.demoData.tomorrowEvents = calEvents.filter(e => e.date === tomISO);

          // Merge into month grid
          calEvents.forEach(ev => {
            if (ev.date && ev.date.includes('-')) {
              const dayNum = parseInt(ev.date.split('-')[2]);
              if (!isNaN(dayNum)) {
                let dayData = state.demoData.monthCalendarDays.find(d => d.date === dayNum);
                if (!dayData) {
                  dayData = { date: dayNum, events: [] };
                  state.demoData.monthCalendarDays.push(dayData);
                }
                dayData.events.push({
                  name: ev.title.substring(0, 8),
                  time: ev.time,
                  type: 'dot-meeting',
                  location: ev.location
                });
              }
            }
          });

          return true;
        }
      }
    } catch (e) {
      console.warn('iCal fetch error:', e);
    }
    return false;
  }

  // GAS Web App helpers (方案 1：CORS-free 雙向同步)
  async function fetchGasData() {
    const gasUrl = (state.config.gasUrl || '').trim();
    if (!gasUrl) return null;

    try {
      const sep = gasUrl.includes('?') ? '&' : '?';
      // GAS 冷啟動 + 讀 Sheet + 讀 30 天日曆事件可能較慢，逾時放寬到 20 秒
      const text = await fetchWithTimeout(gasUrl + sep + 'action=getData', 20000);
      if (!text) {
        console.warn('GAS fetch: 無回應或逾時（20 秒內未取得資料），改用備援資料源');
        return null;
      }
      const json = JSON.parse(text);
      if (json && json.success) return json;
      console.warn('GAS fetch: 回傳內容非預期格式', json);
    } catch (e) {
      console.warn('GAS fetch error:', e);
    }
    return null;
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function postGasAction(action, payload, retrying) {
    const gasUrl = (state.config.gasUrl || '').trim();
    if (!gasUrl) return { success: false, error: '尚未設定 GAS Web App 網址' };

    try {
      const res = await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // 避免觸發 CORS 預檢
        body: JSON.stringify(Object.assign({ action }, payload))
      });
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch (parseErr) {
        // Google 短暫流量限制/忙線時會回傳 HTML 錯誤頁而非 JSON；稍等後自動重試一次
        if (!retrying) {
          console.warn('GAS post: 回傳非 JSON（可能是 Google 端流量限制），2 秒後自動重試一次');
          await sleep(2000);
          return postGasAction(action, payload, true);
        }
        return { success: false, error: 'Google 伺服器忙線中，回傳非預期內容（非 JSON）。請稍等幾秒後手動再試一次。' };
      }
    } catch (e) {
      console.warn('GAS post error:', e);
      return { success: false, error: e.message };
    }
  }

  function applyGasData(json) {
    state.demoData.pendingSchedules = (json.pendingSchedules || []).map(item => Object.assign({ id: 'gas_row_' + item.row }, item));
    state.demoData.receipts = json.receipts || [];
    state.demoData.summaries = json.summaries || [];
    state.demoData.subscriptions = json.subscriptions || [];
    state.demoData.documents = json.documents || [];

    const now = new Date();
    const todayISO = isoDate(now);
    const tom = new Date(now);
    tom.setDate(now.getDate() + 1);
    const tomISO = isoDate(tom);

    const calEvents = json.calendarEvents || [];
    state.demoData.todayEvents = calEvents.filter(e => e.date === todayISO).map(toRenderEvent);
    state.demoData.tomorrowEvents = calEvents.filter(e => e.date === tomISO).map(toRenderEvent);

    const monthEvMap = {};
    calEvents.forEach(ev => {
      if (!ev.date || !ev.date.includes('-')) return;
      const dayNum = parseInt(ev.date.split('-')[2]);
      if (isNaN(dayNum)) return;
      if (!monthEvMap[dayNum]) monthEvMap[dayNum] = [];
      monthEvMap[dayNum].push({ name: ev.title.substring(0, 8), time: ev.time, type: 'dot-meeting', location: ev.location });
    });
    (json.pendingSchedules || []).forEach(item => {
      if (!item.date || !item.date.includes('-')) return;
      const dayNum = parseInt(item.date.split('-')[2]);
      if (isNaN(dayNum)) return;
      if (!monthEvMap[dayNum]) monthEvMap[dayNum] = [];
      monthEvMap[dayNum].push({ name: item.title.substring(0, 8), time: item.time, type: 'dot-clinic', location: item.location });
    });

    state.demoData.monthCalendarDays = [];
    for (let d = 1; d <= 31; d++) {
      if (monthEvMap[d]) state.demoData.monthCalendarDays.push({ date: d, events: monthEvMap[d] });
    }
  }

  function isoDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function toRenderEvent(ev) {
    return { date: ev.date, time: ev.time, title: ev.title, location: ev.location, type: 'calendar', tag: 'Google Calendar' };
  }

  // Load Real Google Sheet / Calendar Data
  async function loadLiveSheetDataIfConfigured() {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.getElementById('status-text-val');

    // 優先走 GAS Web App：同一次請求拿到「真實」Google 日曆行程 + Sheet 資料，無 CORS 問題
    const gasJson = await fetchGasData();
    if (gasJson) {
      applyGasData(gasJson);
      if (statusDot) statusDot.className = 'status-dot dot-live';
      if (statusText) statusText.innerText = '🟢 已連線 GAS Web App（含真實 Google 日曆）';
      return;
    }

    // Fallback：舊的 CSV + iCal 直連方式（會受限於瀏覽器 CORS）
    let inputUrl = state.config.sheetCsvUrl || DEFAULT_USER_SHEET_URL;

    try {
      let targetFetchUrl = inputUrl;
      if (!targetFetchUrl.includes('output=csv')) {
        targetFetchUrl += (targetFetchUrl.includes('?') ? '&' : '?') + 'output=csv';
      }

      const mainCsv = await fetchCsvWithFallback(targetFetchUrl);
      if (mainCsv) {
        parsePendingCsv(mainCsv);
      }
    } catch (err) {
      console.warn('Live Sheet fetch warning:', err);
    }

    await loadLiveCalendarIfConfigured();

    if (statusDot) statusDot.className = 'status-dot dot-live';
    if (statusText) statusText.innerText = state.config.gasUrl
      ? '🟡 GAS 連線失敗，改用備援資料源'
      : '🟢 已連線實時 Google Sheet（建議設定 GAS Web App 以取得真實日曆）';
  }

  function parseCSVRows(csvText) {
    const lines = csvText.split('\n').filter(l => l.trim());
    return lines.map(line => {
      return line.split(',').map(cell => cell.replace(/^"|"$/g, '').trim());
    });
  }

  function parsePendingCsv(csvText) {
    const rows = parseCSVRows(csvText).slice(1);
    if (rows.length === 0) return;

    const pendings = [];
    const monthEvMap = {};

    rows.forEach((r, i) => {
      const date = r[0] || '';
      const time = r[1] || '';
      const title = r[2] || '';
      const location = r[3] || '';
      const status = r[4] || '';
      const subject = r[5] || '';
      const notes = r[6] || '';

      if (!title) return; // Skip blank rows

      pendings.push({ id: 'live_p_' + i, date, time, title, location, status: status || '待確認', subject, notes });

      try {
        if (date && date.includes('-')) {
          const dayNum = parseInt(date.split('-')[2]);
          if (!isNaN(dayNum)) {
            if (!monthEvMap[dayNum]) monthEvMap[dayNum] = [];
            monthEvMap[dayNum].push({
              name: title.substring(0, 8),
              time,
              type: title.includes('門診') ? 'dot-clinic' : 'dot-meeting',
              location
            });
          }
        }
      } catch(e) {}
    });

    if (pendings.length > 0) state.demoData.pendingSchedules = pendings;

    if (Object.keys(monthEvMap).length > 0) {
      state.demoData.monthCalendarDays = [];
      for (let d = 1; d <= 31; d++) {
        if (monthEvMap[d]) {
          state.demoData.monthCalendarDays.push({
            date: d,
            events: monthEvMap[d]
          });
        }
      }
    }
  }

  // 1. Render Vertical Time Bar
  function renderVerticalTimeTrack() {
    const container = document.getElementById('vertical-time-track');
    const chipsBar = document.getElementById('today-routine-chips-bar');
    const statTodayCount = document.getElementById('stat-today-count');

    if (chipsBar) {
      chipsBar.innerHTML = state.config.routines.map(r => `
        <span class="badge-chip ${r.type || 'chip-clinic'}">
          <i class="fa-regular fa-clock"></i> ${r.name} (${r.days} ${r.time})
        </span>
      `).join('');
    }

    if (!container) return;
    const events = state.demoData.todayEvents;
    if (statTodayCount) statTodayCount.innerText = events.length;

    if (events.length === 0) {
      container.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-muted);">
          <i class="fa-solid fa-calendar-check" style="font-size: 1.8rem; color: var(--accent-cyan); margin-bottom: 8px;"></i>
          <p>本日尚無排定行程。請於設定貼入 Google 日曆 iCal 網址同步個人行程！</p>
        </div>
      `;
      return;
    }

    container.innerHTML = events.map(ev => {
      const gcalUrl = generateGoogleCalendarUrl(ev);
      const timeStart = ev.time ? ev.time.split('-')[0].trim() : '09:00';
      return `
        <div class="v-time-node">
          <div class="v-time-label">${timeStart}</div>
          <div class="v-node-dot"></div>
          <div class="v-node-card type-${ev.type}" onclick="window.open('${gcalUrl}', '_blank')">
            <div class="v-card-info">
              <h4>${ev.title}</h4>
              <p><i class="fa-solid fa-location-dot"></i> ${ev.location || '未指定地點'} • <i class="fa-regular fa-clock"></i> ${ev.time || '全天'}</p>
            </div>
            <a href="${gcalUrl}" target="_blank" class="btn-card-gcal" onclick="event.stopPropagation()">
              <i class="fa-regular fa-calendar-plus"></i> 開啟日曆
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  // 2. Render Tomorrow & Next Week Cards
  function renderTomorrowAndNextWeek() {
    const tomorrowContainer = document.getElementById('tomorrow-events-list');
    const nextWeekContainer = document.getElementById('next-week-container');

    if (tomorrowContainer) {
      if (state.demoData.tomorrowEvents.length === 0) {
        tomorrowContainer.innerHTML = `<p class="text-sm text-muted" style="padding: 10px;">明天無特殊排定行程。</p>`;
      } else {
        tomorrowContainer.innerHTML = state.demoData.tomorrowEvents.map(ev => {
          const gcalUrl = generateGoogleCalendarUrl(ev);
          return `
            <div class="v-node-card type-calendar" style="border-left-color: var(--accent-cyan);" onclick="window.open('${gcalUrl}', '_blank')">
              <div class="v-card-info">
                <h4>${ev.title}</h4>
                <p><i class="fa-solid fa-location-dot"></i> ${ev.location || '未指定'} • <i class="fa-regular fa-clock"></i> ${ev.time}</p>
              </div>
              <a href="${gcalUrl}" target="_blank" class="btn-card-gcal" onclick="event.stopPropagation()">
                <i class="fa-regular fa-calendar-plus"></i> 開啟日曆
              </a>
            </div>
          `;
        }).join('');
      }
    }

    if (nextWeekContainer) {
      if (state.demoData.nextWeekEvents.length === 0) {
        nextWeekContainer.innerHTML = `<p class="text-sm text-muted" style="padding: 10px;">下週依常規固定班表進行。</p>`;
      } else {
        nextWeekContainer.innerHTML = state.demoData.nextWeekEvents.map(nw => `
          <div class="next-week-day-card">
            <div class="nw-day-title">${nw.day}</div>
            ${nw.events.map(e => `<div class="nw-event-item"><span>• ${e}</span></div>`).join('')}
          </div>
        `).join('');
      }
    }
  }

  // 3. Render Monthly Grid Calendar
  function renderMonthlyGridCalendar() {
    const container = document.getElementById('monthly-grid-container');
    if (!container) return;

    const dayHeaders = ['日', '一', '二', '三', '四', '五', '六'];
    let html = dayHeaders.map(h => `<div class="month-grid-header-cell">${h}</div>`).join('');

    const todayDateNum = new Date().getDate();

    for (let i = 0; i < 6; i++) {
      html += `<div class="month-grid-day-cell text-muted" style="opacity: 0.3;"><span class="day-number"></span></div>`;
    }

    for (let d = 1; d <= 31; d++) {
      const isToday = (d === todayDateNum);
      const isSelected = (d === state.selectedCalendarDay);
      const dayData = state.demoData.monthCalendarDays.find(item => item.date === d);
      const eventsHtml = dayData && dayData.events ? dayData.events.map(e => `
        <span class="event-dot-tag ${e.type}">${e.name}</span>
      `).join('') : '';

      html += `
        <div class="month-grid-day-cell ${isToday ? 'is-today-cell' : ''} ${isSelected ? 'is-selected' : ''}" onclick="SparkMewApp.selectCalendarDay(${d})">
          <span class="day-number">${d}${isToday ? ' (今)' : ''}</span>
          <div class="day-event-dots">
            ${eventsHtml}
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
    renderSelectedDayAgenda();
  }

  function selectCalendarDay(dayNum) {
    state.selectedCalendarDay = dayNum;
    renderMonthlyGridCalendar();
  }

  function renderSelectedDayAgenda() {
    const panel = document.getElementById('selected-day-agenda');
    const title = document.getElementById('selected-day-title');
    const listContainer = document.getElementById('selected-day-items');

    if (!panel || !listContainer) return;

    const dayData = state.demoData.monthCalendarDays.find(item => item.date === state.selectedCalendarDay);
    const mo = new Date().getMonth() + 1;

    panel.style.display = 'block';
    if (title) title.innerHTML = `<i class="fa-solid fa-calendar-check"></i> ${mo}月${state.selectedCalendarDay}日 行程明細`;

    if (!dayData || !dayData.events || dayData.events.length === 0) {
      listContainer.innerHTML = `<p class="text-sm text-muted">本日尚無排定行程。</p>`;
      return;
    }

    listContainer.innerHTML = dayData.events.map(ev => `
      <div class="agenda-item-card">
        <div>
          <strong class="text-sm">${ev.name}</strong>
          <p class="text-sm text-muted">${ev.time} • ${ev.location || '未指定地點'}</p>
        </div>
        <a href="https://calendar.google.com" target="_blank" class="btn-card-gcal">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> 開啟
        </a>
      </div>
    `).join('');
  }

  // 4. Render Pending Schedule Hub & Instant Promotion to Confirmed Calendar
  function renderPendingHub() {
    const container = document.getElementById('pending-cards-container');
    const badge = document.getElementById('pending-hub-badge');
    const statPendingCount = document.getElementById('stat-pending-count');

    if (!container) return;

    const list = state.demoData.pendingSchedules;
    if (badge) badge.innerText = `${list.length} 筆待處理`;
    if (statPendingCount) statPendingCount.innerText = list.length;

    if (list.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1; padding: 20px; text-align: center; color: var(--text-muted);">
          <i class="fa-solid fa-circle-check" style="font-size: 2rem; color: var(--accent-emerald); margin-bottom: 8px;"></i>
          <p>太棒了！所有待處理行程已全部審核完成！</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(item => `
      <div class="pending-card" id="card-${item.id}">
        <div class="pending-card-top">
          <span class="pending-time-tag"><i class="fa-regular fa-clock"></i> ${item.date} ${item.time}</span>
          <span class="badge-pending">待確認</span>
        </div>
        <div class="pending-title">${item.title}</div>
        <div class="pending-meta">
          <span><i class="fa-solid fa-location-dot"></i> ${item.location || '未指定'}</span>
          <span><i class="fa-solid fa-envelope"></i> 來源: ${item.subject || 'Gmail / 排班表提煉'}</span>
        </div>
        <div class="pending-actions">
          <button class="btn-add-cal" onclick="SparkMewApp.markAsAdded('${item.id}')" title="${state.config.gasUrl ? '直接寫入 Google 日曆' : '尚未設定 GAS，將開啟手動加入頁面'}">
            <i class="fa-regular fa-calendar-plus"></i> 一鍵加日曆
          </button>
          <button class="btn-reject" onclick="SparkMewApp.rejectPendingItem('${item.id}')" title="忽略此行程，不寫入日曆">
            <i class="fa-solid fa-xmark"></i> 不加入
          </button>
        </div>
      </div>
    `).join('');
  }

  // Promote pending item to a real Calendar Event
  async function markAsAdded(id) {
    const item = state.demoData.pendingSchedules.find(p => p.id === id);
    if (!item) return;

    if (!state.config.gasUrl) {
      // 尚未設定 GAS：退回舊行為，開啟預填頁面讓用戶手動存檔
      window.open(generateGoogleCalendarUrl(item), '_blank');
      alert('⚠️ 尚未設定 GAS Web App 網址，無法自動寫入日曆。\n已開啟 Google 日曆預填頁面，請手動點擊「儲存」。\n\n若要自動寫入，請至設定填入 GAS Web App 網址。');
      return;
    }

    const card = document.getElementById(`card-${id}`);
    if (card) card.style.opacity = '0.5';

    const result = await postGasAction('addEvent', { item: { row: item.row, date: item.date, time: item.time, title: item.title, location: item.location, notes: item.notes } });

    if (result && result.success) {
      state.demoData.pendingSchedules = state.demoData.pendingSchedules.filter(p => p.id !== id);
      await loadLiveSheetDataIfConfigured();
      renderAllViews();
    } else {
      if (card) card.style.opacity = '1';
      alert('❌ 寫入 Google 日曆失敗：' + (result && result.error ? result.error : '未知錯誤') + '\n請確認 GAS Web App 已正確部署並可存取。');
    }
  }

  async function rejectPendingItem(id) {
    const item = state.demoData.pendingSchedules.find(p => p.id === id);
    state.demoData.pendingSchedules = state.demoData.pendingSchedules.filter(p => p.id !== id);
    renderAllViews();

    if (item && state.config.gasUrl && item.row) {
      await postGasAction('rejectEvent', { row: item.row });
    }
  }

  // 5. Render Receipts
  function renderReceipts(filterCat = 'all') {
    const container = document.getElementById('expense-list-container');
    const totalDisplay = document.getElementById('expense-total-display');
    const statMonthExpense = document.getElementById('stat-month-expense');
    if (!container) return;

    let items = state.demoData.receipts;
    if (filterCat !== 'all') items = items.filter(r => r.category === filterCat);

    const totalSum = state.demoData.receipts.reduce((sum, r) => sum + r.amount, 0);
    if (totalDisplay) totalDisplay.innerText = `$${totalSum.toLocaleString()}`;
    if (statMonthExpense) statMonthExpense.innerText = `$${totalSum.toLocaleString()}`;

    if (items.length === 0) {
      container.innerHTML = `<p class="text-sm text-muted" style="padding: 10px;">目前無記帳發票紀錄。</p>`;
      return;
    }

    container.innerHTML = items.map(r => `
      <div class="expense-card">
        <div class="expense-main">
          <h4>${r.vendor}</h4>
          <p>${r.date} • <span class="badge-chip chip-clinic">${r.category}</span> ${r.notes ? '• ' + r.notes : ''}</p>
        </div>
        <div class="expense-amount">+$${r.amount}</div>
      </div>
    `).join('');
  }

  // 6. Render Summaries
  function renderSummaries(filterType = 'all') {
    const container = document.getElementById('summaries-list-container');
    if (!container) return;

    let items = state.demoData.summaries;
    if (filterType !== 'all') items = items.filter(s => s.type === filterType);

    if (items.length === 0) {
      container.innerHTML = `<p class="text-sm text-muted" style="padding: 10px;">目前無公文或學術懶人包紀錄。</p>`;
      return;
    }

    container.innerHTML = items.map(s => `
      <div class="summary-card" id="summary-row-${s.row || ''}">
        <div class="flex items-center gap-2" style="justify-content: space-between;">
          <div class="flex items-center gap-2">
            <span class="summary-tag ${s.type === '公文' ? 'tag-doc' : 'tag-academic'}">${s.type}</span>
            <strong class="text-sm">${s.subject}</strong>
          </div>
          ${s.row ? `<button class="btn-reject" onclick="SparkMewApp.deleteSummary(${s.row})" title="刪除此條目"><i class="fa-solid fa-trash-can"></i> 刪除</button>` : ''}
        </div>
        <div class="summary-one-liner">
          <i class="fa-solid fa-quote-left text-muted"></i> ${s.oneLiner}
        </div>
        <div class="text-sm text-muted">
          ${s.date} • ${s.linkText}
        </div>
      </div>
    `).join('');
  }

  async function deleteSummary(row) {
    if (!state.config.gasUrl) {
      alert('⚠️ 尚未設定 GAS Web App 網址，無法刪除（刪除功能需要直接操作 Google Sheet）。');
      return;
    }
    if (!confirm('確定要刪除這筆摘要嗎？此動作會直接從 Google Sheet 移除，無法復原。')) return;

    const card = document.getElementById(`summary-row-${row}`);
    if (card) card.style.opacity = '0.5';

    const result = await postGasAction('deleteEntry', { sheetName: 'Summaries', row });
    if (result && result.success) {
      await loadLiveSheetDataIfConfigured();
      renderAllViews();
    } else {
      if (card) card.style.opacity = '1';
      alert('❌ 刪除失敗：' + (result && result.error ? result.error : '未知錯誤'));
    }
  }

  // 7. Render Subscriptions
  function renderSubscriptions() {
    const container = document.getElementById('subscriptions-container');
    if (!container) return;

    if (state.demoData.subscriptions.length === 0) {
      container.innerHTML = `<p class="text-sm text-muted" style="padding: 10px;">無近期的訂閱續費項目。</p>`;
      return;
    }

    container.innerHTML = state.demoData.subscriptions.map(sub => `
      <div class="sub-item">
        <div class="sub-info">
          <h4>${sub.name}</h4>
          <p>扣款日: ${sub.dueDate} ($${sub.amount}/月)</p>
        </div>
        <div class="sub-countdown">
          剩 ${sub.daysLeft} 天到期
        </div>
      </div>
    `).join('');
  }

  // 8. Render Documents & Contracts
  function renderDocuments() {
    const container = document.getElementById('documents-list-container');
    if (!container) return;

    const items = state.demoData.documents;
    if (items.length === 0) {
      container.innerHTML = `<p class="text-sm text-muted" style="padding: 10px;">目前無文件或合約紀錄。</p>`;
      return;
    }

    container.innerHTML = items.map(d => `
      <div class="summary-card" id="document-row-${d.row || ''}">
        <div class="flex items-center gap-2" style="justify-content: space-between;">
          <div class="flex items-center gap-2">
            <span class="summary-tag tag-doc">${d.category || ''}</span>
            <strong class="text-sm">${d.subject || ''}</strong>
          </div>
          ${d.row ? `<button class="btn-reject" onclick="SparkMewApp.deleteDocument(${d.row})" title="刪除此條目"><i class="fa-solid fa-trash-can"></i> 刪除</button>` : ''}
        </div>
        <div class="summary-one-liner">
          <i class="fa-solid fa-quote-left text-muted"></i> ${d.summary || ''}
        </div>
        <div class="text-sm text-muted">
          ${d.date || ''} • ${d.notes || ''}
        </div>
      </div>
    `).join('');
  }

  async function deleteDocument(row) {
    if (!state.config.gasUrl) {
      alert('⚠️ 尚未設定 GAS Web App 網址，無法刪除（刪除功能需要直接操作 Google Sheet）。');
      return;
    }
    if (!confirm('確定要刪除這筆文件/合約紀錄嗎？此動作會直接從 Google Sheet 移除，無法復原。')) return;

    const card = document.getElementById(`document-row-${row}`);
    if (card) card.style.opacity = '0.5';

    const result = await postGasAction('deleteEntry', { sheetName: 'Documents_and_Contracts', row });
    if (result && result.success) {
      await loadLiveSheetDataIfConfigured();
      renderAllViews();
    } else {
      if (card) card.style.opacity = '1';
      alert('❌ 刪除失敗：' + (result && result.error ? result.error : '未知錯誤'));
    }
  }

  // 9. Dynamic Routine Rows in Settings Modal
  function renderRoutineSlotRows() {
    const container = document.getElementById('routine-slots-list');
    if (!container) return;

    if (state.config.routines.length === 0) {
      container.innerHTML = `<p class="text-sm text-muted mb-2">尚未設定固定常規。點擊右上角「+ 新增常規行程」自訂。</p>`;
      return;
    }

    container.innerHTML = state.config.routines.map((r, i) => `
      <div class="routine-slot-row" data-index="${i}">
        <input type="text" class="form-input text-sm r-name" value="${r.name}" placeholder="行程名稱 (如: 接小孩)">
        <input type="text" class="form-input text-sm r-days" value="${r.days}" placeholder="重複 (如: 週一至五)">
        <input type="text" class="form-input text-sm r-time" value="${r.time}" placeholder="時間 (如: 17:00 - 18:00)">
        <button class="btn-del-routine-row" onclick="SparkMewApp.deleteRoutineRow(${i})" title="刪除此常規"><i class="fa-solid fa-trash-can"></i></button>
      </div>
    `).join('');
  }

  function addRoutineRow() {
    state.config.routines.push({ name: '新常規行程', days: '週一', time: '12:00 - 13:00', type: 'chip-custom' });
    renderRoutineSlotRows();
  }

  function deleteRoutineRow(idx) {
    state.config.routines.splice(idx, 1);
    renderRoutineSlotRows();
  }

  function saveRoutineRowsFromDOM() {
    const rows = document.querySelectorAll('#routine-slots-list .routine-slot-row');
    const updated = [];
    rows.forEach(row => {
      const name = row.querySelector('.r-name').value.trim();
      const days = row.querySelector('.r-days').value.trim();
      const time = row.querySelector('.r-time').value.trim();
      if (name) {
        let type = 'chip-custom';
        if (name.includes('門診')) type = 'chip-clinic';
        else if (name.includes('小孩')) type = 'chip-kids';
        updated.push({ name, days, time, type });
      }
    });
    state.config.routines = updated;
  }

  function openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
      renderRoutineSlotRows();
      document.getElementById('cfg-sheet-csv-url').value = state.config.sheetCsvUrl || DEFAULT_USER_SHEET_URL;
      document.getElementById('cfg-ical-url').value = state.config.iCalUrl || '';
      const gasInput = document.getElementById('cfg-gas-url');
      if (gasInput) gasInput.value = state.config.gasUrl || '';
      modal.classList.add('active');
    }
  }

  function closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.classList.remove('active');
  }

  // Filters & Modals Init
  function initFiltersAndModals() {
    document.querySelectorAll('#expense-category-filters .filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#expense-category-filters .filter-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderReceipts(btn.dataset.cat);
      });
    });

    document.querySelectorAll('#summary-type-filters .filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#summary-type-filters .filter-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderSummaries(btn.dataset.type);
      });
    });

    const openBtn = document.getElementById('btn-open-settings');
    const closeBtn = document.getElementById('btn-close-settings');
    const saveBtn = document.getElementById('btn-save-settings');
    const resetBtn = document.getElementById('btn-reset-demo');
    const refreshBtn = document.getElementById('btn-refresh-data');
    const addRoutineBtn = document.getElementById('btn-add-routine-row');

    if (openBtn) openBtn.addEventListener('click', openSettingsModal);
    if (closeBtn) closeBtn.addEventListener('click', closeSettingsModal);
    if (addRoutineBtn) addRoutineBtn.addEventListener('click', addRoutineRow);

    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        saveRoutineRowsFromDOM();
        state.config.sheetCsvUrl = document.getElementById('cfg-sheet-csv-url').value.trim() || DEFAULT_USER_SHEET_URL;
        state.config.iCalUrl = document.getElementById('cfg-ical-url').value.trim();
        const gasInput = document.getElementById('cfg-gas-url');
        state.config.gasUrl = gasInput ? gasInput.value.trim() : '';
        localStorage.setItem('sparkmew_config', JSON.stringify(state.config));

        closeSettingsModal();
        renderAllViews();

        await loadLiveSheetDataIfConfigured();
        renderAllViews();

        alert('🟢 設定已成功儲存並同步資料源！');
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        localStorage.clear();
        state.config.sheetCsvUrl = DEFAULT_USER_SHEET_URL;
        state.config.iCalUrl = '';
        state.config.gasUrl = '';
        hydrateRealSheetFallback();
        alert('已重置為預設資料源！');
        location.reload();
      });
    }

    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        await loadLiveSheetDataIfConfigured();
        renderAllViews();
        alert('🟢 數據已成功刷新！');
      });
    }
  }

  function renderAllViews() {
    updateRealtimeDates();
    renderVerticalTimeTrack();
    renderTomorrowAndNextWeek();
    renderMonthlyGridCalendar();
    renderPendingHub();
    renderReceipts();
    renderSummaries();
    renderSubscriptions();
    renderDocuments();
  }

  // Non-blocking Synchronous Initialization Engine
  function init() {
    initTheme();
    initTabs();
    initFiltersAndModals();
    renderAllViews();

    loadLiveSheetDataIfConfigured().then(() => {
      renderAllViews();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.SparkMewApp = {
    openSettingsModal,
    closeSettingsModal,
    markAsAdded,
    rejectPendingItem,
    deleteSummary,
    deleteDocument,
    selectCalendarDay,
    deleteRoutineRow,
    lockApp,
    refreshLiveData: async () => {
      await loadLiveSheetDataIfConfigured();
      renderAllViews();
      alert('🟢 數據已成功刷新！');
    }
  };

})();
