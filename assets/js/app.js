//app.js

// Глобальные переменные
let routers = [];
let originalRouters = []; // Сохраняем исходный порядок
let filteredRouters = []; // Текущий отфильтрованный список
let draggedItem = null;
let currentSearchQuery = ''; // Текущий поисковый запрос
let favorites = JSON.parse(localStorage.getItem('favorites')) || []; // Избранное

// Ссылки на DOM элементы (будут инициализированы позже)
let gridElement = null;

// Функция открытия модалки
function openModal(id) {
  const router = routers.find(r => r.id === id);
  if (!router) return;
  
  const modal = document.getElementById("modal");
  const modalBody = document.getElementById("modal-body");
  
  // Формируем HTML для модалки из структурированных данных
  let infoHtml = `<h2>${router.info.title || router.name}</h2>`;
  
  // Добавляем IP адреса
  if (router.info.ip && router.info.ip.length > 0) {
    router.info.ip.forEach(ip => {
      infoHtml += `<p><strong>IP:</strong> ${ip}</p>`;
    });
  }
  
  // Добавляем MAC адреса
  if (router.info.mac && router.info.mac.length > 0) {
    router.info.mac.forEach(mac => {
      infoHtml += `<p><strong>MAC:</strong> ${mac}</p>`;
    });
  }
  
  // Добавляем пароль если есть
  if (router.info.password) {
    infoHtml += `<p><strong>Пароль по-умолчанию:</strong> ${router.info.password}</p>`;
  }
  
  // Добавляем описание если есть
  if (router.info.description) {
    infoHtml += `<p>${router.info.description}</p>`;
  }
  
  // Добавляем примечание если есть
  if (router.info.note) {
    infoHtml += `<p><em>${router.info.note}</em></p>`;
  }
  
  let emulatorsHtml = "";
  if (router.emulators && router.emulators.length > 0) {
    emulatorsHtml = `<div class="modal-section"><h3>Эмуляторы</h3><div class="links-list">` +
      router.emulators.map(e => `<a href="${e.url}" target="_blank" rel="noopener noreferrer" class="modal-link">${e.name}</a>`).join("") +
      `</div></div>`;
  }
  
  let instructionsHtml = "";
  if (router.instructions && router.instructions.length > 0) {
    instructionsHtml = `<div class="modal-section"><h3>Инструкции</h3><div class="links-list">` +
      router.instructions.map(i => `<a href="${i.url}" target="_blank" rel="noopener noreferrer" class="modal-link">${i.name}</a>`).join("") +
      `</div></div>`;
  }
  
  modalBody.innerHTML = `
    ${infoHtml}
    ${emulatorsHtml}
    ${instructionsHtml}
  `;
  modal.classList.add('active');
  modal.style.display = "flex";
  document.body.style.overflow = 'hidden';
}

// Делаем функцию глобальной
window.openModal = openModal;

// Функция подсветки текста
function highlightText(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
}

// Функция переключения избранного
function toggleFavorite(id, event) {
  // Останавливаем всплытие события, чтобы не активировать drag
  if (event) {
    event.stopPropagation();
  }
  
  const index = favorites.indexOf(id);
  if (index === -1) {
    favorites.push(id);
    showNotification('Добавлено в избранное');
  } else {
    favorites.splice(index, 1);
    showNotification('Удалено из избранного');
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
  
  // Перерисовываем текущий список без перезагрузки страницы
  if (currentSearchQuery) {
    const filtered = routers.filter(r =>
      r.name.toLowerCase().includes(currentSearchQuery)
    );
    render(filtered);
  } else {
    render(routers);
  }
}

window.toggleFavorite = toggleFavorite;

// Функция показа уведомлений
function showNotification(message) {
  // Проверяем, есть ли уже уведомление
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
  }, 2000);
}

// Функция показа только избранного
function showFavorites() {
  if (favorites.length > 0) {
    const favoriteRouters = routers.filter(r => favorites.includes(r.id));
    render(favoriteRouters);
    
    // Обновляем активное состояние кнопки
    const favBtn = document.getElementById('showFavorites');
    if (favBtn) {
      favBtn.classList.add('active');
      favBtn.textContent = '★ Все роутеры';
    }
  }
}

