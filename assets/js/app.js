/* ==========================================================
   ZAHAB — поведение сайта.
   Контент берётся из assets/js/data.js (window.SITE).
   ========================================================== */
(function(){
'use strict';

var S = window.SITE;
var $  = function(sel, root){ return (root || document).querySelector(sel); };
var $$ = function(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* метка для CSS: без скриптов первый экран не должен прятаться */
document.documentElement.classList.add('js');

/* ---------- иконки карточек ---------- */
var ICONS = {
  lightning: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M26 4 12 27h9l-3 17 18-25h-10l3-15Z"/></svg>',
  crack:     '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 34h9l6-8 5 6 4-12 6 9h10"/><path d="M19 26 17 12"/><path d="M28 21 33 8"/></svg>',
  drop:      '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M24 5s14 16 14 24a14 14 0 0 1-28 0C10 21 24 5 24 5Z"/><path d="M18 30a6 6 0 0 0 6 6"/></svg>',
  leaf:      '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M40 8C20 8 10 18 10 30c0 4 2 8 2 8s16-2 22-10c5-7 6-20 6-20Z"/><path d="M8 40c6-8 12-14 20-19"/></svg>'
};

var WA_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3Z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M9 8.5c.3 2.6 3.9 6.2 6.5 6.5.6.1 1.3-.4 1.4-1l.1-.8-2.2-1-.9 1c-1.2-.5-2.3-1.6-2.8-2.8l1-.9-1-2.2-.8.1c-.6.1-1.1.8-1 1.4Z" fill="currentColor"/></svg>';
var TG_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 4-3 16-6-4-3 3-.5-4.5L19 6 7.5 12.5 3 11l18-7Z" fill="currentColor"/></svg>';

/* ---------- ссылки на мессенджеры ---------- */
function waLink(phone, text){
  return 'https://wa.me/' + phone + (text ? '?text=' + encodeURIComponent(text) : '');
}
function tgLink(){ return 'https://t.me/' + S.contacts.telegram.user; }

/* ---------- уведомление ---------- */
var toastEl = $('#toast'), toastTimer;
function toast(msg){
  toastEl.textContent = msg;
  toastEl.hidden = false;
  requestAnimationFrame(function(){ toastEl.classList.add('on'); });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){
    toastEl.classList.remove('on');
    setTimeout(function(){ toastEl.hidden = true; }, 320);
  }, 2600);
}

/* ==========================================================
   РЕНДЕР КОНТЕНТА
   ========================================================== */
function renderHero(){
  $('#heroImg').src = S.hero.image;
  $('#heroImg').alt = '';
  $('#heroKicker').textContent = S.hero.kicker;
  $('#heroTitle').innerHTML = S.hero.title;
  $('#heroLead').textContent = S.hero.text;
  $('#heroFacts').innerHTML = S.hero.facts.map(function(f){
    return '<li><b>' + f.value + '</b><span>' + f.label + '</span></li>';
  }).join('');
}

function renderHadith(){
  $('#hadithAr').textContent = S.hadith.arabic;
  $('#hadithTr').textContent = S.hadith.translation;
  $('#hadithSrc').textContent = S.hadith.source;
  $('#hadithNote').textContent = S.hadith.note;
}

function renderAbout(){
  $('#aboutTitle').textContent = S.about.title;
  $('#aboutLead').textContent  = S.about.lead;
  $('#aboutCards').innerHTML = S.about.cards.map(function(c){
    return '<article class="about__card reveal">' + (ICONS[c.icon] || ICONS.drop) +
           '<h3>' + c.title + '</h3><p>' + c.text + '</p></article>';
  }).join('');
  $('#compTitle').textContent = S.about.composition.title;
  $('#compText').textContent  = S.about.composition.text;
  $('#compItems').innerHTML = S.about.composition.items.map(function(i){
    return '<li>' + i + '</li>';
  }).join('');
}

function renderConditions(){
  var c = S.conditions;
  $('#condTitle').textContent = c.title;
  $('#condLead').textContent  = c.lead;
  $('#condGrid').innerHTML = c.items.map(function(t, i){
    return '<li style="transition-delay:' + (i % 4) * 60 + 'ms"><i>' + (i + 1) + '</i>' + t + '</li>';
  }).join('');
  $('#condException').textContent = c.exception;
  $('#condTerms').innerHTML = c.terms.map(function(t){
    return '<div class="cond__term reveal"><b>' + t.label + '</b><span>' + t.text + '</span></div>';
  }).join('');
  $('#noticeText').textContent = S.disclaimer;
}

function renderProcess(){
  $('#procTitle').textContent = S.process.title;
  $('#procLead').textContent  = S.process.lead;
  var zoomIcon = '<span class="proc__zoom"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">' +
                 '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5M11 8.6v4.8M8.6 11h4.8"/></svg></span>';
  $('#procSteps').innerHTML = S.process.steps.map(function(s, i){
    // постер — первый кадр ролика: пока видео не загрузилось, на месте кадра не чёрный прямоугольник
    var media = s.type === 'video'
      ? '<video src="' + s.media + '" poster="' + (s.poster || '') + '" muted loop playsinline ' +
        'preload="metadata" disablepictureinpicture></video>'
      : '<img src="' + s.media + '" alt="' + s.title + '" loading="lazy">';
    return '<article class="proc__step reveal">' +
             '<div class="proc__num">' + s.num + '</div>' +
             '<div class="proc__body"><h3>' + s.title + '</h3><p>' + s.text + '</p></div>' +
             '<div class="proc__media" data-proc="' + i + '" role="button" tabindex="0" ' +
                  'aria-label="Открыть: ' + s.title + '">' + media + zoomIcon + '</div>' +
           '</article>';
  }).join('');
  $('#procStory').innerHTML = '<h3>' + S.process.story.title + '</h3><p>' + S.process.story.text + '</p>';
}

function renderUsage(){
  $('#useTitle').textContent = S.usage.title;
  $('#useLead').textContent  = S.usage.lead;
  $('#useSteps').innerHTML = S.usage.steps.map(function(s){
    return '<li class="reveal"><b>' + s.num + '</b><div><h3>' + s.title + '</h3><p>' + s.text + '</p></div></li>';
  }).join('');
  $('#useReaction').innerHTML =
    '<div class="usage__box"><h3>' + S.usage.reaction.title + '</h3><p>' + S.usage.reaction.text + '</p></div>' +
    '<div class="usage__box usage__box--warn"><h3>Когда нужен врач</h3><p>' + S.usage.reaction.warning + '</p></div>';
}

function renderShop(){
  $('#shopGrid').innerHTML = S.products.map(function(p){
    return '<article class="card reveal" data-id="' + p.id + '">' +
      '<div class="card__pic">' +
        (p.badge ? '<span class="card__badge">' + p.badge + '</span>' : '') +
        '<img src="' + p.image + '" alt="' + p.title + '" loading="lazy">' +
      '</div>' +
      '<div class="card__body">' +
        '<h3>' + p.title + '</h3>' +
        '<p class="card__sub">' + p.subtitle + '</p>' +
        '<p class="card__note">' + p.note + '</p>' +
        '<div class="card__foot">' +
          '<span class="card__price">' + money(p.price) + '</span>' +
          '<div class="card__ctrl" data-ctrl="' + p.id + '"></div>' +
        '</div>' +
      '</div></article>';
  }).join('');

  $('#extras').innerHTML =
    '<h3>' + S.extras.title + '</h3><p>' + S.extras.text + '</p>' +
    '<ul class="extras__list">' + S.extras.items.map(function(i){
      return '<li><b>' + i.title + '</b><span>' + i.note + '</span></li>';
    }).join('') + '</ul>';

  paintProductButtons();
}

function renderReviews(){
  $('#revTitle').textContent = S.reviews.title;
  $('#revLead').textContent  = S.reviews.lead;
  $('#revTrack').innerHTML = S.reviews.items.map(function(r){
    return '<article class="rev__item">' +
      '<div class="rev__quote">“</div>' +
      '<p class="rev__text">' + r.text + '</p>' +
      '<div class="rev__author"><div class="rev__ava">' + r.author.charAt(0) + '</div>' +
      '<div><b>' + r.author + '</b><span>' + r.source + '</span></div></div>' +
    '</article>';
  }).join('');
}

function renderGallery(){
  $('#galTitle').textContent = S.gallery.title;
  $('#galLead').textContent  = S.gallery.lead;
  $('#galGrid').innerHTML = S.gallery.items.map(function(g, i){
    return '<figure data-i="' + i + '" style="transition-delay:' + (i % 4) * 70 + 'ms">' +
      '<img src="' + g.src + '" alt="' + g.caption + '" loading="lazy">' +
      '<figcaption>' + g.caption + '</figcaption></figure>';
  }).join('');
  $('#tgChannelBtn').href = tgLink();
}

function renderMap(){
  $('#mapTitle').textContent = S.map.title;
  $('#mapLead').textContent  = S.map.lead;
  $('#mapPoints').innerHTML = S.map.points.map(function(p, i){
    return '<button class="map__point' + (i === 0 ? ' on' : '') + '" type="button" data-p="' + i + '">' +
      '<b>' + p.name + '</b><i>' + p.city + '</i><span>' + p.text + '</span></button>';
  }).join('');
  showMapPoint(0);
}

function showMapPoint(i){
  var p = S.map.points[i];
  var d = 180 / Math.pow(2, p.zoom) * 2;
  var bbox = [p.lon - d, p.lat - d / 2, p.lon + d, p.lat + d / 2].join('%2C');
  $('#mapFrame').src = 'https://www.openstreetmap.org/export/embed.html?bbox=' + bbox +
                       '&layer=mapnik&marker=' + p.lat + '%2C' + p.lon;
  $('#mapLink').href = 'https://www.openstreetmap.org/?mlat=' + p.lat + '&mlon=' + p.lon + '#map=' + p.zoom + '/' + p.lat + '/' + p.lon;
  $$('#mapPoints .map__point').forEach(function(b, k){ b.classList.toggle('on', k === i); });
}

function renderFaq(){
  $('#faqTitle').textContent = S.faq.title;
  $('#faqList').innerHTML = S.faq.items.map(function(f){
    return '<div class="faq__item reveal">' +
      '<button class="faq__q" type="button">' + f.q + '<i>+</i></button>' +
      '<div class="faq__a"><p>' + f.a + '</p></div></div>';
  }).join('');
}

function renderContacts(){
  var c = S.contacts;
  $('#ctaHours').textContent = c.workingHours;

  var links =
    '<a class="cta__link" href="' + waLink(c.whatsappMain.phone, 'Ассаляму алейкум! Пишу с сайта по поводу сока трюфеля.') + '" target="_blank" rel="noopener">' +
      WA_ICON + '<div><b>WhatsApp ' + c.whatsappMain.label + '</b><span>' + c.whatsappMain.note + '</span></div></a>' +
    '<a class="cta__link" href="' + waLink(c.whatsappRu.phone, 'Здравствуйте! Пишу с сайта по поводу сока трюфеля.') + '" target="_blank" rel="noopener">' +
      WA_ICON + '<div><b>WhatsApp ' + c.whatsappRu.label + '</b><span>' + c.whatsappRu.note + '</span></div></a>' +
    '<a class="cta__link" href="' + tgLink() + '" target="_blank" rel="noopener">' +
      TG_ICON + '<div><b>Telegram ' + c.telegram.label + '</b><span>канал и заказы</span></div></a>' +
    '<button class="cta__link" type="button" data-open-order style="text-align:left;cursor:pointer;width:100%">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 5h16v11H8l-4 4V5Z"/></svg>' +
      '<div><b>Оставить заявку</b><span>соберём текст — отправите одним сообщением</span></div></button>';

  $('#ctaLinks').innerHTML = links;

  $('#footLinks').innerHTML =
    '<a href="' + waLink(c.whatsappMain.phone) + '" target="_blank" rel="noopener">WhatsApp ' + c.whatsappMain.label + '</a>' +
    '<a href="' + waLink(c.whatsappRu.phone) + '" target="_blank" rel="noopener">WhatsApp ' + c.whatsappRu.label + '</a>' +
    '<a href="' + tgLink() + '" target="_blank" rel="noopener">Telegram ' + c.telegram.label + '</a>';

  $('#footBrandNote').textContent = S.brand.meaning + '. ' + S.brand.subtitle;
  $('#disclaimerText').textContent = S.disclaimer;
  $('#year').textContent = new Date().getFullYear();
  $('#dockWa').href = waLink(c.whatsappMain.phone, 'Ассаляму алейкум! Пишу с сайта по поводу сока трюфеля.');

  $('#mobileMenuFoot').innerHTML =
    '<a class="btn btn--wa" href="' + waLink(c.whatsappMain.phone) + '" target="_blank" rel="noopener">' + WA_ICON + '<span>WhatsApp</span></a>' +
    '<a class="btn btn--tg" href="' + tgLink() + '" target="_blank" rel="noopener">' + TG_ICON + '<span>Telegram</span></a>';

  $('#orderTitle').textContent = S.order.title;
  $('#orderText').textContent  = S.order.text;
  $('#lblName').textContent    = S.order.fields.name;
  $('#lblContact').textContent = S.order.fields.contact;
  $('#lblComment').textContent = S.order.fields.comment;
}

/* пробелы неразрывные — иначе «2 500 ₽» рвётся на две строки */
function money(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽'; }

/* ==========================================================
   КОРЗИНА
   ========================================================== */
var cart = {};
try { cart = JSON.parse(localStorage.getItem('zahab_cart') || '{}') || {}; } catch(e){ cart = {}; }

function saveCart(){ try { localStorage.setItem('zahab_cart', JSON.stringify(cart)); } catch(e){} }
function cartCount(){ return Object.keys(cart).reduce(function(s, k){ return s + cart[k]; }, 0); }
function cartSum(){
  return Object.keys(cart).reduce(function(s, k){
    var p = productById(k);
    return p ? s + p.price * cart[k] : s;
  }, 0);
}
function productById(id){
  for (var i = 0; i < S.products.length; i++) if (S.products[i].id === id) return S.products[i];
  return null;
}

function addToCart(id){
  cart[id] = (cart[id] || 0) + 1;
  saveCart(); paintCartCount(); paintProductButtons(); paintCart();
  if (!$('#cartModal').classList.contains('on')) toast('Добавлено в корзину');
  bumpCart();
}
function setQty(id, q){
  if (q <= 0) delete cart[id]; else cart[id] = q;
  saveCart(); paintCartCount(); paintProductButtons(); paintCart();
}

function bumpCart(){
  var el = $('#cartBtn');
  el.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }],
    { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' }
  );
}

