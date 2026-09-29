/* ============================================================================
   LANDING PAGE — ENTRENADOR PERSONAL
   main.js — Módulos de interactividad (Vanilla JS, sin dependencias)

   Cada módulo es una función independiente que se auto-registra. Si un módulo
   falla, no rompe el resto de la página.

   Módulos
   00. Configuración y utilidades
   01. Header (estado sticky + barra de progreso)
   02. Navegación (móvil, scroll suave, enlace activo)
   03. Reveal (animaciones al hacer scroll)
   04. Contadores animados
   05. Carrusel de testimonios
   06. Medios del hero (imagen de respaldo / vídeo opcional)
   07. Formulario de captación
   08. Barra CTA móvil
   09. Varios (año, preselección de plan, tracking)
   ========================================================================== */

/* ==========================================================================
   00. CONFIGURACIÓN Y UTILIDADES
   ========================================================================== */
const CONFIG = {
  /* Endpoint real del formulario (Formspree, HubSpot, tu API…).
     Mientras sea null, se simula el envío para poder probar la interfaz. */
  formEndpoint: null,

  /* Clave para guardar el borrador del formulario en localStorage */
  draftKey: 'entrenador:lead-draft',

  /* Ruta a un vídeo corto en loop para el hero (opcional).
     Ejemplo: 'assets/media/hero-loop.mp4'. Déjalo vacío para usar solo la foto. */
  heroVideo: '',

  /* Duración de la animación de contadores (ms) */
  counterDuration: 1600,
};

/* --- Utilidades DOM --- */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* --- Detecta preferencia de movimiento reducido --- */
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --- Comprueba si el navegador soporta IntersectionObserver --- */
const supportsObserver = 'IntersectionObserver' in window;

/* --- Formatea un número con separador de miles (es-CO) --- */
const formatNumber = (n) => n.toLocaleString('es-CO');

/* --- Registra un clic en un elemento con data-track.
       Punto de enganche para GA4 / GTM / Meta Pixel. --- */
function track(eventName, params = {}) {
  // dataLayer existe cuando hay Google Tag Manager instalado
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: eventName, ...params });
  }
  // Personaliza este bloque para enviar eventos a tu herramienta de analítica
  // console.debug('[track]', eventName, params);
}


/* ==========================================================================
   01. HEADER — estado al hacer scroll + barra de progreso de lectura
   ========================================================================== */
function initHeader() {
  const header = $('[data-header]');
  const progress = $('[data-scroll-progress]');
  if (!header) return;

  let ticking = false;

  const update = () => {
    const y = window.scrollY;

    header.classList.toggle('is-scrolled', y > 12);

    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(y / max, 1) : 0;
      progress.style.transform = `scaleX(${ratio})`;
    }

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }, { passive: true });

  update();
}


/* ==========================================================================
   02. NAVEGACIÓN — menú móvil, scroll suave y enlace activo
   ========================================================================== */
