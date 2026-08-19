// theme.js

// ============================================
// 🎨 Утилиты для работы с цветами
// ============================================

function rgbToHex(rgb) {
	if (!rgb || rgb === '') return '#000000';
	if (rgb.startsWith('#')) return rgb.toUpperCase();

	const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
	if (!match) {
		const matchRgba = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
		if (matchRgba) {
			const r = parseInt(matchRgba[1]).toString(16).padStart(2, '0');
			const g = parseInt(matchRgba[2]).toString(16).padStart(2, '0');
			const b = parseInt(matchRgba[3]).toString(16).padStart(2, '0');
			return `#${r}${g}${b}`.toUpperCase();
		}
		return '#000000';
	}

	const r = parseInt(match[1]).toString(16).padStart(2, '0');
	const g = parseInt(match[2]).toString(16).padStart(2, '0');
	const b = parseInt(match[3]).toString(16).padStart(2, '0');

	return `#${r}${g}${b}`.toUpperCase();
}

function normalizeThemeName(theme) {
	if (!theme) return 'dark';
	return theme.toLowerCase().trim();
}

// ============================================
// 🎨 Базовые цвета для тем
// ============================================

function getBaseColors(theme) {
	const normalizedTheme = normalizeThemeName(theme);

	const baseThemes = {
		dark: {
			'--color-bg-page': '#1a1e24',
			'--color-bg-surface': '#252a33',
			'--color-bg-input': '#2d343e',
			'--color-text-primary': '#eef2f5',
			'--color-text-secondary': '#9aa8b5',
			'--color-accent-primary': '#00b7ff',
			'--color-accent-light': '#0074f8',
			'--color-border': '#3a404b',
			'--color-shadow': 'rgba(0, 0, 0, 0.4)',
			'--color-special': '#ffd700',
		},
		light: {
			'--color-bg-page': '#f0f3f7',
			'--color-bg-surface': '#ffffff',
			'--color-bg-input': '#e6ecf2',
			'--color-text-primary': '#1f2a36',
			'--color-text-secondary': '#546e7a',
			'--color-accent-primary': '#4a7a8c',
			'--color-accent-light': '#6b9bb0',
			'--color-border': '#cbd5e0',
			'--color-shadow': 'rgba(0, 0, 0, 0.08)',
			'--color-special': '#ffd700',
		},
	};

	return baseThemes[normalizedTheme] || baseThemes.dark;
}

const ALL_CSS_VARS = [
	'--color-bg-page',
	'--color-bg-surface',
	'--color-bg-input',
	'--color-text-primary',
	'--color-text-secondary',
	'--color-accent-primary',
	'--color-accent-light',
	'--color-border',
	'--color-shadow',
	'--color-special',
];

// ============================================
// 🎛️ Управление скроллбаром (ЕДИНОЕ МЕСТО)
// ============================================

function updateScrollbarTheme() {
	const body = document.body;

	let style = document.getElementById('scrollbar-style');
	if (!style) {
		style = document.createElement('style');
		style.id = 'scrollbar-style';
		document.head.appendChild(style);
	}

	// Берем цвета ПРЯМО СЕЙЧАС из примененных стилей
	const computedStyle = getComputedStyle(body);
	const accentColor = computedStyle.getPropertyValue('--color-accent-primary').trim() || '#00b7ff';
	const bgSurface = computedStyle.getPropertyValue('--color-bg-surface').trim() || '#252a33';
	const bgInput = computedStyle.getPropertyValue('--color-bg-input').trim() || '#2d343e';

	style.textContent = `
    ::-webkit-scrollbar { width: 0.4375rem; height: 0.4375rem; }
    ::-webkit-scrollbar-track { background-color: ${bgSurface} !important; border-radius: 0.5rem; }
    ::-webkit-scrollbar-thumb { background-color: ${accentColor} !important; border-radius: 0.5rem; border: 0.125rem solid ${bgSurface}; }
    ::-webkit-scrollbar-thumb:hover { background-color: ${accentColor} !important; filter: brightness(1.2); }
    
    * { scrollbar-width: thin; scrollbar-color: ${accentColor} ${bgSurface} !important; }
    
    .card::-webkit-scrollbar, .modal-content::-webkit-scrollbar, .customize-panel-content::-webkit-scrollbar { width: 0.3125rem; }
    .card::-webkit-scrollbar-track, .modal-content::-webkit-scrollbar-track, .customize-panel-content::-webkit-scrollbar-track { background-color: ${bgInput} !important; }
    .card::-webkit-scrollbar-thumb, .modal-content::-webkit-scrollbar-thumb, .customize-panel-content::-webkit-scrollbar-thumb { background-color: ${accentColor} !important; }
  `;

	console.log('[Theme] Scrollbar updated');
}