function paintCartCount(){
  var n = cartCount();
  [['#cartCount', 'on'], ['#dockCount', 'on']].forEach(function(pair){
    var el = $(pair[0]); if (!el) return;
    el.textContent = n;
    el.classList.toggle(pair[1], n > 0);
  });
}

function paintProductButtons(){
  $$('[data-ctrl]').forEach(function(box){
    var id = box.getAttribute('data-ctrl');
    var q = cart[id] || 0;
    box.innerHTML = q
      ? '<div class="card__qty"><button type="button" data-dec="' + id + '" aria-label="Меньше">−</button>' +
        '<span>' + q + '</span><button type="button" data-inc="' + id + '" aria-label="Больше">+</button></div>'
      : '<button class="card__add" type="button" data-add="' + id + '">В корзину</button>';
  });
}

function paintCart(){
  var ids = Object.keys(cart);
  var list = $('#cartList');

  if (!ids.length){
    list.innerHTML = '<div class="cart__empty">Корзина пуста. Добавьте флаконы — и отправьте заказ одним сообщением.</div>';
    $('#cartTotal').innerHTML = '';
    $('#cartSend').innerHTML =
      '<a class="btn btn--gold btn--wide" href="#shop" data-close>Перейти к товарам</a>';
    return;
  }

  list.innerHTML = ids.map(function(id){
    var p = productById(id); if (!p) return '';
    return '<div class="cart__row">' +
      '<img src="' + p.image + '" alt="">' +
      '<div><b>' + p.title + '</b><span>' + p.subtitle + ' · ' + money(p.price) + '</span></div>' +
      '<div class="cart__ctrl">' +
        '<button type="button" data-dec="' + id + '" aria-label="Меньше">−</button>' +
        '<b>' + cart[id] + '</b>' +
        '<button type="button" data-inc="' + id + '" aria-label="Больше">+</button>' +
      '</div></div>';
  }).join('');

  $('#cartTotal').innerHTML = '<span>Итого</span><b>' + money(cartSum()) + '</b>';

  var text = cartText();
  $('#cartSend').innerHTML =
    '<a class="btn btn--wa btn--wide" href="' + waLink(S.contacts.whatsappMain.phone, text) + '" target="_blank" rel="noopener">' +
      WA_ICON + '<span>Заказ в WhatsApp<i>' + S.contacts.whatsappMain.label + '</i></span></a>' +
    '<a class="btn btn--wa btn--wide" href="' + waLink(S.contacts.whatsappRu.phone, text) + '" target="_blank" rel="noopener">' +
      WA_ICON + '<span>WhatsApp Россия<i>' + S.contacts.whatsappRu.label + '</i></span></a>' +
    '<button class="btn btn--tg btn--wide" type="button" data-tg-order>' + TG_ICON +
      '<span>Скопировать и открыть Telegram</span></button>';
}

