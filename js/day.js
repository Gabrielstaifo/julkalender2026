/*
 * Loads one reading from data/readings.json and renders the bilingual day view.
 */
(function () {
  'use strict';

  var Calendar = window.Calendar;
  var content = document.getElementById('day-content');
  if (!Calendar || !content) return;

  var ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

  function createElement(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (text != null) element.textContent = text;
    return element;
  }

  function toArabicDigits(value) {
    return String(value).replace(/\d/g, function (digit) {
      return ARABIC_DIGITS[Number(digit)];
    });
  }

  // A clearly marked placeholder must never be mistaken for Bible text.
  function isMissing(value) {
    return typeof value !== 'string' || !value.trim() || value.trim().indexOf('[MISSING') === 0;
  }

  function addBilingualNotice(parent, key) {
    var notice = createElement('p', 'notice bilingual');
    ['sv', 'ar'].forEach(function (lang) {
      var span = createElement('span', null, Calendar.t(key, lang));
      span.lang = lang;
      span.dir = lang === 'ar' ? 'rtl' : 'ltr';
      notice.appendChild(span);
    });
    parent.appendChild(notice);
  }

  function showMessage(key) {
    content.replaceChildren();
    var box = createElement('div', 'message-box');
    addBilingualNotice(box, key);
    box.appendChild(createNavLink('backHome', Calendar.homeUrl(), 'button-link'));
    content.appendChild(box);
  }

  function createNavLink(labelKey, url, className) {
    var link = createElement('a', className || 'nav__link');
    if (url) link.href = url;
    ['sv', 'ar'].forEach(function (lang) {
      var span = createElement('span', null, Calendar.t(labelKey, lang));
      span.lang = lang;
      span.dir = lang === 'ar' ? 'rtl' : 'ltr';
      link.appendChild(span);
    });
    return link;
  }

  function createDisabledNav(labelKey) {
    var placeholder = createElement('span', 'nav__link nav__link--disabled');
    placeholder.setAttribute('aria-disabled', 'true');
    ['sv', 'ar'].forEach(function (lang) {
      var span = createElement('span', null, Calendar.t(labelKey, lang));
      span.lang = lang;
      span.dir = lang === 'ar' ? 'rtl' : 'ltr';
      placeholder.appendChild(span);
    });
    return placeholder;
  }

  function initNav(day) {
    var nav = document.getElementById('day-nav');
    if (!nav) return;
    var previous = day > 1
      ? createNavLink('previous', Calendar.dayUrl(day - 1), 'nav__link')
      : createDisabledNav('previous');
    var home = createNavLink('backHome', Calendar.homeUrl(), 'nav__link nav__link--home');
    var next = day < Calendar.TOTAL_DAYS
      ? createNavLink('next', Calendar.dayUrl(day + 1), 'nav__link')
      : createDisabledNav('next');
    nav.replaceChildren(previous, home, next);
  }

  function appendParagraphs(parent, text) {
    String(text).split(/\n\s*\n/).forEach(function (block) {
      var trimmed = block.trim();
      if (!trimmed) return;
      var paragraph = createElement('p', 'reading__text', trimmed);
      if (isMissing(trimmed)) paragraph.classList.add('is-placeholder');
      parent.appendChild(paragraph);
    });
  }

  function createReading(entry, lang) {
    var suffix = lang === 'sv' ? '_sv' : '_ar';
    var article = createElement('article', 'reading reading--' + lang);
    article.lang = lang;
    article.dir = lang === 'ar' ? 'rtl' : 'ltr';

    var headingKey = lang === 'sv' ? 'swedishColumn' : 'arabicColumn';
    article.appendChild(createElement('h3', 'reading__heading', Calendar.t(headingKey, lang)));

    var reference = createElement('p', 'reading__ref', entry['ref' + suffix] || '');
    if (isMissing(entry['ref' + suffix])) reference.classList.add('is-placeholder');
    article.appendChild(reference);

    appendParagraphs(article, entry['text' + suffix] || '');
    if (isMissing(entry['text' + suffix])) {
      addBilingualNotice(article, 'missingNotice');
      addBilingualNotice(article, 'placeholderHint');
    }
    return article;
  }

  function renderDay(entry) {
    content.replaceChildren();

    var header = createElement('div', 'day-header');
    var heading = createElement('h2', 'day-header__title bilingual');
    heading.id = 'day-heading';
    var labelSv = createElement('span', null, Calendar.t('dayLabel', 'sv', {
      day: Calendar.displayDay(entry.day)
    }));
    labelSv.lang = 'sv';
    var labelAr = createElement('span', null, Calendar.t('dayLabel', 'ar', {
      day: toArabicDigits(Calendar.displayDay(entry.day))
    }));
    labelAr.lang = 'ar';
    labelAr.dir = 'rtl';
    heading.append(labelSv, labelAr);
    header.appendChild(heading);
    content.appendChild(header);

    var readings = createElement('div', 'readings');
    readings.append(createReading(entry, 'sv'), createReading(entry, 'ar'));
    content.appendChild(readings);

    renderQuiz(entry);
  }

  /* ---- End-of-reading quiz ---- */

  // Progress helper is optional; the quiz still runs if the script failed.
  var Progress = window.AdventProgress || {
    getDay: function () { return null; },
    saveDay: function () {},
    clearDay: function () {}
  };

  // Append a Swedish and an Arabic span, each with its own lang/dir.
  function appendBilingual(parent, key, vars) {
    ['sv', 'ar'].forEach(function (lang) {
      var span = createElement('span', null, Calendar.t(key, lang, vars));
      span.lang = lang;
      span.dir = lang === 'ar' ? 'rtl' : 'ltr';
      parent.appendChild(span);
    });
  }

  function isPlaceholderText(value) {
    return typeof value === 'string' && value.trim().indexOf('[PLACEHOLDER') === 0;
  }

  // One language line inside a question, option or explanation.
  function addLangLine(parent, lang, text) {
    var span = createElement('span', null, text);
    span.lang = lang;
    span.dir = lang === 'ar' ? 'rtl' : 'ltr';
    if (isPlaceholderText(text)) span.classList.add('is-placeholder');
    parent.appendChild(span);
    return span;
  }

  // Fisher–Yates shuffle so option order changes on every load.
  function shuffle(items) {
    for (var i = items.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = items[i];
      items[i] = items[j];
      items[j] = tmp;
    }
    return items;
  }

  // A missing or fully empty quiz is hidden silently.
  function isEmptyQuiz(quiz) {
    if (!quiz || typeof quiz !== 'object') return true;
    var hasText = ['q_ar', 'q_sv', 'explain_ar', 'explain_sv'].some(function (key) {
      return typeof quiz[key] === 'string' && quiz[key].trim();
    });
    var hasOptions = Array.isArray(quiz.options) && quiz.options.length > 0;
    return !hasText && !hasOptions;
  }

  // A present but malformed quiz logs a clear error and is hidden.
  function validateQuiz(quiz, day) {
    var problems = [];
    ['q_ar', 'q_sv'].forEach(function (key) {
      if (typeof quiz[key] !== 'string' || !quiz[key].trim()) problems.push(key + ' is empty');
    });
    var options = Array.isArray(quiz.options) ? quiz.options : [];
    if (options.length < 3 || options.length > 4) {
      problems.push('expected 3-4 options, found ' + options.length);
    }
    var correctCount = options.filter(function (option) {
      return option && option.correct === true;
    }).length;
    if (correctCount !== 1) {
      problems.push('expected exactly 1 correct option, found ' + correctCount);
    }
    options.forEach(function (option, index) {
      if (!option || typeof option.ar !== 'string' || !option.ar.trim() ||
          typeof option.sv !== 'string' || !option.sv.trim()) {
        problems.push('option ' + (index + 1) + ' is missing ar/sv text');
      }
    });
    if (problems.length) {
      console.error('[quiz] Day ' + day + ' has an invalid quiz: ' + problems.join('; ') + '. Quiz hidden.');
      return false;
    }
    return true;
  }

  function renderQuiz(entry) {
    var quiz = entry.quiz;
    if (isEmptyQuiz(quiz)) return;
    if (!validateQuiz(quiz, entry.day)) return;
    var saved = Progress.getDay(entry.day);
    if (saved && saved.completed) {
      mountQuiz(entry, quiz, saved);
    } else {
      mountGate(entry, quiz);
    }
  }

  // The "I have finished reading" button; the quiz stays hidden until clicked.
  function mountGate(entry, quiz) {
    var gate = createElement('div', 'quiz-gate');
    var start = createElement('button', 'quiz__start');
    start.type = 'button';
    appendBilingual(start, 'quizDone');
    start.addEventListener('click', function () {
      gate.remove();
      mountQuiz(entry, quiz, { attempts: 0, stars: 0, completed: false });
    });
    gate.appendChild(start);
    content.appendChild(gate);
  }

  function mountQuiz(entry, quiz, record) {
    var section = createElement('section', 'quiz');
    section.setAttribute('aria-labelledby', 'quiz-heading');
    content.appendChild(section);
    buildQuizBody(section, entry, quiz, record);
  }

  function createOptionButton(option) {
    var button = createElement('button', 'quiz__option');
    button.type = 'button';
    // Icon stays in the accessible name (not aria-hidden) once set.
    button.appendChild(createElement('span', 'quiz__icon'));
    var text = createElement('span', 'quiz__option-text');
    addLangLine(text, 'sv', option.sv);
    addLangLine(text, 'ar', option.ar);
    button.appendChild(text);
    return button;
  }

  function setOptionState(button, state) {
    button.classList.add(state === 'correct' ? 'quiz__option--correct' : 'quiz__option--wrong');
    button.querySelector('.quiz__icon').textContent = state === 'correct' ? '✓' : '✗';
    button.disabled = true;
    button.setAttribute('aria-disabled', 'true');
  }

  function renderStar(container, stars) {
    container.replaceChildren();
    var half = stars < 1;
    var labelKey = half ? 'quizStarHalf' : 'quizStarFull';
    var star = createElement('span', 'quiz__star' + (half ? ' quiz__star--half' : ''));
    star.setAttribute('role', 'img');
    star.setAttribute('aria-label', Calendar.t(labelKey, 'sv') + ' / ' + Calendar.t(labelKey, 'ar'));
    var base = createElement('span', 'quiz__star-base', '★');
    base.setAttribute('aria-hidden', 'true');
    var fill = createElement('span', 'quiz__star-fill', '★');
    fill.setAttribute('aria-hidden', 'true');
    star.append(base, fill);
    container.appendChild(star);
    var label = createElement('span', 'quiz__star-label bilingual');
    appendBilingual(label, labelKey);
    container.appendChild(label);
  }

  function buildQuizBody(section, entry, quiz, record) {
    var heading = createElement('h3', 'quiz__heading bilingual');
    heading.id = 'quiz-heading';
    appendBilingual(heading, 'quizTitle');
    section.appendChild(heading);

    var question = createElement('p', 'quiz__question bilingual');
    addLangLine(question, 'sv', quiz.q_sv);
    addLangLine(question, 'ar', quiz.q_ar);
    section.appendChild(question);

    if (isPlaceholderText(quiz.q_sv) || isPlaceholderText(quiz.q_ar)) {
      var hint = createElement('p', 'quiz__notice bilingual');
      appendBilingual(hint, 'quizPlaceholder');
      section.appendChild(hint);
    }

    var list = createElement('div', 'quiz__options');
    list.setAttribute('role', 'group');
    list.setAttribute('aria-labelledby', 'quiz-heading');
    var buttons = [];
    shuffle(quiz.options.slice()).forEach(function (option) {
      var button = createOptionButton(option);
      button.addEventListener('click', function () { handleAnswer(button, option); });
      list.appendChild(button);
      buttons.push({ button: button, option: option });
    });
    section.appendChild(list);

    var feedback = createElement('p', 'quiz__feedback bilingual');
    feedback.setAttribute('aria-live', 'polite');
    section.appendChild(feedback);

    var explain = createElement('div', 'quiz__explain bilingual');
    explain.hidden = true;
    section.appendChild(explain);

    var result = createElement('p', 'quiz__result');
    result.hidden = true;
    section.appendChild(result);

    var reset = createElement('button', 'quiz__reset');
    reset.type = 'button';
    appendBilingual(reset, 'quizReset');
    reset.hidden = true;
    reset.addEventListener('click', function () {
      Progress.clearDay(entry.day);
      section.remove();
      mountGate(entry, quiz);
    });
    section.appendChild(reset);

    // attempts counts wrong tries before the correct answer.
    var state = { attempts: record.attempts || 0, completed: !!record.completed };

    function showExplanation() {
      explain.replaceChildren();
      if (quiz.explain_sv) addLangLine(explain, 'sv', quiz.explain_sv);
      if (quiz.explain_ar) addLangLine(explain, 'ar', quiz.explain_ar);
      explain.hidden = !(quiz.explain_sv || quiz.explain_ar);
    }

    function markCorrect(stars) {
      buttons.forEach(function (item) {
        if (item.option.correct) {
          setOptionState(item.button, 'correct');
        } else {
          item.button.disabled = true;
          item.button.setAttribute('aria-disabled', 'true');
        }
      });
      feedback.replaceChildren();
      appendBilingual(feedback, 'quizCorrect');
      showExplanation();
      renderStar(result, stars);
      result.hidden = false;
      reset.hidden = false;
    }

    function handleAnswer(button, option) {
      if (state.completed || button.disabled) return;
      if (option.correct) {
        state.completed = true;
        var stars = state.attempts === 0 ? 1 : 0.5;
        markCorrect(stars);
        Progress.saveDay(entry.day, { attempts: state.attempts, stars: stars, completed: true });
      } else {
        state.attempts += 1;
        setOptionState(button, 'wrong');
        feedback.replaceChildren();
        appendBilingual(feedback, 'quizTryAgain');
      }
    }

    if (state.completed) {
      // Solved on a previous visit: show the answer and earned star directly.
      markCorrect(typeof record.stars === 'number' ? record.stars : 1);
    } else {
      buttons[0].button.focus();
    }
  }

  function getRequestedDay() {
    var value = new URLSearchParams(window.location.search).get('day');
    var day = Number.parseInt(value, 10);
    return Number.isInteger(day) && day >= 1 && day <= Calendar.TOTAL_DAYS ? day : null;
  }

  function load() {
    var day = getRequestedDay();
    if (day === null) {
      showMessage('invalidDay');
      return;
    }
    initNav(day);

    if (!Calendar.isDayUnlocked(day)) {
      showMessage('lockedNotice');
      return;
    }

    content.replaceChildren();
    var loading = createElement('p', 'loading bilingual');
    ['sv', 'ar'].forEach(function (lang) {
      var span = createElement('span', null, Calendar.t('loading', lang));
      span.lang = lang;
      span.dir = lang === 'ar' ? 'rtl' : 'ltr';
      loading.appendChild(span);
    });
    content.appendChild(loading);

    fetch('data/readings.json')
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function (entries) {
        var entry = entries.find(function (item) { return item.day === day; });
        if (!entry) {
          showMessage('notFound');
          return;
        }
        renderDay(entry);
      })
      .catch(function () {
        showMessage('loadError');
      });
  }

  load();
})();
