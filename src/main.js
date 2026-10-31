import './style.css';

// MENÚ MÓVIL
const menuToggle = document.getElementById('menu-toggle');
const nav = document.getElementById('nav');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';

    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute(
      'aria-label',
      isOpen ? 'Abrir menú' : 'Cerrar menú'
    );

    nav.classList.toggle('open', !isOpen);
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Abrir menú');
    });
  });
}

// ANIMACIONES AL DESPLAZARSE
const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => {
    element.classList.add('is-visible');
  });
}

// AÑO AUTOMÁTICO
const footerYear = document.querySelector('.site-footer > span');

if (footerYear) {
  footerYear.textContent = `© ${new Date().getFullYear()} Gabriela Correa`;
}

// ENLACE DE CONTACTO
const contactEmail = document.getElementById('contact-email');

if (contactEmail) {
  contactEmail.addEventListener('click', (event) => {
    if (
      !contactEmail.getAttribute('href') ||
      contactEmail.getAttribute('href') === 'mailto:'
    ) {
      event.preventDefault();
      alert(
        'Pronto podrás contactar directamente a Gabriela. Estamos preparando sus datos de contacto.'
      );
    }
  });
}

/* =========================================
   LOGOS EN MEDIA LUNA: SALEN DEL BOLSO
========================================= */

const brandsCanvas = document.querySelector('.brands-canvas');
const brandsSection = document.querySelector('#marcas');

