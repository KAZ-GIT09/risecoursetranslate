/*!
 * risecoursetranslate.js — Rise & Storyline Course Translator
 * Drop-in — use this one link in your Rise index.html (always latest):
 *   <script src="https://cdn.jsdelivr.net/gh/Moyour/risecoursetranslate@main/risecoursetranslate.js" defer></script>
 */
(function () {
  'use strict';

  /* ── CONFIG ────────────────────────────────────────────────────── */
  var LANGUAGES = [
    { code: 'en', label: '🇬🇧 English (UK)' },
    { code: 'en-US', label: '🇺🇸 English (US)' },
    { code: 'af', label: '🇿🇦 Afrikaans' },
    { code: 'ar', label: '🇸🇦 Arabic', rtl: true },
    { code: 'zh', label: '🇨🇳 Chinese (Simplified)' },
    { code: 'zh-TW', label: '🇹🇼 Chinese (Traditional)' },
    { code: 'hr', label: '🇭🇷 Croatian' },
    { code: 'cs', label: '🇨🇿 Czech' },
    { code: 'da', label: '🇩🇰 Danish' },
    { code: 'nl', label: '🇳🇱 Dutch' },
    { code: 'fi', label: '🇫🇮 Finnish' },
    { code: 'fr', label: '🇫🇷 French' },
    { code: 'de', label: '🇩🇪 German' },
    { code: 'el', label: '🇬🇷 Greek' },
    { code: 'gu', label: '🇮🇳 Gujarati' },
    { code: 'ha', label: '🇳🇬 Hausa' },
    { code: 'hi', label: '🇮🇳 Hindi' },
    { code: 'hu', label: '🇭🇺 Hungarian' },
    { code: 'id', label: '🇮🇩 Indonesian' },
    { code: 'it', label: '🇮🇹 Italian' },
    { code: 'ja', label: '🇯🇵 Japanese' },
    { code: 'ko', label: '🇰🇷 Korean' },
    { code: 'ms', label: '🇲🇾 Malay' },
    { code: 'mr', label: '🇮🇳 Marathi' },
    { code: 'ne', label: '🇳🇵 Nepali' },
    { code: 'no', label: '🇳🇴 Norwegian' },
    { code: 'fa', label: '🇮🇷 Persian', rtl: true },
    { code: 'pl', label: '🇵🇱 Polish' },
    { code: 'pt', label: '🇧🇷 Portuguese' },
    { code: 'pa', label: '🇮🇳 Punjabi' },
    { code: 'ro', label: '🇷🇴 Romanian' },
    { code: 'ru', label: '🇷🇺 Russian' },
    { code: 'so', label: '🇸🇴 Somali' },
    { code: 'es', label: '🇪🇸 Spanish' },
    { code: 'sw', label: '🇰🇪 Swahili' },
    { code: 'sv', label: '🇸🇪 Swedish' },
    { code: 'tl', label: '🇵🇭 Tagalog' },
    { code: 'ta', label: '🇮🇳 Tamil' },
    { code: 'te', label: '🇮🇳 Telugu' },
    { code: 'th', label: '🇹🇭 Thai' },
    { code: 'tr', label: '🇹🇷 Turkish' },
    { code: 'uk', label: '🇺🇦 Ukrainian' },
    { code: 'ur', label: '🇵🇰 Urdu', rtl: true },
    { code: 'vi', label: '🇻🇳 Vietnamese' },
    { code: 'cy', label: '🏴󠁧󠁢󠁷󠁬󠁳󠁿 Welsh' },
    { code: 'yo', label: '🇳🇬 Yoruba' },
    { code: 'zu', label: '🇿🇦 Zulu' }
  ];

  var DEEPL_LANG_MAP = {
    ar: 'AR', bg: 'BG', cs: 'CS', da: 'DA', de: 'DE', el: 'EL', en: 'EN-GB', 'en-US': 'EN-US',
    es: 'ES', et: 'ET', fi: 'FI', fr: 'FR', hu: 'HU', id: 'ID', it: 'IT',
    ja: 'JA', ko: 'KO', lt: 'LT', lv: 'LV', nl: 'NL', no: 'NB', pl: 'PL',
    pt: 'PT-BR', ro: 'RO', ru: 'RU', sk: 'SK', sl: 'SL', sv: 'SV', th: 'TH',
    tr: 'TR', uk: 'UK', vi: 'VI', zh: 'ZH', 'zh-TW': 'ZH-HANT'
  };

  var STORAGE_KEY = 'rise_course_lang';
  var BAR_ID      = 'rise-translate-bar';
  var cache       = {};          // { langCode: { originalText: translatedText } }
  var originalMap = new Map();   // node → original text

  /* Rise cover Start button selectors (published export) */
  var START_SELECTORS = [
    'a.cover__header-content-action-link',
    '.cover__header-content-action-link',
    'button.cover__header-content-action-link',
    '[class*="cover"][class*="action-link"]'
  ];

  /* ── BAR STYLES ────────────────────────────────────────────────── */
  var css = [
    /* bar layout */
    '#' + BAR_ID + '{',
    '  display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:8px 10px;',
    '  width:100%;box-sizing:border-box;margin-top:14px;padding:0;',
    '  font-family:system-ui,sans-serif;font-size:13px;color:inherit;',
    '}',
    '#' + BAR_ID + '.rise-translate-bar--floating{',
    '  position:fixed;bottom:16px;right:16px;left:auto;top:auto;z-index:99999;',
    '  width:auto;max-width:calc(100vw - 32px);margin-top:0;padding:10px 14px;',
    '  background:rgba(26,26,46,.92);color:#fff;border-radius:10px;',
    '  box-shadow:0 4px 16px rgba(0,0,0,.25);',
    '}',

    /* dropdown wrapper */
    '.rise-dropdown{position:relative;display:inline-block;min-width:180px;max-width:260px;}',
    '@media(max-width:420px){.rise-dropdown{min-width:140px;max-width:calc(100vw - 80px);}}',

    /* trigger button */
    '.rise-dropdown__trigger{',
    '  display:flex;align-items:center;gap:6px;width:100%;',
    '  background:rgba(255,255,255,.92);border:1px solid rgba(0,0,0,.15);',
    '  color:#222;border-radius:6px;padding:6px 10px;font-size:13px;',
    '  font-family:system-ui,sans-serif;cursor:pointer;text-align:left;',
    '  transition:border-color .15s,box-shadow .15s;',
    '}',
    '.rise-dropdown__trigger:hover{border-color:rgba(0,0,0,.3);box-shadow:0 0 0 2px rgba(0,0,0,.06);}',
    '.rise-dropdown.is-open .rise-dropdown__trigger{border-color:#4a90d9;box-shadow:0 0 0 2px rgba(74,144,217,.25);}',
    '.rise-dropdown__selected-text{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
    '.rise-dropdown__chevron{flex-shrink:0;width:14px;height:14px;transition:transform .2s;}',
    '.rise-dropdown.is-open .rise-dropdown__chevron{transform:rotate(180deg);}',

    /* floating bar trigger (dark) */
    '#' + BAR_ID + '.rise-translate-bar--floating .rise-dropdown__trigger{',
    '  background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);color:#fff;',
    '}',
    '#' + BAR_ID + '.rise-translate-bar--floating .rise-dropdown__trigger:hover{',
    '  border-color:rgba(255,255,255,.45);box-shadow:0 0 0 2px rgba(255,255,255,.1);',
    '}',

    /* panel */
    '.rise-dropdown__panel{',
    '  display:none;position:absolute;left:0;right:0;z-index:100000;',
    '  background:#fff;border:1px solid rgba(0,0,0,.12);border-radius:8px;',
    '  box-shadow:0 8px 24px rgba(0,0,0,.15);overflow:hidden;direction:ltr;',
    '}',
    '.rise-dropdown.is-open .rise-dropdown__panel{display:block;}',
    '.rise-dropdown__panel--down{top:calc(100% + 4px);}',
    '.rise-dropdown__panel--up{bottom:calc(100% + 4px);}',

    /* floating bar panel (dark) */
    '#' + BAR_ID + '.rise-translate-bar--floating .rise-dropdown__panel{',
    '  background:#1a1a2e;border-color:rgba(255,255,255,.15);',
    '}',

    /* search input */
    '.rise-dropdown__search{',
    '  display:block;width:100%;box-sizing:border-box;border:none;',
    '  border-bottom:1px solid rgba(0,0,0,.08);padding:8px 10px;font-size:13px;',
    '  font-family:system-ui,sans-serif;outline:none;background:transparent;color:#222;',
    '}',
    '.rise-dropdown__search::placeholder{color:rgba(0,0,0,.4);}',
    '.rise-dropdown__search:focus{box-shadow:inset 0 -2px 0 #4a90d9;}',
    '#' + BAR_ID + '.rise-translate-bar--floating .rise-dropdown__search{',
    '  color:#fff;border-bottom-color:rgba(255,255,255,.12);',
    '}',
    '#' + BAR_ID + '.rise-translate-bar--floating .rise-dropdown__search::placeholder{color:rgba(255,255,255,.4);}',

    /* list */
    '.rise-dropdown__list{',
    '  list-style:none;margin:0;padding:4px 0;max-height:240px;overflow-y:auto;',
    '}',
    '.rise-dropdown__list::-webkit-scrollbar{width:6px;}',
    '.rise-dropdown__list::-webkit-scrollbar-track{background:transparent;}',
    '.rise-dropdown__list::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:3px;}',
    '#' + BAR_ID + '.rise-translate-bar--floating .rise-dropdown__list::-webkit-scrollbar-thumb{background:rgba(255,255,255,.2);}',

    /* list items */
    '.rise-dropdown__item{',
    '  padding:7px 10px;cursor:pointer;font-size:13px;',
    '  transition:background .1s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;',
    '}',
    '.rise-dropdown__item:hover,.rise-dropdown__item.is-focused{background:rgba(74,144,217,.1);color:#222;}',
    '.rise-dropdown__item.is-selected{background:rgba(74,144,217,.18);font-weight:600;}',
    '#' + BAR_ID + '.rise-translate-bar--floating .rise-dropdown__item{color:#ddd;}',
    '#' + BAR_ID + '.rise-translate-bar--floating .rise-dropdown__item:hover,',
    '#' + BAR_ID + '.rise-translate-bar--floating .rise-dropdown__item.is-focused{background:rgba(255,255,255,.1);color:#fff;}',
    '#' + BAR_ID + '.rise-translate-bar--floating .rise-dropdown__item.is-selected{background:rgba(74,144,217,.3);color:#fff;}',

    /* empty state */
    '.rise-dropdown__empty{display:none;padding:12px 10px;font-size:12px;color:rgba(0,0,0,.45);text-align:center;}',
    '.rise-dropdown__empty.is-visible{display:block;}',
    '#' + BAR_ID + '.rise-translate-bar--floating .rise-dropdown__empty{color:rgba(255,255,255,.4);}',

    /* spinner & status (unchanged layout) */
    '#' + BAR_ID + ' .rise-status{font-size:11px;opacity:.55;min-height:0;}',
    '#' + BAR_ID + ' .rise-status:empty{display:none;}',
    '#' + BAR_ID + '.rise-translate-bar--floating .rise-status{margin-left:4px;}',
    '#' + BAR_ID + ' .rise-spinner{',
    '  width:14px;height:14px;border:2px solid rgba(0,0,0,.15);',
    '  border-top-color:#333;border-radius:50%;',
    '  animation:rise-spin .6s linear infinite;display:none;flex-shrink:0;',
    '}',
    '#' + BAR_ID + '.rise-translate-bar--floating .rise-spinner{',
    '  border-color:rgba(255,255,255,.3);border-top-color:#fff;',
    '}',
    '@keyframes rise-spin{to{transform:rotate(360deg)}}'
  ].join('\n');

  /* ── DROPDOWN HELPERS ─────────────────────────────────────────── */
  var dropdownAPI = null;

  function createChevronSVG() {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 20 20');
    svg.setAttribute('fill', 'currentColor');
    svg.classList.add('rise-dropdown__chevron');
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill-rule', 'evenodd');
    path.setAttribute('d', 'M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z');
    path.setAttribute('clip-rule', 'evenodd');
    svg.appendChild(path);
    return svg;
  }

  function setupDropdownBehavior(wrapper, trigger, panel, searchInput, list, emptyMsg, selectedText, onSelect) {
    var focusIndex = -1;
    var items = [];
    var _outsideClickBound = false;

    function getVisibleItems() {
      return Array.prototype.slice.call(list.querySelectorAll('.rise-dropdown__item:not([hidden])'));
    }

    function open() {
      wrapper.classList.add('is-open');
      adjustPanelDirection();
      searchInput.value = '';
      filterItems('');
      items = getVisibleItems();
      focusIndex = -1;
      setTimeout(function () { searchInput.focus(); }, 0);
      if (!_outsideClickBound) {
        _outsideClickBound = true;
        document.addEventListener('click', outsideClick, true);
      }
    }

    function close() {
      wrapper.classList.remove('is-open');
      clearFocus();
      focusIndex = -1;
    }

    function toggle() {
      if (wrapper.classList.contains('is-open')) close();
      else open();
    }

    function outsideClick(e) {
      if (!wrapper.contains(e.target)) close();
    }

    function adjustPanelDirection() {
      panel.classList.remove('rise-dropdown__panel--up', 'rise-dropdown__panel--down');
      var rect = wrapper.getBoundingClientRect();
      var spaceBelow = window.innerHeight - rect.bottom;
      var spaceAbove = rect.top;
      panel.classList.add(spaceBelow < 280 && spaceAbove > spaceBelow ? 'rise-dropdown__panel--up' : 'rise-dropdown__panel--down');
    }

    function filterItems(query) {
      var q = query.toLowerCase().replace(/[\u{1F1E0}-\u{1F9FF}]/gu, '').trim();
      var anyVisible = false;
      var allItems = list.querySelectorAll('.rise-dropdown__item');
      for (var i = 0; i < allItems.length; i++) {
        var text = (allItems[i].textContent || '').toLowerCase().replace(/[\u{1F1E0}-\u{1F9FF}]/gu, '').trim();
        var match = !q || text.indexOf(q) !== -1;
        allItems[i].hidden = !match;
        if (match) anyVisible = true;
      }
      if (anyVisible) emptyMsg.classList.remove('is-visible');
      else emptyMsg.classList.add('is-visible');
      items = getVisibleItems();
      focusIndex = -1;
      clearFocus();
    }

    function clearFocus() {
      var focused = list.querySelector('.is-focused');
      if (focused) focused.classList.remove('is-focused');
    }

    function setFocus(idx) {
      clearFocus();
      if (idx >= 0 && idx < items.length) {
        items[idx].classList.add('is-focused');
        items[idx].scrollIntoView({ block: 'nearest' });
      }
    }

    function selectItem(item) {
      var code = item.getAttribute('data-value');
      var label = item.textContent;
      /* update selected class */
      var prev = list.querySelector('.is-selected');
      if (prev) prev.classList.remove('is-selected');
      item.classList.add('is-selected');
      selectedText.textContent = label;
      close();
      if (onSelect) onSelect(code);
    }

    /* event: trigger button */
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    });

    /* event: search input */
    searchInput.addEventListener('input', function () {
      filterItems(this.value);
    });
    searchInput.addEventListener('click', function (e) { e.stopPropagation(); });

    /* event: keyboard */
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        items = getVisibleItems();
        focusIndex = Math.min(focusIndex + 1, items.length - 1);
        setFocus(focusIndex);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        items = getVisibleItems();
        focusIndex = Math.max(focusIndex - 1, 0);
        setFocus(focusIndex);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (focusIndex >= 0 && focusIndex < items.length) {
          selectItem(items[focusIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        close();
        trigger.focus();
      }
    });

    /* event: trigger keyboard open */
    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        open();
      }
    });

    /* event: item clicks */
    list.addEventListener('click', function (e) {
      var item = e.target.closest('.rise-dropdown__item');
      if (item) selectItem(item);
    });

    /* public API */
    return {
      getValue: function () {
        var sel = list.querySelector('.is-selected');
        return sel ? sel.getAttribute('data-value') : 'en';
      },
      setValue: function (code) {
        var allItems = list.querySelectorAll('.rise-dropdown__item');
        for (var i = 0; i < allItems.length; i++) {
          if (allItems[i].getAttribute('data-value') === code) {
            var prev = list.querySelector('.is-selected');
            if (prev) prev.classList.remove('is-selected');
            allItems[i].classList.add('is-selected');
            selectedText.textContent = allItems[i].textContent;
            return;
          }
        }
      },
      close: close
    };
  }

  /* ── INIT ──────────────────────────────────────────────────────── */
  function getConfig() {
    var script = document.currentScript
      || document.querySelector('script[src*="risecoursetranslate"]');
    var provider = (script && script.getAttribute('data-provider')) || 'google';
    return {
      provider: provider === 'deepl' ? 'deepl' : 'google',
      deeplProxyUrl: (script && script.getAttribute('data-deepl-proxy')) || ''
    };
  }

  function mapToDeepLCode(code) {
    return DEEPL_LANG_MAP[code] || null;
  }

  function getLanguages() {
    var cfg = getConfig();
    if (cfg.provider !== 'deepl') return LANGUAGES;
    return LANGUAGES.filter(function (l) {
      return l.code === 'en' || l.code === 'en-US' || mapToDeepLCode(l.code);
    });
  }

  function isOriginalLanguage(code) {
    return !code || code === 'en' || code === 'en-US';
  }

  function init() {
    injectStyles();
    waitForCourseShell(function () {
      placeBar();
      var saved = getSavedLang();
      if (saved && !isOriginalLanguage(saved)) {
        if (dropdownAPI) {
          dropdownAPI.setValue(saved);
          translatePage(saved);
        }
      }
    });
  }

  function injectStyles() {
    var s = document.createElement('style');
    s.textContent = css;
    document.head.appendChild(s);
  }

  function isVisible(el) {
    if (!el || !el.getBoundingClientRect) return false;
    var rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function findStartButton() {
    var i, el, candidates, txt, j;
    for (i = 0; i < START_SELECTORS.length; i++) {
      el = document.querySelector(START_SELECTORS[i]);
      if (el && isVisible(el)) return el;
    }
    candidates = document.querySelectorAll('a, button');
    for (j = 0; j < candidates.length; j++) {
      txt = (candidates[j].textContent || '').trim().toLowerCase();
      if (/^(start|begin|start course|resume|continue)$/.test(txt) && isVisible(candidates[j])) {
        return candidates[j];
      }
    }
    return null;
  }

  function waitForCourseShell(done) {
    var finished = false;
    var observer = null;
    function finish() {
      if (finished) return;
      finished = true;
      if (observer) observer.disconnect();
      done();
    }
    if (findStartButton()) {
      finish();
      return;
    }
    observer = new MutationObserver(function () {
      if (findStartButton()) finish();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(finish, 15000);
  }

  function ensureBar() {
    var bar = document.getElementById(BAR_ID);
    if (bar) return bar;

    bar = document.createElement('div');
    bar.id = BAR_ID;

    /* dropdown wrapper */
    var wrapper = document.createElement('div');
    wrapper.className = 'rise-dropdown';

    /* trigger button */
    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'rise-dropdown__trigger';
    trigger.id = 'rise-select';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-label', 'Select course language');

    var selectedText = document.createElement('span');
    selectedText.className = 'rise-dropdown__selected-text';
    var savedCode = getSavedLang() || 'en';
    var savedLang = LANGUAGES.find(function (l) { return l.code === savedCode; });
    selectedText.textContent = savedLang ? savedLang.label : LANGUAGES[0].label;

    trigger.appendChild(selectedText);
    trigger.appendChild(createChevronSVG());

    /* panel */
    var panel = document.createElement('div');
    panel.className = 'rise-dropdown__panel rise-dropdown__panel--down';

    var searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'rise-dropdown__search';
    searchInput.placeholder = 'Search languages\u2026';
    searchInput.setAttribute('autocomplete', 'off');

    var list = document.createElement('ul');
    list.className = 'rise-dropdown__list';
    list.setAttribute('role', 'listbox');

    getLanguages().forEach(function (l) {
      var li = document.createElement('li');
      li.className = 'rise-dropdown__item';
      li.setAttribute('role', 'option');
      li.setAttribute('data-value', l.code);
      li.textContent = l.label;
      if (l.code === savedCode) li.classList.add('is-selected');
      list.appendChild(li);
    });

    var emptyMsg = document.createElement('div');
    emptyMsg.className = 'rise-dropdown__empty';
    emptyMsg.textContent = 'No languages found';

    panel.appendChild(searchInput);
    panel.appendChild(list);
    panel.appendChild(emptyMsg);
    wrapper.appendChild(trigger);
    wrapper.appendChild(panel);

    var spinner = document.createElement('div');
    spinner.className = 'rise-spinner';
    spinner.setAttribute('aria-hidden', 'true');

    var status = document.createElement('span');
    status.className = 'rise-status';
    status.textContent = '';

    /* wire up dropdown behavior */
    dropdownAPI = setupDropdownBehavior(wrapper, trigger, panel, searchInput, list, emptyMsg, selectedText, function (lang) {
      if (isOriginalLanguage(lang)) {
        activeTranslation = null;
        restorePage();
        clearSavedLang();
        status.textContent = '';
        return;
      }
      activeTranslation = lang;
      saveLang(lang);
      translatePage(lang, spinner, status);
    });

    bar.appendChild(wrapper);
    bar.appendChild(spinner);
    bar.appendChild(status);
    return bar;
  }

  function placeBar() {
    var startBtn = findStartButton();
    var bar = ensureBar();
    if (dropdownAPI) dropdownAPI.close();
    if (startBtn) {
      bar.classList.remove('rise-translate-bar--floating');
      if (startBtn.nextElementSibling !== bar) {
        startBtn.insertAdjacentElement('afterend', bar);
      }
      return;
    }
    bar.classList.add('rise-translate-bar--floating');
    document.body.appendChild(bar);
  }

  /* ── TEXT NODE COLLECTION ──────────────────────────────────────── */
  function getTextNodes() {
    var skip  = ['SCRIPT','STYLE','NOSCRIPT','IFRAME',BAR_ID.toUpperCase()];
    var nodes = [];
    var walk  = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          var p = node.parentElement;
          if (!p) return NodeFilter.FILTER_REJECT;
          if (p.id === BAR_ID) return NodeFilter.FILTER_REJECT;
          if (p.closest && p.closest('#' + BAR_ID)) return NodeFilter.FILTER_REJECT;
          if (skip.indexOf(p.nodeName) !== -1) return NodeFilter.FILTER_REJECT;
          var txt = node.nodeValue.trim();
          if (!txt || txt.length < 2) return NodeFilter.FILTER_SKIP;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    var n;
    while ((n = walk.nextNode())) nodes.push(n);
    return nodes;
  }

  /* ── TRANSLATION ───────────────────────────────────────────────── */
  function translatePage(lang, spinner, status) {
    var nodes = getTextNodes();
    var toTranslate = [];

    /* collect original texts & determine what still needs translating */
    nodes.forEach(function (node) {
      if (!originalMap.has(node)) originalMap.set(node, node.nodeValue);
      var orig = originalMap.get(node).trim();
      if (orig.length < 2) return;
      cache[lang] = cache[lang] || {};
      if (!cache[lang][orig]) toTranslate.push(orig);
    });

    toTranslate = unique(toTranslate);

    /* set RTL if needed */
    var langObj = LANGUAGES.find(function (l) { return l.code === lang; });
    document.body.style.direction = (langObj && langObj.rtl) ? 'rtl' : '';

    if (toTranslate.length === 0) {
      applyTranslations(nodes, lang);
      return;
    }

    if (spinner) spinner.style.display = 'block';
    if (status)  status.textContent = 'Translating…';

    batchTranslate(toTranslate, lang, function (err) {
      if (spinner) spinner.style.display = 'none';
      if (err) {
        if (status) status.textContent = 'Translation failed — check console';
        console.warn('[risecoursetranslate] Error:', err);
        return;
      }
      applyTranslations(nodes, lang);
      if (status) status.textContent = '';
    });
  }

  function applyTranslations(nodes, lang) {
    nodes.forEach(function (node) {
      var orig = originalMap.get(node);
      if (!orig) return;
      var trimmed = orig.trim();
      if (cache[lang] && cache[lang][trimmed]) {
        /* preserve leading/trailing whitespace */
        var lead  = orig.match(/^\s*/)[0];
        var trail = orig.match(/\s*$/)[0];
        node.nodeValue = lead + cache[lang][trimmed] + trail;
      }
    });
  }

  /* ── TRANSLATION PROVIDERS ─────────────────────────────────────── */
  var CHUNK_SIZE = 50;

  function batchTranslate(texts, lang, done) {
    var cfg = getConfig();
    var translateFn = cfg.provider === 'deepl' ? deeplTranslate : googleTranslate;
    var chunks = chunkArray(texts, CHUNK_SIZE);
    var pending = chunks.length;
    var errored = null;

    if (pending === 0) return done(null);

    chunks.forEach(function (chunk) {
      translateFn(chunk, lang, function (err, results) {
        if (errored) return;
        if (err) { errored = err; return done(err); }
        chunk.forEach(function (orig, i) {
          cache[lang][orig] = results[i] || orig;
        });
        pending--;
        if (pending === 0) done(null);
      });
    });
  }

  function googleTranslate(texts, targetLang, cb) {
    /* join texts with a delimiter unlikely to appear in course text */
    var SEP = '\n||||\n';
    var joined = texts.join(SEP);

    var url = 'https://translate.googleapis.com/translate_a/single'
      + '?client=gtx'
      + '&sl=auto'
      + '&tl=' + encodeURIComponent(targetLang)
      + '&dt=t'
      + '&q=' + encodeURIComponent(joined);

    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        /* Google returns [ [[translated, original, ...], ...], ... ] */
        var raw = '';
        if (data && data[0]) {
          data[0].forEach(function (seg) { if (seg && seg[0]) raw += seg[0]; });
        }
        var parts = raw.split('||||').map(function (s) { return s.replace(/^\n|\n$/g, ''); });
        cb(null, parts);
      })
      .catch(function (err) { cb(err, null); });
  }

  function deeplTranslate(texts, targetLang, cb) {
    var cfg = getConfig();
    var deeplCode = mapToDeepLCode(targetLang);

    if (!cfg.deeplProxyUrl) {
      return cb(new Error('DeepL proxy URL missing — set data-deepl-proxy on the script tag'));
    }
    if (!deeplCode) {
      return cb(new Error('Language not supported by DeepL: ' + targetLang));
    }

    fetch(cfg.deeplProxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: texts, target_lang: deeplCode })
    })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        var results = (data.translations || []).map(function (item) {
          return typeof item === 'string' ? item : item.text;
        });
        cb(null, results);
      })
      .catch(function (err) { cb(err, null); });
  }

  /* ── RESTORE ────────────────────────────────────────────────────── */
  function restorePage() {
    originalMap.forEach(function (orig, node) {
      node.nodeValue = orig;
    });
    document.body.style.direction = '';
  }

  /* ── PERSISTENCE ────────────────────────────────────────────────── */
  function saveLang(lang)   { try { sessionStorage.setItem(STORAGE_KEY, lang); } catch(e){} }
  function clearSavedLang() { try { sessionStorage.removeItem(STORAGE_KEY);    } catch(e){} }
  function getSavedLang()   { try { return sessionStorage.getItem(STORAGE_KEY); } catch(e){ return null; } }

  /* ── UTILS ──────────────────────────────────────────────────────── */
  function unique(arr) {
    var seen = {};
    return arr.filter(function (v) { return seen[v] ? false : (seen[v] = true); });
  }
  function chunkArray(arr, size) {
    var out = [];
    for (var i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }

  /* ── WAIT FOR DOM ────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /*
   * ── FOR SINGLE-PAGE / RISE SLIDE NAVIGATION ──────────────────────
   * Rise loads content dynamically. We re-scan on URL hash changes
   * and on mutations inside the main content area.
   */
  var activeTranslation = null;

  window.addEventListener('hashchange', function () {
    placeBar();
    if (activeTranslation) setTimeout(function () { translatePage(activeTranslation); }, 400);
  });

  var contentObserver = new MutationObserver(function (mutations) {
    clearTimeout(contentObserver._placeT);
    contentObserver._placeT = setTimeout(placeBar, 300);

    if (!activeTranslation) return;
    var relevant = mutations.some(function (m) {
      return m.addedNodes.length > 0 || m.type === 'characterData';
    });
    if (relevant) {
      clearTimeout(contentObserver._t);
      contentObserver._t = setTimeout(function () { translatePage(activeTranslation); }, 600);
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    var target = document.querySelector('#app, #root, .content-wrapper, body') || document.body;
    contentObserver.observe(target, {
      childList: true,
      subtree: true,
      characterData: false,
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden']
    });
  });

})();
