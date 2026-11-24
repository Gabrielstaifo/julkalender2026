/*
 * Shared UI texts, Stockholm date logic, preview handling, countdown and grid.
 * Loaded by both index.html and day.html.
 */
(function () {
  'use strict';

  var TIME_ZONE = 'Europe/Stockholm';
  var TOTAL_DAYS = 25;

  // Client-only rehearsal window: 22–29 November maps to reading days 1–8.
  var SIMULATION = {
    start: { year: 2026, month: 11, day: 22 },
    days: 8
  };

  // All user-facing UI strings live in this single object, in both languages.
  var UI = {
    sv: {
      skipToContent: 'Hoppa till innehållet',
      intro: 'En läsning för varje dag i adventet, från 1 till 25 december.',
      introSim: 'En läsning för varje dag den 22–29 november.',
      subtitle: 'Bibelläsning för Mor Ignatius gruppen.',
      sayingTitle: 'Ett ord från kyrkofäderna',
      countdownTitle: 'Nästa lucka öppnar om',
      days: 'dagar',
      hours: 'timmar',
      minutes: 'minuter',
      seconds: 'sekunder',
      allOpen: 'Alla luckor är öppna.',
      calendarTitle: 'Kalenderns dagar',
      dayLabel: 'Dag {day}',
      open: 'Öppna läsningen',
      today: 'Idag',
      locked: 'Låst',
      previewAll: 'Förhandsvisning: alla dagar',
      previewDay: 'Förhandsvisning: dag {day}',
      backHome: 'Till startsidan',
      previous: 'Föregående dag',
      next: 'Nästa dag',
      swedishColumn: 'Svenska',
      arabicColumn: 'العربية',
      lockedNotice: 'Den här dagen har ännu inte kommit.',
      missingNotice: 'Texten är inte tillagd ännu.',
      placeholderHint: 'Platshållare – ersätt med bibeltext.',
      loadError: 'Kunde inte ladda läsningarna.',
      notFound: 'Läsningen kunde inte hittas.',
      invalidDay: 'Ogiltigt dagnummer.',
      loading: 'Laddar läsningen…',
      quizTitle: 'Fråga om läsningen',
      quizDone: 'Jag har läst klart',
      quizTryAgain: 'Försök igen',
      quizReset: 'Börja om',
      quizCorrect: 'Rätt svar!',
      quizStarFull: 'Hel stjärna – rätt på första försöket',
      quizStarHalf: 'Halv stjärna – rätt efter några försök',
      quizPlaceholder: 'Platshållare – ersätt med en riktig fråga.',
      footer: 'Grupp Mor Ignatius & Mor Baselios'
    },
    ar: {
      skipToContent: 'انتقل إلى المحتوى',
      intro: 'قراءة لكل يوم من أيام الصوم المقدس، من ١ إلى ٢٥ ديسمبر.',
      introSim: 'قراءة لكل يوم من ٢٢ إلى ٢٩ نوفمبر.',
      subtitle: 'قراءات لكروب مار اغناطيوس',
      sayingTitle: 'قول من أقوال الآباء',
      countdownTitle: 'النافذة التالية تُفتح بعد',
      days: 'أيام',
      hours: 'ساعات',
      minutes: 'دقائق',
      seconds: 'ثوانٍ',
      allOpen: 'جميع النوافذ مفتوحة.',
      calendarTitle: 'أيام التقويم',
      dayLabel: 'اليوم {day}',
      open: 'افتح القراءة',
      today: 'اليوم',
      locked: 'مقفل',
      previewAll: 'وضع المعاينة: كل الأيام',
      previewDay: 'وضع المعاينة: اليوم {day}',
      backHome: 'العودة إلى الرئيسية',
      previous: 'اليوم السابق',
      next: 'اليوم التالي',
      swedishColumn: 'السويدية',
      arabicColumn: 'العربية',
      lockedNotice: 'لم يأتِ موعد هذا اليوم بعد.',
      missingNotice: 'النص لم يُضف بعد.',
      placeholderHint: 'علامة موضع – تُستبدل بنص الكتاب المقدس.',
      loadError: 'تعذّر تحميل القراءات.',
      notFound: 'لم يتم العثور على القراءة.',
      invalidDay: 'رقم اليوم غير صالح.',
      loading: 'جارٍ تحميل القراءة…',
      quizTitle: 'سؤال عن القراءة',
      quizDone: 'أنهيت القراءة',
      quizTryAgain: 'حاول مرة أخرى',
      quizReset: 'إعادة المحاولة',
      quizCorrect: 'إجابة صحيحة!',
      quizStarFull: 'نجمة كاملة – صحيح من المحاولة الأولى',
      quizStarHalf: 'نصف نجمة – صحيح بعد عدة محاولات',
      quizPlaceholder: 'علامة موضع – تُستبدل بسؤال حقيقي.',
      footer: 'حلقة مار اغناطيوس & مار باسيليوس'
    }
  };

  // Replace {name} tokens in a UI string.
  function t(key, lang, vars) {
    var table = UI[lang] || UI.sv;
    var template = table[key] || UI.sv[key] || key;
    return String(template).replace(/\{(\w+)\}/g, function (_, name) {
      return vars && vars[name] != null ? String(vars[name]) : '';
    });
  }

  // Read date parts in Stockholm, never in the visitor's local time zone.
  function getStockholmToday(now) {
    var parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    }).formatToParts(now || new Date());
    var values = {};
    parts.forEach(function (part) {
      if (part.type !== 'literal') values[part.type] = Number(part.value);
    });
    return { year: values.year, month: values.month, day: values.day };
  }

  // Read the optional test date; malformed values are ignored.
  function readSimulateParam() {
    var value = new URLSearchParams(window.location.search).get('simulate');
    return /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? value : null;
  }

  function parseDateParam(value) {
    if (!value) return null;
    var bits = value.split('-').map(Number);
    var date = new Date(Date.UTC(bits[0], bits[1] - 1, bits[2]));
    if (date.getUTCFullYear() !== bits[0] ||
        date.getUTCMonth() !== bits[1] - 1 ||
        date.getUTCDate() !== bits[2]) return null;
    return { year: bits[0], month: bits[1], day: bits[2] };
  }

  var simulateParam = readSimulateParam();
  var simulatedDate = parseDateParam(simulateParam);

  function dayIndex(date) {
    return Math.floor(Date.UTC(date.year, date.month - 1, date.day) / 86400000);
  }

  function simulationDateForDay(day) {
    var date = new Date(Date.UTC(
      SIMULATION.start.year, SIMULATION.start.month - 1, SIMULATION.start.day + day - 1
    ));
    return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
  }

  function simulationDay(today) {
    return dayIndex(today) - dayIndex(SIMULATION.start) + 1;
  }

  function getTotalDays() {
    return simulatedDate ? SIMULATION.days : TOTAL_DAYS;
  }

  // Tiles show the real November date during the rehearsal.
  function displayDay(day) {
    return simulatedDate ? simulationDateForDay(day).day : day;
  }

  // The simulated date is fixed; real mode keeps using Stockholm wall-clock time.
  function getEffectiveToday(now) {
    return simulatedDate || getStockholmToday(now);
  }

  // Wall-clock parts of an instant in Stockholm.
  function getZonedParts(date) {
    var parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hourCycle: 'h23'
    }).formatToParts(date);
    var values = {};
    parts.forEach(function (part) {
      if (part.type !== 'literal') values[part.type] = Number(part.value);
    });
    return values;
  }

  // Convert a Stockholm midnight into the matching UTC instant (iterates to handle offsets).
  function localMidnight(year, month, day) {
    var target = Date.UTC(year, month - 1, day, 0, 0, 0);
    var instant = target;
    for (var i = 0; i < 3; i += 1) {
      var local = getZonedParts(new Date(instant));
      var localAsUtc = Date.UTC(
        local.year, local.month - 1, local.day,
        local.hour, local.minute, local.second
      );
      instant += target - localAsUtc;
    }
    return new Date(instant);
  }

  // Next meaningful boundary: the next rehearsal date, or the real December boundary.
  function getCountdownTarget(today) {
    if (simulatedDate) {
      var day = simulationDay(today);
      if (day < 1) return localMidnight(SIMULATION.start.year, SIMULATION.start.month, SIMULATION.start.day);
      if (day >= SIMULATION.days) return localMidnight(SIMULATION.start.year, 12, 1);
      var next = simulationDateForDay(day + 1);
      return localMidnight(next.year, next.month, next.day);
    }
    if (today.month < 12) return localMidnight(today.year, 12, 1);
    if (today.day < 25) return localMidnight(today.year, 12, today.day + 1);
    return localMidnight(today.year + 1, 12, 1);
  }

  // Client-side preview only; it is never a security boundary.
  function readPreview() {
    var value = new URLSearchParams(window.location.search).get('preview');
    if (value === 'all') return 'all';
    var day = Number.parseInt(value, 10);
    if (Number.isInteger(day) && day >= 1 && day <= getTotalDays()) return day;
    return null;
  }

  var preview = readPreview();

  function computeState(today, previewValue) {
    var total = getTotalDays();
    if (previewValue === 'all') return { unlockedThrough: total, todayDay: null };
    if (typeof previewValue === 'number') {
      return { unlockedThrough: previewValue, todayDay: previewValue };
    }
    if (simulatedDate) {
      var rehearsalDay = simulationDay(today);
      return {
        unlockedThrough: Math.max(0, Math.min(rehearsalDay, total)),
        todayDay: rehearsalDay >= 1 && rehearsalDay <= total ? rehearsalDay : null
      };
    }
    var inDecember = today.month === 12;
    return {
      unlockedThrough: inDecember ? Math.min(today.day, total) : 0,
      todayDay: inDecember && today.day <= total ? today.day : null
    };
  }

  var state = computeState(getEffectiveToday(), preview);

  function isDayUnlocked(day) {
    return day >= 1 && day <= state.unlockedThrough;
  }

  function isToday(day) {
    return day === state.todayDay;
  }

  // Keep preview and simulate flags when navigating between the two pages.
  function extraQuery() {
    var parts = [];
    if (preview !== null) {
      parts.push('preview=' + encodeURIComponent(preview === 'all' ? 'all' : String(preview)));
    }
    if (simulateParam) parts.push('simulate=' + encodeURIComponent(simulateParam));
    return parts.join('&');
  }

  function dayUrl(day) {
    var query = 'day=' + day;
    var extra = extraQuery();
    return 'day.html?' + (extra ? query + '&' + extra : query);
  }

  function homeUrl() {
    var extra = extraQuery();
    return extra ? 'index.html?' + extra : 'index.html';
  }

  function setText(id, value) {
    var element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function initLabels() {
    document.querySelectorAll('[data-i18n]').forEach(function (element) {
      var key = simulatedDate && element.dataset.i18n === 'intro'
        ? 'introSim'
        : element.dataset.i18n;
      element.textContent = t(key, element.lang || 'sv');
    });
  }

  // Hide a missing logo so no broken-image icon appears before it is supplied.
  function initLogo() {
    document.querySelectorAll('img[src="assets/logo.png"]').forEach(function (image) {
      image.addEventListener('error', function () { image.hidden = true; });
      if (image.complete && image.naturalWidth === 0) image.hidden = true;
    });
  }

  function initPreviewNotice() {
    var notice = document.getElementById('preview-notice');
    if (!notice || preview === null) return;
    var key = preview === 'all' ? 'previewAll' : 'previewDay';
    var vars = preview === 'all' ? {} : { day: displayDay(preview) };
    notice.querySelector('[data-preview-sv]').textContent = t(key, 'sv', vars);
    notice.querySelector('[data-preview-ar]').textContent = t(key, 'ar', vars);
    notice.hidden = false;
  }

  // The home card is shown only during the fast, or for an explicit preview day.
  function getSayingDay() {
    if (preview !== null) return preview === 'all' ? 1 : preview;
    var today = getEffectiveToday();
    var day = simulatedDate ? simulationDay(today) : today.day;
    var inWindow = simulatedDate ? day >= 1 && day <= getTotalDays()
      : today.month === 12 && day >= 1 && day <= getTotalDays();
    return inWindow ? day : null;
  }

  function setPlaceholderClass(element, value) {
    if (typeof value !== 'string' || !value.trim() || value.trim().indexOf('[MISSING') === 0) {
      element.classList.add('is-placeholder');
    }
  }

  function renderSaying(entry) {
    var textSv = document.getElementById('saying-sv-text');
    var textAr = document.getElementById('saying-ar-text');
    textSv.textContent = entry.text_sv || '';
    textAr.textContent = entry.text_ar || '';
    setPlaceholderClass(textSv, entry.text_sv);
    setPlaceholderClass(textAr, entry.text_ar);
  }

  function initSaying() {
    var card = document.getElementById('saying-card');
    if (!card) return;
    var day = getSayingDay();
    if (day === null) return;

    fetch('data/sayings.json')
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function (sayings) {
        var entry = sayings.find(function (item) { return item.day === day; });
        if (!entry) return;
        renderSaying(entry);
        card.hidden = false;
      })
      .catch(function () {
        // Keep the optional card out of the way if the file is unavailable.
      });
  }

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function renderCountdown(target, now) {
    var remaining = Math.max(0, target.getTime() - now.getTime());
    var seconds = Math.floor(remaining / 1000);
    setText('cd-days', pad(Math.floor(seconds / 86400)));
    setText('cd-hours', pad(Math.floor((seconds % 86400) / 3600)));
    setText('cd-minutes', pad(Math.floor((seconds % 3600) / 60)));
    setText('cd-seconds', pad(seconds % 60));

    var message = document.getElementById('countdown-message');
    if (!message) return;
    var today = getEffectiveToday(now);
    var isAfterFast = simulatedDate
      ? simulationDay(today) > SIMULATION.days
      : today.month === 12 && today.day >= 25;
    if (isAfterFast) {
      message.querySelector('[data-countdown-sv]').textContent = t('allOpen', 'sv');
      message.querySelector('[data-countdown-ar]').textContent = t('allOpen', 'ar');
      message.hidden = false;
    } else {
      message.hidden = true;
    }
  }

  function initCountdown() {
    if (!document.getElementById('countdown')) return;
    var target = getCountdownTarget(getEffectiveToday());
    function tick() {
      var now = new Date();
      renderCountdown(target, now);
      // The rehearsal date is fixed, so its target must not be recomputed each tick.
      if (!simulatedDate && target.getTime() - now.getTime() <= 0) {
        target = getCountdownTarget(getStockholmToday(now));
      }
    }
    tick();
    window.setInterval(tick, 1000);
  }

  // Locked tiles are spans: no href, no tabindex, therefore not keyboard-activatable.
  function createTile(day) {
    var unlocked = isDayUnlocked(day);
    var tile = document.createElement(unlocked ? 'a' : 'span');
    var classes = ['tile'];
    if (!unlocked) classes.push('tile--locked');
    if (isToday(day)) classes.push('tile--today');
    tile.className = classes.join(' ');

    if (unlocked) {
      tile.href = dayUrl(day);
      var stateKey = isToday(day) ? 'today' : 'open';
      tile.setAttribute('aria-label', 'Day ' + displayDay(day) + ' — ' + t(stateKey, 'sv'));
      // Only a finished quiz earns a star on its day tile.
      var record = window.AdventProgress ? window.AdventProgress.getDay(day) : null;
      if (!isToday(day) && record && record.completed) {
        var star = document.createElement('span');
        star.className = 'tile__star';
        star.setAttribute('aria-hidden', 'true');
        star.textContent = '★';
        tile.classList.add('tile--completed');
        tile.appendChild(star);
      }
    } else {
      tile.setAttribute('aria-disabled', 'true');
      tile.setAttribute('aria-label', 'Day ' + displayDay(day) + ' — ' + t('locked', 'sv'));
    }

    var number = document.createElement('span');
    number.className = 'tile__number';
    number.setAttribute('aria-hidden', 'true');
    number.textContent = String(displayDay(day));
    tile.appendChild(number);
    return tile;
  }

  function initGrid() {
    var grid = document.getElementById('calendar-grid');
    if (!grid) return;
    for (var day = 1; day <= getTotalDays(); day += 1) {
      grid.appendChild(createTile(day));
    }
  }

  function init() {
    initLabels();
    initLogo();
    initPreviewNotice();
    initSaying();
    initGrid();
    initCountdown();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API used by day.js.
  window.Calendar = {
    UI: UI,
    t: t,
    getToday: getStockholmToday,
    isDayUnlocked: isDayUnlocked,
    isToday: isToday,
    getPreview: function () { return preview; },
    dayUrl: dayUrl,
    homeUrl: homeUrl,
    TOTAL_DAYS: getTotalDays(),
    displayDay: displayDay,
    isSimulation: function () { return simulatedDate !== null; }
  };
})();
