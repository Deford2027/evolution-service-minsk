/* Аналитика и реклама – те же счётчики, что на старом сайте (Тильда):
   Яндекс Метрика 97350250, Google Analytics 4 G-XMPNCJPL5Y, Google Tag Manager GTM-MWKWQVH3
   (внутри GTM – Google Ads AW-16539722036, коллтрекинг call-tracking.by, цель «франшиза»).
   Включается ТОЛЬКО на боевом домене evolutioncarservice.com, чтобы тестовые визиты не портили статистику
   и коллтрекинг не подменял телефоны на тесте. Для проверки на тесте: ?an=1 (выключить: ?an=0).
   Цели: evmGoal('имя') – Метрика reachGoal + событие GA4 + dataLayer.push({event}) для GTM. */
(function () {
  var MID = 97350250, GA = 'G-XMPNCJPL5Y', GTM = 'GTM-MWKWQVH3';
  var h = location.hostname, on = /^(www\.)?evolutioncarservice\.com$/.test(h);
  try {
    var q = /[?&]an=([01])/.exec(location.search);
    if (q) localStorage.setItem('evm-an', q[1]);
    if (localStorage.getItem('evm-an') === '1') on = true;
    if (localStorage.getItem('evm-an') === '0') on = false;
  } catch (e) {}

  // Очереди создаются сразу: события до загрузки счётчиков не теряются
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { dataLayer.push(arguments); };
  window.ym = window.ym || function () { (ym.a = ym.a || []).push(arguments); };
  ym.l = 1 * new Date();

  window.evmGoal = function (name, params) {
    if (!on) return;
    try { ym(MID, 'reachGoal', name, params || {}); } catch (e) {}
    try { gtag('event', name, params || {}); } catch (e) {}
    try { dataLayer.push(Object.assign({ event: name }, params || {})); } catch (e) {}
  };
  if (!on) return;

  function js(src) { var s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s); }
  var started = false;
  function start() {
    if (started) return; started = true;
    ym(MID, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: true, ecommerce: 'dataLayer' });
    js('https://mc.yandex.ru/metrika/tag.js');
    gtag('js', new Date()); gtag('config', GA);
    js('https://www.googletagmanager.com/gtag/js?id=' + GA);
    dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    js('https://www.googletagmanager.com/gtm.js?id=' + GTM);
  }
  // Как на Тильде – с задержкой ~2 с после загрузки, либо сразу при первом действии посетителя
  if (document.readyState === 'complete') setTimeout(start, 2000);
  else window.addEventListener('load', function () { setTimeout(start, 2000); });
  ['scroll', 'pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
    window.addEventListener(ev, start, { once: true, passive: true });
  });

  // Цели на клики – имена как в GTM старого сайта
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
    var u = a.getAttribute('href');
    if (/^tel:/.test(u)) evmGoal('clicktel');
    else if (/wa\.me|whatsapp/i.test(u)) evmGoal('clickwhatsapp');
    else if (/t\.me\//i.test(u)) evmGoal('clicktg');
    else if (/instagram\.com/i.test(u)) evmGoal('clickinst');
    else if (/yclients\.com/i.test(u)) evmGoal('yclients');
  }, true);
})();
