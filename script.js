(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* theme toggle */
  var btn = document.getElementById('theme');
  function isLight() {
    var t = root.getAttribute('data-theme');
    if (t) return t === 'light';
    return window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches;
  }
  try {
    var saved = localStorage.getItem('jp-theme');
    if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);
  } catch (e) {}

  btn.addEventListener('click', function () {
    var next = isLight() ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem('jp-theme', next);
    } catch (e) {}
  });

  /* reveal on scroll */
  var rv = [].slice.call(document.querySelectorAll('.rv'));
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    rv.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 70 + 'ms';
      io.observe(el);
    });
  } else {
    rv.forEach(function (el) {
      el.classList.add('in');
    });
  }

  /* cursor glow */
  var hero = document.querySelector('.hero'),
    glow = document.getElementById('glow');
  if (hero && !reduce) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      glow.style.setProperty('--mx', (e.clientX) + 'px');
      glow.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  }

  /* terminal typing */
  var term = document.getElementById('term');
  if (term && !reduce) {
    var lines = [].slice.call(term.querySelectorAll('.tl'));
    var info = lines.map(function (l) {
      var tx = l.querySelector('.tx');
      return { el: l, tx: tx, text: tx ? tx.textContent : '' };
    });
    lines.forEach(function (l) {
      l.style.display = 'none';
    });
    var i = 0;
    function next() {
      if (i >= info.length) return;
      var n = info[i++];
      n.el.style.display = 'block';
      if (n.tx) {
        var j = 0;
        n.tx.textContent = '';
        (function type() {
          if (j < n.text.length) {
            n.tx.textContent += n.text.charAt(j++);
            setTimeout(type, 34 + Math.random() * 30);
          } else {
            setTimeout(next, 320);
          }
        })();
      } else {
        setTimeout(next, i === info.length ? 0 : 220);
      }
    }
    setTimeout(next, 500);
  }

  /* EMI calculator */
  var fmt = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
  function inr(n) {
    return '₹ ' + fmt.format(Math.round(n));
  }
  var amt = document.getElementById('amt'),
    rate = document.getElementById('rate'),
    ten = document.getElementById('ten');

  function calc() {
    var P = +amt.value,
      R = +rate.value / 12 / 100,
      N = +ten.value;
    var emi = R === 0 ? P / N : (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
    var total = emi * N,
      interest = total - P;

    document.getElementById('emi').textContent = inr(emi);
    document.getElementById('amtv').textContent = inr(P);
    document.getElementById('ratev').textContent = (+rate.value) + '%';
    document.getElementById('tenv').textContent = N + ' months';
    document.getElementById('pr').textContent = inr(P);
    document.getElementById('int').textContent = inr(interest);
    document.getElementById('tot').textContent = inr(total);
    document.getElementById('donut').style.setProperty('--p', (P / total * 100).toFixed(1));
  }

  [amt, rate, ten].forEach(function (el) {
    el.addEventListener('input', calc);
  });
  calc();

  /* parking slots */
  var lot = document.getElementById('lot'),
    picked = document.getElementById('picked');
  var taken = { 'A2': 1, 'A5': 1, 'B1': 1, 'B4': 1, 'B6': 1, 'C3': 1 };

  ['A', 'B', 'C'].forEach(function (row) {
    for (var k = 1; k <= 6; k++) {
      var id = row + k,
        b = document.createElement('button');
      b.type = 'button';
      b.className = 'slot';
      b.textContent = id;
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-label', 'Slot ' + id + (taken[id] ? ', taken' : ''));
      if (taken[id]) b.disabled = true;
      lot.appendChild(b);
    }
  });

  lot.addEventListener('click', function (e) {
    var s = e.target.closest('.slot');
    if (!s || s.disabled) return;
    [].forEach.call(lot.children, function (c) {
      c.setAttribute('aria-pressed', 'false');
    });
    s.setAttribute('aria-pressed', 'true');
    picked.textContent = s.textContent;
  });

  if (lot.children[8]) {
    lot.children[8].click();
  }

  /* copy email */
  var copy = document.getElementById('copy'),
    mail = document.getElementById('mail');

  copy.addEventListener('click', function () {
    var text = mail.textContent.trim();

    function fallback() {
      var r = document.createRange();
      r.selectNodeContents(mail);
      var s = window.getSelection();
      s.removeAllRanges();
      s.addRange(r);
      copy.textContent = 'Selected, press copy';
    }

    function done() {
      copy.textContent = 'Copied ✓';
      setTimeout(function () {
        copy.textContent = 'Copy address';
      }, 2000);
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else {
        fallback();
      }
    } catch (e) {
      fallback();
    }
  });
})();