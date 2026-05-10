/* ============================================================
   PRAKASH MODEL SCHOOL – Unified JavaScript
   Covers: index, gallery, events, results, sports, achievements,
           scholarship, newspaper
   ============================================================ */

/* ──────────────────────────────────────────────
   SCROLL PROGRESS BAR  (all pages)
────────────────────────────────────────────── */
(function(){
  var bar = document.getElementById('scroll-progress');
  if(!bar) return;
  window.addEventListener('scroll', function(){
    var scrollTop = window.scrollY;
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    var pct  = docH > 0 ? (scrollTop / docH) * 100 : 0;
    bar.style.width = Math.min(pct, 100) + '%';
  }, {passive:true});
})();

/* ──────────────────────────────────────────────
   NAVBAR SCROLL EFFECT  (all pages)
────────────────────────────────────────────── */
(function(){
  var nb = document.getElementById('navbar');
  if(!nb) return;
  window.addEventListener('scroll', function(){
    nb.classList.toggle('scrolled', window.scrollY > 60);
    var strip = document.querySelector('.admission-strip');
    if(strip){
      var stripH = strip.offsetHeight || 50;
      strip.classList.toggle('hidden', window.scrollY > stripH);
    }
  }, {passive:true});
})();

/* ──────────────────────────────────────────────
   MOBILE MENU  (index)
────────────────────────────────────────────── */
function toggleMenu(){
  var menu = document.getElementById('mobile-menu');
  if(!menu) return;
  var isOpen = menu.classList.toggle('open');
  document.body.style.overflow  = isOpen ? 'hidden' : '';
  document.body.style.position  = isOpen ? 'fixed'  : '';
  document.body.style.width     = isOpen ? '100%'   : '';
}

/* ──────────────────────────────────────────────
   ACTIVE NAV LINK ON SCROLL  (index)
────────────────────────────────────────────── */
(function(){
  var sections  = document.querySelectorAll('section[id]');
  var navLinks  = document.querySelectorAll('.nav-links a');
  if(!sections.length || !navLinks.length) return;
  window.addEventListener('scroll', function(){
    var current = '';
    sections.forEach(function(s){
      if(window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    navLinks.forEach(function(a){
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });

    /* Dot-grid fade on scroll */
    var hero   = document.getElementById('hero');
    var canvas = document.getElementById('dot-grid-canvas');
    if(hero && canvas){
      var heroH  = hero.offsetHeight;
      var scrolled = window.scrollY;
      var fadeStart = heroH * 0.20;
      var fadeEnd   = heroH * 0.60;
      var opacity   = 1;
      if(scrolled > fadeStart){
        opacity = Math.max(0, 1 - (scrolled - fadeStart) / (fadeEnd - fadeStart));
      }
      canvas.style.opacity = opacity;
    }
  }, {passive:true});
})();

/* ──────────────────────────────────────────────
   COUNTER ANIMATION  (index)
────────────────────────────────────────────── */
function animateCounter(el){
  var target   = parseInt(el.dataset.target);
  var duration = 1100;
  var start    = performance.now();
  function easeOut(t){ return 1 - Math.pow(1-t, 3); }
  function update(now){
    var progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.floor(easeOut(progress) * target);
    if(progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  requestAnimationFrame(update);
}

/* ──────────────────────────────────────────────
   INTERSECTION OBSERVER – reveals + counters  (all pages)
────────────────────────────────────────────── */
(function(){
  var revealEls   = document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.stagger');
  var counterEls  = document.querySelectorAll('.counter');
  var observed    = new Set();
  var counterSeen = new Set();

  var revealObs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting && !observed.has(e.target)){
        observed.add(e.target);
        e.target.classList.add('visible');
      }
    });
  }, {threshold:0.12});

  revealEls.forEach(function(el){ revealObs.observe(el); });

  if(counterEls.length){
    var counterObs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting && !counterSeen.has(e.target)){
          counterSeen.add(e.target);
          animateCounter(e.target);
        }
      });
    }, {threshold:0.3});
    counterEls.forEach(function(el){ counterObs.observe(el); });
  }
})();