// Делаем функцию глобальной, чтобы другие скрипты могли вызвать её при необходимости
window.updateScrollbarTheme = updateScrollbarTheme;

// ============================================
// 🎨 Применение тем
// ============================================

function applyCustomTheme(theme) {
	const root = document.body;
	const currentTheme = normalizeThemeName(theme);

	// Безопасное чтение localStorage
	let customThemes = {};
	try {
		const stored = localStorage.getItem('customThemes');
		if (stored) customThemes = JSON.parse(stored);
	} catch (e) {
		console.error('Ошибка чтения тем из localStorage', e);
		localStorage.removeItem('customThemes');
	}

	console.log(`[Theme] Applying: ${currentTheme}`);

	let colorsToApply = {};

	if (customThemes[currentTheme]) {
		colorsToApply = customThemes[currentTheme];
	} else {
		colorsToApply = getBaseColors(currentTheme);
	}

	ALL_CSS_VARS.forEach(key => {
		if (colorsToApply[key]) {
			root.style.setProperty(key, colorsToApply[key], 'important');
		}
	});

	// 👇 САМОЕ ВАЖНОЕ: Сразу обновляем скроллбар после применения цветов
	updateScrollbarTheme();
}

function saveCustomTheme(theme, colors) {
	const normalizedTheme = normalizeThemeName(theme);
	let customThemes = {};
	try {
		const stored = localStorage.getItem('customThemes');
		if (stored) customThemes = JSON.parse(stored);
	} catch (e) {
		customThemes = {};
	}

	const root = document.body;
	const allColors = {};

	ALL_CSS_VARS.forEach(varName => {
		if (colors && colors[varName]) {
			allColors[varName] = colors[varName];
		} else {
			const computed = getComputedStyle(root).getPropertyValue(varName).trim();
			if (computed) {
				allColors[varName] = rgbToHex(computed);
			} else {
				allColors[varName] = getBaseColors(normalizedTheme)[varName] || '#000000';
			}
		}
	});

	customThemes[normalizedTheme] = allColors;
	localStorage.setItem('customThemes', JSON.stringify(customThemes));
	localStorage.setItem('usingCustomTheme', 'true');

	applyCustomTheme(normalizedTheme); // Применяем сразу
	showNotification('Тема сохранена');
}

function removeCustomTheme(theme) {
	const normalizedTheme = normalizeThemeName(theme);
	let customThemes = {};
	try {
		const stored = localStorage.getItem('customThemes');
		if (stored) customThemes = JSON.parse(stored);
	} catch (e) {
		customThemes = {};
	}

	delete customThemes[normalizedTheme];
	localStorage.setItem('customThemes', JSON.stringify(customThemes));

	if (Object.keys(customThemes).length === 0) {
		localStorage.removeItem('usingCustomTheme');
	}

	applyCustomTheme(normalizedTheme); // Сбрасываем к базе
	showNotification('Тема сброшена');
}

// ============================================
// 🔔 Уведомления
// ============================================

function showNotification(message, type = 'success') {
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
			if (notification && notification.parentNode) notification.remove();
		}, 300);
	}, 2000);
}

// ============================================
// 🎨 Панель кастомизации
// ============================================