if (brandsCanvas && brandsSection) {
  const logos = [...brandsCanvas.querySelectorAll('.brand-orbit')];

  // Calcula 15 posiciones distribuidas uniformemente
  // sobre una media elipse, adaptada al ancho disponible.
  

  function createBrandArc(width) {
    const count = logos.length;
  
    const settings =
      width <= 600
        ? { left: 8, right: 92, top: 20, bottom: 65 }
        : width <= 850
          ? { left: 5, right: 95, top: 12, bottom: 65 }
          : { left: 4, right: 96, top: 8, bottom: 65 };
  
    const rx = (settings.right - settings.left) / 2;
    const ry = settings.bottom - settings.top;
    const cx = (settings.left + settings.right) / 2;
    const cy = settings.bottom;
  
    const positions = [];
  
    // Distribución uniforme siguiendo la longitud del arco.
    const samples = 2000;
    const curve = [];
    const lengths = [0];
  
    for (let i = 0; i <= samples; i++) {
      const angle = Math.PI - (Math.PI * i) / samples;
  
      curve.push([
        cx + rx * Math.cos(angle),
        cy - ry * Math.sin(angle),
      ]);
  
      if (i > 0) {
        const previous = curve[i - 1];
        const current = curve[i];
  
        lengths.push(
          lengths[i - 1] +
            Math.hypot(
              (current[0] - previous[0]) * width / 100,
              (current[1] - previous[1]) * brandsCanvas.clientHeight / 100
            )
        );
      }
    }
  
    const total = lengths[lengths.length - 1];
  
    for (let i = 0; i < count; i++) {
      const target = total * i / (count - 1);
  
      let low = 0;
      let high = lengths.length - 1;
  
      while (low < high) {
        const middle = Math.floor((low + high) / 2);
  
        if (lengths[middle] < target) {
          low = middle + 1;
        } else {
          high = middle;
        }
      }
  
      positions.push(curve[low]);
    }
  
    return positions;
  }
  
  let animationStarted = false;
  let resizeObserver;

  // Posiciona los logos y calcula el centro del bolso.
  function arrangeBrandArc() {
    const width = brandsCanvas.clientWidth;
    const height = brandsCanvas.clientHeight;

    if (!width || !height) return;

    const positions = createBrandArc(width);
    const canvasRect = brandsCanvas.getBoundingClientRect();
    const bag = brandsCanvas.querySelector('.brands-bag');

    let centerX = 50;
    let centerY = 75;

    if (bag) {
      const bagRect = bag.getBoundingClientRect();

      centerX =
        ((bagRect.left + bagRect.width / 2 - canvasRect.left) /
          width) *
        100;

      centerY =
        ((bagRect.top + bagRect.height / 2 - canvasRect.top) /
          height) *
        100;
    }

    logos.forEach((logo, index) => {
      const point = positions[index];
      if (!point) return;

      logo.dataset.targetLeft = point[0];
      logo.dataset.targetTop = point[1];

      logo.style.right = 'auto';
      logo.style.bottom = 'auto';
      logo.style.transform = 'translate(-50%, -50%)';

      if (!animationStarted) {
        logo.style.left = `${centerX}%`;
        logo.style.top = `${centerY}%`;
      } else {
        logo.style.left = `${point[0]}%`;
        logo.style.top = `${point[1]}%`;
      }
    });
  }

  arrangeBrandArc();

  const brandsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || animationStarted) return;

        arrangeBrandArc();

        const canvasRect = brandsCanvas.getBoundingClientRect();
        const bag = brandsCanvas.querySelector('.brands-bag');

        let startX = 50;
        let startY = 75;

        if (bag) {
          const bagRect = bag.getBoundingClientRect();

          startX =
            ((bagRect.left + bagRect.width / 2 - canvasRect.left) /
              canvasRect.width) *
            100;

          startY =
            ((bagRect.top + bagRect.height / 2 - canvasRect.top) /
              canvasRect.height) *
            100;
        }

        animationStarted = true;
        brandsSection.classList.add('is-visible');

        logos.forEach((logo, index) => {
          const endX = Number(logo.dataset.targetLeft);
          const endY = Number(logo.dataset.targetTop);

          const bend = index % 2 === 0 ? 1 : -1;

          const controlX =
            (startX + endX) / 2 +
            (endY - startY) * 0.12 * bend;

          const controlY =
            (startY + endY) / 2 -
            (endX - startX) * 0.12 * bend;

          const middleX =
            0.25 * startX + 0.5 * controlX + 0.25 * endX;

          const middleY =
            0.25 * startY + 0.5 * controlY + 0.25 * endY;          const animation = logo.animate(
              [
                {
                  left: `${startX}%`,
                  top: `${startY}%`,
                  opacity: 0,
                  transform: 'translate(-50%, -50%) scale(0.15)',
                },
                {
                  left: `${middleX}%`,
                  top: `${middleY}%`,
                  opacity: 1,
                  transform: 'translate(-50%, -50%) scale(0.7)',
                  offset: 0.55,
                },
                {
                  left: `${endX}%`,
                  top: `${endY}%`,
                  opacity: 1,
                  transform: 'translate(-50%, -50%) scale(1)',
                },
              ],
              {
                duration: 1000,
                delay: index * 90,
                easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
                fill: 'forwards',
              }
            );
  
            animation.onfinish = () => {
              logo.style.left = `${endX}%`;
              logo.style.top = `${endY}%`;
              logo.style.opacity = '1';
              logo.style.transform = 'translate(-50%, -50%)';
              animation.cancel();
            };
          });
  
          brandsObserver.unobserve(brandsSection);
        });
      },
      { threshold: 0.25 }
    );
  
    brandsObserver.observe(brandsSection);
  
    window.addEventListener('resize', arrangeBrandArc);
  
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(arrangeBrandArc);
      resizeObserver.observe(brandsCanvas);
    }
  } // Cierra correctamente el bloque de los logos.
  
  /* =========================================
     PORTAFOLIO AUDIOVISUAL: CARRUSEL Y MODAL
  ========================================= */
  
  (() => {
    const track = document.querySelector('.content-track');
    const prevButton = document.querySelector('.content-prev');
    const nextButton = document.querySelector('.content-next');
    const modal = document.querySelector('#content-modal');
  
    if (!track || !modal) return;
  
    const modalTitle = modal.querySelector('#modal-title');
    const modalDescription = modal.querySelector('#modal-description');
    const postsContainer = modal.querySelector('#content-posts');
    const closeButtons = modal.querySelectorAll('[data-close-modal]');
  
    const categories = {
      beauty: {
        title: 'Belleza y Skincare',
        description:
          'Rutinas, productos favoritos y experiencias de cuidado personal.',

          posts: [
            {
                instagramUrl: 'https://www.instagram.com/reel/DeQDM17xtz9/',
                title: 'Belleza y Skincare',
                description: 'Contenido de belleza y cuidado personal.'
            },
            {
                instagramUrl: 'https://www.instagram.com/reel/DbUFH15RDx1/',
                title: 'Belleza y Skincare',
                description: 'Contenido de belleza y cuidado personal.'
            },
            {
                instagramUrl: 'https://www.instagram.com/reel/DcmLJsRRgBA/',
                title: 'Belleza y Skincare',
                description: 'Contenido de belleza y cuidado personal.'
            },
            {
                instagramUrl: 'https://www.instagram.com/reel/DdXdjFmx_YC/',
                title: 'Belleza y Skincare',
                description: 'Contenido de belleza y cuidado personal.'
            },
            {
                instagramUrl: 'https://www.instagram.com/reel/DdpW9G9xRVe/',
                title: 'Belleza y Skincare',
                description: 'Contenido de belleza y cuidado personal.'
            },
            {
                instagramUrl: 'https://www.instagram.com/reel/DeFVTb6RE4Z/',
                title: 'Belleza y Skincare',
                description: 'Contenido de belleza y cuidado personal.'
            },
            {
                instagramUrl: 'https://www.instagram.com/reel/DeIVlyIR7Pi/',
                title: 'Belleza y Skincare',
                description: 'Contenido de belleza y cuidado personal.'
            }
        ]
      },
  

      food: {
        title: 'Gastronomía',
        description: 'Sabores, lugares especiales y experiencias gastronómicas.',
        posts: [
          {
            instagramUrl: 'https://www.instagram.com/reel/Da8UYlwxBgx/',
            title: 'Empicadas',
            description: 'Una experiencia gastronómica para descubrir nuevos sabores.'
          },
          {
            instagramUrl: 'https://www.instagram.com/reel/DbrBtdEx_v-/',
            title: 'JM Artesano',
            description: 'Una propuesta artesanal para disfrutar y compartir.'
          },
          {
            instagramUrl: 'https://www.instagram.com/reel/Dc1XqhxxPqk/',
            title: 'GelatiMarte',
            description: 'Una experiencia dulce para los amantes del helado.'
          },
          {
            instagramUrl: 'https://www.instagram.com/reel/Dc4OC0-x0-y/',
            title: 'Sushi Break',
            description: 'Una experiencia gastronómica alrededor del sushi.'
          },
          {
            instagramUrl: 'https://www.instagram.com/reel/Dd4VnC-xUHz/',
            title: 'JM Artesano: Galletas',
            description: 'Una propuesta artesanal dedicada al mundo de las galletas.'
          },
        ],
      },
      
  

      hair: {
        title: 'Mundo Capilar',
        description: 'Rutinas, productos y experiencias para el cuidado del cabello.',
        posts: [
          {
            instagramUrl: 'https://www.instagram.com/reel/Dc6vwMFR8iZ/',
            title: 'Shampoo Ritual Botánica',
            description: 'Una experiencia de cuidado capilar con Ritual Botánica.'
          },
          {
            instagramUrl: 'https://www.instagram.com/reel/DbEDWd_Rdih/',
            title: 'Mascarilla Ritual Botánica',
            description: 'Contenido sobre el cuidado y tratamiento del cabello.'
          },
          {
            instagramUrl: 'https://www.instagram.com/reel/DdUkjNbRPkw/',
            title: 'Rutina Capilar',
            description: 'Una rutina dedicada al cuidado del cabello.'
          },
          {
            instagramUrl: 'https://www.instagram.com/reel/DdZ9wfzRsdQ/',
            title: 'Loción o Perfume Capilar',
            description: 'Una propuesta para complementar el cuidado capilar.'
          },
        ],
      },
        

travel: {
  title: 'Viaje y Turismo',
  description: 'Destinos, planes y momentos que inspiran a descubrir nuevos lugares.',
  posts: [
    {
      instagramUrl: 'https://www.instagram.com/reel/DUZguZSjd-T/',
      title: 'Viaje a Boyacá',
      description: 'Un recorrido para descubrir los paisajes y encantos de Boyacá.'
    },
    {
      instagramUrl: 'https://www.instagram.com/reel/DUa-rZWEZ8m/',
      title: 'Vlog: Tibasosa, Boyacá',
      description: 'Una experiencia recorriendo Tibasosa y sus atractivos.'
    },
    {
      instagramUrl: 'https://www.instagram.com/reel/DXnZYfDDe-B/',
      title: 'Catedral de Manizales',
      description: 'Una visita a uno de los lugares emblemáticos de Manizales.'
    },
    {
      instagramUrl: 'https://www.instagram.com/reel/DZaYK7xRzxl/',
      title: 'Villa Natalia, Salento',
      description: 'Una experiencia para disfrutar de los paisajes y el encanto de Salento.'
    },
    {
      instagramUrl: 'https://www.instagram.com/reel/DcWzsRURYrC/',
      title: 'Castillo del Café',
      description: 'Una visita para descubrir este destino turístico.'
    },
    {
      instagramUrl: 'https://www.instagram.com/reel/DcehJFTxi6Q/',
      title: 'Jardín Botánico Gamonrá',
      description: 'Un recorrido por un espacio natural lleno de vida.'
    },
    {
      instagramUrl: 'https://www.instagram.com/reel/Dcodrc9xki2/',
      title: 'Maderero Campestre',
      description: 'Una experiencia para disfrutar de un entorno campestre.'
    },
    {
      instagramUrl: 'https://www.instagram.com/reel/DdmQ1MZRAT8/',
      title: 'Avistamiento de ballenas, Buenaventura',
      description: 'Una experiencia de naturaleza y avistamiento de ballenas en Buenaventura.'
    },
  ],
},

projects: {
  title: 'Experiencias de marca',
  description: 'Campañas, colaboraciones y proyectos creativos.',
  posts: [
    {
      instagramUrl: 'https://www.instagram.com/reel/DbRCi7oRyXv/',
      title: 'Proyecto de óptica',
      description: 'Experiencia de marca y contenido visual.'
    },
    {
      instagramUrl: 'https://www.instagram.com/reel/DdCaLbjxODn/',
      title: 'Campaña publicitaria',
      description: 'Contenido creativo para una marca.'
    },
    {
      instagramUrl: 'https://www.instagram.com/reel/DdPhI0_RLHV/',
      title: 'Contenido de marca',
      description: 'Una experiencia creativa para redes sociales.'
    },
    {
      instagramUrl: 'https://www.instagram.com/reel/Dd6paIBxJfH/',
      title: 'Maquillaje artístico',
      description: 'Creatividad y expresión a través del maquillaje.'
    },
    {
      instagramUrl: 'https://www.instagram.com/reel/DeKmxlBRW0b/',
      title: 'Proyecto creativo',
      description: 'Contenido audiovisual y comunicación de marca.'
    },
    {
      instagramUrl: 'https://www.instagram.com/reel/DeiJRQ-Rn1O/',
      title: 'Experiencia publicitaria',
      description: 'Creación de contenido para redes sociales.'
    },
    {
      instagramUrl: 'https://www.instagram.com/p/DexFolUIPMU/',
      title: 'Colaboración de marca',
      description: 'Contenido y colaboración comercial.'
    },
    {
      instagramUrl: 'https://www.instagram.com/reel/DfCxP2kRl__/',
      title: 'Proyecto de contenido',
      description: 'Producción creativa para plataformas digitales.'
    },
    {
      instagramUrl: 'https://www.instagram.com/reel/De4UTeCx2J4/',
      title: 'Campaña Alkosto',
      description: 'Contenido promocional relacionado con iPhone.'
    },
    {
      instagramUrl: 'https://www.instagram.com/reel/DfF--kMRbS5/',
      title: 'Contenido publicitario',
      description: 'Comunicación visual y promoción de marca.'
    },
    {
      instagramUrl: 'https://www.instagram.com/reel/DP-NQvIDbyI/',
      title: 'Proyecto especial',
      description: 'Una experiencia más dentro de su trabajo creativo.'
    }
  ]
}

    };
  
    // Navegación horizontal del carrusel.
    function scrollCards(direction) {
      const card = track.querySelector('.content-card');
      if (!card) return;
  
      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap) || 0;
      const distance = card.getBoundingClientRect().width + gap;
  
      track.scrollBy({
        left: direction * distance,
        behavior: 'smooth',
      });
    }
  
    prevButton?.addEventListener('click', () => scrollCards(-1));
    nextButton?.addEventListener('click', () => scrollCards(1));
  
    // Construye las publicaciones de una categoría.

// Construye las publicaciones de una categoría.
function renderPosts(category) {
  postsContainer.replaceChildren();

  if (!category.posts.length) {
    const emptyState = document.createElement('div');
    emptyState.className = 'content-empty';

    const symbol = document.createElement('div');
    symbol.className = 'content-empty-symbol';
    symbol.textContent = '✧';

    const heading = document.createElement('h3');
    heading.textContent = 'Próximamente';

    const message = document.createElement('p');
    message.textContent =
      'Estamos preparando esta selección de videos. Muy pronto podrás explorar las publicaciones de esta categoría.';

    emptyState.append(symbol, heading, message);
    postsContainer.appendChild(emptyState);
    return;
  }

  category.posts.forEach((post) => {
    const article = document.createElement('article');
    article.className = 'content-post';

    // Insertar Reel de Instagram.

    // Insertar Reel de Instagram.
// Insertar Reel de Instagram.
// Insertar Reel de Instagram.
if (post.instagramUrl) {
  const reelUrl = post.instagramUrl
    .split('?')[0]
    .replace(/\/$/, '');

  const videoWrapper = document.createElement('div');
  videoWrapper.className = 'instagram-video-wrapper';

  const iframe = document.createElement('iframe');

  iframe.src = `${reelUrl}/embed/`;
  iframe.title = post.title || 'Video de Instagram';
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('scrolling', 'no');

  videoWrapper.appendChild(iframe);
  article.appendChild(videoWrapper);
}
    // Reproducción de videos MP4.
    else if (post.videoUrl) {
      const video = document.createElement('video');
      video.className = 'content-post-media';
      video.src = post.videoUrl;
      video.controls = true;
      video.preload = 'metadata';
      video.playsInline = true;

      if (post.poster) {
        video.poster = post.poster;
      }

      article.appendChild(video);
    }

    // Mostrar imagen cuando no hay video.
    else if (post.poster) {
      const image = document.createElement('img');
      image.className = 'content-post-media';
      image.src = post.poster;
      image.alt = post.title || 'Portada de publicación';
      image.loading = 'lazy';

      article.appendChild(image);
    }

    const heading = document.createElement('h3');
    heading.textContent = post.title || 'Una experiencia para compartir';
    article.appendChild(heading);

    if (post.description) {
      const description = document.createElement('p');
      description.textContent = post.description;
      article.appendChild(description);
    }

    postsContainer.appendChild(article);
  });

  // Procesar las publicaciones con el script oficial de Instagram.
  const scriptUrl = 'https://www.instagram.com/embed.js';
  let script = document.querySelector(`script[src="${scriptUrl}"]`);

  if (!script) {
    script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;

    script.onload = () => {
      window.instgrm?.Embeds?.process();
    };

    document.body.appendChild(script);
  } else if (window.instgrm?.Embeds) {
    window.instgrm.Embeds.process();
  } else {
    script.addEventListener(
      'load',
      () => window.instgrm?.Embeds?.process(),
      { once: true }
    );
  }
}
    // Abrir la ventana superpuesta.
    function openModal(categoryKey) {
      const category = categories[categoryKey];
      if (!category) return;
  
      modalTitle.textContent = category.title;
      modalDescription.textContent = category.description;
  
      renderPosts(category);
  
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('content-modal-open');
  
      modal.querySelector('.content-modal-close')?.focus();
    }
  
    // Cerrar la ventana y detener cualquier video en reproducción.
    function closeModal() {
      if (!modal.classList.contains('is-open')) return;
  
      modal.querySelectorAll('video').forEach((video) => {
        video.pause();
        video.removeAttribute('src');
        video.load();
      });
  
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('content-modal-open');
    }
  
    // Botones de las cuatro categorías.
    track.querySelectorAll('[data-category]').forEach((button) => {
      button.addEventListener('click', () => {
        openModal(button.dataset.category);
      });
    });
  
    closeButtons.forEach((button) => {
      button.addEventListener('click', closeModal);
    });
  
    // Cerrar con Escape.
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    });
  })();
  
  /* =========================================
  CARRUSEL DE TESTIMONIOS
========================================= */