function initNav() {
  const header  = $('[data-header]');
  const nav     = $('#nav-principal');
  const burger  = $('[data-burger]');
  const links   = $$('.nav__link');
  const body    = document.body;

  /* --- Menú móvil --- */
  if (nav && burger) {
    const setMenu = (open) => {
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
      body.classList.toggle('is-locked', open);
    };

    burger.addEventListener('click', () => {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });

    // Cerrar al pulsar Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenu(false);
        burger.focus();
      }
    });

    // Cerrar al cambiar el tamaño de ventana a escritorio
    window.matchMedia('(min-width: 56.3125rem)').addEventListener('change', (e) => {
      if (e.matches) setMenu(false);
    });
  }

  /* --- Scroll suave con compensación del header sticky --- */
  const scrollToTarget = (target) => {
    const offset = (header ? header.offsetHeight : 64) + 8;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({
      top,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth'
    });

    // Actualiza la URL sin provocar un salto brusco del navegador
    if (history.replaceState && target.id) {
      history.replaceState(null, '', `#${target.id}`);
    }
  };

  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();

      if (nav && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        body.classList.remove('is-locked');
      }

      scrollToTarget(target);

      // Accesibilidad: mueve el foco al destino
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  /* --- Resalta el enlace de la sección visible --- */
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (!sections.length) return;

  const setActive = () => {
    const offset = (header ? header.offsetHeight : 64) + 24;
    let activeId = sections[0].id;

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= offset) activeId = section.id;
    });

    links.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${activeId}`);
    });
  };

  if (supportsObserver) {
    const observer = new IntersectionObserver(setActive, {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    });
    sections.forEach((s) => observer.observe(s));
  } else {
    window.addEventListener('scroll', setActive, { passive: true });
  }

  setActive();
}


/* ==========================================================================
   03. REVEAL — animaciones de entrada al hacer scroll
   ========================================================================== */
function initReveal() {
  const items = $$('.reveal');
  if (!items.length) return;

  // Aplica el retardo escalonado declarado en el HTML (data-reveal-delay)
  items.forEach((el) => {
    const delay = el.dataset.revealDelay;
    if (delay) el.style.setProperty('--reveal-delay', `${delay}ms`);
  });

  // Sin IntersectionObserver o con movimiento reducido: mostrar todo
  if (!supportsObserver || prefersReducedMotion()) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target); // se anima una sola vez
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  items.forEach((el) => observer.observe(el));
}


/* ==========================================================================
   04. CONTADORES ANIMADOS
   ========================================================================== */
function initCounters() {
  const counters = $$('[data-count]');
  if (!counters.length) return;

  const render = (el, value) => {
    el.textContent = `${el.dataset.prefix || ''}${formatNumber(value)}${el.dataset.suffix || ''}`;
  };

  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    if (prefersReducedMotion()) {
      render(el, target);
      return;
    }

    const duration = CONFIG.counterDuration;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutExpo: arranca rápido y frena suavemente
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      render(el, Math.round(target * eased));

      if (progress < 1) window.requestAnimationFrame(tick);
    };

    window.requestAnimationFrame(tick);
  };

  if (!supportsObserver) {
    counters.forEach((el) => render(el, parseInt(el.dataset.count, 10) || 0));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animate(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.6 });

  counters.forEach((el) => observer.observe(el));
}


/* ==========================================================================
   05. CARRUSEL DE TESTIMONIOS
   En escritorio se comporta como una cuadrícula; en móvil, como carrusel.
   ========================================================================== */
function initCarousel() {
  const root = $('[data-carousel]');
  if (!root) return;

  const track = $('[data-carousel-track]', root);
  const nav   = $('[data-carousel-nav]', root);
  if (!track || !nav) return;

  const prevBtn = $('[data-carousel-prev]', nav);
  const nextBtn = $('[data-carousel-next]', nav);
  const dotsBox = $('[data-carousel-dots]', nav);
  const cards   = Array.from(track.children);

  if (cards.length < 2) {
    nav.hidden = true;
    return;
  }

  /* --- Posición de cada tarjeta respecto al inicio del track.
         En móvil el track tiene padding lateral, por eso se resta la
         posición de la primera tarjeta como origen. --- */
  const positionOf = (i) => {
    const origin = cards[0].offsetLeft - track.offsetLeft;
    return cards[i].offsetLeft - track.offsetLeft - origin;
  };

  /* --- Crea los puntos de navegación --- */
  const dots = cards.map((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel__dot';
    dot.setAttribute('aria-label', `Ir al testimonio ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsBox.appendChild(dot);
    return dot;
  });

  /* --- ¿Hay algo que desplazar? (en escritorio no: es una cuadrícula) --- */
  const isScrollable = () => track.scrollWidth - track.clientWidth > 2;

  /* --- Calcula la tarjeta "activa" (la más visible a la izquierda) --- */
  const activeIndex = () => {
    if (!isScrollable()) return 0;

    // Con scroll-snap la última tarjeta nunca alcanza su posición de inicio
    // (el track se agota), así que al final se marca directamente.
    if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 2) {
      return cards.length - 1;
    }

    const scroll = track.scrollLeft;
    let index = 0;
    cards.forEach((_, i) => {
      if (positionOf(i) <= scroll + 8) index = i;
    });
    return index;
  };

  const goTo = (index) => {
    const clamped = Math.max(0, Math.min(index, cards.length - 1));

    track.scrollTo({
      left: positionOf(clamped),
      behavior: prefersReducedMotion() ? 'auto' : 'smooth'
    });
  };

  const sync = () => {
    nav.hidden = !isScrollable();

    const index = activeIndex();
    dots.forEach((dot, i) => {
      const active = i === index;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
    });

    if (prevBtn) prevBtn.disabled = track.scrollLeft <= 2;
    if (nextBtn) nextBtn.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
  };

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(activeIndex() - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(activeIndex() + 1));

  // Sincroniza al hacer scroll, redimensionar o cambiar de pestaña
  track.addEventListener('scroll', () => window.requestAnimationFrame(sync), { passive: true });
  window.addEventListener('resize', sync);

  // Navegación con teclado cuando el carrusel tiene el foco
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(activeIndex() + 1); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(activeIndex() - 1); }
  });

  sync();
}


