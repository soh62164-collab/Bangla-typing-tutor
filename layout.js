/*
 * জাতীয় (Jatiyo) কিবোর্ড লেআউট — Bangladesh National Keyboard
 *
 * উৎস: Wikimedia Commons "KB-Bengali-Jatiyo.svg" (বাংলাদেশ কম্পিউটার কাউন্সিল
 * প্রকাশিত সফটওয়্যারের সংজ্ঞা অনুযায়ী আঁকা চার্ট)।
 * পরীক্ষার আগে অফিসিয়াল বিসিসি চার্টের সাথে মিলিয়ে নিন। কোনো কী ভুল মনে হলে
 * শুধু এই ফাইলের সংশ্লিষ্ট লাইন বদলালেই পুরো অ্যাপে ঠিক হয়ে যাবে।
 *
 * প্রতিটি কী KeyboardEvent.code দিয়ে চেনা হয় (কী-এর ভৌত অবস্থান),
 * তাই কম্পিউটার/ফোনে ইংরেজি লেআউট থাকলেও কোনো সমস্যা নেই।
 *
 *   n  = সাধারণ            s  = Shift
 *   a  = AltGr (ডান Alt)   as = AltGr + Shift
 *
 * কার-চিহ্ন ও নুক্তাযুক্ত বর্ণ ইচ্ছাকৃতভাবে \u কোডে লেখা (ভুল-ইউনিকোড এড়াতে)।
 */
(function (g) {
  'use strict';
  g.LAYOUT = {
    Backquote: { n: '`', s: '~' },
    Digit1: { n: '১', s: '!' },
    Digit2: { n: '২', s: '@' },
    Digit3: { n: '৩', s: '#' },
    Digit4: { n: '৪', s: '$' },
    Digit5: { n: '৫', s: '%' },
    Digit6: { n: '৬', s: '^' },
    Digit7: { n: '৭', s: '&' },
    Digit8: { n: '৮', s: '*' },
    Digit9: { n: '৯', s: '(' },
    Digit0: { n: '০', s: ')' },
    Minus: { n: '-', s: '_' },
    Equal: { n: '=', s: '+' },

    KeyQ: { n: 'ঙ', s: '\u0982' },                 // ঙ  | ং
    KeyW: { n: 'য', s: '\u09DF' },                 // য  | য়
    KeyE: { n: 'ড', s: 'ঢ' },
    KeyR: { n: 'প', s: 'ফ' },
    KeyT: { n: 'ট', s: 'ঠ' },
    KeyY: { n: 'চ', s: 'ছ' },
    KeyU: { n: 'জ', s: 'ঝ' },
    KeyI: { n: 'হ', s: 'ঞ' },
    KeyO: { n: 'গ', s: 'ঘ' },
    KeyP: { n: '\u09DC', s: '\u09DD' },            // ড় | ঢ়
    BracketLeft: { n: '[', s: '{' },
    BracketRight: { n: ']', s: '}' },
    Backslash: { n: '\\', s: '|' },

    KeyA: { n: '\u09C3', s: '\u09C4', a: 'ঋ', as: '\u09E0' },   // ৃ | ৄ | ঋ | ৠ
    KeyS: { n: '\u09C1', s: '\u09C2', a: 'উ', as: 'ঊ' },        // ু | ূ | উ | ঊ
    KeyD: { n: '\u09BF', s: '\u09C0', a: 'ই', as: 'ঈ' },        // ি | ী | ই | ঈ
    KeyF: { n: 'ব', s: 'ভ' },
    KeyG: { n: '\u09CD', s: '\u0964', a: '\u0965' },            // ্ (হসন্ত) | । | ॥
    KeyH: { n: '\u09BE', s: 'অ', a: 'আ' },                      // া | অ | আ
    KeyJ: { n: 'ক', s: 'খ', a: 'ক্ষ' },
    KeyK: { n: 'ত', s: 'থ', a: '\u09CE' },                      // ত | থ | ৎ
    KeyL: { n: 'দ', s: 'ধ' },
    Semicolon: { n: ';', s: ':' },
    Quote: { n: "'", s: '"' },

    KeyZ: { n: '\u0981', s: '\u0983' },                         // ঁ | ঃ
    KeyX: { n: '\u09CB', s: '\u09CC', a: 'ও', as: 'ঔ' },        // ো | ৌ | ও | ঔ
    KeyC: { n: '\u09C7', s: '\u09C8', a: 'এ', as: 'ঐ' },        // ে | ৈ | এ | ঐ
    KeyV: { n: 'র', s: 'ল' },
    KeyB: { n: 'ন', s: 'ণ' },
    KeyN: { n: 'স', s: 'ষ' },
    KeyM: { n: 'ম', s: 'শ' },
    Comma: { n: ',', s: '<' },
    Period: { n: '.', s: '>' },
    Slash: { n: '/', s: '?' },

    Space: { n: ' ', s: ' ' }
  };
})(typeof window !== 'undefined' ? window : globalThis);