const testimonialsCarousel = document.querySelector(
 '.testimonials-carousel'
);

const testimonialsPrev = document.querySelector('.testimonial-prev');
const testimonialsNext = document.querySelector('.testimonial-next');

if (testimonialsCarousel && testimonialsPrev && testimonialsNext) {
 const scrollTestimonials = (direction) => {
   const card = testimonialsCarousel.querySelector('.testimonial-card');
   if (!card) return;

   const track = testimonialsCarousel.querySelector('.testimonials-track');
   if (!track) return;

   const styles = window.getComputedStyle(track);
   const gap = parseFloat(styles.columnGap) || 0;
   const distance = card.getBoundingClientRect().width + gap;

   testimonialsCarousel.scrollBy({
     left: direction * distance,
     behavior: 'smooth',
   });
 };

 testimonialsPrev.addEventListener('click', () => {
   scrollTestimonials(-1);
 });

 testimonialsNext.addEventListener('click', () => {
   scrollTestimonials(1);
 });
}

/* =========================================
  AMPLIACIÓN DE TESTIMONIOS
========================================= */

const testimonialCards = document.querySelectorAll('.testimonial-card');

const testimonialLightbox = document.querySelector('#testimonial-lightbox');
const testimonialLightboxImage = testimonialLightbox?.querySelector('img');

