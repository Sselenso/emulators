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
      '--color-special': '#ffd700'
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
      '--color-special': '#ffd700'
    }
  };
  
  return baseThemes[normalizedTheme] || baseThemes.dark;
}

// Список всех CSS переменных (10 штук)
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
  '--color-special'
];

// ============================================
// 🎨 Применение тем
// ============================================

function applyCustomTheme(theme) {
  const root = document.body;
  const currentTheme = normalizeThemeName(theme);
  const customThemes = JSON.parse(localStorage.getItem('customThemes')) || {};
  
  console.log(`[Theme] Applying: ${currentTheme} to body`);
  
  if (customThemes[currentTheme]) {
    console.log(`[Theme] Found custom colors for ${currentTheme}`);
    const customColors = customThemes[currentTheme];
    
    ALL_CSS_VARS.forEach(key => {
      if (customColors[key]) {
        root.style.setProperty(key, customColors[key], 'important');
      }
    });
    return true;
  } else {
    console.log(`[Theme] No custom found, applying base for ${currentTheme}`);
    const baseColors = getBaseColors(currentTheme);
    
    ALL_CSS_VARS.forEach(key => {
      if (baseColors[key]) {
        root.style.setProperty(key, baseColors[key], 'important');
      }
    });
    return false;
  }
}

function saveCustomTheme(theme, colors) {
  const normalizedTheme = normalizeThemeName(theme);
  const customThemes = JSON.parse(localStorage.getItem('customThemes')) || {};
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
        const baseColors = getBaseColors(normalizedTheme);
        allColors[varName] = baseColors[varName] || '#000000';
      }
    }
  });
  
  customThemes[normalizedTheme] = allColors;
  localStorage.setItem('customThemes', JSON.stringify(customThemes));
  localStorage.setItem('usingCustomTheme', 'true');
  
  console.log(`[Theme] Saved custom theme for ${normalizedTheme}:`, allColors);
}

function removeCustomTheme(theme) {
  const normalizedTheme = normalizeThemeName(theme);
  const customThemes = JSON.parse(localStorage.getItem('customThemes')) || {};
  
  delete customThemes[normalizedTheme];
  localStorage.setItem('customThemes', JSON.stringify(customThemes));
  
  if (Object.keys(customThemes).length === 0) {
    localStorage.removeItem('usingCustomTheme');
  }
  
  const baseColors = getBaseColors(normalizedTheme);
  const root = document.body;
  
  ALL_CSS_VARS.forEach(key => {
    if (baseColors[key]) {
      root.style.setProperty(key, baseColors[key], 'important');
    }
  });
  
  console.log(`[Theme] Removed custom theme for ${normalizedTheme}`);
}

// ============================================
// 🔔 Уведомления
// ============================================

// function showNotification(message, type = 'success') {
//   const existing = document.querySelector('.theme-notification');
//   if (existing) existing.remove();
  
//   const notification = document.createElement('div');
//   notification.className = `theme-notification notification-${type}`;
//   notification.textContent = message;
//   notification.style.cssText = `
//     position: fixed;
//     bottom: 20px;
//     right: 20px;
//     padding: 12px 20px;
//     background: var(--color-bg-surface, #252a33);
//     color: var(--color-text-primary, #eef2f5);
//     border: 1px solid var(--color-border, #3a404b);
//     border-radius: 8px;
//     box-shadow: 0 4px 12px var(--color-shadow, rgba(0,0,0,0.4));
//     z-index: 2000;
//     font-size: 14px;
//     animation: slideIn 0.3s ease;
//   `;
  
//   document.body.appendChild(notification);
  
//   if (!document.querySelector('#notification-styles')) {
//     const animStyle = document.createElement('style');
//     animStyle.id = 'notification-styles';
//     animStyle.textContent = `
//       @keyframes slideIn {
//         from { transform: translateX(100%); opacity: 0; }
//         to { transform: translateX(0); opacity: 1; }
//       }
//       @keyframes slideOut {
//         from { transform: translateX(0); opacity: 1; }
//         to { transform: translateX(100%); opacity: 0; }
//       }
//       .theme-notification.hiding {
//         animation: slideOut 0.3s ease forwards;
//       }
//     `;
//     document.head.appendChild(animStyle);
//   }
  
