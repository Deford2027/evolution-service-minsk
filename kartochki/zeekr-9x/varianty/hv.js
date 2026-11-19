/* Варианты первого экрана: цвета кузова (CSS-кружки) + переключатель A/B/C/D.
   Выбор цвета передаётся в скрытый #dots карточки – форма заявки и сохранённый цвет работают как раньше. */
(function () {
  var C = window.CAR, d = document, root = d.documentElement;
  var $$ = function (s) { return [].slice.call(d.querySelectorAll(s)) };
  /* цвета сняты с официальных кружков конфигуратора (верх / середина / низ) */
  var SW = {
    Z011PC002: ['#505050', '#1f1f1f', '#0e0e0e'],
    Z011PC003: ['#f7f6f9', '#e0e2e4', '#c3c5c6'],
    Z011PC045: ['#938a7a', '#696051', '#413930'],
    Z011PC004: ['#d6d8da', '#bbbdbf', '#93949a'],
    Z011PC005: ['#6a6a6c', '#545358', '#36343c'],
    Z011PC006: ['#786e81', '#55515e', '#2f2b33']
  };
  var find = function (code) { return C.colors.filter(function (c) { return c[0] === code })[0] };
  var key = 'evk-color-' + C.proj, cur = null;
  try { cur = localStorage.getItem(key) } catch (e) {}
  if (!find(cur)) cur = C.colors[0][0];

  $$('.hv .hv-sw').forEach(function (box) {
    box.setAttribute('role', 'radiogroup'); box.setAttribute('aria-label', 'Цвет кузова');
    box.innerHTML = C.colors.map(function (c) {
      var s = SW[c[0]] || ['#999', '#666', '#333'];
      return '<button type="button" class="hv-dot" role="radio" aria-checked="false" aria-label="' + c[1] + '" title="' + c[1] + '" data-c="' + c[0] + '" style="--c0:' + s[0] + ';--c1:' + s[1] + ';--c2:' + s[2] + '"></button>';
    }).join('');
  });

  function setColor(code, user) {
    var c = find(code); if (!c) return; cur = code;
    var n = String(C.colors.indexOf(c) + 1); n = n.length < 2 ? '0' + n : n;
    $$('.hv .hv-dot').forEach(function (b) { var on = b.dataset.c === code; b.classList.toggle('on', on); b.setAttribute('aria-checked', on) });
    $$('.hv .cn').forEach(function (x) { x.textContent = c[1] });
    $$('.hv .ci').forEach(function (x) { x.textContent = n });
    $$('.hv .car-imgs').forEach(function (box) {
      var old = box.querySelector('img.on'); if (old && old.dataset.c === code) return;
      var im = new Image(); im.decoding = 'async'; im.src = c[2]; im.dataset.c = code;
      im.alt = box.classList.contains('refl') ? '' : C.name + ', ' + c[1].toLowerCase() + ', официальный рендер';
      box.appendChild(im);
      var go = function () { requestAnimationFrame(function () { im.classList.add('on'); if (old) { old.classList.remove('on'); setTimeout(function () { old.remove() }, 800) } }) };
      if (im.decode) im.decode().then(go, go); else go();
    });
    if (user) { var b = d.querySelector('#dots button[data-c="' + code + '"]'); if (b) b.click() }
  }
  d.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('.hv .hv-dot'); if (b) setColor(b.dataset.c, true) });
  setColor(cur);

  /* высота служебных полос прототипа – первый экран считается без них, как на живом сайте */
  function wb() { var s = 0; $$('.w-bar,.hv-pick').forEach(function (x) { s += x.offsetHeight }); root.style.setProperty('--wb', s + 'px') }
  wb(); addEventListener('resize', wb);
  var pick = d.querySelector('.hv-pick');
  function setV(v) {
    root.setAttribute('data-hv', v);
    $$('.hv-pick button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === v) });
    try { localStorage.setItem('hv-zeekr-9x', v) } catch (e) {}
    try { history.replaceState(null, '', '#' + v) } catch (e) {}
  }
  pick.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { setV(b.dataset.v) } });
  setV(root.getAttribute('data-hv') || 'a');
})();