window.showFavorites = showFavorites;

// Функция показа всех роутеров
function showAll() {
  if (currentSearchQuery) {
    const filtered = routers.filter(r =>
      r.name.toLowerCase().includes(currentSearchQuery)
    );
    render(filtered);
  } else {
    render(routers);
  }
  
  const favBtn = document.getElementById('showFavorites');
  if (favBtn) {
    favBtn.classList.remove('active');
    favBtn.textContent = '★ Избранное';
  }
}

window.showAll = showAll;

// Функция создания элемента карточки
function createCardElement(router) {
  const card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('data-type', router.id);
  
  const mainUrl = router.emulators && router.emulators.length > 0 ? router.emulators[0].url : "#";
  const isFavorite = favorites.includes(router.id) ? 'active' : '';
  
  // Формируем HTML для IP адресов
  let ipHtml = '';
  if (router.info && router.info.ip && router.info.ip.length > 0) {
    ipHtml = '<div class="card-info-list">';
    router.info.ip.forEach(ip => {
      if (ip.includes(':')) {
        const [label, value] = ip.split(':').map(s => s.trim());
        ipHtml += `<div class="card-info-item"><span class="info-label">${label}</span> ${value}</div>`;
      } else {
        ipHtml += `<div class="card-info-item"><span class="info-label">IP</span> ${ip}</div>`;
      }
    });
    ipHtml += '</div>';
  }

  // Формируем HTML для MAC адресов
  let macHtml = '';
  if (router.info && router.info.mac && router.info.mac.length > 0) {
    macHtml = '<div class="card-info">';
    router.info.mac.forEach(mac => {
      if (mac.includes(':')) {
        const [label, value] = mac.split(':').map(s => s.trim());
        macHtml += `<div class="card-info-item"><span class="info-label">${label}</span> ${value}</div>`;
      } else {
        macHtml += `<div class="card-info-item"><span class="info-label">MAC</span> ${mac}</div>`;
      }
    });
    macHtml += '</div>';
  }

  // Подсветка названия при поиске
  const highlightedName = currentSearchQuery ? 
    highlightText(router.name, currentSearchQuery) : router.name;

  // Пустой заполнитель для одинаковой высоты карточек
  const hasContent = ipHtml || macHtml;
  const placeholderHtml = !hasContent ? `<div class="card-info" style="visibility:hidden">IP: placeholder</div>` : "";

  // Если нет эмуляторов, показываем заглушку
  const emulatorButton = router.emulators && router.emulators.length > 0 
    ? `<a href="${mainUrl}" target="_blank" rel="noopener noreferrer">Эмулятор</a>`
    : `<span class="disabled-btn">Нет эмулятора</span>`;

  card.innerHTML = `
    <button class="favorite-btn ${isFavorite}" onclick="toggleFavorite('${router.id}', event)">★</button>
    <div class="card-title"><h2>${highlightedName}</h2></div>
    ${ipHtml}					
    ${macHtml}         
    ${placeholderHtml}
    <div class="actions">
      ${emulatorButton}
      <button onclick="openModal('${router.id}')">Подробнее</button>
    </div>
  `;
  
  return card;
}

// Функция отрисовки карточек
function render(list) {  
  if (!gridElement) {
    gridElement = document.getElementById("grid");
  }
  
  if (!gridElement) return;
  
  // Обновляем счетчик результатов
  const resultCount = document.getElementById('resultCount');
  if (resultCount) {
    resultCount.textContent = `Найдено: ${list.length} из ${routers.length}`;
  }
  
  gridElement.innerHTML = "";
  list.forEach((router) => {
    const card = createCardElement(router);
    gridElement.appendChild(card);
  });
  
  // Добавляем drag & drop функциональность после отрисовки
  setTimeout(() => {
    makeCardsDraggable();
  }, 100);
}

// Делаем функцию render глобальной
window.render = render;