function cartText(){
  var lines = ['Ассаляму алейкум! Заказ с сайта ZAHAB:'];
  Object.keys(cart).forEach(function(id){
    var p = productById(id); if (!p) return;
    lines.push('• ' + p.title + ' (' + p.subtitle + ') × ' + cart[id] + ' — ' + money(p.price * cart[id]));
  });
  lines.push('Итого: ' + money(cartSum()));
  lines.push('Подскажите, пожалуйста, по наличию и доставке.');
  return lines.join('\n');
}

/* ==========================================================
   МОДАЛЬНЫЕ ОКНА
   ========================================================== */
var lockCount = 0;
function lockScroll(on){
  lockCount += on ? 1 : -1;
  if (lockCount < 0) lockCount = 0;
  document.body.style.overflow = lockCount ? 'hidden' : '';
}
function openModal(el){
  el.hidden = false;
  requestAnimationFrame(function(){ el.classList.add('on'); });
  lockScroll(true);
}
function closeModal(el){
  el.classList.remove('on');
  lockScroll(false);
  setTimeout(function(){ el.hidden = true; }, 380);
}

/* ==========================================================
   ЗАЯВКА
   ========================================================== */
function orderText(){
  var name = $('#fName').value.trim();
  var city = $('#fCity').value.trim();
  var note = $('#fComment').value.trim();
  var lines = ['Ассаляму алейкум! Пишу с сайта ZAHAB.'];
  if (name) lines.push('Меня зовут: ' + name);
  if (city) lines.push('Пожелание: ' + city);
  if (note) lines.push('Вопрос: ' + note);
  if (cartCount()) {
    lines.push('');
    lines.push('В корзине:');
    Object.keys(cart).forEach(function(id){
      var p = productById(id); if (!p) return;
      lines.push('• ' + p.title + ' × ' + cart[id]);
    });
    lines.push('Итого: ' + money(cartSum()));
  }
  return lines.join('\n');
}

