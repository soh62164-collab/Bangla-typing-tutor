/* বাংলা টাইপিং শিখি — অ্যাপের ইন্টারফেস ও টাইপিং ইঞ্জিন */
(function () {
  'use strict';
  const C = window.Core;
  const L = window.LAYOUT;
  const app = document.getElementById('app');

  const BN = '০১২৩৪৫৬৭৮৯';
  const bn = n => String(n).replace(/\d/g, d => BN[+d]);
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const $ = sel => document.querySelector(sel);

  const store = {
    get(k, def) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };
  let progress = store.get('bt_progress_v1', {});
  let weak = store.get('bt_weak_v1', {});

  const PASS_ACC = 90;
  let session = null;
  let lastLessonId = null;
  let agDown = false;

  const ROWS = [
    [['Backquote', 1], ['Digit1', 1], ['Digit2', 1], ['Digit3', 1], ['Digit4', 1], ['Digit5', 1], ['Digit6', 1],
      ['Digit7', 1], ['Digit8', 1], ['Digit9', 1], ['Digit0', 1], ['Minus', 1], ['Equal', 1], ['Backspace', 2, '⌫']],
    [['Tab', 1.5, 'Tab'], ['KeyQ', 1], ['KeyW', 1], ['KeyE', 1], ['KeyR', 1], ['KeyT', 1], ['KeyY', 1], ['KeyU', 1],
      ['KeyI', 1], ['KeyO', 1], ['KeyP', 1], ['BracketLeft', 1], ['BracketRight', 1], ['Backslash', 1.5]],
    [['CapsLock', 1.75, 'Caps'], ['KeyA', 1], ['KeyS', 1], ['KeyD', 1], ['KeyF', 1], ['KeyG', 1], ['KeyH', 1],
      ['KeyJ', 1], ['KeyK', 1], ['KeyL', 1], ['Semicolon', 1], ['Quote', 1], ['Enter', 2.25, 'Enter']],
    [['ShiftLeft', 2.25, 'Shift'], ['KeyZ', 1], ['KeyX', 1], ['KeyC', 1], ['KeyV', 1], ['KeyB', 1], ['KeyN', 1],
      ['KeyM', 1], ['Comma', 1], ['Period', 1], ['Slash', 1], ['ShiftRight', 2.75, 'Shift']],
    [['ControlLeft', 1.5, 'Ctrl'], ['AltLeft', 1.5, 'Alt'], ['Space', 9, ''], ['AltRight', 1.5, 'AltGr'], ['ControlRight', 1.5, 'Ctrl']]
  ];
  const HOME_KEYS = ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon'];

  function kbHTML(chartLayer) {
    let h = '<div class="kbwrap"><div class="kb">';
    for (const row of ROWS) {
      h += '<div class="kbrow">';
      for (const k of row) {
        const code = k[0], w = k[1], label = k[2];
        const f = C.FINGER_OF[code] || 'th';
        const m = L[code];
        let inner = '';
        if (label !== undefined) {
          inner = `<span class="kl">${esc(label)}</span>`;
        } else if (m) {
          if (chartLayer) {
            const o = m[chartLayer];
            inner = o ? `<span class="kc">${esc(C.disp(o))}</span>` : '';
          } else {
            inner = `<span class="kn">${esc(C.disp(m.n))}</span>`;
            if (m.s && m.s !== m.n) inner += `<span class="ks">${esc(C.disp(m.s))}</span>`;
            if (m.a) inner += `<span class="ka">${esc(C.disp(m.a))}</span>`;
          }
        }
        const bump = (code === 'KeyF' || code === 'KeyJ') ? ' bump' : '';
        h += `<div class="key f-${f}${bump}" data-code="${code}" style="--w:${w}">${inner}</div>`;
      }
      h += '</div>';
    }
    return h + '</div></div>';
  }

  function flashKey(code, cls) {
    const k = document.querySelector(`.key[data-code="${code}"]`);
    if (!k) return;
    k.classList.add(cls);
    setTimeout(() => k.classList.remove(cls), 150);
  }

  function chip(code, layer) {
    const ch = L[code] && L[code][layer];
    return `<span class="chip"><b>${esc(C.keyLabel(code))}</b>${ch ? esc(C.disp(ch)) : ''}</span>`;
  }

  function renderHome() {
    stopSession();
    document.title = 'বাংলা টাইপিং শিখি';
    const real = C.LESSONS.filter(l => l.type !== 'intro');
    const done = real.filter(l => progress[l.id] && progress[l.id].done).length;
    const next = real.find(l => !(progress[l.id] && progress[l.id].done));
    const pct = Math.round(done * 100 / real.length);

    let h = `
      <header class="hero">
        <h1>বাংলা টাইপিং শিখি</h1>
        <p>জাতীয় কিবোর্ড লেআউটে আঙুলের সঠিক অবস্থান থেকে শুরু করে পরীক্ষার গতি পর্যন্ত, ধাপে ধাপে।</p>
      </header>
      <div class="prog"><div class="pbar"><i style="width:${pct}%"></i></div><span>${bn(done)}/${bn(real.length)} পাঠ সম্পন্ন</span></div>
      <button class="cta" data-go="lesson:${next ? next.id : 'w2'}">${next ? 'চালিয়ে যান: ' + esc(next.g) + ', ' + esc(next.t) : 'সব পাঠ শেষ, আরেকবার বাক্য অনুশীলন করুন'}</button>
      <div class="tools">
        <button data-go="intro">আঙুলের অবস্থান</button>
        <button data-go="chart">লেআউট চার্ট</button>
      </div>`;

    const wk = Object.keys(weak).sort((a, b) => weak[b] - weak[a]).slice(0, 6);
    if (wk.length) {
      h += `<section class="weak"><h3>যে কী-তে বেশি ভুল হচ্ছে</h3><div class="chips">` +
        wk.map(k => { const p = k.split(':'); return chip(p[0], p[1]).replace('</span>', `<small>${bn(weak[k])}</small></span>`); }).join('') +
        `</div></section>`;
    }

    let group = '';
    for (const l of C.LESSONS) {
      if (l.type === 'intro') continue;
      if (l.g !== group) {
        if (group) h += '</div>';
        group = l.g;
        h += `<h2 class="grp">${esc(group)}</h2><div class="list">`;
      }
      const p = progress[l.id];
      const chars = l.type === 'keys' ? C.charsOf(l).slice(0, 6).map(c => esc(C.disp(c))).join(' ') : '';
      const st = p && p.done ? `<span class="ok">✓ ${bn(p.acc)}%</span>` : (p ? `<span class="mut">${bn(p.acc)}%</span>` : '');
      h += `<button class="row" data-go="lesson:${l.id}"><span class="rt">${esc(l.t)}</span><span class="rc">${chars}</span><span class="rs">${st}</span></button>`;
    }
    h += '</div><p class="note">যেকোনো পাঠ যেকোনো সময় খুলতে পারবেন। প্রতিটি পাঠে নির্ভুলতা ৯০%-এর বেশি হলে পাঠটি সম্পন্ন ধরা হয়।</p>';
    app.innerHTML = h;
    window.scrollTo(0, 0);
  }

  function renderIntro() {
    stopSession();
    const legend = [
      ['lp', 'বাম কড়ে আঙুল', 'A'], ['lr', 'বাম অনামিকা', 'S'], ['lm', 'বাম মধ্যমা', 'D'], ['li', 'বাম তর্জনী', 'F'],
      ['ri', 'ডান তর্জনী', 'J'], ['rm', 'ডান মধ্যমা', 'K'], ['rr', 'ডান অনামিকা', 'L'], ['rp', 'ডান কড়ে আঙুল', ';'],
      ['th', 'দুই বুড়ো আঙুল', 'Space']
    ];
    app.innerHTML = `
      <div class="bar"><button class="back" data-go="home" aria-label="হোমে ফিরুন">←</button><h2>আঙুলের অবস্থান ও বসার নিয়ম</h2></div>
      ${kbHTML()}
      <ul class="legend">${legend.map(x => `<li><i class="sw f-${x[0]}"></i><span>${x[1]}</span><b>${x[2]}</b></li>`).join('')}</ul>
      <div class="prose">
        <h3>হোম রো</h3>
        <p>বাম হাতের চার আঙুল <b>A S D F</b>-এ, ডান হাতের চার আঙুল <b>J K L ;</b>-এ থাকবে। দুই বুড়ো আঙুল থাকবে স্পেসবারের উপর। টাইপ করার পর প্রতিবার আঙুল এই ঘরে ফিরিয়ে আনুন।</p>
        <p>বেশিরভাগ কিবোর্ডে <b>F</b> ও <b>J</b> কী-তে ছোট একটা উঁচু দাগ থাকে। দুই তর্জনী দিয়ে দাগ ছুঁয়ে না তাকিয়েই হোম রো খুঁজে নিন।</p>
        <h3>প্রতিটি কী, একটি নির্দিষ্ট আঙুল</h3>
        <p>উপরের ছবিতে কী-এর রং বলে দেয় কোন আঙুল সেটা চাপবে। উপরের সারির কী-তে আঙুল বাড়িয়ে চাপুন, চাপার পর হোম রোতে ফিরে আসুন।</p>
        <h3>Shift ও AltGr</h3>
        <p>বাম হাতের কী-তে Shift লাগলে ডান Shift, ডান হাতের কী-তে লাগলে বাম Shift চাপুন। <b>AltGr</b> মানে স্পেসবারের ডান পাশের Alt কী। এটা ডান বুড়ো আঙুলে চাপুন। ফোনের OTG কিবোর্ডেও একই।</p>
        <h3>বসা ও অভ্যাস</h3>
        <p>পিঠ সোজা, কনুই প্রায় ৯০ ডিগ্রিতে, কবজি হালকা ভাসানো। কিবোর্ডের দিকে তাকাবেন না, ভুল হলেও নয়। শুরুতে গতির চেয়ে নির্ভুলতা বেশি জরুরি। নির্ভুলতা ৯৫%-এর উপরে এলে গতি বাড়ান।</p>
      </div>
      <button class="cta" data-go="lesson:h1">প্রথম পাঠ শুরু করুন</button>`;
    HOME_KEYS.forEach(c => { const k = $(`.key[data-code="${c}"]`); if (k) k.classList.add('home'); });
    window.scrollTo(0, 0);
  }

  const LAYER_NAMES = { n: 'সাধারণ', s: 'Shift', a: 'AltGr', as: 'AltGr + Shift' };
  function renderChart(layer) {
    stopSession();
    app.innerHTML = `
      <div class="bar"><button class="back" data-go="home" aria-label="হোমে ফিরুন">←</button><h2>জাতীয় কিবোর্ড লেআউট চার্ট</h2></div>
      <div class="tabs">${Object.keys(LAYER_NAMES).map(k => `<button class="${k === layer ? 'on' : ''}" data-go="layer:${k}">${LAYER_NAMES[k]}</button>`).join('')}</div>
      ${kbHTML(layer)}
      <p class="note">এই চার্ট উইকিমিডিয়া কমন্সের "KB-Bengali-Jatiyo.svg" (বিসিসি-প্রকাশিত সফটওয়্যারের সংজ্ঞা অনুযায়ী) থেকে নেওয়া। পরীক্ষার আগে অফিসিয়াল বিসিসি চার্টের সাথে মিলিয়ে নিন।</p>`;
    window.scrollTo(0, 0);
  }

  function startLesson(id) {
    const idx = C.lessonIndex(id);
    if (idx < 0) return renderHome();
    const les = C.LESSONS[idx];
    if (les.type === 'intro') return renderIntro();
    stopSession();
    lastLessonId = id;
    const target = C.cps(C.drillFor(les));
    session = {
      les, idx, mode: les.type === 'test' ? 'test' : 'learn', target, cl: C.clusters(target),
      pos: 0, typed: [], good: 0, err: 0, strokes: 0, t0: 0, timer: null, weak: {},
      showKb: les.type !== 'test', done: false, errFlash: false
    };
    renderLesson();
  }

  function renderLesson() {
    const s = session, les = s.les;
    document.title = les.t + ' — বাংলা টাইপিং শিখি';
    const newKeys = les.type === 'keys'
      ? `<div class="newkeys"><span>নতুন কী</span>${les.keys.map(k => chip(k, les.layer || 'n')).join('')}</div>` : '';
    const intro = s.mode === 'test'
      ? 'পরীক্ষার মতো টাইপ করুন। ভুল হলে Backspace চাপুন।'
      : 'কিবোর্ড সংযুক্ত করে যেকোনো কী চাপুন। ভুল কী চাপলে আবার সঠিক কী চাপুন।';
    app.innerHTML = `
      <div class="bar"><button class="back" data-go="home" aria-label="হোমে ফিরুন">←</button><h2>${esc(les.g)}: ${esc(les.t)}</h2></div>
      ${newKeys}
      <div class="stats">
        <div><b id="sWpm">০</b><small>WPM</small></div>
        <div><b id="sAcc">—</b><small>নির্ভুলতা</small></div>
        <div><b id="sTime">০:০০</b><small>সময়</small></div>
      </div>
      <div class="pbar"><i id="pfill" style="width:0%"></i></div>
      <div class="textbox" id="tbox"></div>
      <div class="hint" id="hint">${intro}</div>
      <div id="kbslot">${s.showKb ? kbHTML() : ''}</div>
      <div class="foot">
        <button data-go="togglekb">কিবোর্ড দেখান বা লুকান</button>
        <button data-go="restart">নতুন করে শুরু</button>
      </div>
      <p class="rot">ফোন আড়াআড়ি ধরলে কিবোর্ডের ছবি বড় দেখাবে।</p>`;
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    updateText();
    updateHint();
    window.scrollTo(0, 0);
  }

  function stopSession() {
    if (session && session.timer) clearInterval(session.timer);
    session = null;
  }

  function matches(s) {
    let m = 0;
    for (let i = 0; i < s.typed.length; i++) if (s.typed[i] === s.target[i]) m++;
    return m;
  }
  function calc(s) {
    const correct = s.mode === 'learn' ? s.pos : matches(s);
    const secs = s.t0 ? (Date.now() - s.t0) / 1000 : 0;
    const mins = Math.max(secs, 5) / 60;
    const wpm = s.t0 ? Math.round((correct / 5) / mins) : 0;
    let acc;
    if (s.mode === 'learn') acc = (s.good + s.err) ? Math.round(s.good * 100 / (s.good + s.err)) : null;
    else acc = s.typed.length ? Math.round(correct * 100 / s.typed.length) : null;
    return { correct, secs, wpm, acc };
  }
  const fmtTime = secs => { const m = Math.floor(secs / 60), r = Math.floor(secs % 60); return bn(m) + ':' + bn(String(r).padStart(2, '0')); };

  function updateText() {
    const s = session, box = $('#tbox');
    if (!s || !box) return;
    const pos = s.mode === 'learn' ? s.pos : s.typed.length;
    let h = '', curIdx = -1;
    s.cl.forEach((c, i) => {
      const txt = s.target.slice(c.s, c.e).join('');
      let cls = 'ch';
      if (txt === ' ') cls += ' sp';
      if (s.mode === 'learn') {
        if (pos >= c.e) cls += ' ok';
        else if (pos >= c.s) { cls += ' cur'; curIdx = i; if (s.errFlash) cls += ' flash'; }
      } else if (pos >= c.e) {
        let same = true;
        for (let j = c.s; j < c.e; j++) if (s.typed[j] !== s.target[j]) same = false;
        cls += same ? ' ok' : ' bad';
      } else if (pos >= c.s) { cls += ' cur'; curIdx = i; }
      h += `<span class="${cls}" data-i="${i}">${esc(txt === ' ' ? ' ' : txt)}</span>`;
    });
    box.innerHTML = h;
    const cur = box.querySelector ? box.querySelector('.cur') : null;
    if (cur && box.scrollHeight > box.clientHeight) box.scrollTop = Math.max(0, cur.offsetTop - box.clientHeight / 3);
  }

  function updateStats() {
    const s = session;
    if (!s) return;
    const r = calc(s);
    const set = (id, v) => { const e = $(id); if (e) e.textContent = v; };
    set('#sWpm', bn(r.wpm));
    set('#sAcc', r.acc === null ? '—' : bn(r.acc) + '%');
    set('#sTime', fmtTime(r.secs));
    const pos = s.mode === 'learn' ? s.pos : s.typed.length;
    const f = $('#pfill');
    if (f) f.style.width = Math.min(100, Math.round(pos * 100 / s.target.length)) + '%';
  }

  function updateHint() {
    const s = session, hint = $('#hint');
    if (!s || !hint) return;
    document.querySelectorAll('.key.target').forEach(k => k.classList.remove('target'));
    if (s.mode !== 'learn') { if (s.t0) hint.innerHTML = ''; return; }
    const ch = s.target[s.pos];
    const info = ch ? C.REV[ch] : null;
    if (!info) { hint.innerHTML = ''; return; }
    const f = C.FINGER_OF[info.code] || 'th';
    let mods = '', modKeys = [];
    if (info.layer === 's' || info.layer === 'as') {
      const code = f.charAt(0) === 'l' ? 'ShiftRight' : 'ShiftLeft';
      modKeys.push(code);
      mods += `<span class="chip mod">${f.charAt(0) === 'l' ? 'ডান' : 'বাম'} Shift</span>`;
    }
    if (info.layer === 'a' || info.layer === 'as') { modKeys.push('AltRight'); mods += '<span class="chip mod">AltGr</span>'; }
    hint.innerHTML = `<span class="hk f-${f}">${esc(C.keyLabel(info.code))}</span><span>${C.FINGER_NAME[f]}</span>${mods}`;
    [info.code].concat(modKeys).forEach(c => { const k = $(`.key[data-code="${c}"]`); if (k) k.classList.add('target'); });
  }

  const MODS = ['ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight', 'CapsLock', 'ContextMenu'];

  function onKey(e) {
    if (e.code === 'AltRight') agDown = true;
    const s = session;
    if (!s || s.done) return;
    if (MODS.indexOf(e.code) >= 0) return;
    if (e.key === 'Escape') { renderHome(); return; }
    const ag = agDown || (e.getModifierState && e.getModifierState('AltGraph')) || (e.ctrlKey && e.altKey);
    if ((e.ctrlKey || e.metaKey) && !ag) return;
    if (e.altKey && !ag) return;
    if (e.code === 'Enter' || e.code === 'Tab') { e.preventDefault(); return; }

    if (e.code === 'Backspace') {
      e.preventDefault();
      if (s.mode === 'test' && s.typed.length && !e.repeat) {
        s.typed.pop(); s.strokes++;
        flashKey('Backspace', 'press');
        updateText(); updateStats();
      }
      return;
    }

    const out = C.typeOut(e.code, e.shiftKey, ag);
    if (out === null) { if (L[e.code]) e.preventDefault(); return; }
    e.preventDefault();
    if (e.repeat) return;

    if (!s.t0) { s.t0 = Date.now(); s.timer = setInterval(updateStats, 250); }
    const chars = C.cps(out);
    flashKey(e.code, 'press');
    s.strokes++;

    if (s.mode === 'learn') {
      const exp = s.target.slice(s.pos, s.pos + chars.length);
      if (exp.join('') === chars.join('')) {
        s.pos += chars.length; s.good++;
      } else {
        s.err++;
        const need = C.REV[s.target[s.pos]];
        if (need) { const k = need.code + ':' + need.layer; s.weak[k] = (s.weak[k] || 0) + 1; }
        flashKey(e.code, 'wrong');
        s.errFlash = true;
        setTimeout(() => { if (session === s) { s.errFlash = false; updateText(); } }, 220);
      }
    } else {
      for (const c of chars) if (s.typed.length < s.target.length) s.typed.push(c);
    }

    updateText(); updateHint(); updateStats();
    const pos = s.mode === 'learn' ? s.pos : s.typed.length;
    if (pos >= s.target.length) finish();
  }

  function finish() {
    const s = session;
    if (!s || s.done) return;
    s.done = true;
    if (s.timer) clearInterval(s.timer);
    if (s.mode === 'test') {
      for (let i = 0; i < s.typed.length; i++) {
        if (s.typed[i] !== s.target[i]) {
          const need = C.REV[s.target[i]];
          if (need) { const k = need.code + ':' + need.layer; s.weak[k] = (s.weak[k] || 0) + 1; }
        }
      }
    }
    const r = calc(s);
    const acc = r.acc === null ? 0 : r.acc;
    const pass = acc >= PASS_ACC;
    const prev = progress[s.les.id] || {};
    progress[s.les.id] = {
      done: !!(prev.done || pass),
      acc: Math.max(prev.acc || 0, acc),
      wpm: Math.max(prev.wpm || 0, r.wpm)
    };
    store.set('bt_progress_v1', progress);
    Object.keys(s.weak).forEach(k => { weak[k] = (weak[k] || 0) + s.weak[k]; });
    store.set('bt_weak_v1', weak);
    setTimeout(() => renderResult(s, r, acc, pass), 350);
  }

  function renderResult(s, r, acc, pass) {
    const wk = Object.keys(s.weak).sort((a, b) => s.weak[b] - s.weak[a]).slice(0, 6);
    const errs = s.mode === 'learn' ? s.err : (s.typed.length - matches(s));
    const hasNext = C.LESSONS.slice(s.idx + 1).some(l => l.type !== 'intro');
    app.innerHTML = `
      <div class="bar"><button class="back" data-go="home" aria-label="হোমে ফিরুন">←</button><h2>ফলাফল: ${esc(s.les.t)}</h2></div>
      <div class="result">
        <div><b>${bn(r.wpm)}</b><small>WPM</small></div>
        <div><b class="${pass ? 'ok' : 'bad'}">${bn(acc)}%</b><small>নির্ভুলতা</small></div>
        <div><b>${fmtTime(r.secs)}</b><small>সময়</small></div>
        <div><b>${bn(errs)}</b><small>ভুল</small></div>
      </div>
      <p class="verdict ${pass ? 'ok' : 'bad'}">${pass
        ? 'নির্ভুলতা ৯০%-এর উপরে, পাঠটি সম্পন্ন। এবার পরের পাঠে যেতে পারেন।'
        : 'নির্ভুলতা ৯০%-এর নিচে। গতি নয়, আগে নির্ভুলতা বাড়ান। আবার চেষ্টা করুন।'}</p>
      ${wk.length ? `<section class="weak"><h3>এই অনুশীলনে যেসব কী-তে ভুল হয়েছে</h3><div class="chips">${wk.map(k => { const p = k.split(':'); return chip(p[0], p[1]); }).join('')}</div></section>` : ''}
      <div class="actions">
        <button class="cta" data-go="retry">আবার অনুশীলন</button>
        ${hasNext ? '<button data-go="next">পরের পাঠ</button>' : ''}
        <button data-go="home">সব পাঠ</button>
      </div>`;
    window.scrollTo(0, 0);
  }

  app.addEventListener('click', e => {
    const b = e.target.closest ? e.target.closest('[data-go]') : null;
    if (!b) return;
    const a = b.dataset.go;
    if (a === 'home') renderHome();
    else if (a === 'intro') renderIntro();
    else if (a === 'chart') renderChart('n');
    else if (a.indexOf('layer:') === 0) renderChart(a.slice(6));
    else if (a.indexOf('lesson:') === 0) startLesson(a.slice(7));
    else if (a === 'restart' || a === 'retry') startLesson(lastLessonId);
    else if (a === 'next') {
      const idx = C.lessonIndex(lastLessonId);
      const nx = C.LESSONS.slice(idx + 1).find(l => l.type !== 'intro');
      if (nx) startLesson(nx.id); else renderHome();
    } else if (a === 'togglekb') {
      if (!session) return;
      session.showKb = !session.showKb;
      const slot = $('#kbslot');
      if (slot) slot.innerHTML = session.showKb ? kbHTML() : '';
      updateHint();
    }
  });

  document.addEventListener('keydown', onKey);
  document.addEventListener('keyup', e => { if (e.code === 'AltRight') agDown = false; });
  window.addEventListener('blur', () => { agDown = false; });

  renderHome();
})();
