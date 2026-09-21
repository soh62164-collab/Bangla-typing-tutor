/* মূল যুক্তি (DOM ছাড়া): উল্টো ম্যাপ, অক্ষর-গুচ্ছ, পাঠ, অনুশীলন-জেনারেটর */
(function (g) {
  'use strict';
  var L = g.LAYOUT;
  var TEXTS = g.TEXTS;

  var RE_CONS = /[\u0995-\u09B9\u09DC-\u09DF]/;
  var RE_LETTER = /[\u0985-\u0994\u0995-\u09B9\u09DC-\u09DF\u09CE\u09E0]/;
  var RE_SIGN = /[\u09BE-\u09CC\u0981-\u0983]/;
  var VIRAMA = '\u09CD';
  function isCons(c) { return RE_CONS.test(c); }
  function isLetter(c) { return RE_LETTER.test(c); }
  function isSign(c) { return RE_SIGN.test(c); }

  function fixNukta(s) {
    return s.replace(/\u09AF\u09BC/g, '\u09DF').replace(/\u09A1\u09BC/g, '\u09DC').replace(/\u09A2\u09BC/g, '\u09DD');
  }

  function cps(s) { return Array.from(s); }

  var REV = {};
  ['n', 's', 'a', 'as'].forEach(function (layer) {
    Object.keys(L).forEach(function (code) {
      var o = L[code][layer];
      if (o && cps(o).length === 1 && !(o in REV)) REV[o] = { code: code, layer: layer };
    });
  });

  function typeOut(code, shift, altgr) {
    var m = L[code];
    if (!m) return null;
    var layer = altgr ? (shift ? 'as' : 'a') : (shift ? 's' : 'n');
    return m[layer] || null;
  }

  function typable(text) {
    return cps(text).every(function (c) { return c in REV; });
  }

  var FINGER_OF = {};
  function setF(f, codes) { codes.forEach(function (c) { FINGER_OF[c] = f; }); }
  setF('lp', ['Backquote', 'Digit1', 'KeyQ', 'KeyA', 'KeyZ', 'Tab', 'CapsLock', 'ShiftLeft', 'ControlLeft']);
  setF('lr', ['Digit2', 'KeyW', 'KeyS', 'KeyX']);
  setF('lm', ['Digit3', 'KeyE', 'KeyD', 'KeyC']);
  setF('li', ['Digit4', 'Digit5', 'KeyR', 'KeyT', 'KeyF', 'KeyG', 'KeyV', 'KeyB']);
  setF('th', ['Space', 'AltLeft', 'AltRight']);
  setF('ri', ['Digit6', 'Digit7', 'KeyY', 'KeyU', 'KeyH', 'KeyJ', 'KeyN', 'KeyM']);
  setF('rm', ['Digit8', 'KeyI', 'KeyK', 'Comma']);
  setF('rr', ['Digit9', 'KeyO', 'KeyL', 'Period']);
  setF('rp', ['Digit0', 'Minus', 'Equal', 'Backspace', 'KeyP', 'BracketLeft', 'BracketRight',
    'Backslash', 'Semicolon', 'Quote', 'Enter', 'Slash', 'ShiftRight', 'ControlRight']);
  var FINGER_NAME = {
    lp: 'বাম কড়ে আঙুল', lr: 'বাম অনামিকা', lm: 'বাম মধ্যমা', li: 'বাম তর্জনী', th: 'বুড়ো আঙুল',
    ri: 'ডান তর্জনী', rm: 'ডান মধ্যমা', rr: 'ডান অনামিকা', rp: 'ডান কড়ে আঙুল'
  };

  var SPECIAL = {
    Semicolon: ';', Quote: "'", Comma: ',', Period: '.', Slash: '/', BracketLeft: '[', BracketRight: ']',
    Backslash: '\\', Minus: '-', Equal: '=', Backquote: '`', Space: 'Space', ShiftLeft: 'Shift',
    ShiftRight: 'Shift', AltRight: 'AltGr', AltLeft: 'Alt'
  };
  function keyLabel(code) {
    if (code.indexOf('Key') === 0) return code.slice(3);
    if (code.indexOf('Digit') === 0) return code.slice(5);
    return SPECIAL[code] || code;
  }

  function disp(c) {
    if (c === ' ') return '␣';
    return (isSign(c) || c === VIRAMA) ? '\u25CC' + c : c;
  }

  function clusters(arr) {
    var out = [], i = 0;
    while (i < arr.length) {
      var st = i, c = arr[i];
      i++;
      if (isLetter(c)) {
        while (i + 1 < arr.length && arr[i] === VIRAMA && isCons(arr[i + 1])) i += 2;
        while (i < arr.length && isSign(arr[i])) i++;
      }
      out.push({ s: st, e: i });
    }
    return out;
  }

  var TX = {}, DROPPED = [];
  if (TEXTS) {
    Object.keys(TEXTS).forEach(function (k) {
      TX[k] = TEXTS[k].map(fixNukta).filter(function (t) {
        var ok = typable(t);
        if (!ok) DROPPED.push(t);
        return ok;
      });
    });
  }

  var LESSONS = [
    { id: 'intro', g: 'শুরুর কথা', t: 'আঙুলের অবস্থান ও বসার নিয়ম', type: 'intro' },

    { id: 'h1', g: 'হোম রো', t: 'প্রথম দুই কী', type: 'keys', keys: ['KeyF', 'KeyJ'] },
    { id: 'h2', g: 'হোম রো', t: 'D ও K', type: 'keys', keys: ['KeyD', 'KeyK'] },
    { id: 'h3', g: 'হোম রো', t: 'S ও L', type: 'keys', keys: ['KeyS', 'KeyL'] },
    { id: 'h4', g: 'হোম রো', t: 'A ও ;', type: 'keys', keys: ['KeyA', 'Semicolon'] },
    { id: 'h5', g: 'হোম রো', t: 'G ও H — হসন্ত ও আ-কার', type: 'keys', keys: ['KeyG', 'KeyH'] },

    { id: 't1', g: 'উপরের সারি', t: 'R ও U', type: 'keys', keys: ['KeyR', 'KeyU'] },
    { id: 't2', g: 'উপরের সারি', t: 'E ও I', type: 'keys', keys: ['KeyE', 'KeyI'] },
    { id: 't3', g: 'উপরের সারি', t: 'W ও O', type: 'keys', keys: ['KeyW', 'KeyO'] },
    { id: 't4', g: 'উপরের সারি', t: 'Q ও P', type: 'keys', keys: ['KeyQ', 'KeyP'] },
    { id: 't5', g: 'উপরের সারি', t: 'T ও Y', type: 'keys', keys: ['KeyT', 'KeyY'] },

    { id: 'b1', g: 'নিচের সারি', t: 'V ও N', type: 'keys', keys: ['KeyV', 'KeyN'] },
    { id: 'b2', g: 'নিচের সারি', t: 'C ও M', type: 'keys', keys: ['KeyC', 'KeyM'] },
    { id: 'b3', g: 'নিচের সারি', t: 'X ও B', type: 'keys', keys: ['KeyX', 'KeyB'] },
    { id: 'b4', g: 'নিচের সারি', t: 'Z, কমা, দাঁড়ি ও স্ল্যাশ', type: 'keys', keys: ['KeyZ', 'Comma', 'Period', 'Slash'] },

    { id: 'n1', g: 'সংখ্যা', t: '১ থেকে ৫', type: 'keys', keys: ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'] },
    { id: 'n2', g: 'সংখ্যা', t: '৬ থেকে ০', type: 'keys', keys: ['Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0'] },

    { id: 's1', g: 'Shift', t: 'ডান হাতের কী (বাম Shift)', type: 'keys', layer: 's',
      keys: ['KeyH', 'KeyJ', 'KeyK', 'KeyL', 'KeyU', 'KeyI', 'KeyO', 'KeyY', 'KeyN', 'KeyM'] },
    { id: 's2', g: 'Shift', t: 'বাম হাতের কী — উপরের সারি (ডান Shift)', type: 'keys', layer: 's',
      keys: ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyP'] },
    { id: 's3', g: 'Shift', t: 'বাম হাতের কী — মাঝের ও নিচের সারি (ডান Shift)', type: 'keys', layer: 's',
      keys: ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB'] },

    { id: 'c1', g: 'যুক্তাক্ষর', t: 'হসন্ত (্) দিয়ে যুক্তাক্ষর', type: 'text', src: 'conj', count: 10 },
    { id: 'v1', g: 'AltGr', t: 'স্বরবর্ণ ও ৎ (AltGr)', type: 'text', src: 'vowels', count: 10 },

    { id: 'w1', g: 'অনুশীলন', t: 'শব্দ', type: 'text', src: 'words', count: 12 },
    { id: 'w2', g: 'অনুশীলন', t: 'বাক্য', type: 'text', src: 'sent', count: 3 },

    { id: 'x1', g: 'পরীক্ষা', t: 'ছোট টাইপিং টেস্ট', type: 'test', src: 'sent', count: 4 },
    { id: 'x2', g: 'পরীক্ষা', t: 'বড় টাইপিং টেস্ট', type: 'test', src: 'sent', count: 8 }
  ];

  function lessonIndex(id) {
    for (var i = 0; i < LESSONS.length; i++) if (LESSONS[i].id === id) return i;
    return -1;
  }

  function charsOf(l) {
    return (l.keys || []).map(function (k) { return L[k] && L[k][l.layer || 'n']; }).filter(Boolean);
  }

  function knownBefore(idx) {
    var set = [];
    for (var i = 0; i < idx; i++) {
      var l = LESSONS[i];
      if (l.type === 'keys') charsOf(l).forEach(function (c) { if (set.indexOf(c) < 0) set.push(c); });
    }
    return set;
  }

  function rnd(n) { return Math.floor(Math.random() * n); }
  function pick(a) { return a[rnd(a.length)]; }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
  function shuffle(a) {
    var b = a.slice();
    for (var i = b.length - 1; i > 0; i--) { var j = rnd(i + 1); var t = b[i]; b[i] = b[j]; b[j] = t; }
    return b;
  }

  function genDrill(focus, known, nWords) {
    var fc = focus.filter(isLetter);
    var fs = focus.filter(isSign);
    var fo = focus.filter(function (c) { return !isLetter(c) && !isSign(c) && c !== VIRAMA; });
    var hasV = focus.indexOf(VIRAMA) >= 0;
    var baseC = uniq(fc.concat(known)).filter(isCons);
    var allSigns = uniq(fs.concat(known.filter(isSign)));
    var words = [], guard = 0;

    while (words.length < nWords && guard++ < 600) {
      var w = '', n, i;
      if (fo.length && !baseC.length && !fc.length && !fs.length) {
        n = 2 + rnd(3);
        for (i = 0; i < n; i++) w += pick(fo);
      } else if (fo.length && Math.random() < 0.3) {
        n = 1 + rnd(3);
        for (i = 0; i < n; i++) w += pick(fo);
      } else {
        n = 2 + rnd(2);
        for (i = 0; i < n; i++) {
          var useFocus = fc.length && Math.random() < 0.7;
          var c = useFocus ? pick(fc) : pick(baseC.length ? baseC : fc);
          if (!c) c = pick(fc);
          w += c;
          if (hasV && i < n - 1 && baseC.length && isCons(c) && Math.random() < 0.6) w += VIRAMA + pick(baseC);
          if (allSigns.length && isCons(w.charAt(w.length - 1)) && Math.random() < (fs.length ? 0.7 : 0.3)) {
            w += (fs.length && Math.random() < 0.7) ? pick(fs) : pick(allSigns);
          }
        }
      }
      if (w && (guard > 80 || words.indexOf(w) < 0)) words.push(w);
    }
    return words.join(' ');
  }

  function drillFor(lesson) {
    var idx = lessonIndex(lesson.id);
    if (lesson.type === 'keys') return genDrill(charsOf(lesson), knownBefore(idx), 14);
    var pool = shuffle(TX[lesson.src] || []).slice(0, lesson.count || 10);
    return pool.join(' ');
  }

  var Core = {
    LAYOUT: L, REV: REV, LESSONS: LESSONS, TX: TX, DROPPED: DROPPED,
    FINGER_OF: FINGER_OF, FINGER_NAME: FINGER_NAME,
    isCons: isCons, isLetter: isLetter, isSign: isSign, VIRAMA: VIRAMA,
    fixNukta: fixNukta, cps: cps, clusters: clusters, typable: typable, typeOut: typeOut,
    keyLabel: keyLabel, disp: disp, lessonIndex: lessonIndex, charsOf: charsOf,
    knownBefore: knownBefore, genDrill: genDrill, drillFor: drillFor
  };
  g.Core = Core;
  if (typeof module !== 'undefined' && module.exports) module.exports = Core;
})(typeof window !== 'undefined' ? window : globalThis);