/* ==========================================================================
   06. MEDIOS DEL HERO — respaldo de imagen y vídeo opcional
   Si los archivos no existen, la página conserva su aspecto gracias al
   degradado de fondo en .hero__media.
   ========================================================================== */
function initHeroMedia() {
  const media = $('[data-hero-media]');
  if (!media) return;

  // Si la imagen no carga, se elimina para no mostrar un icono roto.
  // El evento "error" puede haber ocurrido ANTES de que se adjunte el
  // listener (por ejemplo, un 404 resuelto muy rápido), así que también se
  // comprueba el estado "complete" combinado con naturalWidth.
  $$('img', media).forEach((img) => {
    const drop = () => img.remove();

    if (img.complete) {
      if (img.naturalWidth === 0) drop();
    } else {
      img.addEventListener('error', drop, { once: true });
    }
  });

  // Vídeo de fondo opcional (se crea solo si hay una ruta configurada)
  if (!CONFIG.heroVideo) return;

  const video = document.createElement('video');
  video.className = 'hero__video';
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('aria-hidden', 'true');
  video.poster = 'assets/img/hero.jpg';
  video.preload = 'metadata';
  video.autoplay = true;

  const source = document.createElement('source');
  source.src = CONFIG.heroVideo;
  source.type = 'video/mp4';
  video.appendChild(source);

  // Si el vídeo falla, se retira y se queda solo la imagen
  video.addEventListener('error', () => video.remove(), { once: true });

  // Algunos navegadores bloquean el autoplay hasta que hay interacción
  const play = () => video.play().catch(() => {});
  video.addEventListener('canplay', play);
  window.addEventListener('pointerdown', play, { once: true });

  const existing = $('.hero__image', media);
  media.insertBefore(video, existing);
}


/* ==========================================================================
   07. FORMULARIO DE CAPTACIÓN
   Validación accesible, estado de carga, envío y borrador local.
   ========================================================================== */
