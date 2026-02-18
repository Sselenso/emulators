// Глобальные переменные
let routers = [];

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

// Загрузка данных из JSON
async function loadRouters() {
  try {
    const response = await fetch('./assets/data/routers.json');
    if (!response.ok) {
      throw new Error('Ошибка загрузки данных');
    }
    routers = await response.json();
    return routers;
  } catch (error) {
    console.error('Ошибка:', error);
    return [];
  }
}

// Ждем загрузку DOM
document.addEventListener('DOMContentLoaded', async function() {
  // Загружаем данные
  await loadRouters();
  
  // DOM элементы
  const grid = document.getElementById("grid");
  const modal = document.getElementById("modal");
  const search = document.getElementById("search");
  const closeModalBtn = document.getElementById("closeModal");
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  // Функция закрытия модалки
  function closeModalFunc() {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = "none";
      document.body.style.overflow = '';
    }, 300);
  }

  // Функция отрисовки карточек
  function render(list) {
    if (!grid) return;
    
    grid.innerHTML = "";
    list.forEach((r) => {
      const mainUrl = r.emulators && r.emulators.length > 0 ? r.emulators[0].url : "#";

      // Формируем HTML для IP адресов
      let ipHtml = '';
      if (r.info && r.info.ip && r.info.ip.length > 0) {
        ipHtml = '<div class="card-info-list">';
        r.info.ip.forEach(ip => {
          // Если IP содержит двоеточие (например "в новых моделях: 192.168.0.1")
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
      if (r.info && r.info.mac && r.info.mac.length > 0) {
        macHtml = '<div class="card-info">';
        r.info.mac.forEach(mac => {
          // Если MAC содержит двоеточие (например "у старых моделей: +1")
          if (mac.includes(':')) {
            const [label, value] = mac.split(':').map(s => s.trim());
            macHtml += `<div class="card-info-item"><span class="info-label">${label}</span> ${value}</div>`;
          } else {
            macHtml += `<div class="card-info-item"><span class="info-label">MAC</span> ${mac}</div>`;
          }
        });
        macHtml += '</div>';
      }
			//  // Добавляем пароль если есть
      // let passwordHtml = '';
      // if (r.info && r.info.password) {
      //   passwordHtml = `<div class="card-info-item"><div class="card-info-item"><span class="info-label">Пароль</span> ${r.info.password}</div></div>`;
      // }
     

      // Пустой заполнитель для одинаковой высоты карточек
      const hasContent = ipHtml || macHtml || passwordHtml;
      const placeholderHtml = !hasContent ? `<div class="card-info" style="visibility:hidden">IP: placeholder</div>` : "";

      grid.innerHTML += `
        <div class="card" data-type="${r.id}">
          <div class="card-title"><h2>${r.name}</h2></div>
          ${ipHtml}					
          ${macHtml}         
          ${placeholderHtml}
          <div class="actions">
            <a href="${mainUrl}" target="_blank" rel="noopener noreferrer">Эмулятор</a>
            <button onclick="openModal('${r.id}')">Подробнее</button>
          </div>
        </div>
      `;
    });
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
  });

  // Поиск
  if (search) {
    search.oninput = () => {
      const q = search.value.toLowerCase();
      const filtered = routers.filter(r =>
        r.name.toLowerCase().includes(q)
      );
      render(filtered);
    };
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
      body.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }

  // Инициализация
  render(routers);
});