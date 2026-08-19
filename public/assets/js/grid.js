// ============================================
// 📐 Управление сеткой (Grid Columns)
// ============================================

const GRID_COLUMNS_KEY = 'gridColumns';
const DEFAULT_GRID = 'auto-fill';
const MOBILE_BREAKPOINT = 768; // Точка перелома для мобильных

// Инициализация сетки при загрузке
function initGridColumns() {
  const savedColumns = localStorage.getItem(GRID_COLUMNS_KEY);
  const grid = document.querySelector('.grid');
  
  if (grid) {
    // Проверяем ширину экрана
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      // На мобильном всегда авто
      applyGridColumns(DEFAULT_GRID, false);
    } else if (savedColumns) {
      applyGridColumns(savedColumns, false);
    } else {
      applyGridColumns(DEFAULT_GRID, false);
    }
  }
  
  // Слушаем изменение размера окна
  window.addEventListener('resize', debounce(handleResize, 250));
}

// Обработчик изменения размера окна
function handleResize() {
  const grid = document.querySelector('.grid');
  if (!grid) return;
  
  const savedColumns = localStorage.getItem(GRID_COLUMNS_KEY);
  
  if (window.innerWidth <= MOBILE_BREAKPOINT) {
    // Мобильный вид - всегда авто
    applyGridColumns(DEFAULT_GRID, false);
    
    // Скрываем кнопку выбора сетки на мобильных
    const btn = document.getElementById('gridColumnsBtn');
    if (btn) btn.style.display = 'none';
  } else {
    // Десктоп - восстанавливаем сохранённый выбор
    const columns = savedColumns || DEFAULT_GRID;
    applyGridColumns(columns, false);
    
    // Показываем кнопку
    const btn = document.getElementById('gridColumnsBtn');
    if (btn) btn.style.display = 'flex';
  }
}

// Применение количества столбцов
function applyGridColumns(columns, save = true) {
  const grid = document.querySelector('.grid');
  if (!grid) return;
  
  if (columns === DEFAULT_GRID || columns === 'auto') {
    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
  } else {
    grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  }
  
  // Сохраняем в localStorage (только если не мобильный вид)
  if (save && window.innerWidth > MOBILE_BREAKPOINT) {
    localStorage.setItem(GRID_COLUMNS_KEY, columns);
  }
  
  // Обновляем активную кнопку в меню
  updateGridMenuActive(columns);
  
  console.log(`[Grid] Applied ${columns} columns`);
}

// Дебаунс для resize
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Открытие/закрытие меню выбора сетки
function toggleGridMenu() {
  const menu = document.querySelector('.grid-columns-menu');
  
  if (menu) {
    menu.classList.toggle('active');
    return;
  }
  
  // Создаём меню если его нет
  const gridMenu = document.createElement('div');
  gridMenu.className = 'grid-columns-menu';
  gridMenu.innerHTML = `
    <div class="grid-columns-menu-content">
      <h4>Количество столбцов</h4>
      <button class="grid-option" data-columns="3">
        <span class="grid-preview">▦▦▦</span>
        <span>3 столбца</span>
      </button>
      <button class="grid-option" data-columns="4">
        <span class="grid-preview">▦▦▦▦</span>
        <span>4 столбца</span>
      </button>
      <button class="grid-option" data-columns="5">
        <span class="grid-preview">▦▦▦▦▦</span>
        <span>5 столбцов</span>
      </button>
      <button class="grid-option active" data-columns="auto">
        <span class="grid-preview">⚡</span>
        <span>Авто (по умолчанию)</span>
      </button>
    </div>
  `;
  
  document.body.appendChild(gridMenu);
  
  // Позиционируем меню рядом с кнопкой
  const btn = document.getElementById('gridColumnsBtn');
  const btnRect = btn.getBoundingClientRect();
  
  gridMenu.style.top = `${btnRect.bottom + 8}px`;
  gridMenu.style.right = `${window.innerWidth - btnRect.right}px`;
  
  setTimeout(() => gridMenu.classList.add('active'), 10);
  
  // Обработчики кликов по опциям
  gridMenu.querySelectorAll('.grid-option').forEach(option => {
    option.addEventListener('click', () => {
      const columns = option.getAttribute('data-columns');
      applyGridColumns(columns);
      
      setTimeout(() => {
        gridMenu.classList.remove('active');
        setTimeout(() => gridMenu.remove(), 300);
      }, 200);
    });
  });
  
  // Закрытие по клику вне меню
  setTimeout(() => {
    const closeHandler = (e) => {
      if (!gridMenu.contains(e.target) && e.target !== btn) {
        gridMenu.classList.remove('active');
        setTimeout(() => gridMenu.remove(), 300);
        document.removeEventListener('click', closeHandler);
      }
    };
    document.addEventListener('click', closeHandler);
  }, 100);
}

// Обновление активной кнопки в меню
function updateGridMenuActive(columns) {
  const menu = document.querySelector('.grid-columns-menu');
  if (!menu) return;
  
  menu.querySelectorAll('.grid-option').forEach(option => {
    const optionColumns = option.getAttribute('data-columns');
    if (optionColumns === columns) {
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  });
  
  // Обновляем текст кнопки
  const btn = document.getElementById('gridColumnsBtn');
  if (btn) {
    if (columns === DEFAULT_GRID || columns === 'auto') {
      btn.innerHTML = '<span>▦</span> Авто';
    } else {
      btn.innerHTML = `<span>▦</span> ${columns} кол.`;
    }
  }
}

// ============================================
// 🚀 Инициализация при загрузке
// ============================================

document.addEventListener('DOMContentLoaded', function() { 
  initGridColumns();
  
  // 🔥 Кнопка выбора сетки
  const gridColumnsBtn = document.getElementById('gridColumnsBtn');
  if (gridColumnsBtn) {
    // Скрываем кнопку на мобильных при загрузке
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      gridColumnsBtn.style.display = 'none';
    }
    
    gridColumnsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleGridMenu();
    });
  }
});