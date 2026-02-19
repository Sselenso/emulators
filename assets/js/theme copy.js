// Функция для конвертации RGB в HEX
function rgbToHex(rgb) {
  if (!rgb || rgb === '') return '#000000';
  if (rgb.startsWith('#')) return rgb;
  
  const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return '#000000';
  
  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');
  
  return `#${r}${g}${b}`;
}

// Функция получения базовых цветов для темы
function getBaseColors(theme) {
  const baseThemes = {
    dark: {
      '--bg': '#1a1e24',
      '--card': '#252a33',
      '--accent': '#00b7ff',
      '--accent-light': '#0074f8',
      '--text': '#eef2f5',
      '--muted': '#9aa8b5',
      '--header-bg': '#1f252d',
      '--input-bg': '#2d343e',
      '--border': '#3a404b',
      '--shadow': 'rgba(0, 0, 0, 0.4)',
      '--shadow-hover': 'rgba(0, 0, 0, 0.6)',
      '--accent-color': '#5f9ea0',
      '--favorite-color': '#ffd700'
    },
    light: {
      '--bg': '#f0f3f7',
      '--card': '#ffffff',
      '--accent': '#4a7a8c',
      '--accent-light': '#6b9bb0',
      '--text': '#1f2a36',
      '--muted': '#546e7a',
      '--header-bg': '#ffffff',
      '--input-bg': '#e6ecf2',
      '--border': '#cbd5e0',
      '--shadow': 'rgba(0, 0, 0, 0.08)',
      '--shadow-hover': 'rgba(0, 0, 0, 0.15)',
      '--accent-color': '#4a7a8c',
      '--favorite-color': '#ffd700'
    }
  };
  
  return baseThemes[theme] || baseThemes.dark;
}

// Функция для применения кастомной темы
function applyCustomTheme(theme) {
  const root = document.documentElement;
  const customThemes = JSON.parse(localStorage.getItem('customThemes')) || {};
  const currentTheme = theme || localStorage.getItem('theme') || 
                      document.body.getAttribute('data-theme') || 
                      'dark';
  
  console.log('Applying theme:', currentTheme); // Для отладки
  console.log('Custom themes:', customThemes); // Для отладки
  
  // Проверяем, есть ли кастомная тема для текущей базовой
  if (customThemes[currentTheme]) {
    console.log('Found custom theme for', currentTheme); // Для отладки
    const customColors = customThemes[currentTheme];
    Object.keys(customColors).forEach(key => {
      if (key.startsWith('--')) {
        root.style.setProperty(key, customColors[key]);
      }
    });
    return true;
  } else {
    // Если нет кастомной темы, применяем базовые цвета
    console.log('No custom theme, applying base colors for', currentTheme); // Для отладки
    const baseColors = getBaseColors(currentTheme);
    Object.keys(baseColors).forEach(key => {
      root.style.setProperty(key, baseColors[key]);
    });
    return false;
  }
}

// Функция для сохранения кастомной темы
function saveCustomTheme(theme, colors) {
  const customThemes = JSON.parse(localStorage.getItem('customThemes')) || {};
  customThemes[theme] = colors;
  localStorage.setItem('customThemes', JSON.stringify(customThemes));
  localStorage.setItem('usingCustomTheme', 'true');
  console.log('Saved custom theme for', theme, colors); // Для отладки
}

// Функция для удаления кастомной темы
function removeCustomTheme(theme) {
  const customThemes = JSON.parse(localStorage.getItem('customThemes')) || {};
  delete customThemes[theme];
  localStorage.setItem('customThemes', JSON.stringify(customThemes));
  
  // Если не осталось кастомных тем, удаляем флаг
  if (Object.keys(customThemes).length === 0) {
    localStorage.removeItem('usingCustomTheme');
  }
  
  // Применяем базовые цвета для этой темы
  const baseColors = getBaseColors(theme);
  const root = document.documentElement;
  Object.keys(baseColors).forEach(key => {
    root.style.setProperty(key, baseColors[key]);
  });
}

