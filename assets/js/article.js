//article.js

// ============================================
// 📄 СКРИПТ ДЛЯ СТАТЬИ
// ============================================

document.addEventListener('DOMContentLoaded', function() {
	const themeToggle = document.getElementById('theme-toggle');
	const body = document.body;
  
	 if (themeToggle) {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      body.setAttribute('data-theme', savedTheme);
    }

    themeToggle.addEventListener('click', () => {
      const currentTheme = body.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      body.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);      
      
    });
  }

	function updateScrollbarTheme() {
  const body = document.body;
  
  // Создаем или обновляем стиль для скроллбара
  let style = document.getElementById('scrollbar-style');
  if (!style) {
    style = document.createElement('style');
    style.id = 'scrollbar-style';
    document.head.appendChild(style);
  }
  
  // Получаем актуальные цвета из computed styles body
  const computedStyle = getComputedStyle(body);
  const accentColor = computedStyle.getPropertyValue('--color-accent-primary').trim() || '#00b7ff';
  const bgSurface = computedStyle.getPropertyValue('--color-bg-surface').trim() || '#252a33';
  
  style.textContent = `
    /* Стили для скроллбара */
    ::-webkit-scrollbar {
      width: 0.4375rem;
      height: 0.4375rem;
    }
    
    ::-webkit-scrollbar-track {
      background-color: ${bgSurface} !important;
      border-radius: 0.5rem;
    }
    
    ::-webkit-scrollbar-thumb {
      background-color: ${accentColor} !important;
      border-radius: 0.5rem;
      border: 0.125rem solid ${bgSurface};
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background-color: ${accentColor} !important;
      filter: brightness(1.2);
    }
    
    /* Для Firefox */
    * {
      scrollbar-width: thin;
      scrollbar-color: ${accentColor} ${bgSurface} !important;
    }
    
    /* Для карточек */
    .card::-webkit-scrollbar {
      width: 0.3125rem;
      height: 0.3125rem;
    }
    
    .card::-webkit-scrollbar-track {
      background-color: var(--color-bg-input) !important;
    }
    
    .card::-webkit-scrollbar-thumb {
      background-color: ${accentColor} !important;
    }
    
    /* Для модального окна */
    .modal-content::-webkit-scrollbar {
      width: 0.3125rem;
      height: 0.3125rem;
    }
    
    .modal-content::-webkit-scrollbar-track {
      background-color: var(--color-bg-input) !important;
    }
    
    .modal-content::-webkit-scrollbar-thumb {
      background-color: ${accentColor} !important;
    }
    
    /* Адаптация для мобильных */
    @media (max-width: 48rem) {
      ::-webkit-scrollbar {
        width: 0.375rem;
        height: 0.375rem;
      }
      
      .card::-webkit-scrollbar,
      .modal-content::-webkit-scrollbar {
        width: 0.25rem;
        height: 0.25rem;
      }
    }
    
    @media (max-width: 30rem) {
      ::-webkit-scrollbar {
        width: 0.3125rem;
        height: 0.3125rem;
      }
      
      .card::-webkit-scrollbar,
      .modal-content::-webkit-scrollbar {
        width: 0.1875rem;
        height: 0.1875rem;
      }
    }
  `;
}

// Инициализация темы скроллбара
  updateScrollbarTheme();



  // Ленивая загрузка изображений
  const images = document.querySelectorAll('.gallery-image');
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  } else {
    images.forEach(img => img.classList.add('loaded'));
  }  
  
  const galleryItems = document.querySelectorAll('.gallery-image-wrapper');
  galleryItems.forEach(wrapper => {
    wrapper.addEventListener('click', function(e) {
      const img = this.querySelector('.gallery-image');
      if (!img) return;
      
      const modal = document.createElement('div');
      modal.className = 'image-modal';
      modal.innerHTML = `
        <div class="image-modal-content">
          <button class="image-modal-close">&times;</button>
          <img src="${img.src}" alt="${img.alt}">
        </div>
      `;
      
      document.body.appendChild(modal);
      document.body.style.overflow = 'hidden';
      
      setTimeout(() => modal.classList.add('active'), 10);
      
      const closeBtn = modal.querySelector('.image-modal-close');
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => {
          modal.remove();
          document.body.style.overflow = '';
          if (typeof window.updateScrollbarTheme === 'function') {
            window.updateScrollbarTheme();
          }
        }, 300);
      });
      
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
          setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
            if (typeof window.updateScrollbarTheme === 'function') {
              window.updateScrollbarTheme();
            }
          }, 300);
        }
      });
      
      const escHandler = (e) => {
        if (e.key === 'Escape') {
          modal.classList.remove('active');
          setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
            if (typeof window.updateScrollbarTheme === 'function') {
              window.updateScrollbarTheme();
            }
          }, 300);
          document.removeEventListener('keydown', escHandler);
        }
      };
      document.addEventListener('keydown', escHandler);
    });
  });
});

// Стили для модального окна
const modalStyles = document.createElement('style');
modalStyles.textContent = `
  .image-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }
  
  .image-modal.active {
    opacity: 1;
    pointer-events: auto;
  }
  
  .image-modal-content {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    transform: scale(0.9);
    transition: transform 0.3s ease;
  }
  
  .image-modal.active .image-modal-content {
    transform: scale(1);
  }
  
  .image-modal-content img {
    max-width: 100%;
    max-height: 90vh;
    object-fit: contain;
    border-radius: var(--radius-md);
    border: 2px solid var(--color-border);
  }
  
  .image-modal-close {
    position: absolute;
    top: -2.5rem;
    right: -2.5rem;
    width: 2.5rem;
    height: 2.5rem;
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border);
    border-radius: 50%;
    color: var(--color-text-primary);
    font-size: 2rem;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition);
    z-index: 10;
  }
  
  .image-modal-close:hover {
    background: var(--color-accent-primary);
    color: white;
    transform: rotate(90deg);
  }
  
  @media (max-width: 768px) {
    .image-modal-close {
      top: 0.5rem;
      right: 0.5rem;
    }
  }
`;





document.head.appendChild(modalStyles);