/* ──────────────────────────────────────────────
   BACK-TO-TOP BUTTON  (gallery + sub-pages)
────────────────────────────────────────────── */
(function(){
  var btt = document.getElementById('btt');
  if(!btt) return;
  window.addEventListener('scroll', function(){
    btt.classList.toggle('show', window.scrollY > 400);
  }, {passive:true});
  btt.addEventListener('click', function(){
    window.scrollTo({top:0, behavior:'smooth'});
  });
})();

/* ──────────────────────────────────────────────
   DOT GRID CANVAS ANIMATION  (index hero)
────────────────────────────────────────────── */
(function(){
  var canvas = document.getElementById('dot-grid-canvas');
  if(!canvas) return;

  var DOT_SIZE   = 4;
  var GAP        = 18;
  var BASE_COLOR = {r:11,  g:60,  b:93,  a:0.55};
  var ACT_COLOR  = {r:245, g:166, b:35,  a:1.0};
  var ACT2_COLOR = {r:46,  g:211, b:183, a:0.9};
  var PROXIMITY  = 110;
  var SHOCK_R    = 220;
  var SHOCK_STR  = 7;
  var RESISTANCE = 0.82;
  var RETURN_SPD = 0.07;
  var SPEED_TRIG = 80;

  var dots = [];
  var pointer = {x:-999,y:-999,vx:0,vy:0,speed:0,lx:0,ly:0,lt:0};
  var dpr = window.devicePixelRatio||1;
  var W=0, H=0;

  function buildGrid(){
    var wrap = canvas.parentElement;
    if(!wrap) return;
    var rect = wrap.getBoundingClientRect();
    W = rect.width  + 160;
    H = rect.height + 160;
    dpr = window.devicePixelRatio||1;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    canvas.style.left   = (-80) + 'px';
    canvas.style.top    = (-80) + 'px';
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    var cell = DOT_SIZE + GAP;
    var cols = Math.floor(W / cell) + 1;
    var rows = Math.floor(H / cell) + 1;
    var offX = (W - cols*cell + GAP) / 2;
    var offY = (H - rows*cell + GAP) / 2;
    dots = [];
    for(var r=0;r<rows;r++){
      for(var c=0;c<cols;c++){
        dots.push({cx:offX+c*cell+DOT_SIZE/2, cy:offY+r*cell+DOT_SIZE/2, ox:0,oy:0,vx:0,vy:0});
      }
    }
  }

  function lerpColor(a,b,t){
    return {r:a.r+(b.r-a.r)*t, g:a.g+(b.g-a.g)*t, b:a.b+(b.b-a.b)*t, a:a.a+(b.a-a.a)*t};
  }

  function draw(){
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,W,H);
    var proxSq = PROXIMITY*PROXIMITY;
    var px = pointer.x, py = pointer.y;
    for(var i=0;i<dots.length;i++){
      var d = dots[i];
      d.vx += (-d.ox) * RETURN_SPD;
      d.vy += (-d.oy) * RETURN_SPD;
      d.vx *= RESISTANCE;
      d.vy *= RESISTANCE;
      d.ox += d.vx;
      d.oy += d.vy;
      var rx = d.cx + d.ox;
      var ry = d.cy + d.oy;
      var dx = d.cx - px;
      var dy = d.cy - py;
      var dsq = dx*dx + dy*dy;
      var col = BASE_COLOR;
      if(dsq < proxSq){
        var t = 1 - Math.sqrt(dsq)/PROXIMITY;
        var mid = lerpColor(ACT2_COLOR, ACT_COLOR, t);
        col = lerpColor(BASE_COLOR, mid, Math.min(1, t*1.4));
      }
      ctx.beginPath();
      ctx.arc(rx, ry, DOT_SIZE/2, 0, Math.PI*2);
      ctx.fillStyle = 'rgba('+Math.round(col.r)+','+Math.round(col.g)+','+Math.round(col.b)+','+col.a.toFixed(2)+')';
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  function onMouseMove(e){
    var now = performance.now();
    var dt  = pointer.lt ? now - pointer.lt : 16;
    var dx  = e.clientX - pointer.lx;
    var dy  = e.clientY - pointer.ly;
    pointer.vx = dx/dt*1000;
    pointer.vy = dy/dt*1000;
    pointer.speed = Math.hypot(pointer.vx, pointer.vy);
    pointer.lx = e.clientX; pointer.ly = e.clientY; pointer.lt = now;
    var rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    if(pointer.speed > SPEED_TRIG){
      for(var i=0;i<dots.length;i++){
        var d = dots[i];
        var dist = Math.hypot(d.cx - pointer.x, d.cy - pointer.y);
        if(dist < PROXIMITY){
          var angle = Math.atan2(d.cy - pointer.y, d.cx - pointer.x);
          var force = (1 - dist/PROXIMITY) * pointer.speed * 0.004;
          d.vx += Math.cos(angle)*force + pointer.vx*0.003;
          d.vy += Math.sin(angle)*force + pointer.vy*0.003;
        }
      }
    }
  }

  function onTouch(e){
    if(!e.touches.length) return;
    var rect = canvas.getBoundingClientRect();
    pointer.x = e.touches[0].clientX - rect.left;
    pointer.y = e.touches[0].clientY - rect.top;
  }

  function onClick(e){
    var rect = canvas.getBoundingClientRect();
    var cx = e.clientX - rect.left;
    var cy = e.clientY - rect.top;
    for(var i=0;i<dots.length;i++){
      var d = dots[i];
      var dist = Math.hypot(d.cx - cx, d.cy - cy);
      if(dist < SHOCK_R){
        var t = 1 - dist/SHOCK_R;
        var angle = Math.atan2(d.cy - cy, d.cx - cx);
        d.vx += Math.cos(angle) * t * SHOCK_STR;
        d.vy += Math.sin(angle) * t * SHOCK_STR;
      }
    }
  }

  function initGrid(){
    buildGrid();
    draw();
  }

  /* Wait for splash to finish so hero has correct dimensions */
  if(document.getElementById('splash')){
    window.addEventListener('splashDone', function(){ initGrid(); }, {once:true});
    setTimeout(function(){ if(!dots.length) initGrid(); }, 3700); /* fallback */
  } else {
    initGrid();
  }

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('touchmove', onTouch, {passive:true});
  canvas.addEventListener('click', onClick);
  window.addEventListener('resize', buildGrid);
})();

/* ──────────────────────────────────────────────
   SPLASH SCREEN  (index only)
────────────────────────────────────────────── */
(function(){
  var splash = document.getElementById('splash');
  if(!splash) return;

  /* Style the HTML splash elements */
  splash.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#0B3C5D;'
    + 'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;overflow:hidden';

  /* Style the logo wrap */
  var logoWrap = splash.querySelector('.splash-logo-wrap');
  if(logoWrap){
    logoWrap.style.cssText = 'position:relative;width:170px;height:170px;display:flex;align-items:center;justify-content:center';
    var svg = logoWrap.querySelector('svg');
    if(svg){ svg.style.cssText = 'width:150px;height:150px;border-radius:50%;position:relative;z-index:1'; }
    /* Rings */
    var ring  = logoWrap.querySelector('.splash-ring');
    var ring2 = logoWrap.querySelector('.splash-ring2');
    if(ring)  ring.style.cssText  = 'position:absolute;inset:-12px;border-radius:50%;border:2px solid rgba(245,166,35,.4);animation:splashSpin 8s linear infinite';
    if(ring2) ring2.style.cssText = 'position:absolute;inset:-22px;border-radius:50%;border:1px dashed rgba(46,211,183,.35);animation:splashSpin 14s linear infinite reverse';
  }

  /* Style text elements */
  var name    = splash.querySelector('.splash-name');
  var sub     = splash.querySelector('.splash-sub');
  var tagline = splash.querySelector('.splash-tagline');
  if(name)    name.style.cssText    = 'color:#fff;font-family:"Playfair Display",serif;font-size:1.5rem;font-weight:700;text-align:center;margin:0';
  if(sub)     sub.style.cssText     = 'color:rgba(245,166,35,.9);font-size:.8rem;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;text-align:center;margin:0';
  if(tagline) tagline.style.cssText = 'color:rgba(255,255,255,.55);font-size:.72rem;font-weight:400;letter-spacing:.5px;text-align:center;margin:0;font-style:italic';

  /* Style progress bar */
  var barWrap = splash.querySelector('.splash-bar-wrap');
  var bar     = splash.querySelector('.splash-bar');
  if(barWrap) barWrap.style.cssText = 'width:180px;height:3px;background:rgba(255,255,255,.15);border-radius:2px;overflow:hidden';
  if(bar)     bar.style.cssText     = 'height:100%;width:0%;background:linear-gradient(90deg,#F5A623,#2ED3B7);border-radius:2px;transition:width .05s linear';

  /* Particles */
  var pWrap = splash.querySelector('#splashParticles') || splash.querySelector('.splash-particles');
  if(pWrap){
    pWrap.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden';
    var pColors = ['#F5A623','#2ED3B7','#ffffff','#1565a0'];
    for(var i=0;i<14;i++){
      var p  = document.createElement('div');
      var sz = 3 + Math.random()*9;
      p.style.cssText = 'position:absolute;border-radius:50%;opacity:.1;'
        + 'width:'+sz+'px;height:'+sz+'px;'
        + 'left:'+Math.random()*100+'%;top:'+Math.random()*100+'%;'
        + 'background:'+pColors[Math.floor(Math.random()*pColors.length)]+';'
        + 'animation:splashFloat linear infinite;'
        + 'animation-duration:'+(4+Math.random()*6)+'s;animation-delay:-'+(Math.random()*4)+'s;';
      pWrap.appendChild(p);
    }
  }

  /* Inject keyframes */
  var kf = document.createElement('style');
  kf.textContent = '@keyframes splashSpin{to{transform:rotate(360deg)}}'
    + '@keyframes splashFloat{0%{transform:translateY(0) scale(1)}50%{transform:translateY(-28px) scale(1.1)}100%{transform:translateY(0) scale(1)}}';
  document.head.appendChild(kf);

  /* Animate progress bar */
  var pct = 0;
  var iv  = setInterval(function(){
    pct += 2.2;
    if(bar) bar.style.width = Math.min(pct, 95) + '%';
    if(pct >= 95) clearInterval(iv);
  }, 55);

  /* Dismiss after 2.8s */
  setTimeout(function(){
    if(bar) bar.style.width = '100%';
    setTimeout(function(){
      splash.style.transition = 'opacity .7s ease';
      splash.style.opacity    = '0';
      document.body.classList.add('splash-done');
      /* Rebuild dot-grid after hero is visible */
      setTimeout(function(){
        splash.remove();
        var rebuildEv = new Event('splashDone');
        window.dispatchEvent(rebuildEv);
      }, 700);
    }, 200);
  }, 2800);
})();

/* ──────────────────────────────────────────────
   STREAM CARDS – AMBIENT + SCROLL ACTIVATION  (index)
────────────────────────────────────────────── */
(function(){
  var streamSection = document.getElementById('streams');
  if(!streamSection) return;
  var cards = streamSection.querySelectorAll('.stream-card');
  if(!cards.length) return;
  var autoTimer;
  var userClicked = false;

  function setActive(idx){
    cards.forEach(function(c,i){
      c.classList.toggle('active', i === idx);
    });
    if(idx >= 0 && cards[idx]){
      var ambient = getComputedStyle(cards[idx]).getPropertyValue('--ambient') || 'transparent';
      streamSection.style.setProperty('--stream-ambient', ambient);
    } else {
      streamSection.style.setProperty('--stream-ambient','transparent');
    }
  }

  cards.forEach(function(card, i){
    card.addEventListener('click', function(){
      clearTimeout(autoTimer);
      userClicked = true;
      setActive(i);
      autoTimer = setTimeout(function(){ userClicked = false; }, 4000);
    });
  });

  window.addEventListener('scroll', function(){
    if(!streamSection || userClicked) return;
    var rect  = streamSection.getBoundingClientRect();
    var vh    = window.innerHeight;
    if(rect.top < vh*0.65 && rect.bottom > vh*0.35){
      var progress = Math.max(0, Math.min(0.999, (vh*0.55 - rect.top) / rect.height));
      var idx = Math.min(Math.floor(progress * cards.length), cards.length - 1);
      setActive(idx);
    } else if(rect.bottom <= 0 || rect.top >= vh){
      setActive(-1);
    }
  }, {passive:true});

  var cycleIdx = 0;
  function autoCycle(){
    clearTimeout(autoTimer);
    autoTimer = setTimeout(function tick(){
      if(!userClicked) setActive(cycleIdx);
      cycleIdx = (cycleIdx+1) % cards.length;
      autoTimer = setTimeout(tick, 2000);
    }, 2000);
  }
  var obs = new IntersectionObserver(function(entries){
    if(entries[0].isIntersecting){ autoCycle(); }
    else { clearTimeout(autoTimer); setActive(-1); cycleIdx=0; }
  }, {threshold:0.2});
  obs.observe(streamSection);
})();

/* ──────────────────────────────────────────────
   ADMISSION MODAL  (all pages)
────────────────────────────────────────────── */
function openAdmissionModal(){
  var overlay = document.getElementById('adm-modal-overlay');
  if(!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  var success = document.getElementById('adm-modal-success');
  var form    = document.getElementById('adm-modal-form');
  if(success) success.style.display = 'none';
  if(form)    form.style.display    = 'block';
}
function closeAdmissionModal(){
  var overlay = document.getElementById('adm-modal-overlay');
  if(!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}
function handleModalClassChange(v){
  var box = document.getElementById('m-stream-box');
  if(!box) return;
  box.style.display = (v==='Class 11'||v==='Class 12') ? 'block' : 'none';
}
function submitModalAdmission(){
  var parent  = document.getElementById('m-parent').value.trim();
  var email   = document.getElementById('m-email').value.trim();
  var phone   = document.getElementById('m-phone').value.trim();
  var student = document.getElementById('m-student').value.trim();
  var cls     = document.getElementById('m-class').value;
  var consent = document.getElementById('m-consent').checked;
  var country = document.getElementById('m-country').value;
  var streamEl= document.getElementById('m-stream');
  var stream  = streamEl ? streamEl.value : '';
  var streamBox = document.getElementById('m-stream-box');
  var streamVisible = streamBox && streamBox.style.display === 'block';
  if(!parent||!email||!phone||!student||!cls){ alert('Please fill all required fields.'); return; }
  if(streamVisible && !stream){ alert('Please select a Stream.'); return; }
  if(!consent){ alert('Please give your consent to proceed.'); return; }
  var msg = '*New Admission Enquiry \u2013 Prakash Model School*%0AParent: '+encodeURIComponent(parent)
    +'%0AEmail: '+encodeURIComponent(email)
    +'%0AMobile: '+encodeURIComponent(country+' '+phone)
    +'%0AStudent: '+encodeURIComponent(student)
    +'%0AClass: '+encodeURIComponent(cls)
    +(stream?'%0AStream: '+encodeURIComponent(stream):'');
  window.open('https://wa.me/91XXXXXXXXXX?text='+msg, '_blank');
  var form    = document.getElementById('adm-modal-form');
  var success = document.getElementById('adm-modal-success');
  if(form)    form.style.display    = 'none';
  if(success) success.style.display = 'block';
}
/* Close on overlay click */
document.addEventListener('DOMContentLoaded', function(){
  var overlay = document.getElementById('adm-modal-overlay');
  if(overlay) overlay.addEventListener('click', function(e){ if(e.target===this) closeAdmissionModal(); });
});

/* ──────────────────────────────────────────────
   LIGHTBOX  (gallery, events, sports, results)
────────────────────────────────────────────── */
(function(){
  /* Gallery-page lightbox (photo grid) */
  var lb = document.getElementById('lightbox');
  if(!lb) return;

  var lbImg   = document.getElementById('lb-img');
  var lbCap   = document.querySelector('.lb-caption');
  var lbClose = lb.querySelector('.lb-close');
  var lbPrev  = lb.querySelector('.lb-prev');
  var lbNext  = lb.querySelector('.lb-next');
  var slots   = [];
  var lbIdx   = 0;
  var lbStartX = 0;

  /* Collect all clickable gallery items — works across all page types */
  function buildPool(){
    slots = [];
    /* photo-slots (gallery page) */
    document.querySelectorAll('.photo-slot').forEach(function(el){
      var img = el.querySelector('img');
      if(img) slots.push({src:img.src, cap:el.querySelector('.photo-label') ? el.querySelector('.photo-label').textContent : ''});
    });
    /* gallery-items (results page) */
    document.querySelectorAll('.gallery-item[data-src]').forEach(function(el){
      slots.push({src:el.dataset.src, cap:el.querySelector('.g-cap') ? el.querySelector('.g-cap').textContent : ''});
    });
    /* slide-cards (events/sports) — handled by their own pool, skip */
  }

  function openLbAt(idx){
    buildPool();
    lbIdx = idx;
    showLb();
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function showLb(){
    if(!slots[lbIdx]) return;
    var item = slots[lbIdx];
    /* If page uses lb-img element */
    if(lbImg){
      lbImg.src = item.src;
      lbImg.alt = item.cap || '';
    }
    /* If page uses lb-media-wrap */
    var wrap = document.getElementById('lb-media-wrap');
    if(wrap){
      wrap.innerHTML = '';
      var img = document.createElement('img');
      img.src = item.src; img.alt = item.cap || '';
      wrap.appendChild(img);
    }
    if(lbCap) lbCap.textContent = item.cap || '';
    var counter = document.getElementById('lb-counter');
    if(counter) counter.textContent = (lbIdx+1) + ' / ' + slots.length;
  }
  function closeLb(){
    lb.classList.remove('open');
    document.body.style.overflow = '';
    var wrap = document.getElementById('lb-media-wrap');
    if(wrap){ var v = wrap.querySelector('video'); if(v) v.pause(); }
  }
  function lbNav(dir){
    var wrap = document.getElementById('lb-media-wrap');
    if(wrap){ var v = wrap.querySelector('video'); if(v) v.pause(); }
    lbIdx = (lbIdx + dir + slots.length) % slots.length;
    showLb();
  }

  if(lbClose) lbClose.addEventListener('click', closeLb);
  if(lbPrev)  lbPrev.addEventListener('click', function(){ lbNav(-1); });
  if(lbNext)  lbNext.addEventListener('click', function(){ lbNav(1); });
  lb.addEventListener('click', function(e){ if(e.target===this) closeLb(); });
  document.addEventListener('keydown', function(e){
    if(!lb.classList.contains('open')) return;
    if(e.key==='ArrowLeft')  lbNav(-1);
    else if(e.key==='ArrowRight') lbNav(1);
    else if(e.key==='Escape')     closeLb();
  });
  lb.addEventListener('touchstart', function(e){ lbStartX = e.touches[0].clientX; }, {passive:true});
  lb.addEventListener('touchend', function(e){
    var dx = lbStartX - e.changedTouches[0].clientX;
    if(Math.abs(dx) > 40) lbNav(dx > 0 ? 1 : -1);
  });

  /* Attach click to photo slots */
  document.addEventListener('click', function(e){
    var slot = e.target.closest('.photo-slot');
    if(!slot) return;
    buildPool();
    var allSlots = Array.from(document.querySelectorAll('.photo-slot'));
    var idx = allSlots.indexOf(slot);
    if(idx >= 0) openLbAt(idx);
  });
})();

/* ──────────────────────────────────────────────
   EVENTS / SPORTS SLIDER  (events-1, sports-3)
   — pages that use this must define window.EVENTS or window.SPORTS_DATA
   and call initSlider(data, 'section-id')
────────────────────────────────────────────── */
function initSlider(items, sectionId){
  var section = document.getElementById(sectionId || 'slider-section');
  var outer   = section ? section.querySelector('.slider-outer') : document.querySelector('.slider-outer');
  if(!outer) return;

  var track  = outer.querySelector('.slider-track');
  var dotsEl = document.querySelector('.sl-dots');
  var prevBtn= document.querySelector('.sl-btn.prev');
  var nextBtn= document.querySelector('.sl-btn.next');
  var lbPool = [];
  var current = 0;

  /* --- Preload images/videos then build --- */
  function preloadAll(arr, cb){
    var loaded = [];
    if(!arr || !arr.length){ cb(loaded); return; }
    var done = 0;
    arr.forEach(function(item){
      if(item.type === 'video'){
        loaded.push(item);
        done++;
        if(done === arr.length) cb(loaded);
      } else {
        var img = new Image();
        img.onload = img.onerror = function(){
          if(img.naturalWidth > 0) loaded.push(item);
          done++;
          if(done === arr.length) cb(loaded);
        };
        img.src = item.src;
      }
    });
  }

  function buildSlider(pool){
    lbPool = pool;
    track.innerHTML = '';
    if(!pool.length){
      outer.innerHTML = '<div class="slider-empty"><i class="fas fa-images"></i><p>Media will appear here soon.</p></div>';
      return;
    }
    pool.forEach(function(item, i){
      var card = document.createElement('div');
      card.className = 'slide-card';
      if(item.type === 'video'){
        card.innerHTML = '<div class="slide-img-wrap"><video src="'+item.src+'" muted playsinline loop></video>'
          +'<div class="slide-video-badge"><i class="fas fa-play"></i> VIDEO</div>'
          +'<div class="slide-overlay"><i class="fas fa-play-circle"></i></div></div>'
          +'<div class="slide-cap">'+(item.cap||'')+'</div>';
      } else {
        card.innerHTML = '<div class="slide-img-wrap"><img src="'+item.src+'" alt="'+(item.cap||'')+'" loading="lazy">'
          +'<div class="slide-overlay"><i class="fas fa-search-plus"></i></div></div>'
          +'<div class="slide-cap">'+(item.cap||'')+'</div>';
      }
      card.addEventListener('click', function(){ openSliderLightbox(i); });
      track.appendChild(card);
    });

    /* Dots */
    var visCount = window.innerWidth < 769 ? 1 : 2;
    var pageCount = Math.ceil(pool.length / visCount);
    if(dotsEl){
      dotsEl.innerHTML = '';
      for(var p=0;p<pageCount;p++){
        var dot = document.createElement('div');
        dot.className = 'sl-dot' + (p===0?' active':'');
        (function(pg){ dot.addEventListener('click', function(){ goTo(pg * visCount); }); })(p);
        dotsEl.appendChild(dot);
      }
    }
    goTo(0);
  }

  function goTo(idx){
    var cards    = track.querySelectorAll('.slide-card');
    var visCount = window.innerWidth < 769 ? 1 : 2;
    var maxIdx   = Math.max(0, cards.length - visCount);
    current = Math.max(0, Math.min(idx, maxIdx));
    if(!cards.length) return;
    var cardW = cards[0].offsetWidth + 14;
    track.style.transform = 'translateX(-'+(current * cardW)+'px)';
    if(dotsEl){
      var dots = dotsEl.querySelectorAll('.sl-dot');
      var pg   = Math.floor(current / visCount);
      dots.forEach(function(d,i){ d.classList.toggle('active', i===pg); });
    }
  }

  if(prevBtn) prevBtn.addEventListener('click', function(){ goTo(current - 1); });
  if(nextBtn) nextBtn.addEventListener('click', function(){ goTo(current + 1); });

  /* Touch swipe */
  var startX = 0;
  outer.addEventListener('touchstart', function(e){ startX = e.touches[0].clientX; }, {passive:true});
  outer.addEventListener('touchend', function(e){
    var dx = startX - e.changedTouches[0].clientX;
    if(Math.abs(dx) > 40) goTo(dx > 0 ? current + 1 : current - 1);
  });

  /* Auto-play */
  var autoTimer;
  function startAuto(){ autoTimer = setInterval(function(){ goTo(current+1); }, 4000); }
  function stopAuto(){ clearInterval(autoTimer); }
  outer.addEventListener('mouseenter', stopAuto);
  outer.addEventListener('mouseleave', startAuto);
  startAuto();

  window.addEventListener('resize', function(){ goTo(current); });

  /* Slider lightbox */
  function openSliderLightbox(idx){
    var lb = document.getElementById('lightbox');
    if(!lb) return;
    var item = lbPool[idx];
    if(!item) return;
    var wrap = document.getElementById('lb-media-wrap');
    if(wrap){
      wrap.innerHTML = '';
      if(item.type === 'video'){
        var vid = document.createElement('video');
        vid.src = item.src; vid.controls = true; vid.autoplay = true; vid.playsInline = true;
        wrap.appendChild(vid);
      } else {
        var img = document.createElement('img');
        img.src = item.src; img.alt = item.cap || '';
        wrap.appendChild(img);
      }
    }
    var counter = document.getElementById('lb-counter');
    if(counter) counter.textContent = (idx+1) + ' / ' + lbPool.length;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    /* Patch lb nav to use slider pool */
    lb._sliderPool  = lbPool;
    lb._sliderIdx   = idx;
    var lbPrev = lb.querySelector('.lb-prev');
    var lbNext = lb.querySelector('.lb-next');
    if(lbPrev) lbPrev.onclick = function(){ sliderLbNav(lb, -1); };
    if(lbNext) lbNext.onclick = function(){ sliderLbNav(lb,  1); };
  }
  function sliderLbNav(lb, dir){
    var pool = lb._sliderPool || [];
    if(!pool.length) return;
    var v = lb.querySelector('video');
    if(v) v.pause();
    lb._sliderIdx = (lb._sliderIdx + dir + pool.length) % pool.length;
    var idx  = lb._sliderIdx;
    var item = pool[idx];
    var wrap = document.getElementById('lb-media-wrap');
    if(wrap){
      wrap.innerHTML = '';
      if(item.type==='video'){
        var vid = document.createElement('video');
        vid.src=item.src;vid.controls=true;vid.autoplay=true;vid.playsInline=true;
        wrap.appendChild(vid);
      } else {
        var img = document.createElement('img');
        img.src=item.src;img.alt=item.cap||'';
        wrap.appendChild(img);
      }
    }
    var counter = document.getElementById('lb-counter');
    if(counter) counter.textContent=(idx+1)+' / '+pool.length;
  }

  preloadAll(items, buildSlider);
}

/* ──────────────────────────────────────────────
   GALLERY PAGE  (gallery.html)
────────────────────────────────────────────── */
(function(){
  /* Photo slots — sources should be set on elements as data-src */
  var photoSlots = document.querySelectorAll('.photo-slot');
  photoSlots.forEach(function(slot){
    var img = slot.querySelector('img');
    if(!img) return;
    var src = img.dataset.src || img.getAttribute('src');
    if(!src || src === '' || src.includes('placeholder')) return;
    img.src = src;
    img.onload = function(){ slot.style.display = 'block'; };
    img.onerror = function(){ /* keep hidden */ };
  });

  /* Video slots */
  var videoSlots = document.querySelectorAll('.video-slot');
  videoSlots.forEach(function(slot){
    var placeholder = slot.querySelector('.video-placeholder');
    var playerWrap  = slot.querySelector('.video-player-wrap');
    var video       = slot.querySelector('.video-player-wrap video');
    if(!placeholder || !playerWrap || !video) return;
    if(!video.src) return;
    slot.classList.add('has-src');
    placeholder.addEventListener('click', function(){
      placeholder.style.display = 'none';
      playerWrap.style.display  = 'block';
      video.play();
    });
  });

  /* Filter tabs — works with both #filter-bar and .filter-wrap selectors */
  var filterBtns = document.querySelectorAll('#filter-bar .filter-btn, .filter-bar .filter-btn');
  var photoSec   = document.getElementById('photos-section');
  var videoSec   = document.getElementById('videos-section');
  filterBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      filterBtns.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.dataset.filter || 'all';
      if(photoSec) photoSec.style.display = (f==='videos') ? 'none' : 'block';
      if(videoSec) videoSec.style.display = (f==='photos') ? 'none' : 'block';
    });
  });
})();

/* ──────────────────────────────────────────────
   ACHIEVEMENT FILTER TABS  (prakash-achievements)
────────────────────────────────────────────── */
(function(){
  var filterBtns = document.querySelectorAll('.filter-wrap .filter-btn, #filter-bar .filter-btn, .filter-bar .filter-btn');
  var panels     = document.querySelectorAll('.tab-panel');
  if(!filterBtns.length || !panels.length) return;

  /* Show first panel by default */
  panels.forEach(function(p, i){
    p.classList.toggle('active', i === 0);
  });
  /* Mark first button active if none already */
  if(!document.querySelector('.filter-btn.active') && filterBtns[0]){
    filterBtns[0].classList.add('active');
  }

  filterBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      filterBtns.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      var target = btn.dataset.tab || btn.dataset.filter;
      panels.forEach(function(panel){
        var match = target && (panel.id === target || panel.dataset.tab === target);
        panel.classList.toggle('active', !!match);
      });
    });
  });
})();