function customizeTheme() {
	// ... (твой существующий код панели, он хороший) ...
	// Для краткости я не дублирую весь блок customizeTheme,
	// но убедись, что внутри него при клике "Сохранить" вызывается saveCustomTheme,
	// а при "Сбросить" - removeCustomTheme.
	// Эти функции теперь сами вызовут updateScrollbarTheme.

	const root = document.body;
	const currentTheme = normalizeThemeName(localStorage.getItem('theme') || document.body.getAttribute('data-theme') || 'dark');

	const baseColors = getBaseColors(currentTheme);
	let customThemes = {};
	try {
		customThemes = JSON.parse(localStorage.getItem('customThemes')) || {};
	} catch (e) {}
	const savedColors = customThemes[currentTheme] || {};

	const getColor = varName => {
		const computed = getComputedStyle(root).getPropertyValue(varName).trim();
		if (computed && computed !== '' && computed !== 'initial') {
			const hex = rgbToHex(computed);
			if (hex !== '#000000' || varName === '--color-bg-page') return hex;
		}
		if (savedColors[varName]) return savedColors[varName];
		return baseColors[varName] || '#000000';
	};

	if (document.querySelector('.customize-panel')) return;

	const panel = document.createElement('div');
	panel.className = 'customize-panel';
	panel.innerHTML = `
    <div class="customize-panel-content">
      <h3>🎨 Настройка темы</h3>
      <p class="customize-description">Текущая тема: <strong>${currentTheme === 'dark' ? '🌙 Тёмная' : '☀️ Светлая'}</strong></p>
      <div class="color-section"><h4>🎨 Фоновые цвета</h4><div class="color-inputs">
        <div class="color-input-group"><label><span class="color-label">📄 Фон страницы</span><span class="color-preview" style="background: ${getColor('--color-bg-page')}"></span></label><input type="color" id="bg-page-color" value="${getColor('--color-bg-page')}"></div>
        <div class="color-input-group"><label><span class="color-label">📦 Карточки</span><span class="color-preview" style="background: ${getColor('--color-bg-surface')}"></span></label><input type="color" id="bg-surface-color" value="${getColor('--color-bg-surface')}"></div>
        <div class="color-input-group"><label><span class="color-label">⌨️ Поля ввода</span><span class="color-preview" style="background: ${getColor('--color-bg-input')}"></span></label><input type="color" id="bg-input-color" value="${getColor('--color-bg-input')}"></div>
      </div></div>
      <div class="color-section"><h4>📝 Текст</h4><div class="color-inputs">
        <div class="color-input-group"><label><span class="color-label">📄 Основной</span><span class="color-preview" style="background: ${getColor('--color-text-primary')}"></span></label><input type="color" id="text-primary-color" value="${getColor('--color-text-primary')}"></div>
        <div class="color-input-group"><label><span class="color-label">🔇 Второстепенный</span><span class="color-preview" style="background: ${getColor('--color-text-secondary')}"></span></label><input type="color" id="text-secondary-color" value="${getColor('--color-text-secondary')}"></div>
      </div></div>
      <div class="color-section"><h4>✨ Акценты</h4><div class="color-inputs">
        <div class="color-input-group"><label><span class="color-label">🎨 Основной</span><span class="color-preview" style="background: ${getColor('--color-accent-primary')}"></span></label><input type="color" id="accent-primary-color" value="${getColor('--color-accent-primary')}"></div>
        <div class="color-input-group"><label><span class="color-label">💫 Светлый</span><span class="color-preview" style="background: ${getColor('--color-accent-light')}"></span></label><input type="color" id="accent-light-color" value="${getColor('--color-accent-light')}"></div>
      </div></div>
      <div class="color-section"><h4>🧩 Элементы</h4><div class="color-inputs">
        <div class="color-input-group"><label><span class="color-label">📏 Границы</span><span class="color-preview" style="background: ${getColor('--color-border')}"></span></label><input type="color" id="border-color" value="${getColor('--color-border')}"></div>
        <div class="color-input-group"><label><span class="color-label">⭐ Избранное</span><span class="color-preview" style="background: ${getColor('--color-special')}"></span></label><input type="color" id="special-color" value="${getColor('--color-special')}"></div>
      </div></div>
      <div class="customize-actions">
        <button id="save-custom-theme" class="save-btn">💾 Сохранить</button>
        <button id="reset-custom-theme" class="reset-btn">↺ Сброс</button>
        <button id="close-customize" class="close-btn">✕ Закрыть</button>
      </div>
    </div>
  `;

	document.body.appendChild(panel);
	setTimeout(() => panel.classList.add('active'), 10);

	const updatePreviews = () => {
		document.querySelectorAll('.color-input-group').forEach(group => {
			const input = group.querySelector('input[type="color"]');
			const preview = group.querySelector('.color-preview');
			if (input && preview) preview.style.background = input.value;
		});
	};

	document.querySelectorAll('.color-input-group input').forEach(input => {
		input.addEventListener('input', updatePreviews);
	});

	document.getElementById('save-custom-theme').addEventListener('click', () => {
		const colors = {
			'--color-bg-page': document.getElementById('bg-page-color').value,
			'--color-bg-surface': document.getElementById('bg-surface-color').value,
			'--color-bg-input': document.getElementById('bg-input-color').value,
			'--color-text-primary': document.getElementById('text-primary-color').value,
			'--color-text-secondary': document.getElementById('text-secondary-color').value,
			'--color-accent-primary': document.getElementById('accent-primary-color').value,
			'--color-accent-light': document.getElementById('accent-light-color').value,
			'--color-border': document.getElementById('border-color').value,
			'--color-special': document.getElementById('special-color').value,
		};
		saveCustomTheme(currentTheme, colors);
		panel.classList.remove('active');
		setTimeout(() => panel.remove(), 300);
	});

	document.getElementById('reset-custom-theme').addEventListener('click', () => {
		removeCustomTheme(currentTheme);
		panel.classList.remove('active');
		setTimeout(() => panel.remove(), 300);
	});

	document.getElementById('close-customize').addEventListener('click', () => {
		panel.classList.remove('active');
		setTimeout(() => panel.remove(), 300);
	});

	panel.addEventListener('click', e => {
		if (e.target === panel) {
			panel.classList.remove('active');
			setTimeout(() => panel.remove(), 300);
		}
	});

	const escHandler = e => {
		if (e.key === 'Escape' && document.body.contains(panel)) {
			panel.classList.remove('active');
			setTimeout(() => panel.remove(), 300);
			document.removeEventListener('keydown', escHandler);
		}
	};
	document.addEventListener('keydown', escHandler);
}