function initForm() {
  const form = $('[data-form]');
  if (!form) return;

  const status  = $('[data-form-status]');
  const success = $('[data-success]');
  const submit  = $('[data-submit]', form);
  const reset   = $('[data-reset]');

  /* --- Reglas de validación --- */
  const rules = {
    nombre: (v) => {
      if (!v.trim()) return 'Escribe tu nombre para poder contactarte.';
      if (v.trim().length < 2) return 'El nombre es demasiado corto.';
      return '';
    },
    email: (v) => {
      if (!v.trim()) return 'Necesitamos un correo para enviarte la confirmación.';
      if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim())) return 'Ese correo no parece válido.';
      return '';
    },
    whatsapp: (v) => {
      if (!v.trim()) return '';
      if (v.replace(/\D/g, '').length < 7) return 'Incluye un número de WhatsApp válido.';
      return '';
    },
    objetivo: (v) => (v ? '' : 'Selecciona tu objetivo principal.')
  };

  /* --- Mostrar / limpiar el error de un campo --- */
  const setError = (name, message) => {
    const field = form.elements[name];
    if (!field) return;

    const errorEl = form.querySelector(`[data-error-for="${name}"]`);
    field.classList.toggle('is-invalid', Boolean(message));
    field.setAttribute('aria-invalid', message ? 'true' : 'false');

    if (errorEl) errorEl.textContent = message;
  };

  const validateField = (name) => {
    const rule = rules[name];
    const field = form.elements[name];
    if (!rule || !field) return true;

    const message = rule(field.value);
    setError(name, message);
    return !message;
  };

  /* --- Validación en vivo: solo después del primer intento --- */
  let submitted = false;

  Object.keys(rules).forEach((name) => {
    const field = form.elements[name];
    if (!field) return;

    field.addEventListener('blur', () => {
      if (submitted) validateField(name);
    });

    field.addEventListener('input', () => {
      if (submitted) validateField(name);
    });

    // El select no emite "input" de forma fiable en todos los navegadores
    if (field.tagName === 'SELECT') {
      field.addEventListener('change', () => {
        if (submitted) validateField(name);
      });
    }
  });

  /* --- Estado del mensaje global --- */
  const setStatus = (message, type = 'error') => {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('is-success', type === 'success');
    status.hidden = !message;
  };

  /* --- Envío --- */
  async function send(payload) {
    // Sin endpoint configurado: simulamos la latencia para probar la interfaz
    if (!CONFIG.formEndpoint) {
      await new Promise((resolve) => setTimeout(resolve, 900));
      return;
    }

    const response = await fetch(CONFIG.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitted = true;

    // Honeypot: si un bot llenó el campo oculto, fingimos éxito y salimos
    const honeypot = form.elements.sitio_web;
    if (honeypot && honeypot.value) {
      form.hidden = true;
      if (success) success.hidden = false;
      return;
    }

    const invalid = Object.keys(rules).filter((name) => !validateField(name));

    if (invalid.length) {
      setStatus('Revisa los campos marcados para poder enviar tu solicitud.');
      const first = form.elements[invalid[0]];
      if (first) first.focus();
      return;
    }

    setStatus('');
    form.hidden = true;
    if (success) success.hidden = false;

    const data = Object.fromEntries(new FormData(form).entries());
    delete data.sitio_web;

    // Lanza un evento para que cualquier analítica lo escuche
    track('lead_submitted', { objetivo: data.objetivo, programa: data.programa || 'n/d' });

    if (submit) submit.classList.add('is-loading');

    try {
      await send(data);
      clearDraft();
    } catch (error) {
      // Si algo falla, se revierte la interfaz para que el usuario reintente
      form.hidden = false;
      if (success) success.hidden = true;
      setStatus('No pudimos enviar el formulario. Escríbeme por WhatsApp y lo resolvemos al instante.');
      if (submit) submit.classList.remove('is-loading');
      console.error('[form] Error al enviar:', error);
      return;
    }

    if (submit) submit.classList.remove('is-loading');
  });

  /* --- Botón "enviar otra solicitud" --- */
  if (reset) {
    reset.addEventListener('click', () => {
      form.reset();
      form.hidden = false;
      if (success) success.hidden = true;
      submitted = false;
      Object.keys(rules).forEach((name) => setError(name, ''));
      setStatus('');
      form.elements.nombre.focus();
    });
  }

  /* --- Borrador: evita que el usuario pierda lo escrito --- */
  function saveDraft() {
    try {
      const data = Object.fromEntries(new FormData(form).entries());
      delete data.sitio_web;
      localStorage.setItem(CONFIG.draftKey, JSON.stringify(data));
    } catch { /* modo privado o cuota llena: se ignora */ }
  }

  function restoreDraft() {
    try {
      const raw = localStorage.getItem(CONFIG.draftKey);
      if (!raw) return;

      const data = JSON.parse(raw);
      Object.keys(data).forEach((key) => {
        const field = form.elements[key];
        if (field && typeof field.value === 'string') field.value = data[key];
      });
    } catch { /* contenido corrupto: se ignora */ }
  }

  function clearDraft() {
    try { localStorage.removeItem(CONFIG.draftKey); } catch { /* noop */ }
  }

  form.addEventListener('input', saveDraft);
  restoreDraft();

  /* Preselección del programa si el usuario llega desde el footer */
  const preset = new URLSearchParams(window.location.search).get('plan');
  if (preset && form.elements.programa) form.elements.programa.value = preset;
}


