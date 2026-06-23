/*!
 * risecoursetranslate.js — Rise & Storyline Course Translator
 * Drop-in: add <script src="risecoursetranslate.js" defer></script> to index.html
 * Uses Google Translate (free endpoint). No API key required.
 * v1.4 — fixed dropdown collapse, removed document click listener
 */
(function () {
  'use strict';

  var LANGUAGES = [
    { code: 'af', label: 'Afrikaans' },
    { code: 'ar', label: 'Arabic', rtl: true },
    { code: 'zh', label: 'Chinese (Simplified)' },
    { code: 'zh-TW', label: 'Chinese (Traditional)' },
    { code: 'hr', label: 'Croatian' },
    { code: 'cs', label: 'Czech' },
    { code: 'da', label: 'Danish' },
    { code: 'nl', label: 'Dutch' },
    { code: 'fi', label: 'Finnish' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
    { code: 'el', label: 'Greek' },
    { code: 'gu', label: 'Gujarati' },
    { code: 'ha', label: 'Hausa' },
    { code: 'hi', label: 'Hindi' },
    { code: 'hu', label: 'Hungarian' },
    { code: 'id', label: 'Indonesian' },
    { code: 'it', label: 'Italian' },
    { code: 'ja', label: 'Japanese' },
    { code: 'ko', label: 'Korean' },
    { code: 'ms', label: 'Malay' },
    { code: 'mr', label: 'Marathi' },
    { code: 'ne', label: 'Nepali' },
    { code: 'no', label: 'Norwegian' },
    { code: 'fa', label: 'Persian', rtl: true },
    { code: 'pl', label: 'Polish' },
    { code: 'pt', label: 'Portuguese' },
    { code: 'pa', label: 'Punjabi' },
    { code: 'ro', label: 'Romanian' },
    { code: 'ru', label: 'Russian' },
    { code: 'so', label: 'Somali' },
    { code: 'es', label: 'Spanish' },
    { code: 'sw', label: 'Swahili' },
    { code: 'sv', label: 'Swedish' },
    { code: 'tl', label: 'Tagalog' },
    { code: 'ta', label: 'Tamil' },
    { code: 'te', label: 'Telugu' },
    { code: 'th', label: 'Thai' },
    { code: 'tr', label: 'Turkish' },
    { code: 'uk', label: 'Ukrainian' },
    { code: 'ur', label: 'Urdu', rtl: true },
    { code: 'vi', label: 'Vietnamese' },
    { code: 'cy', label: 'Welsh' },
    { code: 'yo', label: 'Yoruba' },
    { code: 'zu', label: 'Zulu' }
  ];

  var STORAGE_KEY       = 'rise_course_lang';
  var BAR_ID            = 'rise-translate-bar';
  var cache             = {};
  var originalMap       = new Map();
  var isObserving       = false;
  var observer          = null;
  var activeTranslation = null;
  var panelOpen         = false;

  /* ── STYLES ─────────────────────────────────────────────────────── */
  var css = [
    '#' + BAR_ID + '{',
    '  position:fixed;top:0;left:0;right:0;z-index:2147483647;',
    '  display:flex;align-items:center;gap:12px;padding:0 16px;height:48px;',
    '  background:#1e1e2e;color:#fff;',
    '  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:13px;',
    '  box-shadow:0 2px 12px rgba(0,0,0,0.4);box-sizing:border-box;',
    '}',
    '#' + BAR_ID + ' .rt-label{opacity:.7;white-space:nowrap;font-size:12px;letter-spacing:.3px;}',
    '#' + BAR_ID + ' .rt-wrap{position:relative;}',
    '#' + BAR_ID + ' .rt-trigger{',
    '  display:flex;align-items:center;gap:8px;',
    '  background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);',
    '  color:#fff;border-radius:8px;padding:6px 12px;font-size:13px;cursor:pointer;',
    '  min-width:180px;justify-content:space-between;user-select:none;',
    '}',
    '#' + BAR_ID + ' .rt-trigger:hover{background:rgba(255,255,255,.18);}',
    '#' + BAR_ID + ' .rt-caret{font-size:10px;opacity:.6;transition:transform .2s;display:inline-block;}',
    '#' + BAR_ID + ' .rt-panel{',
    '  visibility:hidden;opacity:0;',
    '  position:absolute;top:calc(100% + 6px);left:0;',
    '  background:#1e1e2e;border:1px solid rgba(255,255,255,.2);',
    '  border-radius:10px;width:240px;overflow:hidden;',
    '  box-shadow:0 8px 24px rgba(0,0,0,.5);z-index:2147483647;',
    '  transition:opacity .15s,visibility .15s;',
    '  pointer-events:none;',
    '}',
    '#' + BAR_ID + ' .rt-panel.rt-open{visibility:visible;opacity:1;pointer-events:all;}',
    '#' + BAR_ID + ' .rt-search{',
    '  width:100%;box-sizing:border-box;padding:10px 12px;',
    '  background:rgba(255,255,255,.08);border:none;border-bottom:1px solid rgba(255,255,255,.1);',
    '  color:#fff;font-size:13px;outline:none;',
    '}',
    '#' + BAR_ID + ' .rt-search::placeholder{color:rgba(255,255,255,.4);}',
    '#' + BAR_ID + ' .rt-list{max-height:260px;overflow-y:auto;padding:4px 0;}',
    '#' + BAR_ID + ' .rt-list::-webkit-scrollbar{width:4px;}',
    '#' + BAR_ID + ' .rt-list::-webkit-scrollbar-thumb{background:rgba(255,255,255,.2);border-radius:4px;}',
    '#' + BAR_ID + ' .rt-option{',
    '  padding:9px 14px;cursor:pointer;font-size:13px;color:rgba(255,255,255,.85);',
    '}',
    '#' + BAR_ID + ' .rt-option:hover{background:rgba(255,255,255,.1);}',
    '#' + BAR_ID + ' .rt-option.rt-selected{color:#fff;font-weight:500;background:rgba(255,255,255,.12);}',
    '#' + BAR_ID + ' .rt-option.rt-hidden{display:none;}',
    '#' + BAR_ID + ' .rt-reset{',
    '  background:transparent;border:1px solid rgba(255,255,255,.2);color:rgba(255,255,255,.6);',
    '  border-radius:6px;padding:5px 10px;font-size:12px;cursor:pointer;white-space:nowrap;',
    '}',
    '#' + BAR_ID + ' .rt-reset:hover{border-color:rgba(255,255,255,.5);color:#fff;}',
    '#' + BAR_ID + ' .rt-status{font-size:11px;opacity:.45;margin-left:auto;white-space:nowrap;}',
    '#' + BAR_ID + ' .rt-spinner{',
    '  width:14px;height:14px;border:2px solid rgba(255,255,255,.25);',
    '  border-top-color:#fff;border-radius:50%;flex-shrink:0;',
    '  animation:rt-spin .6s linear infinite;display:none;',
    '}',
    '@keyframes rt-spin{to{transform:rotate(360deg)}}',
    'body.rise-has-bar{padding-top:48px !important;margin-top:0 !important;}'
  ].join('\n');

  /* ── INIT ──────────────────────────────────────────────────────── */
  function init() {
    injectStyles();
    injectBar();
    var saved = getSavedLang();
    if (saved) {
      setTriggerLabel(saved);
      translatePage(saved);
    }
    initObserver();
  }

  function injectStyles() {
    var s = document.createElement('style');
    s.id = 'rise-translate-styles';
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* ── BAR ────────────────────────────────────────────────────────── */
  function injectBar() {
    var bar = document.createElement('div');
    bar.id = BAR_ID;

    /* label */
    var label = document.createElement('span');
    label.className = 'rt-label';
    label.textContent = '🌐 Translate:';

    /* wrap holds trigger + panel */
    var wrap = document.createElement('div');
    wrap.className = 'rt-wrap';

    /* trigger button */
    var trigger = document.createElement('button');
    trigger.className = 'rt-trigger';
    trigger.type = 'button';
    trigger.innerHTML = '<span class="rt-trigger-text">Select language</span><span class="rt-caret">▼</span>';

    /* panel */
    var panel = document.createElement('div');
    panel.className = 'rt-panel';

    /* search input inside panel */
    var search = document.createElement('input');
    search.className = 'rt-search';
    search.type = 'text';
    search.placeholder = 'Search language…';
    search.setAttribute('autocomplete', 'off');

    /* language list */
    var list = document.createElement('div');
    list.className = 'rt-list';

    LANGUAGES.forEach(function (lang) {
      var opt = document.createElement('div');
      opt.className = 'rt-option';
      opt.textContent = lang.label;
      opt.setAttribute('data-code', lang.code);
      /* use mousedown so it fires before blur */
      opt.addEventListener('mousedown', function (e) {
        e.preventDefault();
        e.stopPropagation();
        selectLanguage(lang.code, list);
        closePanel(trigger, panel);
      });
      list.appendChild(opt);
    });

    search.addEventListener('input', function () {
      var q = this.value.toLowerCase();
      list.querySelectorAll('.rt-option').forEach(function (o) {
        o.classList.toggle('rt-hidden', o.textContent.toLowerCase().indexOf(q) === -1);
      });
    });

    /* ── KEY FIX: toggle open state via a boolean, don't rely on document listener ── */
    trigger.addEventListener('mousedown', function (e) {
      e.preventDefault();  /* stops blur from firing on the panel search input */
      e.stopPropagation();
      if (panelOpen) {
        closePanel(trigger, panel);
      } else {
        openPanel(trigger, panel, search);
      }
    });

    /* close only when focus fully leaves the bar */
    bar.addEventListener('focusout', function (e) {
      setTimeout(function () {
        if (!bar.contains(document.activeElement)) {
          closePanel(trigger, panel);
        }
      }, 150);
    });

    panel.appendChild(search);
    panel.appendChild(list);
    wrap.appendChild(trigger);
    wrap.appendChild(panel);

    /* spinner */
    var spinner = document.createElement('div');
    spinner.className = 'rt-spinner';

    /* reset button */
    var resetBtn = document.createElement('button');
    resetBtn.className = 'rt-reset';
    resetBtn.type = 'button';
    resetBtn.textContent = 'Reset';
    resetBtn.style.display = 'none';
    resetBtn.addEventListener('mousedown', function (e) {
      e.preventDefault();
      restorePage();
      clearSavedLang();
      activeTranslation = null;
      setTriggerLabel(null);
      resetBtn.style.display = 'none';
      status.textContent = 'Powered by Google Translate';
      list.querySelectorAll('.rt-option').forEach(function (o) { o.classList.remove('rt-selected'); });
    });

    /* status text */
    var status = document.createElement('span');
    status.className = 'rt-status';
    status.textContent = 'Powered by Google Translate';

    bar.appendChild(label);
    bar.appendChild(wrap);
    bar.appendChild(spinner);
    bar.appendChild(resetBtn);
    bar.appendChild(status);

    document.body.insertBefore(bar, document.body.firstChild);
    document.body.classList.add('rise-has-bar');

    /* store refs */
    bar._spinner  = spinner;
    bar._status   = status;
    bar._reset    = resetBtn;
    bar._list     = list;
  }

  function openPanel(trigger, panel, search) {
    panelOpen = true;
    panel.classList.add('rt-open');
    trigger.querySelector('.rt-caret').style.transform = 'rotate(180deg)';
    /* reset search */
    search.value = '';
    panel.querySelectorAll('.rt-option').forEach(function (o) { o.classList.remove('rt-hidden'); });
    setTimeout(function () { search.focus(); }, 30);
  }

  function closePanel(trigger, panel) {
    panelOpen = false;
    panel.classList.remove('rt-open');
    trigger.querySelector('.rt-caret').style.transform = '';
  }

  function setTriggerLabel(code) {
    var bar = document.getElementById(BAR_ID);
    if (!bar) return;
    var txt = bar.querySelector('.rt-trigger-text');
    if (!txt) return;
    if (!code) { txt.textContent = 'Select language'; return; }
    var lang = LANGUAGES.find(function (l) { return l.code === code; });
    txt.textContent = lang ? lang.label : code;
  }

  function selectLanguage(code, list) {
    var bar = document.getElementById(BAR_ID);
    if (!bar) return;
    setTriggerLabel(code);
    saveLang(code);
    activeTranslation = code;
    list.querySelectorAll('.rt-option').forEach(function (o) {
      o.classList.toggle('rt-selected', o.getAttribute('data-code') === code);
    });
    translatePage(code, bar._spinner, bar._status, bar._reset);
  }

  /* ── TEXT NODES ─────────────────────────────────────────────────── */
  function getTextNodes() {
    var skip  = ['SCRIPT','STYLE','NOSCRIPT','IFRAME','OPTION','SELECT'];
    var nodes = [];
    var walk  = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (p.closest && p.closest('#' + BAR_ID)) return NodeFilter.FILTER_REJECT;
        if (skip.indexOf(p.nodeName) !== -1) return NodeFilter.FILTER_REJECT;
        var txt = node.nodeValue.trim();
        if (!txt || txt.length < 2) return NodeFilter.FILTER_SKIP;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = walk.nextNode())) nodes.push(n);
    return nodes;
  }

  /* ── TRANSLATION ─────────────────────────────────────────────────── */
  function translatePage(lang, spinner, status, resetBtn) {
    var nodes = getTextNodes();
    var toTranslate = [];
    nodes.forEach(function (node) {
      if (!originalMap.has(node)) originalMap.set(node, node.nodeValue);
      var orig = originalMap.get(node).trim();
      if (orig.length < 2) return;
      cache[lang] = cache[lang] || {};
      if (!cache[lang][orig]) toTranslate.push(orig);
    });
    toTranslate = unique(toTranslate);

    var langObj = LANGUAGES.find(function (l) { return l.code === lang; });
    document.body.style.direction = (langObj && langObj.rtl) ? 'rtl' : '';

    if (toTranslate.length === 0) {
      applyTranslations(nodes, lang);
      if (resetBtn) resetBtn.style.display = 'inline-block';
      return;
    }

    if (spinner) spinner.style.display = 'block';
    if (status)  status.textContent = 'Translating…';

    pauseObserver();
    batchTranslate(toTranslate, lang, function (err) {
      if (spinner) spinner.style.display = 'none';
      if (err) {
        if (status) status.textContent = 'Translation failed';
        console.warn('[risecoursetranslate] Error:', err);
        resumeObserver();
        return;
      }
      applyTranslations(nodes, lang);
      if (status)   status.textContent = 'Translated: ' + (langObj ? langObj.label : lang);
      if (resetBtn) resetBtn.style.display = 'inline-block';
      resumeObserver();
    });
  }

  function applyTranslations(nodes, lang) {
    nodes.forEach(function (node) {
      var orig = originalMap.get(node);
      if (!orig) return;
      var trimmed = orig.trim();
      if (cache[lang] && cache[lang][trimmed]) {
        node.nodeValue = orig.match(/^\s*/)[0] + cache[lang][trimmed] + orig.match(/\s*$/)[0];
      }
    });
  }

  /* ── GOOGLE TRANSLATE ────────────────────────────────────────────── */
  function batchTranslate(texts, lang, done) {
    var chunks = chunkArray(texts, 50);
    var pending = chunks.length;
    var errored = null;
    if (!pending) return done(null);
    chunks.forEach(function (chunk) {
      googleTranslate(chunk, lang, function (err, results) {
        if (errored) return;
        if (err) { errored = err; return done(err); }
        chunk.forEach(function (orig, i) { cache[lang][orig] = results[i] || orig; });
        if (--pending === 0) done(null);
      });
    });
  }

  function googleTranslate(texts, targetLang, cb) {
    var SEP = '\n||||\n';
    var url = 'https://translate.googleapis.com/translate_a/single'
      + '?client=gtx&sl=auto&tl=' + encodeURIComponent(targetLang) + '&dt=t'
      + '&q=' + encodeURIComponent(texts.join(SEP));
    fetch(url)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        var raw = '';
        if (data && data[0]) data[0].forEach(function (s) { if (s && s[0]) raw += s[0]; });
        cb(null, raw.split('||||').map(function (s) { return s.replace(/^\n|\n$/g, ''); }));
      })
      .catch(function (e) { cb(e, null); });
  }

  /* ── RESTORE ─────────────────────────────────────────────────────── */
  function restorePage() {
    originalMap.forEach(function (orig, node) { node.nodeValue = orig; });
    document.body.style.direction = '';
  }

  /* ── OBSERVER ────────────────────────────────────────────────────── */
  function initObserver() {
    observer = new MutationObserver(function (mutations) {
      if (!activeTranslation || !isObserving) return;
      var relevant = mutations.some(function (m) {
        if (m.target && m.target.closest && m.target.closest('#' + BAR_ID)) return false;
        return m.addedNodes.length > 0;
      });
      if (relevant) {
        clearTimeout(observer._t);
        observer._t = setTimeout(function () {
          if (activeTranslation) translatePage(activeTranslation);
        }, 700);
      }
    });
    var target = document.querySelector('#app, #root, .content-wrapper') || document.body;
    observer.observe(target, { childList: true, subtree: true });
    isObserving = true;
  }

  function pauseObserver()  { isObserving = false; }
  function resumeObserver() { setTimeout(function () { isObserving = true; }, 800); }

  window.addEventListener('hashchange', function () {
    if (activeTranslation) setTimeout(function () { translatePage(activeTranslation); }, 400);
  });

  /* ── PERSISTENCE ─────────────────────────────────────────────────── */
  function saveLang(l)    { try { sessionStorage.setItem(STORAGE_KEY, l); }    catch(e){} }
  function clearSavedLang(){ try { sessionStorage.removeItem(STORAGE_KEY); }   catch(e){} }
  function getSavedLang() { try { return sessionStorage.getItem(STORAGE_KEY); } catch(e){ return null; } }

  /* ── UTILS ───────────────────────────────────────────────────────── */
  function unique(arr) { var s={}; return arr.filter(function(v){ return s[v]?false:(s[v]=true); }); }
  function chunkArray(arr, n) { var o=[]; for(var i=0;i<arr.length;i+=n) o.push(arr.slice(i,i+n)); return o; }

  /* ── BOOT ────────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
