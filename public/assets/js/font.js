// Класс для управления шрифтами
class FontManager {
	constructor() {
		this.fonts = {
			Inter: "'Inter', sans-serif",
			Montserrat: "'Montserrat', sans-serif",
			'Sofia Sans': "'Sofia Sans', sans-serif",
			Manrope: "'Manrope', sans-serif",
			Geologica: "'Geologica', sans-serif",
		};

		this.currentFont = localStorage.getItem('selected-font') || 'Inter';
		this.isMobile = window.innerWidth <= 768;
		this.scrollPosition = 0;
		this.init();
	}

	init() {
		// Применяем сохраненный шрифт БЕЗ уведомления
		this.applyFont(this.currentFont, false);

		// Инициализируем индикатор
		this.updateFontIndicator();

		// Добавляем обработчики
		this.setupEventListeners();

		// Следим за изменением размера окна
		window.addEventListener('resize', () => {
			const wasMobile = this.isMobile;
			this.isMobile = window.innerWidth <= 768;

			// Если режим изменился и меню открыто
			const fontMenu = document.getElementById('font-selector-menu');
			if (fontMenu && fontMenu.classList.contains('active')) {
				if (wasMobile !== this.isMobile) {
					// Переключаем режим
					this.positionMenu();
					if (this.isMobile) {
						this.lockScroll();
					} else {
						this.unlockScroll();
					}
				}
			}
		});
	}

	lockScroll() {
		// Сохраняем текущую позицию скролла
		this.scrollPosition = window.scrollY;

		// Блокируем скролл на body
		document.body.style.overflow = 'hidden';
		document.body.style.position = 'fixed';
		document.body.style.top = `-${this.scrollPosition}px`;
		document.body.style.width = '100%';
	}

	unlockScroll() {
		// Разблокируем скролл
		document.body.style.overflow = '';
		document.body.style.position = '';
		document.body.style.top = '';
		document.body.style.width = '';

		// Возвращаем позицию скролла
		window.scrollTo(0, this.scrollPosition);
	}

	applyFont(fontName, showNotification = true) {
		const fontFamily = this.fonts[fontName];
		if (fontFamily) {
			// Проверяем, действительно ли изменился шрифт
			const previousFont = this.currentFont;

			document.documentElement.style.fontFamily = fontFamily;
			localStorage.setItem('selected-font', fontName);
			this.currentFont = fontName;
			this.updateFontIndicator();

			// Показываем уведомление ТОЛЬКО если шрифт действительно изменился
			// и только если это действие пользователя (showNotification = true)
			if (showNotification && previousFont !== fontName) {
				this.showNotification(`Шрифт изменен на ${fontName}`);
			}
		}
	}

	showNotification(message) {
		// Создаем уведомление, если его нет
		let notification = document.querySelector('.notification');
		if (!notification) {
			notification = document.createElement('div');
			notification.className = 'notification';
			document.body.appendChild(notification);
		}

		notification.textContent = message;
		notification.classList.add('show');

		setTimeout(() => {
			notification.classList.remove('show');
			
			setTimeout(() => {
				if (notification && notification.parentNode) {
					notification.remove();
				}
			}, 300);
		}, 2000);
	}

	updateFontIndicator() {
		const indicator = document.querySelector('.current-font-indicator');
		if (indicator) {
			indicator.textContent = this.currentFont;
		}

		// Обновляем активный класс в меню
		document.querySelectorAll('.font-option').forEach(option => {
			const fontName = option.dataset.font;
			if (fontName === this.currentFont) {
				option.classList.add('active');
			} else {
				option.classList.remove('active');
			}
		});
	}