//   setTimeout(() => {
//     notification.classList.add('hiding');
//     setTimeout(() => notification.remove(), 300);
//   }, 3000);
// }


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
      if (notification && notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 2000); // 2 секунды как в FontManager
}

// ============================================
// 🎨 Панель кастомизации (10 ЦВЕТОВ)
// ============================================

function customizeTheme() {
  const root = document.body;
  const currentTheme = normalizeThemeName(
    localStorage.getItem('theme') || 
    document.body.getAttribute('data-theme') || 
    'dark'
  );
  
  const baseColors = getBaseColors(currentTheme);
  const customThemes = JSON.parse(localStorage.getItem('customThemes')) || {};
  const savedColors = customThemes[currentTheme] || {};
  
  const getColor = (varName) => {
    const computed = getComputedStyle(root).getPropertyValue(varName).trim();
    if (computed && computed !== '' && computed !== 'initial') {
      const hex = rgbToHex(computed);
      if (hex !== '#000000' || varName === '--color-bg-page') {
        return hex;
      }
    }
    if (savedColors[varName]) {
      return savedColors[varName];
    }
    return baseColors[varName] || '#000000';
  };
  
  if (document.querySelector('.customize-panel')) {
    return;
  }
  
  const panel = document.createElement('div');
  panel.className = 'customize-panel';
  panel.innerHTML = `
    <div class="customize-panel-content">
      <h3>🎨 Настройка темы</h3>
      <p class="customize-description">Текущая тема: <strong>${currentTheme === 'dark' ? '🌙 Тёмная' : '☀️ Светлая'}</strong></p>
      <p class="customize-description">Настройте цвета интерфейса</p>
      
      <div class="color-section">
        <h4>🎨 Фоновые цвета</h4>
        <div class="color-inputs">
          <div class="color-input-group">
            <label for="bg-page-color">
              <span class="color-label">📄 Фон страницы</span>
              <span class="color-preview" style="background: ${getColor('--color-bg-page')}"></span>
            </label>
            <input type="color" id="bg-page-color" value="${getColor('--color-bg-page')}">
          </div>
          
          <div class="color-input-group">
            <label for="bg-surface-color">
              <span class="color-label">📦 Карточки и панели</span>
              <span class="color-preview" style="background: ${getColor('--color-bg-surface')}"></span>
            </label>
            <input type="color" id="bg-surface-color" value="${getColor('--color-bg-surface')}">
          </div>
          
          <div class="color-input-group">
            <label for="bg-input-color">
              <span class="color-label">⌨️ Поля ввода и кнопки</span>
              <span class="color-preview" style="background: ${getColor('--color-bg-input')}"></span>
            </label>
            <input type="color" id="bg-input-color" value="${getColor('--color-bg-input')}">
          </div>
        </div>
      </div>
      
      <div class="color-section">
        <h4>📝 Цвета текста</h4>
        <div class="color-inputs">
          <div class="color-input-group">
            <label for="text-primary-color">
              <span class="color-label">📄 Основной текст</span>
              <span class="color-preview" style="background: ${getColor('--color-text-primary')}"></span>
            </label>
            <input type="color" id="text-primary-color" value="${getColor('--color-text-primary')}">
          </div>
          
          <div class="color-input-group">
            <label for="text-secondary-color">
              <span class="color-label">🔇 Второстепенный текст</span>
              <span class="color-preview" style="background: ${getColor('--color-text-secondary')}"></span>
            </label>
            <input type="color" id="text-secondary-color" value="${getColor('--color-text-secondary')}">
          </div>
        </div>
      </div>
      
      <div class="color-section">
        <h4>✨ Акцентные цвета</h4>
        <div class="color-inputs">
          <div class="color-input-group">
            <label for="accent-primary-color">
              <span class="color-label">🎨 Основной акцент</span>
              <span class="color-preview" style="background: ${getColor('--color-accent-primary')}"></span>
            </label>
            <input type="color" id="accent-primary-color" value="${getColor('--color-accent-primary')}">
          </div>
          
          <div class="color-input-group">
            <label for="accent-light-color">
              <span class="color-label">💫 Светлый акцент</span>
              <span class="color-preview" style="background: ${getColor('--color-accent-light')}"></span>
            </label>
            <input type="color" id="accent-light-color" value="${getColor('--color-accent-light')}">
          </div>
        </div>
      </div>
      
      <div class="color-section">
        <h4>🧩 Элементы интерфейса</h4>
        <div class="color-inputs">
          <div class="color-input-group">
            <label for="border-color">
              <span class="color-label">📏 Границы</span>
              <span class="color-preview" style="background: ${getColor('--color-border')}"></span>
            </label>
            <input type="color" id="border-color" value="${getColor('--color-border')}">
          </div>
          
          <div class="color-input-group">
            <label for="special-color">
              <span class="color-label">⭐ Избранное</span>
              <span class="color-preview" style="background: ${getColor('--color-special')}"></span>
            </label>
            <input type="color" id="special-color" value="${getColor('--color-special')}">
          </div>
        </div>
      </div>
      
      <div class="customize-actions">
        <button id="save-custom-theme" class="save-btn">💾 Сохранить</button>
        <button id="reset-custom-theme" class="reset-btn">↺ Сбросить</button>
        <button id="close-customize" class="close-btn">✕ Закрыть</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(panel);
  
  setTimeout(() => panel.classList.add('active'), 10);
  
  function updatePreviews() {
    document.querySelectorAll('.color-input-group').forEach(group => {
      const input = group.querySelector('input[type="color"]');
      const preview = group.querySelector('.color-preview');
      if (input && preview) {
        preview.style.background = input.value;
      }
    });
  }
  
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
      '--color-special': document.getElementById('special-color').value
    };
    
    Object.keys(colors).forEach(key => {
      root.style.setProperty(key, colors[key], 'important');
    });
    
    saveCustomTheme(currentTheme, colors);
    
    showNotification('Тема сохранена');
    
    setTimeout(() => {
      panel.classList.remove('active');
      setTimeout(() => panel.remove(), 300);
    }, 1000);
  });
  
  document.getElementById('reset-custom-theme').addEventListener('click', () => {
    removeCustomTheme(currentTheme);
    showNotification('↺ Тема сброшена к стандартной');
    
    panel.classList.remove('active');
    setTimeout(() => panel.remove(), 300);
  });
  
  document.getElementById('close-customize').addEventListener('click', () => {
    panel.classList.remove('active');
    setTimeout(() => panel.remove(), 300);
  });
  
  panel.addEventListener('click', (e) => {
    if (e.target === panel) {
      panel.classList.remove('active');
      setTimeout(() => panel.remove(), 300);
    }
  });
  
  const escHandler = (e) => {
    if (e.key === 'Escape' && document.body.contains(panel)) {
      panel.classList.remove('active');
      setTimeout(() => panel.remove(), 300);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

function onThemeChanged(newTheme) {
  const normalized = normalizeThemeName(newTheme);
  console.log(`[Theme] Switched to: ${normalized}`);
  applyCustomTheme(normalized);
}

// ============================================
// 🚀 Инициализация
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('[Theme] DOM loaded, initializing...');
  
  const customizeBtn = document.getElementById('customize-theme');
  if (customizeBtn) {
    customizeBtn.addEventListener('click', customizeTheme);
  }
  
  const currentTheme = normalizeThemeName(
    localStorage.getItem('theme') || 
    document.body.getAttribute('data-theme') || 
    'dark'
  );
  
  console.log(`[Theme] Initial theme: ${currentTheme}`);
  applyCustomTheme(currentTheme);
  
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'data-theme') {
        const newTheme = document.body.getAttribute('data-theme');
        if (newTheme) {
          onThemeChanged(newTheme);
        }
      }
    });
  });
  
  observer.observe(document.body, { attributes: true });
});

// ============================================
// 🎨 CSS стили панели
// ============================================

const themeCustomizeStyle = document.createElement('style');
themeCustomizeStyle.textContent = `
  .customize-panel {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1001;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }
  
  .customize-panel.active {
    opacity: 1;
    pointer-events: auto;
  }
  
  .customize-panel-content {
    background: var(--color-bg-surface);
    padding: 2rem;
    border-radius: 1rem;
    max-width: 550px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 10px 30px var(--color-shadow);
    transform: translateY(20px);
    transition: transform 0.3s ease;
    border: 1px solid var(--color-border);
  }
  
  .customize-panel.active .customize-panel-content {
    transform: translateY(0);
  }
  
  .customize-panel-content h3 {
    margin: 0 0 1.5rem 0;
    color: var(--color-text-primary);
    font-size: 1.5rem;
  }
  
  .customize-panel-content h4 {
    margin: 1.5rem 0 0.75rem 0;
    color: var(--color-accent-primary);
    font-size: 1rem;
    font-weight: 600;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--color-border);
  }
  
  .customize-panel-content h4:first-child {
    margin-top: 0;
  }
  
  .customize-description {
    color: var(--color-text-secondary);
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    line-height: 1.4;
  }
  
  .color-section {
    margin-bottom: 1rem;
  }
  
  .color-inputs {
    display: grid;
    gap: 0.75rem;
  }
  
  .color-input-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
    background: var(--color-bg-input);
    border-radius: 0.5rem;
    border: 1px solid var(--color-border);
    transition: border-color 0.2s ease;
  }
  
  .color-input-group:hover {
    border-color: var(--color-accent-primary);
  }
  
  .color-input-group label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-text-primary);
    cursor: pointer;
    flex: 1;
    min-width: 0;
  }
  
  .color-label {
    font-size: 0.9rem;
    min-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .color-preview {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    border: 2px solid var(--color-border);
    transition: transform 0.2s ease;
    flex-shrink: 0;
  }
  
  .color-input-group:hover .color-preview {
    transform: scale(1.1);
  }
  
  .color-input-group input[type="color"] {
    width: 50px;
    height: 40px;
    border: none;
    border-radius: 0.5rem;
    background: transparent;
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
  }
  
  .color-input-group input[type="color"]::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  
  .color-input-group input[type="color"]::-webkit-color-swatch {
    border: 2px solid var(--color-border);
    border-radius: 0.5rem;
  }
  
  .color-input-group input[type="color"]::-moz-color-swatch {
    border: 2px solid var(--color-border);
    border-radius: 0.5rem;
  }
  
  .customize-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border);
  }
  
  .customize-actions button {
    flex: 1;
    min-width: 100px;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .save-btn {
    background: var(--color-accent-primary);
    color: white;
  }
  
  .save-btn:hover {
    filter: brightness(1.1);
    transform: translateY(-2px);
  }
  
  .save-btn:active {
    transform: translateY(0);
  }
  
  .reset-btn {
    background: var(--color-bg-input);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border) !important;
  }
  
  .reset-btn:hover {
    background: var(--color-border);
    transform: translateY(-2px);
  }
  
  .close-btn {
    background: transparent;
    color: var(--color-text-secondary);
  }
  
  .close-btn:hover {
    color: var(--color-text-primary);
    transform: translateY(-2px);
  }
  
  @media (max-width: 480px) {
    .customize-panel-content {
      padding: 1.5rem;
      width: 95%;
    }
    
    .color-label {
      min-width: 130px;
      font-size: 0.85rem;
    }
    
    .color-input-group {
      padding: 0.5rem;
    }
    
    .customize-actions {
      flex-direction: column;
    }
    
    .customize-actions button {
      min-width: auto;
    }
  }
  
  .customize-panel-content::-webkit-scrollbar {
    width: 6px;
  }
  
  .customize-panel-content::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .customize-panel-content::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 3px;
  }
  
  .customize-panel-content::-webkit-scrollbar-thumb:hover {
    background: var(--color-text-secondary);
  }
`;

document.head.appendChild(themeCustomizeStyle);