/* ==========================================================================
   08. BARRA CTA MÓVIL
   Aparece al salir del hero y se oculta sobre el formulario (allí ya
   están los CTAs principales y la barra estorbaría).
   ========================================================================== */
function initDock() {
  const dock = $('[data-dock]');
  if (!dock) return;

  const contact = $('#contacto');
  const hero = $('.hero');

  // Umbral: la barra aparece cuando ya se ha salido del hero
  const threshold = () => (hero ? hero.offsetHeight * 0.7 : window.innerHeight);

  let pastHero = window.scrollY > threshold();
  let contactVisible = false;

  // Única fuente de verdad: evita que el scroll y el observer se peleen
  const update = () => dock.classList.toggle('is-visible', pastHero && !contactVisible);

  const onScroll = () => {
    const next = window.scrollY > threshold();
    if (next === pastHero) return;
    pastHero = next;
    update();
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Sobre el formulario ya hay CTA visibles: la barra solo estorbaría
  if (contact && supportsObserver) {
    const observer = new IntersectionObserver(([entry]) => {
      contactVisible = entry.isIntersecting;
      update();
    }, { threshold: 0.15 });

    observer.observe(contact);
  }
}


/* ==========================================================================
   09. VARIOS — año, preselección de plan, inclinación 3D y tracking
   ========================================================================== */
function initMisc() {
  // Año actual en el pie de página
  $$('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  // Enlaces del footer que preseleccionan el programa
  $$('[data-plan]').forEach((link) => {
    link.addEventListener('click', () => {
      const select = document.querySelector('#programa');
      if (select) select.value = link.dataset.plan;
    });
  });

  // Tracking de clics en elementos marcados
  $$('[data-track]').forEach((el) => {
    el.addEventListener('click', () => track(el.dataset.track, { location: 'landing' }));
  });

  // Inclinación 3D suave en las tarjetas (solo punteros finos)
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion()) {
    $$('[data-tilt]').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        card.style.transform =
          `perspective(900px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) translateY(-6px)`;
      });

      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });
  }
}


/* ==========================================================================
   Fallback de imágenes del bloque "Sobre mí":
   muestra el monograma si no hay fotografía, la oculta si la hay.
   ========================================================================== */
function initAboutPhoto() {
  $$('[data-img-fallback]').forEach((img) => {
    const mark = () => img.closest('.about__photo')?.classList.add('has-img');
    const drop = () => img.remove();

    if (img.complete) {
      if (img.naturalWidth > 0) mark();
      else drop();
      return;
    }

    img.addEventListener('load', mark, { once: true });
    img.addEventListener('error', drop, { once: true });
  });
}


/* ==========================================================================
   Arranque
   ========================================================================== */
function init() {
  const modules = [
    initHeader,
    initNav,
    initReveal,
    initCounters,
    initCarousel,
    initHeroMedia,
    initForm,
    initDock,
    initMisc,
    initAboutPhoto
  ];

  // Cada módulo se ejecuta de forma aislada: un fallo no detiene a los demás
  modules.forEach((mod) => {
    try {
      mod();
    } catch (error) {
      console.error(`[init] Falló el módulo "${mod.name}":`, error);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