function onThemeChanged(newTheme) {
	applyCustomTheme(newTheme);
}

// ============================================
// 🚀 Инициализация
// ============================================

document.addEventListener('DOMContentLoaded', function () {
	console.log('[Theme] Initializing...');

	const customizeBtn = document.getElementById('customize-theme');
	if (customizeBtn) {
		customizeBtn.addEventListener('click', customizeTheme);
	}

	// Применяем тему сразу при загрузке DOM
	const currentTheme = normalizeThemeName(localStorage.getItem('theme') || document.body.getAttribute('data-theme') || 'dark');

	applyCustomTheme(currentTheme);

	// Следим за изменением атрибута data-theme
	const observer = new MutationObserver(function (mutations) {
		mutations.forEach(function (mutation) {
			if (mutation.attributeName === 'data-theme') {
				const newTheme = document.body.getAttribute('data-theme');
				if (newTheme) onThemeChanged(newTheme);
			}
		});
	});

	observer.observe(document.body, { attributes: true });
});

// ============================================
// 🎨 CSS стили панели
// ============================================
// (Твой CSS код остается без изменений, вставь его сюда)
const themeCustomizeStyle = document.createElement('style');
themeCustomizeStyle.textContent = `
  .customize-panel { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 1001; opacity: 0; transition: opacity 0.3s ease; pointer-events: none; }
  .customize-panel.active { opacity: 1; pointer-events: auto; }
  .customize-panel-content { background: var(--color-bg-surface); padding: 2rem; border-radius: 1rem; max-width: 550px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 30px var(--color-shadow); transform: translateY(20px); transition: transform 0.3s ease; border: 1px solid var(--color-border); }
  .customize-panel.active .customize-panel-content { transform: translateY(0); }
  .customize-panel-content h3 { margin: 0 0 1.5rem 0; color: var(--color-text-primary); font-size: 1.5rem; }
  .customize-panel-content h4 { margin: 1.5rem 0 0.75rem 0; color: var(--color-accent-primary); font-size: 1rem; font-weight: 600; padding-bottom: 0.5rem; border-bottom: 1px solid var(--color-border); }
  .customize-description { color: var(--color-text-secondary); margin-bottom: 0.5rem; font-size: 0.9rem; }
  .color-section { margin-bottom: 1rem; }
  .color-inputs { display: grid; gap: 0.75rem; }
  .color-input-group { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.75rem; background: var(--color-bg-input); border-radius: 0.5rem; border: 1px solid var(--color-border); }
  .color-input-group label { display: flex; align-items: center; gap: 0.5rem; color: var(--color-text-primary); cursor: pointer; flex: 1; }
  .color-label { font-size: 0.9rem; min-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .color-preview { width: 24px; height: 24px; border-radius: 4px; border: 2px solid var(--color-border); flex-shrink: 0; }
  .color-input-group input[type="color"] { width: 50px; height: 40px; border: none; background: transparent; cursor: pointer; }
  .customize-actions { display: flex; gap: 0.5rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--color-border); }
  .customize-actions button { flex: 1; padding: 0.75rem; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
  .save-btn { background: var(--color-accent-primary); color: white; }
  .reset-btn { background: var(--color-bg-input); color: var(--color-text-primary); border: 1px solid var(--color-border); }
  .close-btn { background: transparent; color: var(--color-text-secondary); }
  /* Скроллбар внутри панели */
  .customize-panel-content::-webkit-scrollbar { width: 6px; }
  .customize-panel-content::-webkit-scrollbar-track { background: transparent; }
  .customize-panel-content::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }
`;
document.head.appendChild(themeCustomizeStyle);
