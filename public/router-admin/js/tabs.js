// js/tabs.js
import { initFormHandlersIn } from './form-handler.js';

// Конфигурация меню для каждой главной вкладки
const sidebarConfigs = {
  master: [
    { section: 'wizard', label: 'МАСТЕР', active: true },
    { section: 'mode',   label: 'РЕЖИМ РАБОТЫ' }
    // добавляй остальные шаги мастера по мере создания
  ],
  wlan5g: [
    { section: 'basic',    label: 'ОСНОВНЫЕ НАСТРОЙКИ', active: true },
    { section: 'advanced', label: 'РАСШИРЕННЫЕ НАСТРОЙКИ' },
    { section: 'security', label: 'БЕЗОПАСНОСТЬ' },
    { section: 'access',   label: 'КОНТРОЛЬ ДОСТУПА' },
    { section: 'wps',      label: 'WPS' }
  ],
  wlan24g: [
    { section: 'basic',    label: 'ОСНОВНЫЕ НАСТРОЙКИ', active: true },
    { section: 'advanced', label: 'РАСШИРЕННЫЕ НАСТРОЙКИ' },
    { section: 'security', label: 'БЕЗОПАСНОСТЬ' },
    { section: 'access',   label: 'КОНТРОЛЬ ДОСТУПА' },
    { section: 'wps',      label: 'WPS' }
  ],
  easymesh: [
    { section: 'status',   label: 'НАСТРОЙКА EASYMESH', active: true },    
  ],
  tcpip: [
    { section: 'lan',      label: 'НАСТРОЙКА LAN', active: true },
    
  ],
	ipv6: [
    { section: 'ipv6',      label: 'IPV6 LAN SETTING', active: true },
		 { section: 'radvd',      label: 'RADVD' },    
  ],
	multiwan: [
    { section: 'wanconfig',      label: 'WAN CONFIG', active: true },
		 { section: 'wanstatus',      label: 'WANSTATUS' },    
  ],
  default: [
    { section: 'placeholder', label: 'Раздел в разработке', active: true }
  ]
};

let currentTab = 'master';
let currentSection = 'wizard';

export async function initTabs() {
  const mainTabs = document.querySelectorAll('.main-tab');

  mainTabs.forEach(tab => {
    tab.addEventListener('click', async () => {
      mainTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const tabId = tab.dataset.tab;
      if (tabId && tabId !== currentTab) {
        currentTab = tabId;
        await rebuildSidebarAndLoadFirst(tabId);
      }
    });
  });

  // Первая загрузка
  await rebuildSidebarAndLoadFirst(currentTab);
}

async function rebuildSidebarAndLoadFirst(tabId) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) {
    console.error('Sidebar не найден');
    return;
  }

  sidebar.innerHTML = '';

  const config = sidebarConfigs[tabId] || sidebarConfigs.default;
  let firstSection = null;

  config.forEach(item => {
    const div = document.createElement('div');
    div.className = 'sidebar-item';
    if (item.active) {
      div.classList.add('active');
      firstSection = item.section;
    }
    div.dataset.section = item.section;
    div.textContent = item.label;

    div.addEventListener('click', async () => {
      sidebar.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
      div.classList.add('active');

      currentSection = item.section;
      await loadContent(tabId, item.section);
    });

    sidebar.appendChild(div);
  });

  if (firstSection) {
    currentSection = firstSection;
    await loadContent(tabId, firstSection);
  } else if (config.length > 0) {
    // Если нет active — берём первый
    await loadContent(tabId, config[0].section);
  }
}

async function loadContent(tab, section) {
  const contentArea = document.getElementById('contentArea');
  if (!contentArea) {
    console.error('contentArea не найден');
    return;
  }

  contentArea.innerHTML = '<div class="loading">Загрузка...</div>';

  const filePath = `components/content/${tab}-${section}.html`;

  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Не найден: ${filePath} (статус ${response.status})`);
    }

    const html = await response.text();
    contentArea.innerHTML = html;

    // КРИТИЧНО: показываем подгруженный блок
    const loadedSection = contentArea.querySelector('.content-section');
    if (loadedSection) {
      loadedSection.style.display = 'block';
      loadedSection.classList.add('active'); // если у тебя есть .active { display: block }
      console.log(`Подгружен и показан блок: ${loadedSection.id || 'без id'}`);
    } else {
      console.warn('В подгруженном HTML нет элемента с классом .content-section');
    }

    // Инициализируем обработчики
    initFormHandlersIn(contentArea);

  } catch (err) {
    console.error('Ошибка загрузки:', err);
    contentArea.innerHTML = `
      <div style="padding:40px; text-align:center; color:#dc3545;">
        <h3>Ошибка загрузки</h3>
        <p>${err.message}</p>
        <small>Проверьте файл: ${filePath}</small>
      </div>
    `;
  }
}