// Функция для кастомизации текущей темы
function customizeTheme() {
  const root = document.documentElement;
  const currentTheme = localStorage.getItem('theme') || 
                      document.body.getAttribute('data-theme') || 
                      'dark';
  
  // Получаем базовые цвета для текущей темы
  const baseColors = getBaseColors(currentTheme);
  
  // Получаем сохраненные кастомные цвета для текущей темы
  const customThemes = JSON.parse(localStorage.getItem('customThemes')) || {};
  const savedColors = customThemes[currentTheme] || {};
  
  // Функция получения текущего цвета
  const getColor = (varName) => {
    // Сначала проверяем вычисленные стили (они уже могут быть кастомными)
    const computed = getComputedStyle(root).getPropertyValue(varName).trim();
    if (computed && computed !== '') {
      return rgbToHex(computed);
    }
    // Затем проверяем сохраненные кастомные цвета
    if (savedColors[varName]) {
      return savedColors[varName];
    }
    // Иначе берем из базовых
    return baseColors[varName] || '#000000';
  };
  
  // Проверяем, не открыта ли уже панель
  if (document.querySelector('.customize-panel')) {
    return;
  }
  
  // Создаем панель кастомизации
  const panel = document.createElement('div');
  panel.className = 'customize-panel';
  panel.innerHTML = `
    <div class="customize-panel-content">
      <h3>Настройка темы</h3>
      <p class="customize-description">Текущая тема: <strong>${currentTheme === 'dark' ? '🌙 Тёмная' : '☀️ Светлая'}</strong></p>
      <p class="customize-description">Выберите свои цвета для текущей темы</p>
      
      <div class="color-inputs">
        <div class="color-input-group">
          <label for="bg-color">
            <span class="color-label">Фон</span>
            <span class="color-preview" style="background: ${getColor('--bg')}"></span>
          </label>
          <input type="color" id="bg-color" value="${getColor('--bg')}">
        </div>
        
        <div class="color-input-group">
          <label for="card-color">
            <span class="color-label">Карточки</span>
            <span class="color-preview" style="background: ${getColor('--card')}"></span>
          </label>
          <input type="color" id="card-color" value="${getColor('--card')}">
        </div>
        
        <div class="color-input-group">
          <label for="accent-color">
            <span class="color-label">Акцент</span>
            <span class="color-preview" style="background: ${getColor('--accent')}"></span>
          </label>
          <input type="color" id="accent-color" value="${getColor('--accent')}">
        </div>
        
        <div class="color-input-group">
          <label for="text-color">
            <span class="color-label">Текст</span>
            <span class="color-preview" style="background: ${getColor('--text')}"></span>
          </label>
          <input type="color" id="text-color" value="${getColor('--text')}">
        </div>
        
        <div class="color-input-group">
          <label for="muted-color">
            <span class="color-label">Второстепенный текст</span>
            <span class="color-preview" style="background: ${getColor('--muted')}"></span>
          </label>
          <input type="color" id="muted-color" value="${getColor('--muted')}">
        </div>
        
        <div class="color-input-group">
          <label for="border-color">
            <span class="color-label">Границы</span>
            <span class="color-preview" style="background: ${getColor('--border')}"></span>
          </label>
          <input type="color" id="border-color" value="${getColor('--border')}">
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
  
  // Добавляем анимацию появления
  setTimeout(() => panel.classList.add('active'), 10);
  
  // Функция обновления превью
  function updatePreviews() {
    document.querySelectorAll('.color-input-group').forEach(group => {
      const input = group.querySelector('input[type="color"]');
      const preview = group.querySelector('.color-preview');
      if (input && preview) {
        preview.style.background = input.value;
      }
    });
  }
  
  // Обновляем превью при изменении цвета
  document.querySelectorAll('.color-input-group input').forEach(input => {
    input.addEventListener('input', updatePreviews);
  });
  
  // Сохранение кастомной темы
  document.getElementById('save-custom-theme').addEventListener('click', () => {
    const colors = {
      '--bg': document.getElementById('bg-color').value,
      '--card': document.getElementById('card-color').value,
      '--accent': document.getElementById('accent-color').value,
      '--text': document.getElementById('text-color').value,
      '--muted': document.getElementById('muted-color').value,
      '--border': document.getElementById('border-color').value
    };
    
    // Применяем цвета
    Object.keys(colors).forEach(key => {
      root.style.setProperty(key, colors[key]);
    });
    
    // Сохраняем кастомную тему для текущей базовой темы
    saveCustomTheme(currentTheme, colors);
    
    showNotification('✅ Тема сохранена');
    
    // Закрываем панель через секунду
    setTimeout(() => {
      panel.classList.remove('active');
      setTimeout(() => panel.remove(), 300);
    }, 1000);
  });
  
  // Сброс к теме по умолчанию
  document.getElementById('reset-custom-theme').addEventListener('click', () => {
    // Удаляем кастомную тему для текущей базовой
    removeCustomTheme(currentTheme);
    
    showNotification('↺ Тема сброшена к стандартной');
    
    panel.classList.remove('active');
    setTimeout(() => panel.remove(), 300);
  });
  
  // Закрытие
  document.getElementById('close-customize').addEventListener('click', () => {
    panel.classList.remove('active');
    setTimeout(() => panel.remove(), 300);
  });
  
  // Закрытие по клику вне панели
  panel.addEventListener('click', (e) => {
    if (e.target === panel) {
      panel.classList.remove('active');
      setTimeout(() => panel.remove(), 300);
    }
  });
  
  // Закрытие по Escape
  const escHandler = (e) => {
    if (e.key === 'Escape' && document.body.contains(panel)) {
      panel.classList.remove('active');
      setTimeout(() => panel.remove(), 300);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

// Функция для синхронизации с переключением темы
function onThemeChanged(newTheme) {
  console.log('Theme changed to:', newTheme); // Для отладки
  applyCustomTheme(newTheme);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing theme customization'); // Для отладки
  
  // Добавляем кнопку настройки темы
  const customizeBtn = document.getElementById('customize-theme');
  if (customizeBtn) {
    customizeBtn.addEventListener('click', customizeTheme);
  }
  
  // Применяем сохраненную кастомную тему при загрузке
  const currentTheme = localStorage.getItem('theme') || 
                      document.body.getAttribute('data-theme') || 
                      'dark';
  
  console.log('Current theme on load:', currentTheme); // Для отладки
  applyCustomTheme(currentTheme);
  
  // Наблюдаем за изменением атрибута data-theme на body
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'data-theme') {
        const newTheme = document.body.getAttribute('data-theme');
        onThemeChanged(newTheme);
      }
    });
  });
  
  observer.observe(document.body, { attributes: true });
});

// Добавляем CSS для панели кастомизации
const style = document.createElement('style');
style.textContent = `
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
  }
  
  .customize-panel.active {
    opacity: 1;
  }
  
  .customize-panel-content {
    background: var(--card);
    padding: 2rem;
    border-radius: 1rem;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 10px 30px var(--shadow);
    transform: translateY(20px);
    transition: transform 0.3s ease;
  }
  
  .customize-panel.active .customize-panel-content {
    transform: translateY(0);
  }
  
  .customize-panel-content h3 {
    margin: 0 0 0.5rem 0;
    color: var(--text);
    font-size: 1.5rem;
  }
  
  .customize-description {
    color: var(--muted);
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }
  
  .color-inputs {
    display: grid;
    gap: 1rem;
    margin: 1.5rem 0;
  }
  
  .color-input-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem;
    background: var(--input-bg);
    border-radius: 0.5rem;
    border: 1px solid var(--border);
  }
  
  .color-input-group label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text);
    cursor: pointer;
    flex: 1;
  }
  
  .color-label {
    font-size: 0.9rem;
    min-width: 120px;
  }
  
  .color-preview {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    border: 2px solid var(--border);
    transition: transform 0.2s ease;
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
  }
  
  .color-input-group input[type="color"]::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  
  .color-input-group input[type="color"]::-webkit-color-swatch {
    border: 2px solid var(--border);
    border-radius: 0.5rem;
  }
  
  .customize-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  
  .customize-actions button {
    flex: 1;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-width: 100px;
  }
  
  .save-btn {
    background: var(--accent);
    color: white;
  }
  
  .save-btn:hover {
    filter: brightness(1.1);
    transform: translateY(-2px);
  }
  
  .reset-btn {
    background: var(--input-bg);
    color: var(--text);
    border: 1px solid var(--border) !important;
  }
  
  .reset-btn:hover {
    background: var(--border);
    transform: translateY(-2px);
  }
  
  .close-btn {
    background: transparent;
    color: var(--muted);
  }
  
  .close-btn:hover {
    color: var(--text);
    transform: translateY(-2px);
  }
  
  @media (max-width: 480px) {
    .customize-panel-content {
      padding: 1.5rem;
    }
    
    .color-label {
      min-width: 100px;
    }
    
    .customize-actions {
      flex-direction: column;
    }
  }
`;

document.head.appendChild(style);