function paintOrderPreview(){
  var text = orderText();
  $('#orderPreview').textContent = text;
  $('#orderButtons').innerHTML =
    '<a class="btn btn--wa btn--wide" href="' + waLink(S.contacts.whatsappMain.phone, text) + '" target="_blank" rel="noopener">' +
      WA_ICON + '<span>Отправить в WhatsApp</span></a>' +
    '<a class="btn btn--wa btn--wide" href="' + waLink(S.contacts.whatsappRu.phone, text) + '" target="_blank" rel="noopener">' +
      WA_ICON + '<span>WhatsApp Россия</span></a>' +
    '<button class="btn btn--tg btn--wide" type="button" data-tg-order>' + TG_ICON +
      '<span>Скопировать и открыть Telegram</span></button>';
}

function copyAndOpenTelegram(text){
  var done = function(){
    toast('Текст скопирован — вставьте его в чат');
    setTimeout(function(){ window.open(tgLink(), '_blank', 'noopener'); }, 500);
  };
  if (navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(done, fallback);
  } else fallback();

  function fallback(){
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch(e){}
    document.body.removeChild(ta);
    done();
  }
}

/* ==========================================================
   АНИМАЦИИ ПОЯВЛЕНИЯ
   ========================================================== */
function initReveal(){
  var targets = $$('.reveal, .cond__grid li, .gal figure');
  if (!('IntersectionObserver' in window) || reduced){
    targets.forEach(function(el){ el.classList.add('in'); });
    return;
  }

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting){ show(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  targets.forEach(function(el){ io.observe(el); });

  function show(el){ el.classList.add('in'); io.unobserve(el); }

  // прыжок по якорю проматывает секции мимо наблюдателя — дочищаем вручную,
  // иначе выше по странице остаются невидимые блоки
  var ticking = false;
  function sweep(){
    ticking = false;
    var h = window.innerHeight;
    $$('.reveal:not(.in), .cond__grid li:not(.in), .gal figure:not(.in)').forEach(function(el){
      if (el.getBoundingClientRect().top < h * 0.92) show(el);
    });
  }
  window.addEventListener('scroll', function(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(sweep);
  }, { passive: true });
}

/* ---------- золотая пыль в первом экране ---------- */
function initDust(){
  var cv = $('#heroDust');
  if (!cv || reduced) return;
  var ctx = cv.getContext('2d');
  var dots = [], raf = null, w = 0, h = 0;

  function size(){
    var r = Math.min(window.devicePixelRatio || 1, 2);
    w = cv.clientWidth; h = cv.clientHeight;
    cv.width = w * r; cv.height = h * r;
    ctx.setTransform(r, 0, 0, r, 0, 0);
  }
  function build(){
    var n = window.innerWidth < 760 ? 26 : 54;
    dots = [];
    for (var i = 0; i < n; i++){
      dots.push({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.7 + .5,
        vy: -(Math.random() * .22 + .05),
        vx: (Math.random() - .5) * .18,
        a: Math.random() * .5 + .15,
        t: Math.random() * Math.PI * 2
      });
    }
  }
  function frame(){
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < dots.length; i++){
      var d = dots[i];
      d.t += .02; d.y += d.vy; d.x += d.vx + Math.sin(d.t) * .16;
      if (d.y < -6){ d.y = h + 6; d.x = Math.random() * w; }
      if (d.x < -6) d.x = w + 6;
      if (d.x > w + 6) d.x = -6;
      var alpha = d.a * (0.6 + 0.4 * Math.sin(d.t));
      ctx.beginPath();
      ctx.fillStyle = 'rgba(240,206,126,' + alpha.toFixed(3) + ')';
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  }
  function start(){ if (!raf) frame(); }
  function stop(){ if (raf){ cancelAnimationFrame(raf); raf = null; } }

  size(); build(); start();
  window.addEventListener('resize', function(){ size(); build(); });
  document.addEventListener('visibilitychange', function(){
    document.visibilityState === 'visible' ? start() : stop();
  });

  // не тратим кадры, когда первый экран ушёл из вида
  if ('IntersectionObserver' in window){
    new IntersectionObserver(function(e){
      e[0].isIntersecting ? start() : stop();
    }, { threshold: 0 }).observe($('#hero'));
  }
}

/* ---------- объёмный наклон карточки товара ---------- */
function initHeroCard(){
  var card = $('#heroCard');
  if (!card || reduced || window.matchMedia('(hover: none)').matches) return;
  var glow = $('.hero__cardGlow', card);

  card.addEventListener('mousemove', function(e){
    var r = card.getBoundingClientRect();
    var px = (e.clientX - r.left) / r.width;
    var py = (e.clientY - r.top) / r.height;
    card.style.transform = 'perspective(900px) rotateY(' + ((px - .5) * 9).toFixed(2) + 'deg) rotateX(' + ((.5 - py) * 9).toFixed(2) + 'deg) translateY(-6px)';
    glow.style.setProperty('--mx', (px * 100) + '%');
    glow.style.setProperty('--my', (py * 100) + '%');
  });
  card.addEventListener('mouseleave', function(){ card.style.transform = ''; });
}

/* ---------- параллакс фона первого экрана ---------- */
function initParallax(){
  if (reduced) return;
  var img = $('#heroImg'), hero = $('#hero');
  var ticking = false;
  window.addEventListener('scroll', function(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      var y = window.pageYOffset;
      if (y < hero.offsetHeight){
        img.style.transform = 'scale(1.06) translateY(' + (y * 0.16).toFixed(1) + 'px)';
      }
      ticking = false;
    });
  }, { passive: true });
}

