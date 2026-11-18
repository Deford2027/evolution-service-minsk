// Поведение главной: меню, маска телефона, согласие, отправка, ленты, таб-бар, окно «Связаться», фото в окне, появление блоков.
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Меню на узких экранах
  var hdr = $('.hdr'), burger = $('.menu-btn');
  if (burger) burger.addEventListener('click', function () {
    var o = hdr.classList.toggle('open'); burger.setAttribute('aria-expanded', o);
  });
  $$('.mnu a').forEach(function (a) { a.addEventListener('click', function () { hdr.classList.remove('open'); }); });
  document.addEventListener('click', function (e) { if (!hdr.contains(e.target)) { hdr.classList.remove('open'); if (burger) burger.setAttribute('aria-expanded', false); } });
  // Марки и модели: вкладки-логотипы и поиск модели
  var mk = $('.mk');
  if (mk) {
    var mkTabs = $$('.mk-tab', mk), mkBar = $('.mk-tabs', mk), mkPanels = $$('.mk-panel', mk);
    var mkRes = $('#mk-res'), mkItems = $$('.mk-r', mk), mkN = $('.mk-res__n', mk), mkNone = $('.mk-none', mk);
    var mkQ = $('#mk-q'), mkX = $('.mk-find__x');
    var mkSel = function (t, focus) {
      mkTabs.forEach(function (x) { var on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute('aria-controls')).hidden = !on; });
      if (focus) t.focus();
      if (t.scrollIntoView && mkBar.scrollWidth > mkBar.clientWidth) mkBar.scrollTo({ left: t.offsetLeft - mkBar.clientWidth / 2 + t.offsetWidth / 2, behavior: 'smooth' });
    };
    mkTabs.forEach(function (t, i) {
      t.addEventListener('click', function () { mkSel(t); });
      t.addEventListener('keydown', function (e) {
        var d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!d) return;
        e.preventDefault(); mkSel(mkTabs[(i + d + mkTabs.length) % mkTabs.length], true);
      });
    });
    // кириллица → латиница, чтобы «л7», «с05», «ех5» находили L7, S05, EX5
    var tr = { 'а':'a','в':'b','е':'e','к':'k','м':'m','н':'h','о':'o','р':'p','с':'s','т':'t','у':'y','х':'x','л':'l','д':'d','и':'i','п':'p','г':'g','з':'z','ф':'f','ю':'yu','я':'ya','ц':'c','ч':'ch','ш':'sh','б':'b','ь':'','ъ':'','й':'i','ы':'y','э':'e','ж':'j','ё':'e' };
    var norm = function (s) { return s.toLowerCase().replace(/[\s\-–_.,]+/g, ''); };
    var lat = function (s) { return s.replace(/[а-яё]/g, function (c) { return tr[c] != null ? tr[c] : c; }); };
    mkItems.forEach(function (a) {
      a._t = a.getAttribute('data-q').toLowerCase().split(/\s+/).filter(Boolean);
      var br = a.querySelector('.mk-rl').textContent, md = a.querySelector('b').textContent;
      a._m = [norm(md), norm(br + md)];
    });
    // слово запроса совпадает с началом любого слова (марка, модель, русское написание),
    // либо весь запрос без пробелов – часть названия модели («ex 5» → EX5)
    var hit = function (a, words, whole) {
      var pre = function (w) { return a._t.some(function (x) { return x.indexOf(w) === 0; }); };
      if (words.every(function (w) { var w1 = norm(w); return pre(w1) || pre(lat(w1)); })) return true;
      return [whole, lat(whole)].some(function (q) { return q.length > 1 && a._m.some(function (m) { return m.indexOf(q) > -1; }); });
    };
    var mkFind = function () {
      var raw = mkQ.value.trim().toLowerCase();
      var words = raw.split(/\s+/).filter(Boolean);
      mkX.hidden = !raw;
      if (!words.length) { mkRes.hidden = true; mkBar.hidden = false; mkTabs.forEach(function (t) { if (t.getAttribute('aria-selected') === 'true') mkSel(t); }); return; }
      mkBar.hidden = true; mkPanels.forEach(function (p) { p.hidden = true; }); mkRes.hidden = false;
      var n = 0;
      mkItems.forEach(function (a) {
        var ok = hit(a, words, norm(raw));
        a.hidden = !ok; if (ok) n++;
      });
      mkNone.hidden = n > 0;
      mkN.textContent = n ? 'Нашли: ' + n + ' ' + (n % 10 === 1 && n % 100 !== 11 ? 'модель' : (n % 10 > 1 && n % 10 < 5 && (n % 100 < 12 || n % 100 > 14)) ? 'модели' : 'моделей') : '';
    };
    mkQ.addEventListener('input', mkFind);
    mkQ.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { mkQ.value = ''; mkFind(); }
      if (e.key === 'Enter') { var f = mkItems.filter(function (a) { return !a.hidden; }); if (f.length === 1) location.href = f[0].href; }
    });
    mkX.addEventListener('click', function () { mkQ.value = ''; mkFind(); mkQ.focus(); });
    if (mkQ.value) mkFind();
  }

  // Шапка – стекло на первом экране, тёмное стекло ниже; прячется при прокрутке вниз, появляется при прокрутке вверх
  var lastY = window.scrollY;
  function solid() {
    var y = window.scrollY, d = y - lastY;
    hdr.classList.toggle('solid', y > 120);
    if (y < 120 || hdr.classList.contains('open')) hdr.classList.remove('hide');
    else if (d > 6) hdr.classList.add('hide');
    else if (d < -6) hdr.classList.remove('hide');
    if (Math.abs(d) > 6 || y < 120) lastY = y;
  }
  window.addEventListener('scroll', solid, { passive: true }); solid();
  hdr.addEventListener('focusin', function () { hdr.classList.remove('hide'); });

  // Заявка во всплывающем окне: все ссылки на #zapis открывают копию формы этой страницы
  var zapForm = $('#zapis form[data-form]'), pop = null, popBox = null, popBack = null;
  if (zapForm) {
    pop = document.createElement('div'); pop.className = 'pop'; pop.setAttribute('aria-hidden', 'true');
    pop.innerHTML = '<div class="pop__bg" data-pop-close></div><div class="pop__box" role="dialog" aria-modal="true" aria-labelledby="pop-h"><button class="pop__x" type="button" data-pop-close aria-label="Закрыть">×</button><b class="pop__h" id="pop-h"></b><p class="pop__sub">Оставьте телефон – перезвоним, уточним машину и подберём удобное время.</p></div>';
    popBox = $('.pop__box', pop);
    var pf = zapForm.cloneNode(true);
    pf.classList.remove('w-form', 'form--row'); pf.classList.add('pop__form');
    $$('h2', pf).forEach(function (h) { h.parentNode.removeChild(h); });
    $$('[id]', pf).forEach(function (el) { el.id += '-pop'; });
    $$('label[for]', pf).forEach(function (l) { l.htmlFor += '-pop'; });
    popBox.appendChild(pf);
    var popCall = document.createElement('p'); popCall.className = 'pop__call';
    popCall.innerHTML = 'Или позвоните: <a href="tel:+375291358888">+375 29 135-88-88</a>';
    popBox.appendChild(popCall);
    document.body.appendChild(pop);
  }
  function popSet(o, title) {
    if (!pop) return;
    if (o) { popBack = document.activeElement; $('#pop-h').textContent = title || 'Записаться на сервис'; }
    pop.classList.toggle('open', o); pop.setAttribute('aria-hidden', !o);
    document.documentElement.classList.toggle('pop-lock', o);
    if (o) setTimeout(function () { var i = $('input:not([type=checkbox])', pop); if (i && !$('.sent', pop)) i.focus({ preventScroll: true }); }, 80);
    else if (popBack && popBack.focus) popBack.focus({ preventScroll: true });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href="#zapis"]');
    if (a && pop && !a.closest('.pop') && !a.closest('#zapis')) {
      e.preventDefault();
      var t = a.textContent.replace(/\s+/g, ' ').trim();
      setTimeout(function () { popSet(true, t); }, 0);
      return;
    }
    if (e.target.closest('[data-pop-close]')) popSet(false);
  });
  document.addEventListener('keydown', function (e) {
    if (!pop || !pop.classList.contains('open')) return;
    if (e.key === 'Escape') popSet(false);
    if (e.key === 'Tab') {
      var f = $$('a[href], button:not([disabled]), input', popBox).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  // Маска телефона Беларуси: +375 (XX) XXX-XX-XX
  function mask(v) {
    var d = v.replace(/\D/g, '');
    while (d.indexOf('375') === 0) d = d.slice(3);
    if (d.indexOf('80') === 0) d = d.slice(2);
    d = d.slice(0, 9);
    var out = '+375';
    if (d.length) out += ' (' + d.slice(0, 2);
    if (d.length >= 2) out += ')';
    if (d.length > 2) out += ' ' + d.slice(2, 5);
    if (d.length > 5) out += '-' + d.slice(5, 7);
    if (d.length > 7) out += '-' + d.slice(7, 9);
    return { text: out, full: d.length === 9, d: d };
  }
  $$('form[data-form]').forEach(function (f) {
    var tel = $('[data-mask]', f), agree = $('[data-agree]', f), btn = $('button[type=submit]', f);
    function check() { btn.disabled = !(agree.checked && mask(tel.value).full); btn.title = btn.disabled ? 'Введите номер полностью и отметьте согласие' : ''; }
    var prev = '';
    tel.addEventListener('focus', function () { if (!tel.value) tel.value = '+375 ('; });
    tel.addEventListener('input', function (e) {
      var m = mask(tel.value);
      if (e && e.inputType === 'deleteContentBackward' && m.text === prev) m = mask('+375' + m.d.slice(0, -1));
      tel.value = prev = m.text; check();
    });
    tel.addEventListener('blur', function () { if (tel.value === '+375 (' || tel.value === '+375') tel.value = ''; });
    agree.addEventListener('change', check);
    // Дизайн-макет: заявка никуда не уходит, показываем экран «Заявка принята»
    f.addEventListener('submit', function (e) { e.preventDefault(); if (btn.disabled) return; f.classList.add('sent');
      var ok = $('.ok', f); if (ok) { ok.tabIndex = -1; ok.focus({ preventScroll: true }); ok.scrollIntoView({ block: 'center' }); } });
  });

  // Ленты вбок: счётчик «N / всего» и точки
  $$('.lenta').forEach(function (l) {
    var c = l.nextElementSibling;
    if (!c || !c.classList.contains('cnt')) return;
    var dots = $$('b', c), span = $('span', c), n = l.children.length;
    function upd() {
      var w = l.children[0].getBoundingClientRect().width + 12;
      var i = Math.min(n - 1, Math.round(l.scrollLeft / w));
      span.textContent = (i + 1) + ' / ' + n + ' · листайте вбок';
      dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
    }
    l.addEventListener('scroll', upd, { passive: true }); upd();
  });

  // Таб-бар показывается, когда первый экран ушёл вверх
  var tab = $('.tab'), hero = $('.hero');
  if (tab && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { tab.classList.toggle('show', !es[0].isIntersecting); }, { threshold: 0.05 }).observe(hero);
  }

  // Окно «Связаться»
  var sheet = $('.sheet');
  function sheetSet(o) { sheet.classList.toggle('open', o); sheet.setAttribute('aria-hidden', !o); document.body.style.overflow = o ? 'hidden' : ''; }
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-sheet-open]')) sheetSet(true);
    else if (e.target.closest('[data-sheet-close]')) sheetSet(false);
  });

  // Контентные фото – окном с крестиком, Esc закрывает
  var lb = $('.lb'), lbImg = $('img', lb);
  function lbSet(src, alt) { if (src) { lbImg.src = src; lbImg.alt = alt || ''; } lb.classList.toggle('open', !!src); lb.setAttribute('aria-hidden', !src); document.body.style.overflow = src ? 'hidden' : ''; }
  $$('[data-zoom]').forEach(function (img) { img.addEventListener('click', function () { lbSet(img.currentSrc || img.src, img.alt); }); });
  lb.addEventListener('click', function (e) { if (e.target !== lbImg) lbSet(null); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { lbSet(null); sheetSet(false); hdr.classList.remove('open'); if (burger) burger.setAttribute('aria-expanded', false); } });

  // Появление блоков: только прозрачность и сдвиг, вёрстка не прыгает
  var rv = $$('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });
})();
