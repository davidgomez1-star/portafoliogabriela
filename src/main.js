import './style.css';

// MENÚ MÓVIL
const menuToggle = document.getElementById('menu-toggle');
const nav = document.getElementById('nav');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';

    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute(
      'aria-label',      isOpen ? 'Abrir menú' : 'Cerrar menú'
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
    {
      threshold: 0.12,
    }
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
// Más adelante agregaremos el correo real de Gabriela.
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

/* LOGOS EN MEDIA LUNA: SALEN DEL BOLSO */

const brandsCanvas = document.querySelector('.brands-canvas');
const brandsSection = document.querySelector('#marcas');

if (brandsCanvas && brandsSection) {
  const logos = [...brandsCanvas.querySelectorAll('.brand-orbit')];

  const desktopArc = [
    [6, 69],
    [15, 52],
    [25, 34],
    [37.5, 19],
    [50, 13],
    [62.5, 19],
    [75, 34],
    [85, 52],
    [94, 69],
  ];

  const tabletArc = [
    [7, 68],
    [15, 51],
    [26, 34],
    [38, 19],
    [50, 13],
    [62, 19],
    [74, 34],
    [85, 51],
    [93, 68],
  ];

  const mobileArc = [
    [9, 67],
    [15, 52],
    [26, 37],
    [38, 25],
    [50, 20],
    [62, 25],
    [74, 37],
    [85, 52],
    [91, 67],
  ];

  let animationStarted = false;
  let resizeObserver;

  function arrangeBrandArc() {
    const width = brandsCanvas.clientWidth;
    if (!width) return;

    const positions =
      width <= 600 ? mobileArc : width <= 850 ? tabletArc : desktopArc;

    const canvasRect = brandsCanvas.getBoundingClientRect();
    const bag = brandsCanvas.querySelector('.brands-bag');

    let centerX = 50;
    let centerY = 75;

    if (bag) {
      const bagRect = bag.getBoundingClientRect();

      centerX =
        ((bagRect.left + bagRect.width / 2 - canvasRect.left) /
          canvasRect.width) *
        100;

      centerY =
        ((bagRect.top + bagRect.height / 2 - canvasRect.top) /
          canvasRect.height) *
        100;
    }

    logos.forEach((logo, index) => {
      const point = positions[index];
      if (!point) return;

      logo.dataset.targetLeft = point[0];
      logo.dataset.targetTop = point[1];

      logo.style.right = 'auto';
      logo.style.bottom = 'auto';

      // Antes de la animación, todos esperan dentro del bolso.
      if (!animationStarted) {
        logo.style.left = `${centerX}%`;
        logo.style.top = `${centerY}%`;
      } else {
        // Después de la animación, adaptamos la media luna
        // al tamaño actual de la pantalla.
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

        // Recalcular el centro del bolso justo antes de empezar.
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

          // Crear una curva suave entre el bolso y cada logo.
          const bend = index % 2 === 0 ? 1 : -1;
          const controlX = (startX + endX) / 2 + (endY - startY) * 0.12 * bend;
          const controlY = (startY + endY) / 2 - (endX - startX) * 0.12 * bend;

          // Punto intermedio de la curva de salida.
          const middleX = 0.25 * startX + 0.5 * controlX + 0.25 * endX;
          const middleY = 0.25 * startY + 0.5 * controlY + 0.25 * endY;

          const animation = logo.animate(
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
            // Guardar la posición final y liberar la animación
            // para que el efecto hover siga funcionando.
            logo.style.left = `${endX}%`;
            logo.style.top = `${endY}%`;
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
}

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
          description: 'Contenido de cuidado personal y belleza.',
        },
      ],
    },

    food: {
      title: 'Gastronomía',
      description: 'Sabores, lugares especiales y experiencias gastronómicas.',
      posts: [
        {
          instagramUrl: 'https://www.instagram.com/reel/Dc4OC0-x0-y/',
          title: 'Experiencia gastronómica',
          description: 'Contenido de gastronomía.',
        },
      ],
    },

    hair: {
      title: 'Capilar',
      description:
        'Rutinas, productos y experiencias para el cuidado del cabello.',
      posts: [
        {
          instagramUrl: 'https://www.instagram.com/reel/DdUkjNbRPkw/',
          title: 'Cuidado capilar',
          description: 'Contenido sobre el cuidado del cabello.',
        },
      ],
    },

    travel: {
      title: 'Viaje y Turismo',
      description:
        'Destinos, planes y momentos que inspiran a descubrir nuevos lugares.',
      posts: [
        {
          instagramUrl: 'https://www.instagram.com/reel/DdmQ1MZRAT8/',
          title: 'Viaje y Turismo',
          description: 'Contenido de viajes y destinos.',
        },
      ],
    },
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

      // Insertar un Reel público de Instagram.
      if (post.instagramUrl) {
        const embed = document.createElement('blockquote');
        embed.className = 'instagram-media';
        embed.setAttribute('data-instgrm-permalink', post.instagramUrl);
        embed.setAttribute('data-instgrm-version', '14');

        const link = document.createElement('a');
        link.href = post.instagramUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Ver Reel en Instagram';

        embed.appendChild(link);
        article.appendChild(embed);
      } else if (post.videoUrl) {
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
      } else if (post.poster) {
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

    // Cargar el script oficial de Instagram una sola vez.
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
      script.addEventListener('load', () => window.instgrm?.Embeds?.process(), {
        once: true,
      });
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

/* Carrusel de testimonios */
const testimonialsCarousel = document.querySelector(
  ".testimonials-carousel"
);

const testimonialsPrev = document.querySelector(
  ".testimonial-prev"
);

const testimonialsNext = document.querySelector(
  ".testimonial-next"
);

if (testimonialsCarousel && testimonialsPrev && testimonialsNext) {
  const scrollTestimonials = (direction) => {
    const card = testimonialsCarousel.querySelector(
      ".testimonial-card"
    );

    if (!card) return;

    const track = testimonialsCarousel.querySelector(
      ".testimonials-track"
    );

    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap) || 0;
    const distance = card.getBoundingClientRect().width + gap;

    testimonialsCarousel.scrollBy({
      left: direction * distance,
      behavior: "smooth"
    });
  };

  testimonialsPrev.addEventListener("click", () => {
    scrollTestimonials(-1);
  });

  testimonialsNext.addEventListener("click", () => {
    scrollTestimonials(1);
  });
}

/* Ampliación de testimonios */
const testimonialCards = document.querySelectorAll(
  ".testimonial-card"
);

const testimonialLightbox = document.querySelector(
  "#testimonial-lightbox"
);

const testimonialLightboxImage = testimonialLightbox?.querySelector("img");

const testimonialLightboxClose = testimonialLightbox?.querySelector(
  ".testimonial-lightbox-close"
);

let testimonialPreviousFocus = null;

function openTestimonialLightbox(image, card) {
  if (!testimonialLightbox || !testimonialLightboxImage) return;

  testimonialPreviousFocus = card;

  testimonialLightboxImage.src = image.currentSrc || image.src;
  testimonialLightboxImage.alt = image.alt || "Testimonio ampliado";

  testimonialLightbox.classList.add("is-open");
  testimonialLightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  testimonialLightboxClose?.focus();
}

function closeTestimonialLightbox() {
  if (!testimonialLightbox) return;

  testimonialLightbox.classList.remove("is-open");
  testimonialLightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  testimonialPreviousFocus?.focus();
}

testimonialCards.forEach((card) => {
  const image = card.querySelector("img");

  if (!image) return;

  card.setAttribute("tabindex", "0");
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", "Ampliar testimonio");

  card.addEventListener("click", () => {
    openTestimonialLightbox(image, card);
  });

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openTestimonialLightbox(image, card);
    }
  });
});

testimonialLightboxClose?.addEventListener(
  "click",
  closeTestimonialLightbox
);

testimonialLightbox?.addEventListener("click", (event) => {
  if (event.target === testimonialLightbox) {
    closeTestimonialLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    testimonialLightbox?.classList.contains("is-open")
  ) {
    closeTestimonialLightbox();
  }
});

/* Permitir ampliar las imágenes de métricas */
const metricCards = document.querySelectorAll(".metric-card");

metricCards.forEach((card) => {
  const image = card.querySelector("img");
  if (!image) return;

  card.setAttribute("tabindex", "0");
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", "Ampliar métrica");

  card.addEventListener("click", () => {
    if (typeof openTestimonialLightbox === "function") {
      openTestimonialLightbox(image, card);
    }
  });

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (typeof openTestimonialLightbox === "function") {
        openTestimonialLightbox(image, card);
      }
    }
  });
});