/* ==========================================================
   ОТЗЫВЫ
   ========================================================== */
function initReviews(){
  var track = $('#revTrack'), dotsBox = $('#revDots');
  var prev = $('#revPrev'), next = $('#revNext');
  if (!track) return;

  /* ширина одной карточки с отступом и сколько их видно целиком */
  function step(){
    var first = track.querySelector('.rev__item');
    return first ? first.offsetWidth + 20 : 400;
  }
  function perView(){ return Math.max(1, Math.round(track.clientWidth / step())); }
  function pages(){ return Math.max(1, Math.ceil(S.reviews.items.length / perView())); }
  function page(){ return Math.round(track.scrollLeft / (step() * perView())); }

  function goPage(i){
    i = Math.max(0, Math.min(pages() - 1, i));
    track.scrollTo({ left: i * step() * perView(), behavior: reduced ? 'auto' : 'smooth' });
  }

  function paintDots(){
    var n = pages();
    if (dotsBox.children.length !== n){
      var html = '';
      for (var i = 0; i < n; i++) html += '<i data-page="' + i + '" role="button" tabindex="0" aria-label="Отзывы, страница ' + (i + 1) + '"></i>';
      dotsBox.innerHTML = html;
    }
    var cur = page();
    $$('#revDots i').forEach(function(d, i){ d.classList.toggle('on', i === cur); });
    prev.disabled = cur <= 0;
    next.disabled = cur >= n - 1;
    dotsBox.hidden = n < 2;
  }

  prev.addEventListener('click', function(){ goPage(page() - 1); });
  next.addEventListener('click', function(){ goPage(page() + 1); });
  dotsBox.addEventListener('click', function(e){
    var d = e.target.closest('[data-page]');
    if (d) goPage(+d.getAttribute('data-page'));
  });

  var t;
  track.addEventListener('scroll', function(){
    clearTimeout(t);
    t = setTimeout(paintDots, 90);
  }, { passive: true });
  window.addEventListener('resize', function(){
    clearTimeout(t);
    t = setTimeout(paintDots, 150);
  });

  paintDots();
}

