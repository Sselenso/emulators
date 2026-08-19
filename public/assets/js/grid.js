// ============================================
// 📐 Управление сеткой (Grid Columns)
// ============================================

const GRID_COLUMNS_KEY = 'gridColumns';
const DEFAULT_GRID = 'auto-fill';
const MOBILE_BREAKPOINT = 768; 


function initGridColumns() {
  const savedColumns = localStorage.getItem(GRID_COLUMNS_KEY);
  const grid = document.querySelector('.grid');
  
  if (grid) {   
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      
      applyGridColumns(DEFAULT_GRID, false);
    } else if (savedColumns) {
      applyGridColumns(savedColumns, false);
    } else {
      applyGridColumns(DEFAULT_GRID, false);
    }
  }  
  
  window.addEventListener('resize', debounce(handleResize, 250));
}

function handleResize() {
  const grid = document.querySelector('.grid');
  if (!grid) return;
  
  const savedColumns = localStorage.getItem(GRID_COLUMNS_KEY);
  
  if (window.innerWidth <= MOBILE_BREAKPOINT) {   
    applyGridColumns(DEFAULT_GRID, false);    
  
    const btn = document.getElementById('gridColumnsBtn');
    if (btn) btn.style.display = 'none';
  } else {   
    const columns = savedColumns || DEFAULT_GRID;
    applyGridColumns(columns, false);    
   
    const btn = document.getElementById('gridColumnsBtn');
    if (btn) btn.style.display = 'flex';
  }
}


function applyGridColumns(columns, save = true) {
  const grid = document.querySelector('.grid');
  if (!grid) return;
  
  if (columns === DEFAULT_GRID || columns === 'auto') {
    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
  } else {
    grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  }  
 
  if (save && window.innerWidth > MOBILE_BREAKPOINT) {
    localStorage.setItem(GRID_COLUMNS_KEY, columns);
  }
    
  updateGridMenuActive(columns);
  
  console.log(`[Grid] Applied ${columns} columns`);
}

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


function toggleGridMenu() {
  const menu = document.querySelector('.grid-columns-menu');
  
  if (menu) {
    menu.classList.toggle('active');
    return;
  }  

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
  
  const btn = document.getElementById('gridColumnsBtn');
  const btnRect = btn.getBoundingClientRect();
  
  gridMenu.style.top = `${btnRect.bottom + 8}px`;
  gridMenu.style.right = `${window.innerWidth - btnRect.right}px`;
  
  setTimeout(() => gridMenu.classList.add('active'), 10);
  

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
 
  const gridColumnsBtn = document.getElementById('gridColumnsBtn');
  if (gridColumnsBtn) {   
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      gridColumnsBtn.style.display = 'none';
    }
    
    gridColumnsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleGridMenu();
    });
  }
});