	positionMenu() {
		const fontBtn = document.getElementById('font-selector-btn');
		const fontMenu = document.getElementById('font-selector-menu');

		if (!fontBtn || !fontMenu) return;

		if (this.isMobile) {
			// На мобильных меню на весь экран снизу
			fontMenu.style.position = 'fixed';
			fontMenu.style.top = 'auto';
			fontMenu.style.bottom = '0';
			fontMenu.style.left = '0';
			fontMenu.style.right = '0';
			fontMenu.style.transform = 'translateY(100%)';

			// Контент меню на всю ширину
			const content = fontMenu.querySelector('.font-selector-menu-content');
			if (content) {
				content.style.maxWidth = '100%';
				content.style.width = '100%';
				content.style.borderRadius = '24px';
			}
		} else {
			// На десктопе - позиционируем относительно обертки
			fontMenu.style.position = 'absolute';
			fontMenu.style.top = '100%';
			fontMenu.style.right = '0';
			fontMenu.style.left = 'auto';
			fontMenu.style.bottom = 'auto';
			fontMenu.style.transform = 'none';
			fontMenu.style.marginTop = '8px';
		}
	}

	closeMenu() {
		const fontMenu = document.getElementById('font-selector-menu');
		if (fontMenu && fontMenu.classList.contains('active')) {
			fontMenu.classList.remove('active');

			// Разблокируем скролл при закрытии
			if (this.isMobile) {
				this.unlockScroll();
			}
		}
	}

	closeAllMenus() {
		// Закрываем все меню
		document.querySelectorAll('.font-selector-menu.active, .font-size-menu.active, .grid-columns-menu.active').forEach(menu => {
			menu.classList.remove('active');
		});
		
		// Разблокируем скролл на мобильных
		if (this.isMobile) {
			this.unlockScroll();
		}
	}

	setupEventListeners() {
		const fontBtn = document.getElementById('font-selector-btn');
		const fontMenu = document.getElementById('font-selector-menu');

		if (fontBtn && fontMenu) {
			fontBtn.addEventListener('click', e => {
				e.stopPropagation();
				e.preventDefault();

				// Проверяем, открыто ли сейчас меню размера
				const sizeMenu = document.getElementById('font-size-menu');
				const gridMenu = document.querySelector('.grid-columns-menu');
				
				// Закрываем другие меню
				if (sizeMenu && sizeMenu.classList.contains('active')) {
					sizeMenu.classList.remove('active');
				}
				if (gridMenu && gridMenu.classList.contains('active')) {
					gridMenu.classList.remove('active');
				}

				const willOpen = !fontMenu.classList.contains('active');
				fontMenu.classList.toggle('active');

				if (willOpen) {
					this.positionMenu();

					// Блокируем скролл на мобильных при открытии
					if (this.isMobile) {
						this.lockScroll();
					}
				} else {
					// Разблокируем скролл при закрытии
					if (this.isMobile) {
						this.unlockScroll();
					}
				}
			});

			// Обработчики выбора шрифта - закрываем меню сразу после выбора
			document.querySelectorAll('.font-option').forEach(option => {
				option.addEventListener('click', e => {
					e.stopPropagation();
					const fontName = option.dataset.font;

					// Передаем true, чтобы показать уведомление (это действие пользователя)
					this.applyFont(fontName, true);

					// Закрываем меню
					this.closeMenu();
				});
			});
		}

		// Глобальный обработчик клика для закрытия меню
		document.addEventListener('click', (e) => {
			const fontMenu = document.getElementById('font-selector-menu');
			const fontBtn = document.getElementById('font-selector-btn');
			const sizeMenu = document.getElementById('font-size-menu');
			const sizeBtn = document.getElementById('font-size-btn');
			const gridMenu = document.querySelector('.grid-columns-menu');
			const gridBtn = document.getElementById('gridColumnsBtn');

			// Проверяем для меню шрифта
			if (fontMenu && fontMenu.classList.contains('active') && 
				!fontBtn.contains(e.target) && !fontMenu.contains(e.target)) {
				this.closeMenu();
			}

			// Проверяем для меню размера (если есть FontSizeManager)
			if (sizeMenu && sizeMenu.classList.contains('active') && 
				sizeBtn && !sizeBtn.contains(e.target) && !sizeMenu.contains(e.target)) {
				if (window.fontSizeManager) {
					window.fontSizeManager.closeMenu();
				}
			}

			// Проверяем для меню сетки (если есть)
			if (gridMenu && gridMenu.classList.contains('active') && 
				gridBtn && !gridBtn.contains(e.target) && !gridMenu.contains(e.target)) {
				gridMenu.classList.remove('active');
			}
		});

		// Закрытие по Escape
		document.addEventListener('keydown', e => {
			if (e.key === 'Escape') {
				const fontMenu = document.getElementById('font-selector-menu');
				const sizeMenu = document.getElementById('font-size-menu');
				const gridMenu = document.querySelector('.grid-columns-menu');
				
				if (fontMenu && fontMenu.classList.contains('active')) {
					this.closeMenu();
				}
				if (sizeMenu && sizeMenu.classList.contains('active') && window.fontSizeManager) {
					window.fontSizeManager.closeMenu();
				}
				if (gridMenu && gridMenu.classList.contains('active')) {
					gridMenu.classList.remove('active');
					if (this.isMobile) {
						this.unlockScroll();
					}
				}
			}
		});

		// При изменении размера окна перепозиционируем, если меню открыто
		window.addEventListener('resize', () => {
			const fontMenu = document.getElementById('font-selector-menu');
			if (fontMenu && fontMenu.classList.contains('active')) {
				this.positionMenu();
			}
		});
	}
}