/* ==========================================================
   ПРОСМОТР ФОТО И ВИДЕО (общий для галереи и раздела о сборе)
   ========================================================== */
var lbItems = [], lbIndex = 0;

/* наборы, между которыми листаем */
function galleryItems(){
  return S.gallery.items.map(function(g){
    return { type: 'image', src: g.src, caption: g.caption };
  });
}
function processItems(){
  return S.process.steps.map(function(s){
    return { type: s.type, src: s.media, poster: s.poster, caption: s.title };
  });
}

function openLightbox(items, i){
  lbItems = items;
  lbIndex = i;
  var box = $('#lightbox');
  box.hidden = false;
  paintLightbox();
  requestAnimationFrame(function(){ box.classList.add('on'); });
  lockScroll(true);
  document.body.classList.add('lb-open');                      // прячем нижнюю панель
  $$('.proc__media video').forEach(function(v){ v.pause(); }); // фон не должен играть
}

function paintLightbox(){
  var it = lbItems[lbIndex];
  var stage = $('#lbStage');
  stage.innerHTML = '';

  if (it.type === 'video'){
    var v = document.createElement('video');
    v.src = it.src;
    if (it.poster) v.poster = it.poster;   // кадр виден сразу, пока ролик подгружается
    v.preload = 'auto';
    v.controls = true;
    v.autoplay = true;
    v.loop = true;
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    stage.appendChild(v);
    // со звуком получится только если браузер разрешит — иначе играем без него
    v.play().catch(function(){ v.muted = true; v.play().catch(function(){}); });
  } else {
    var img = document.createElement('img');
    img.src = it.src;
    img.alt = it.caption || '';
    stage.appendChild(img);
  }

  $('#lbCap').textContent = it.caption || '';
  $('#lbCount').textContent = (lbIndex + 1) + ' / ' + lbItems.length;
  var many = lbItems.length > 1;
  $('#lbPrev').hidden = !many;
  $('#lbNext').hidden = !many;
}

