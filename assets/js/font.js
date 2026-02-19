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
		let notification = document.querySelector('.font-notification');
		if (!notification) {
			notification = document.createElement('div');
			notification.className = 'notification font-notification';
			document.body.appendChild(notification);
		}

		notification.textContent = message;
		notification.classList.add('show');

		setTimeout(() => {
			notification.classList.remove('show');
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
			// На десктопе - делаем меню относительно кнопки
			// Для этого оборачиваем кнопку и меню в относительный контейнер
			const toolbar = document.querySelector('.theme-controls');

			// Если меню еще не внутри контейнера с кнопкой, перемещаем его
			if (!fontMenu.parentElement.classList.contains('theme-controls')) {
				// Создаем обертку для кнопки и меню, если нужно
				if (!toolbar.querySelector('.font-selector-wrapper')) {
					const wrapper = document.createElement('div');
					wrapper.className = 'font-selector-wrapper';
					wrapper.style.position = 'relative';
					wrapper.style.display = 'inline-block';

					// Перемещаем кнопку и меню в обертку
					fontBtn.parentNode.insertBefore(wrapper, fontBtn);
					wrapper.appendChild(fontBtn);
					wrapper.appendChild(fontMenu);
				}
			}

			fontMenu.style.position = 'absolute';
			fontMenu.style.top = '100%';
			fontMenu.style.left = '0';
			fontMenu.style.right = 'auto';
			fontMenu.style.bottom = 'auto';
			fontMenu.style.transform = 'none';
			fontMenu.style.marginTop = '8px';
			fontMenu.style.left = 'auto';
			fontMenu.style.right = '0';
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

	setupEventListeners() {
		const fontBtn = document.getElementById('font-selector-btn');
		const fontMenu = document.getElementById('font-selector-menu');

		if (fontBtn && fontMenu) {
			fontBtn.addEventListener('click', e => {
				e.stopPropagation();
				e.preventDefault();

				// Закрываем другие возможные открытые меню
				document.querySelectorAll('.font-selector-menu.active, .grid-columns-menu.active').forEach(menu => {
					if (menu !== fontMenu) {
						menu.classList.remove('active');
					}
				});

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

			// Закрытие меню при клике вне (только на десктопе)
			document.addEventListener('click', e => {
				if (!this.isMobile && fontMenu.classList.contains('active') && !fontBtn.contains(e.target) && !fontMenu.contains(e.target)) {
					this.closeMenu();
				}
			});

			// Закрытие по Escape
			document.addEventListener('keydown', e => {
				if (e.key === 'Escape' && fontMenu.classList.contains('active')) {
					this.closeMenu();
				}
			});

			// При изменении размера окна перепозиционируем, если меню открыто
			window.addEventListener('resize', () => {
				if (fontMenu.classList.contains('active')) {
					this.positionMenu();
				}
			});
		}
	}
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
	window.fontManager = new FontManager();
});