const testimonialLightboxClose = testimonialLightbox?.querySelector(
 '.testimonial-lightbox-close'
);

let testimonialPreviousFocus = null;

function openTestimonialLightbox(image, card) {
 if (!testimonialLightbox || !testimonialLightboxImage) return;

 testimonialPreviousFocus = card;

 testimonialLightboxImage.src = image.currentSrc || image.src;
 testimonialLightboxImage.alt = image.alt || 'Testimonio ampliado';

 testimonialLightbox.classList.add('is-open');
 testimonialLightbox.setAttribute('aria-hidden', 'false');
 document.body.style.overflow = 'hidden';

 testimonialLightboxClose?.focus();
}

function closeTestimonialLightbox() {
 if (!testimonialLightbox) return;

 testimonialLightbox.classList.remove('is-open');
 testimonialLightbox.setAttribute('aria-hidden', 'true');
 document.body.style.overflow = '';

 testimonialPreviousFocus?.focus();
}

testimonialCards.forEach((card) => {
 const image = card.querySelector('img');
 if (!image) return;

 card.setAttribute('tabindex', '0');
 card.setAttribute('role', 'button');
 card.setAttribute('aria-label', 'Ampliar testimonio');

 card.addEventListener('click', () => {
   openTestimonialLightbox(image, card);
 });

 card.addEventListener('keydown', (event) => {
   if (event.key === 'Enter' || event.key === ' ') {
     event.preventDefault();
     openTestimonialLightbox(image, card);
   }
 });
});