function closeLightbox(){
  var box = $('#lightbox');
  box.classList.remove('on');
  document.body.classList.remove('lb-open');
  lockScroll(false);
  setTimeout(function(){
    box.hidden = true;
    $('#lbStage').innerHTML = '';   // останавливаем видео
  }, 320);
}

function stepLightbox(d){
  if (!lbItems.length) return;
  lbIndex = (lbIndex + d + lbItems.length) % lbItems.length;
  paintLightbox();
}

/* листание пальцем */
function initLightboxSwipe(){
  var box = $('#lightbox'), x0 = null, y0 = null;
  box.addEventListener('touchstart', function(e){
    x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
  }, { passive: true });
  box.addEventListener('touchend', function(e){
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    var dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) stepLightbox(dx < 0 ? 1 : -1);
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) closeLightbox();
    x0 = y0 = null;
  }, { passive: true });
}

/* ==========================================================
   ШАПКА, МЕНЮ, ПАНЕЛЬ
   ========================================================== */
function initChrome(){
  var header = $('#header'), dock = $('#dock');
  var onScroll = function(){
    var y = window.pageYOffset;
    header.classList.toggle('is-stuck', y > 40);
    dock.classList.toggle('on', y > window.innerHeight * 0.6);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = $('#burger'), menu = $('#mobileMenu'), open = false;
  function toggleMenu(state){
    open = state !== undefined ? state : !open;
    burger.classList.toggle('on', open);
    burger.setAttribute('aria-expanded', String(open));
    if (open){
      menu.hidden = false;
      requestAnimationFrame(function(){ menu.classList.add('on'); });
      $$('#mobileMenu a').forEach(function(a, i){ a.style.animationDelay = (0.05 + i * 0.05) + 's'; });
      lockScroll(true);
    } else {
      menu.classList.remove('on');
      lockScroll(false);
      setTimeout(function(){ menu.hidden = true; }, 380);
    }
  }
  burger.addEventListener('click', function(){ toggleMenu(); });
  $$('#mobileMenu a').forEach(function(a){ a.addEventListener('click', function(){ toggleMenu(false); }); });
  window.addEventListener('keydown', function(e){ if (e.key === 'Escape' && open) toggleMenu(false); });
}

/* ==========================================================
   ОБЩИЕ ОБРАБОТЧИКИ
   ========================================================== */
function initEvents(){
  document.addEventListener('click', function(e){
    var t = e.target;

    var add = t.closest('[data-add]');
    if (add){ addToCart(add.getAttribute('data-add')); return; }

    var inc = t.closest('[data-inc]');
    if (inc){ var i = inc.getAttribute('data-inc'); setQty(i, (cart[i] || 0) + 1); return; }

    var dec = t.closest('[data-dec]');
    if (dec){ var d = dec.getAttribute('data-dec'); setQty(d, (cart[d] || 0) - 1); return; }

    if (t.closest('#cartBtn') || t.closest('[data-open-cart]')){ paintCart(); openModal($('#cartModal')); return; }

    if (t.closest('[data-open-order]')){ paintOrderPreview(); openModal($('#orderModal')); return; }

    if (t.closest('[data-tg-order]')){
      var text = $('#orderModal').classList.contains('on') ? orderText() : cartText();
      copyAndOpenTelegram(text);
      return;
    }

    var closer = t.closest('[data-close]');
    if (closer){
      var modal = closer.closest('.modal');
      if (modal) closeModal(modal);
      else if (closer.closest('.lightbox')) closeLightbox();
      return;
    }

    var point = t.closest('[data-p]');
    if (point){ showMapPoint(+point.getAttribute('data-p')); return; }

    var q = t.closest('.faq__q');
    if (q){
      var item = q.parentElement;
      var body = $('.faq__a', item);
      var open = item.classList.toggle('on');
      body.style.maxHeight = open ? body.scrollHeight + 'px' : '';
      return;
    }

    var fig = t.closest('#galGrid figure');
    if (fig){ openLightbox(galleryItems(), +fig.getAttribute('data-i')); return; }

    var proc = t.closest('[data-proc]');
    if (proc){ openLightbox(processItems(), +proc.getAttribute('data-proc')); return; }

    if (t.closest('#lbNext')){ stepLightbox(1); return; }
    if (t.closest('#lbPrev')){ stepLightbox(-1); return; }
  });

  // те же кадры открываются с клавиатуры
  document.addEventListener('keydown', function(e){
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var el = document.activeElement;
    if (!el) return;
    var proc = el.closest && el.closest('[data-proc]');
    if (proc){ e.preventDefault(); openLightbox(processItems(), +proc.getAttribute('data-proc')); }
  });

  ['#fName', '#fCity', '#fComment'].forEach(function(sel){
    $(sel).addEventListener('input', paintOrderPreview);
  });
  $('#orderForm').addEventListener('submit', function(e){ e.preventDefault(); });

  window.addEventListener('keydown', function(e){
    if (e.key === 'Escape'){
      $$('.modal.on').forEach(closeModal);
      if ($('#lightbox').classList.contains('on')) closeLightbox();
    }
    if ($('#lightbox').classList.contains('on')){
      if (e.key === 'ArrowRight') stepLightbox(1);
      if (e.key === 'ArrowLeft')  stepLightbox(-1);
    }
  });

  // видео в разделе «как добываем» проигрываем, пока они на экране
  if ('IntersectionObserver' in window && !reduced){
    var vio = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        var v = en.target;
        if (en.isIntersecting){
          if (!v.getAttribute('src')) return;
          v.play().catch(function(){});
        } else v.pause();
      });
    }, { threshold: 0.35 });
    setTimeout(function(){ $$('.proc__media video').forEach(function(v){ vio.observe(v); }); }, 400);
  }
}

/* ==========================================================
   СТАРТ
   ========================================================== */
function boot(){
  renderHero();
  renderHadith();
  renderAbout();
  renderConditions();
  renderProcess();
  renderUsage();
  renderShop();
  renderReviews();
  renderGallery();
  renderMap();
  renderFaq();
  renderContacts();

  paintCartCount();
  paintCart();
  paintOrderPreview();

  initChrome();
  initEvents();
  initReviews();
  initHeroCard();
  initParallax();
  initLightboxSwipe();
}

boot();

/* первый экран оживает, когда заставка ушла — переход получается слитным */
document.addEventListener('intro:done', function(){
  $('#hero').classList.add('ready');
  initReveal();
  initDust();
});

/* страховка: если события заставки почему-то не было */
setTimeout(function(){
  if (!$('#hero').classList.contains('ready')){
    $('#hero').classList.add('ready');
    initReveal();
    initDust();
  }
}, 11000);

})();