// Функции для drag & drop
function makeCardsDraggable() {
  const cards = document.querySelectorAll('.card');
  
  cards.forEach(card => {
    // Устанавливаем draggable только для самой карточки, но не для кнопок внутри
    card.setAttribute('draggable', 'true');
    
    // Убираем draggable с кнопок внутри карточки
    const buttons = card.querySelectorAll('button, a');
    buttons.forEach(btn => {
      btn.setAttribute('draggable', 'false');
    });
    
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
    card.addEventListener('dragover', handleDragOver);
    card.addEventListener('drop', handleDrop);
    card.addEventListener('dragenter', handleDragEnter);
    card.addEventListener('dragleave', handleDragLeave);
    
    // Запрещаем drag по кнопкам
    card.querySelectorAll('.favorite-btn, .actions button, .actions a').forEach(el => {
      el.addEventListener('mousedown', (e) => e.stopPropagation());
      el.addEventListener('dragstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });
  });
}

function handleDragStart(e) {
  // Не начинаем drag, если цель - кнопка
  if (e.target.closest('button') || e.target.closest('a')) {
    e.preventDefault();
    return false;
  }
  
  draggedItem = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', this.dataset.type);
  
  // Для Firefox
  e.dataTransfer.setData('text/plain', this.dataset.type);
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  
  // Определяем положение мыши относительно текущей карточки
  const rect = this.getBoundingClientRect();
  const offsetY = e.clientY - rect.top;
  const height = rect.height;
  
  // Если мышь выше середины - вставка сверху, иначе снизу
  const position = offsetY < height / 2 ? 'above' : 'below';
  this.dataset.dragPosition = position;
  
  // Добавляем класс для подсветки
  this.classList.add('drag-over');
  
  return false;
}

function handleDragEnter(e) {
  this.classList.add('drag-over');
}

function handleDragLeave(e) {
  this.classList.remove('drag-over');
  delete this.dataset.dragPosition;
}

function handleDragEnd(e) {
  this.classList.remove('dragging');
  document.querySelectorAll('.card').forEach(card => {
    card.classList.remove('drag-over');
    delete card.dataset.dragPosition;
  });
  draggedItem = null;
}

function handleDrop(e) {
  e.stopPropagation();
  e.preventDefault();
  
  this.classList.remove('drag-over');
  const position = this.dataset.dragPosition || 'below';
  delete this.dataset.dragPosition;
  
  if (draggedItem === this) return;
  
  const grid = document.getElementById('grid');
  
  if (position === 'below') {
    // Вставить после текущего элемента
    this.parentNode.insertBefore(draggedItem, this.nextSibling);
  } else {
    // Вставить перед текущим элементом
    this.parentNode.insertBefore(draggedItem, this);
  }
  
  // Сохраняем новый порядок
  saveOrderToStorage();
  
  // Обновляем массив routers в соответствии с новым порядком
  updateRoutersOrder();
  
  // Обновляем filteredRouters если есть поиск
  if (currentSearchQuery) {
    updateFilteredRouters();
  }
}

function saveOrderToStorage() {
  const cards = document.querySelectorAll('.card');
  const order = [];
  
  cards.forEach(card => {
    const routerId = card.dataset.type;
    order.push(routerId);
  });
  
  localStorage.setItem('routerOrder', JSON.stringify(order));
}

function updateRoutersOrder() {
  const savedOrder = localStorage.getItem('routerOrder');
  
  if (savedOrder && routers.length > 0) {
    try {
      const order = JSON.parse(savedOrder);
      
      // Сортируем routers согласно сохраненному порядку
      routers.sort((a, b) => {
        const indexA = order.indexOf(a.id);
        const indexB = order.indexOf(b.id);
        
        // Если id нет в сохраненном порядке, помещаем в конец
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        
        return indexA - indexB;
      });
    } catch (error) {
      console.error('Ошибка при загрузке порядка:', error);
    }
  }
}

function applySavedOrder() {
  const savedOrder = localStorage.getItem('routerOrder');
  
  if (savedOrder && routers.length > 0) {
    try {
      const order = JSON.parse(savedOrder);
      
      // Сортируем routers согласно сохраненному порядку
      routers.sort((a, b) => {
        const indexA = order.indexOf(a.id);
        const indexB = order.indexOf(b.id);
        
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        
        return indexA - indexB;
      });
    } catch (error) {
      console.error('Ошибка при загрузке порядка:', error);
    }
  }
}

// Функция для обновления отфильтрованного списка
function updateFilteredRouters() {
  if (currentSearchQuery) {
    filteredRouters = routers.filter(r =>
      r.name.toLowerCase().includes(currentSearchQuery)
    );
  } else {
    filteredRouters = [...routers];
  }
}

// Показываем индикатор загрузки
function showLoading() {
  const loader = document.getElementById('loading');
  if (loader) loader.style.display = 'block';
}

function hideLoading() {
  const loader = document.getElementById('loading');
  if (loader) loader.style.display = 'none';
}

// Функция для создания кэша только с id и name
function createSortingCache(fullData) {
  return fullData.map(item => ({
    id: item.id,
    name: item.name
  }));
}

// Загрузка данных из JSON с кэшированием только названий
async function loadRouters() {
  showLoading();
  
  try {
    // Всегда пытаемся загрузить свежие данные
    const response = await fetch('./assets/data/routers.json', {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error('Ошибка загрузки данных');
    }
    
    const fullData = await response.json();
    
    // Сохраняем только id и name для будущего офлайн-режима
    const sortingCache = createSortingCache(fullData);
    localStorage.setItem('routersSortingCache', JSON.stringify(sortingCache));
    localStorage.setItem('routersCacheTime', Date.now());
    
    // Используем полные данные
    originalRouters = fullData.map(r => ({...r}));
    routers = fullData.map(r => ({...r}));
    
    showNotification('Данные загружены');
    
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    
    // Если нет сети - пытаемся восстановить из сортировочного кэша
    const cachedSorting = localStorage.getItem('routersSortingCache');
    if (cachedSorting) {
      try {
        const minimalData = JSON.parse(cachedSorting);
        // Создаем заглушки (без ссылок, только название)
        routers = minimalData.map(item => ({
          id: item.id,
          name: item.name,
          info: { 
            ip: [], 
            mac: [],
            title: item.name,
            password: '',
            description: '',
            note: ''
          },
          emulators: [],
          instructions: []
        }));
        originalRouters = [...routers];
        showNotification('Режим офлайн: отображаются только названия');
      } catch (e) {
        console.error('Ошибка чтения кэша:', e);
        routers = [];
        originalRouters = [];
      }
    } else {
      routers = [];
      originalRouters = [];
    }
  } finally {
    hideLoading();
  }
  
  // Применяем сохраненный порядок (если есть)
  applySavedOrder();
  filteredRouters = [...routers];
  return routers;
}

// Функция для проверки обновлений (можно вызывать периодически)
async function checkForUpdates() {
  try {
    const response = await fetch('./assets/data/routers.json', {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) return;
    
    const newData = await response.json();
    const oldCache = JSON.parse(localStorage.getItem('routersSortingCache') || '[]');
    
    // Сравниваем только по ID и названиям
    const needsUpdate = newData.some((newItem, index) => {
      const oldItem = oldCache[index];
      return !oldItem || oldItem.id !== newItem.id || oldItem.name !== newItem.name;
    });
    
    if (needsUpdate) {
      // Обновляем sorting cache
      const newSortingCache = createSortingCache(newData);
      localStorage.setItem('routersSortingCache', JSON.stringify(newSortingCache));
      
      // Обновляем routers с новыми данными
      originalRouters = newData.map(r => ({...r}));
      routers = newData.map(r => ({...r}));
      
      // Применяем сохраненный порядок
      applySavedOrder();
      
      // Перерисовываем
      if (currentSearchQuery) {
        filteredRouters = routers.filter(r =>
          r.name.toLowerCase().includes(currentSearchQuery)
        );
        render(filteredRouters);
      } else {
        render(routers);
      }
      
      showNotification('Данные обновлены');
    }
  } catch (error) {
    console.error('Ошибка проверки обновлений:', error);
  }
}

// Функция сброса порядка
function resetOrder() {    
  localStorage.removeItem('routerOrder');
  
  if (originalRouters.length > 0) {   
    routers = originalRouters.map(r => ({
      ...r,
      info: {...r.info},
      emulators: r.emulators ? [...r.emulators] : [],
      instructions: r.instructions ? [...r.instructions] : []
    }));
    
    if (currentSearchQuery) {
      filteredRouters = routers.filter(r =>
        r.name.toLowerCase().includes(currentSearchQuery)
      );
      render(filteredRouters);
    } else {
      filteredRouters = routers.map(r => ({...r}));
      render(routers);
    }
    
    showNotification('Порядок сброшен');
  } else {  
    loadRouters().then(() => {
      if (currentSearchQuery) {
        filteredRouters = routers.filter(r =>
          r.name.toLowerCase().includes(currentSearchQuery)
        );
        render(filteredRouters);
      } else {
        render(routers);
      }
    });
  }
}

window.resetOrder = resetOrder;

// Очистка поиска
function clearSearch() {
  const search = document.getElementById('search');
  const clearBtn = document.getElementById('clearSearch');
  
  if (search) {
    search.value = '';
    currentSearchQuery = '';
    if (clearBtn) clearBtn.style.display = 'none';
    
    // Проверяем, активен ли режим избранного
    const favBtn = document.getElementById('showFavorites');
    if (favBtn && favBtn.classList.contains('active')) {
      showFavorites();
    } else {
      render(routers);
    }
  }
}

window.clearSearch = clearSearch;

// Принудительное обновление данных
async function refreshData() {
  showLoading();
  try {
    // Очищаем кэш
    localStorage.removeItem('routersSortingCache');
    localStorage.removeItem('routersCacheTime');
    
    await loadRouters();
    render(routers);
    showNotification('Данные обновлены');
  } catch (error) {
    console.error('Ошибка при обновлении:', error);
    showNotification('Ошибка обновления');
  } finally {
    hideLoading();
  }
}

window.refreshData = refreshData;




// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', async function() {
  await loadRouters();

  gridElement = document.getElementById("grid");

  const modal = document.getElementById("modal");
  const search = document.getElementById("search");
  const clearSearchBtn = document.getElementById("clearSearch");
  const closeModalBtn = document.getElementById("closeModal");
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  const favBtn = document.getElementById('showFavorites');
  const refreshBtn = document.getElementById('refreshData');

  // Функция закрытия модалки
  function closeModalFunc() {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = "none";
      document.body.style.overflow = '';
    }, 300);
  }

  // Обработчики событий
  if (closeModalBtn) {
    closeModalBtn.onclick = closeModalFunc;
  }

  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) {
        closeModalFunc();
      }
    };
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeModalFunc();
    }
    
    // Ctrl/Cmd + F для фокуса на поиске
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      document.getElementById('search').focus();
    }
    
    // Escape для очистки поиска
    if (e.key === 'Escape' && document.getElementById('search') === document.activeElement) {
      clearSearch();
    }
  });

  // Поиск
  if (search) {
    search.oninput = () => {
      currentSearchQuery = search.value.toLowerCase().trim();
      
      if (clearSearchBtn) {
        clearSearchBtn.style.display = currentSearchQuery ? 'block' : 'none';
      }
      
      if (currentSearchQuery) {
        // Если активен режим избранного, фильтруем только по избранным
        if (favBtn && favBtn.classList.contains('active')) {
          const favoriteRouters = routers.filter(r => 
            favorites.includes(r.id) && r.name.toLowerCase().includes(currentSearchQuery)
          );
          render(favoriteRouters);
        } else {
          filteredRouters = routers.filter(r =>
            r.name.toLowerCase().includes(currentSearchQuery)
          );
          render(filteredRouters);
        }
      } else {
        if (favBtn && favBtn.classList.contains('active')) {
          showFavorites();
        } else {
          render(routers);
        }
      }
    };
  }

  // Очистка поиска
  if (clearSearchBtn) {
    clearSearchBtn.onclick = clearSearch;
  }

  // Кнопка избранного
  if (favBtn) {
    favBtn.onclick = function() {
      if (this.classList.contains('active')) {
        showAll();
      } else {
        showFavorites();
      }
    };
  }

  // Кнопка обновления
  if (refreshBtn) {
    refreshBtn.onclick = refreshData;
  }

  // Тема
 if (themeToggle) {  
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    body.setAttribute('data-theme', savedTheme);
  }

  themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Просто меняем атрибут. theme.js перехватит это и сделает всё остальное!
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);      
  });
}
  // Запускаем проверку обновлений каждые 5 минут
  setInterval(checkForUpdates, 5 * 60 * 1000);

  // Инициализация
  render(routers);
});