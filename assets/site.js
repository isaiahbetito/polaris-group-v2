/* POLARIS GROUP — shared site behavior: IT/EN toggle, mobile nav, scroll reveal, count-up */
(function(){
  // ---- language toggle (IT default; persists) ----
  function lang(){ try{ return localStorage.getItem('polaris-lang')==='en' ? 'en':'it'; }catch(e){ return 'it'; } }
  function setLang(l){
    document.documentElement.lang=l;
    document.querySelectorAll('[data-it],[data-en]').forEach(function(el){ var v=el.getAttribute('data-'+l); if(v!==null) el.textContent=v; });
    document.querySelectorAll('[data-it-html],[data-en-html]').forEach(function(el){ var v=el.getAttribute('data-'+l+'-html'); if(v!==null) el.innerHTML=v; });
    document.querySelectorAll('.lang-switch__opt').forEach(function(o){ o.classList.toggle('on', o.dataset.lang===l); });
    try{ localStorage.setItem('polaris-lang',l); }catch(e){}
  }
  document.querySelectorAll('.lang-switch__opt').forEach(function(o){ o.addEventListener('click',function(){ setLang(o.dataset.lang); }); });
  if(lang()!=='it') setLang('en');

  // ---- mobile nav ----
  var nav=document.querySelector('.nav'), toggle=document.querySelector('.nav__toggle');
  if(toggle&&nav){ toggle.addEventListener('click',function(){ nav.classList.toggle('open'); }); }
  document.querySelectorAll('.nav__links a').forEach(function(a){ a.addEventListener('click',function(){ if(nav) nav.classList.remove('open'); }); });

  // ---- reveal on scroll ----
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} }); },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

  // ---- pillar cards: click (or Enter/Space) to toggle active navy fill ----
  document.querySelectorAll('.pillar').forEach(function(p){
    p.setAttribute('tabindex','0'); p.setAttribute('role','button');
    p.addEventListener('click',function(){ p.classList.toggle('is-active'); });
    p.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); p.classList.toggle('is-active'); } });
  });

  // ---- count-up (Italian thousands formatting) ----
  function countUp(el){
    var target=+el.dataset.target, dur=1500, t0=null;
    function step(ts){ if(!t0)t0=ts; var p=Math.min((ts-t0)/dur,1);
      el.textContent=Math.round((1-Math.pow(1-p,3))*target).toLocaleString('it-IT',{useGrouping:'always'}); if(p<1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  var cio=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ countUp(e.target); cio.unobserve(e.target);} }); },{threshold:.6});
  document.querySelectorAll('.count').forEach(function(el){ cio.observe(el); });

  // ---- copy-to-clipboard for .git__copy buttons (delegated, works for injected modal too) ----
  document.addEventListener('click', function(e){
    var btn = e.target.closest('.git__copy');
    if(!btn) return;
    var v = btn.getAttribute('data-copy') || (btn.previousElementSibling ? btn.previousElementSibling.textContent.trim() : '');
    if(!v) return;
    var done = function(){
      var l = lang(), labels = { it:{copy:'Copia',copied:'Copiato'}, en:{copy:'Copy',copied:'Copied'} };
      btn.textContent = labels[l].copied; btn.classList.add('copied');
      setTimeout(function(){ btn.textContent = labels[l].copy; btn.classList.remove('copied'); }, 1800);
    };
    if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(v).then(done).catch(function(){}); }
    else { var t=document.createElement('textarea'); t.value=v; document.body.appendChild(t); t.select(); try{document.execCommand('copy'); done();}catch(e){} document.body.removeChild(t); }
  });

  // ---- Contact modal (auto-injected if any .ask CTA is on the page) ----
  function buildContactModal(){
    if(document.getElementById('contactModal')) return;
    var html = ''+
      '<div class="contact-modal" id="contactModal" role="dialog" aria-modal="true" aria-labelledby="contactModalTitle" hidden>'+
      '  <div class="contact-modal__overlay" data-close-contact></div>'+
      '  <div class="contact-modal__card">'+
      '    <button class="contact-modal__x" type="button" data-close-contact aria-label="Close">&times;</button>'+
      '    <span class="contact-modal__eyebrow" data-it="Contattaci" data-en="Contact Us">Contact Us</span>'+
      '    <h3 id="contactModalTitle" class="contact-modal__title" data-it="Get in Touch" data-en="Get in Touch">Get in Touch</h3>'+
      '    <p class="contact-modal__sub" data-it="Scrivici una mail all\'indirizzo qui sotto. Rispondiamo entro un giorno lavorativo." data-en="Send us a message at the address below. We reply within one business day.">Send us a message at the address below. We reply within one business day.</p>'+
      '    <div class="git__box">'+
      '      <span class="git__email">segreteria@polaris-group.it</span>'+
      '      <button class="git__copy" type="button" data-copy="segreteria@polaris-group.it">COPY</button>'+
      '    </div>'+
      '    <a class="git__cta" href="mailto:segreteria@polaris-group.it" data-it-html="Apri nella tua mail &rarr;" data-en-html="Open in email app &rarr;">Open in email app &rarr;</a>'+
      '    <button class="contact-modal__close" type="button" data-close-contact data-it="Chiudi" data-en="Close">Chiudi</button>'+
      '  </div>'+
      '</div>';
    document.body.insertAdjacentHTML('beforeend', html);
    // re-apply current language to the newly injected nodes
    var l = lang();
    var m = document.getElementById('contactModal');
    if(m){
      m.querySelectorAll('[data-it],[data-en]').forEach(function(el){ var v=el.getAttribute('data-'+l); if(v!==null) el.textContent=v; });
      m.querySelectorAll('[data-it-html],[data-en-html]').forEach(function(el){ var v=el.getAttribute('data-'+l+'-html'); if(v!==null) el.innerHTML=v; });
    }
  }
  function openContactModal(trigger){
    buildContactModal();
    var m = document.getElementById('contactModal');
    if(!m) return;
    // Always reset to defaults first, then apply per-trigger overrides
    var defaults = { eyebrow:'Contact Us', eyebrowIt:'Contattaci', title:'Get in Touch', titleIt:'Get in Touch', email:'segreteria@polaris-group.it' };
    var l = lang();
    var eyebrowEl = m.querySelector('.contact-modal__eyebrow');
    var titleEl = m.querySelector('.contact-modal__title');
    var emailEl = m.querySelector('.git__email');
    var copyEl = m.querySelector('.git__copy');
    var ctaEl = m.querySelector('.git__cta');
    if(eyebrowEl) eyebrowEl.textContent = (l==='it'?defaults.eyebrowIt:defaults.eyebrow);
    if(titleEl) titleEl.textContent = (l==='it'?defaults.titleIt:defaults.title);
    if(emailEl) emailEl.textContent = defaults.email;
    if(copyEl) copyEl.setAttribute('data-copy', defaults.email);
    if(ctaEl) ctaEl.setAttribute('href', 'mailto:' + defaults.email);
    if(trigger){
      var eb = trigger.getAttribute('data-modal-eyebrow');
      var ti = trigger.getAttribute('data-modal-title');
      var em = trigger.getAttribute('data-modal-email');
      if(eb && eyebrowEl) eyebrowEl.textContent = eb;
      if(ti && titleEl) titleEl.textContent = ti;
      if(em){
        if(emailEl) emailEl.textContent = em;
        if(copyEl) copyEl.setAttribute('data-copy', em);
        if(ctaEl) ctaEl.setAttribute('href', 'mailto:' + em);
      }
    }
    m.removeAttribute('hidden');
    m.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeContactModal(){
    var m = document.getElementById('contactModal');
    if(!m) return;
    m.classList.remove('is-open');
    m.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }
  if(document.querySelector('.ask')) buildContactModal();
  document.addEventListener('click', function(e){
    if(e.target.closest('[data-open-contact]')){ e.preventDefault(); openContactModal(e.target.closest('[data-open-contact]')); }
    else if(e.target.closest('[data-close-contact]')){ e.preventDefault(); closeContactModal(); }
  });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeContactModal(); });
})();