testimonialLightboxClose?.addEventListener(
 'click',
 closeTestimonialLightbox
);

testimonialLightbox?.addEventListener('click', (event) => {
 if (event.target === testimonialLightbox) {
   closeTestimonialLightbox();
 }
});

document.addEventListener('keydown', (event) => {
 if (
   event.key === 'Escape' &&
   testimonialLightbox?.classList.contains('is-open')
 ) {
   closeTestimonialLightbox();
 }
});

/* =========================================
  PERMITIR AMPLIAR LAS IMÁGENES DE MÉTRICAS
========================================= */

const metricCards = document.querySelectorAll('.metric-card');

metricCards.forEach((card) => {
 const image = card.querySelector('img');
 if (!image) return;

 card.setAttribute('tabindex', '0');
 card.setAttribute('role', 'button');
 card.setAttribute('aria-label', 'Ampliar métrica');

 card.addEventListener('click', () => {
   openTestimonialLightbox(image, card);
 });

 card.addEventListener('keydown', (event) => {
   if (event.key === 'Enter' || event.key === ' ') {
     event.preventDefault();
     openTestimonialLightbox(image, card);
   }
 });
});

/* =========================================
   INTERACCIÓN DE TARJETAS DE SERVICIOS
========================================= */

const serviceButtons = document.querySelectorAll('.service-toggle');

serviceButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const serviceCard = button.closest('.service-card');
    const serviceContent = document.getElementById(
      button.getAttribute('aria-controls')
    );
    const serviceIcon = button.querySelector('.service-icon');

    const isExpanded = button.getAttribute('aria-expanded') === 'true';

    button.setAttribute('aria-expanded', String(!isExpanded));
    serviceContent.hidden = isExpanded;
    serviceCard.classList.toggle('is-open', !isExpanded);

    serviceIcon.textContent = isExpanded ? '+' : '−';
  });
});
