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
      // Ничего больше делать не нужно!
    });
  }

	
  



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