// ============================================
// 🔤 Класс для управления размером шрифта (75-100%)
// ============================================

class FontSizeManager {
  constructor() {
    this.currentSize = parseInt(localStorage.getItem('font-size')) || 100;
    this.minSize = 75;
    this.maxSize = 100;
    this.isMobile = window.innerWidth <= 768;
    this.scrollPosition = 0;
    
    this.init();
  }
  
  init() {
    // Применяем сохраненный размер
    this.applyFontSize(this.currentSize, false);
    
    // Инициализируем индикатор
    this.updateSizeIndicator();
    this.updateSliderBackground(this.currentSize);
    
    // Добавляем обработчики
    this.setupEventListeners();
    
    // Следим за изменением размера окна
    window.addEventListener('resize', () => {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth <= 768;
      
      const menu = document.getElementById('font-size-menu');
      if (menu && menu.classList.contains('active')) {
        if (wasMobile !== this.isMobile) {
          this.positionMenu();
          if (this.isMobile) {
            this.lockScroll();
          } else {
            this.unlockScroll();
          }
        }
      }
    });
  }
  
  lockScroll() {
    this.scrollPosition = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${this.scrollPosition}px`;
    document.body.style.width = '100%';
  }
  
  unlockScroll() {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, this.scrollPosition);
  }
  
  applyFontSize(sizePercent, showNotification = true) {
    const previousSize = this.currentSize;
    
    // Применяем размер к корневому элементу
    document.documentElement.style.fontSize = (16 * sizePercent / 100) + 'px';
    
    // Сохраняем
    localStorage.setItem('font-size', sizePercent);
    this.currentSize = sizePercent;
    this.updateSizeIndicator();
    this.updateSliderValue(sizePercent);
    this.updateSliderBackground(sizePercent);
    
    // Показываем уведомление
    if (showNotification && previousSize !== sizePercent) {
      this.showNotification(`Размер шрифта: ${sizePercent}%`);
    }
  }
  
  showNotification(message) {
    let notification = document.querySelector('.notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.className = 'notification';
      document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
      notification.classList.remove('show');
      
      setTimeout(() => {
        if (notification && notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 2000);
  }
  
  updateSizeIndicator() {
    const indicator = document.querySelector('.current-size-indicator');
    if (indicator) {
      indicator.textContent = this.currentSize + '%';
    }
    
    // Обновляем активный класс в меню
    document.querySelectorAll('.font-size-option').forEach(option => {
      const size = parseInt(option.dataset.size);
      if (size === this.currentSize) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
  }
  
  updateSliderValue(size) {
    const slider = document.getElementById('font-size-slider');
    const display = document.getElementById('slider-value-display');
    
    if (slider) slider.value = size;
    if (display) display.textContent = size + '%';
  }
  
  updateSliderBackground(size) {
    const slider = document.getElementById('font-size-slider');
    if (slider) {
      const percent = ((size - this.minSize) / (this.maxSize - this.minSize)) * 100;
      slider.style.setProperty('--slider-fill', percent + '%');
    }
  }
  
  positionMenu() {
    const btn = document.getElementById('font-size-btn');
    const menu = document.getElementById('font-size-menu');
    
    if (!btn || !menu) return;
    
    if (this.isMobile) {
      // На мобильных меню на весь экран снизу
      menu.style.position = 'fixed';
      menu.style.top = 'auto';
      menu.style.bottom = '0';
      menu.style.left = '0';
      menu.style.right = '0';
      menu.style.transform = 'translateY(100%)';
      
      // Контент меню на всю ширину
      const content = menu.querySelector('.font-size-menu-content');
      if (content) {
        content.style.maxWidth = '100%';
        content.style.width = '100%';
        content.style.borderRadius = '24px';
      }
    } else {
      // На десктопе - позиционируем относительно обертки
      menu.style.position = 'absolute';
      menu.style.top = '100%';
      menu.style.right = '0';
      menu.style.left = 'auto';
      menu.style.bottom = 'auto';
      menu.style.transform = 'none';
      menu.style.marginTop = '8px';
    }
  }
  
  closeMenu() {
    const menu = document.getElementById('font-size-menu');
    if (menu && menu.classList.contains('active')) {
      menu.classList.remove('active');
      
      if (this.isMobile) {
        this.unlockScroll();
      }
    }
  }
  
  setupEventListeners() {
    const btn = document.getElementById('font-size-btn');
    const menu = document.getElementById('font-size-menu');
    const slider = document.getElementById('font-size-slider');
    const resetBtn = document.getElementById('reset-font-size');
    
    if (!btn || !menu) return;
    
    // Кнопка открытия меню
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      
      // Проверяем, открыто ли сейчас меню шрифта
      const fontMenu = document.getElementById('font-selector-menu');
      const gridMenu = document.querySelector('.grid-columns-menu');
      
      // Закрываем другие меню
      if (fontMenu && fontMenu.classList.contains('active')) {
        fontMenu.classList.remove('active');
        if (window.fontManager && window.fontManager.isMobile) {
          window.fontManager.unlockScroll();
        }
      }
      if (gridMenu && gridMenu.classList.contains('active')) {
        gridMenu.classList.remove('active');
      }
      
      const willOpen = !menu.classList.contains('active');
      menu.classList.toggle('active');
      
      if (willOpen) {
        this.positionMenu();
        
        if (this.isMobile) {
          this.lockScroll();
        }
      } else {
        if (this.isMobile) {
          this.unlockScroll();
        }
      }
    });
    
    // Обработчики выбора размера
    document.querySelectorAll('.font-size-option').forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const size = parseInt(option.dataset.size);
        this.applyFontSize(size, true);
        this.closeMenu();
      });
    });
    
    // Ползунок
    if (slider) {
      // Обновление при движении
      slider.addEventListener('input', (e) => {
        const size = parseInt(e.target.value);
        this.updateSliderValue(size);
        this.updateSliderBackground(size);
      });
      
      // Применение при отпускании
      slider.addEventListener('change', (e) => {
        const size = parseInt(e.target.value);
        this.applyFontSize(size, true);
      });
    }
    
    // Кнопка сброса
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.applyFontSize(100, true);
        this.closeMenu();
      });
    }
    
    // При изменении размера окна перепозиционируем, если меню открыто
    window.addEventListener('resize', () => {
      if (menu.classList.contains('active')) {
        this.positionMenu();
      }
    });
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
	window.fontManager = new FontManager();
	window.fontSizeManager = new FontSizeManager();	
});