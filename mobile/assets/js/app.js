const routers = [
  {
    id: "dlink",
    name: "D-Link",
    logo: "assets/img/dlink.svg",
    emulators: [
      { name: "DIR 615 (старая)", url: "http://em.dlink.ru/emul/DIR-615AA1A/#start/storInfo" },
      { name: "DIR 842 (новая)", url: "https://anweb.dlink.ru:8003/session/start?deviceUrl=http://127.0.0.1:8000&profile=DIR_842E_RT8197F&lang=ru" },
      { name: "Все эмуляторы", url: "https://anweb.dlink.ru/" }
    ],
    instructions: [
      { name: "Новая", url: "https://pakt.ru/internet/oborudovanie/routeri/nastroyka_dir-842.html" },
      { name: "Air", url: "https://support.freedom-vrn.ru/guide/nastroyka-wi-fi-routerov/d-link/nastroyka-wi-fi-marshrutizatora-d-link-air-interfeys.html#ipoe" },
      { name: "Черная", url: "https://support.freedom-vrn.ru/guide/nastroyka-wi-fi-routerov/d-link/nastroyka-podklyucheniya-d-link-temnyy-interfeys.html#ipoe" }
    ],
    info: `
      <h2>D-Link</h2>
      <p><strong>IP:</strong> 192.168.0.1</p>
      <p><strong>MAC:</strong> с этикетки</p>
      <p><strong>MAC у старых моделей:</strong> +1</p>
    `
  },
  {
    id: "tplink",
    name: "TP-Link",
    logo: "assets/img/tplink.svg",
    emulators: [
      { name: "Зелёная", url: "https://emulator.tp-link.com/Archer-C7_RU/Index.htm" },
      { name: "Бирюзовая (новая)", url: "https://emulator.tp-link.com/c6-ru-v2/index.html" },
      { name: "Все эмуляторы", url: "https://www.tp-link.com/kz/support/emulator/" }
    ],
    instructions: [
      { name: "Зеленая", url: "https://help-wifi.com/tp-link/nastrojka-routera-tp-link-tl-wr841n-podklyuchenie-nastrojka-interneta-i-wi-fi/" },
      { name: "Бирюзовая", url: "https://help-wifi.com/tp-link/kak-nastroit-marshrutizator-tp-link-archer-c6/" }
    ],
    info: `
      <h2>TP-Link</h2>
      <p><strong>Адрес входа:</strong> http://tplinkwifi.net/</p>
      <p><strong>IP в новых моделях:</strong> 192.168.0.1</p>
      <p><strong>IP в старых моделях:</strong> 192.168.1.1</p>
      <p><strong>MAC:</strong> +1</p>
    `
  },
  {
    id: "asus",
    name: "Asus",
    logo: "assets/img/asus.svg",
    emulators: [
      { name: "Чёрная", url: "https://linserv.ru/Asus-RT-AC66U/" },
      { name: "Синяя", url: "https://linserv.ru/Asus-RT-N12/" },
      { name: "Фиолетовая", url: "https://linserv.ru/Asus_old/index-2.html" }
    ],
    instructions: [
      { name: "Черная", url: "https://support.freedom-vrn.ru/guide/nastroyka-wi-fi-routerov/asus/nastroyka-wi-fi-marshrutizatora-asus-rtn-12.html#ipoe" },
      { name: "Синяя", url: "https://support.freedom-vrn.ru/guide/nastroyka-wi-fi-routerov/asus/nastroyka-wi-fi-marshrutizatora-asus-rt-n16.html#ipoe" }
    ],
    info: `
      <h2>Asus</h2>
      <p><strong>IP в новых моделях:</strong> 192.168.50.1</p>
      <p><strong>IP в старых моделях:</strong> 192.168.1.1</p>
      <p><strong>IP:</strong> http://router.asus.com</p>
      <p><strong>MAC:</strong> с этикетки</p>
    `
  },
  {
    id: "keenetic",
    name: "Keenetic / Zyxel",
    logo: "assets/img/keenetic.svg",
    emulators: [
      { name: "Новая (user | user12345678)", url: "http://sgtramenator.keenetic.link" },
      { name: "Старая Zyxel", url: "https://linserv.ru/Zuxel-Keenetic/home.html" },
      { name: "Старая Zyxel 2", url: "https://linserv.ru/Keenetic-4G-II/index.html" },
      { name: "Старая Zyxel 3", url: "https://linserv.ru/Keenetic-4G/index.html" }
    ],
    instructions: [
      { name: "Новая", url: "https://support.freedom-vrn.ru/guide/nastroyka-wi-fi-routerov/keenetic/nastroyka-wi-fi-routera-keenetic-startlite.html#ipoe" },
      { name: "Старая", url: "https://support.freedom-vrn.ru/guide/nastroyka-wi-fi-routerov/zyxel/nastroyka-wi-fi-marshrutizatora-zyxel-keenetic-lite.html#ipoe" }
    ],
    info: `
      <h2>Keenetic / Zyxel</h2>
      <p><strong>IP:</strong> 192.168.1.1</p>
      <p><strong>MAC:</strong> с этикетки</p>
    `
  },
  {
    id: "cudy",
    name: "Cudy",
    logo: "assets/img/cudy.svg",
    emulators: [
      { name: "WR3000", url: "https://support.cudy.com/emulator/WR3000/" }
    ],
    instructions: [
      { name: "Инструкция от монтажников", url: "../cudy.html" },
      { name: "Мануал", url: "https://www.cudy.com/ru-ru/blogs/faq/anleitung-zur-installation-des-cudy-wlan-routers" }
    ],
    info: `
      <h2>Cudy</h2>
      <p><strong>IP:</strong> 192.168.10.1</p>
      <p><strong>IP:</strong> http://cudy.net</p>
      <p><strong>MAC:</strong> +1</p>
      <p><strong>Пароль от входа:</strong> password</p>
    `
  },
  {
    id: "tenda",
    name: "Tenda",
    logo: "assets/img/tenda.svg",
    emulators: [
      { name: "AC10", url: "https://static.tenda.com.cn/doc/2025/05/21/8c182a9fd98b4982b1d407e8bc9f4002/AC10v1Emulator/index.html" },
      { name: "Все эмуляторы", url: "https://www.tendacn.com/simulator/default.html" }
    ],
    instructions: [
      { name: "Новая прошивка", url: "https://help-wifi.com/tenda/bystraya-nastrojka-marshrutizatora-tenda-ac9-ac1200/" },
      { name: "Старая прошивка", url: "https://help-wifi.com/tenda/nastrojka-routera-tenda-n301/" }
    ],
    info: `
      <h2>Tenda</h2>
      <p><strong>IP:</strong> 192.168.0.1</p>
      <p><strong>MAC:</strong> +1</p>
    `
  },
  {
    id: "digma",
    name: "Digma",
    logo: "assets/img/digma.svg",
    emulators: [
      { name: "Digma = Tenda", url: "https://www.tendacn.com/simulator/default.html" }
    ],
    instructions: [
      { name: "Мануал", url: "../digma.html" }
    ],
    info: `
      <h2>Digma</h2>
      <p><strong>IP:</strong> 192.168.0.1</p>
      <p><strong>IP:</strong> digmawifi.com</p>
      <p><strong>MAC:</strong> На этикетке + см. мануал</p>
    `
  },
  {
    id: "mercusys",
    name: "Mercusys",
    logo: "assets/img/mercusys.svg",
    emulators: [
      { name: "Любая модель", url: "https://www.mercusys.com/simulator/mw325rv2-ru/web/common/Index.htm" },
      { name: "Все эмуляторы", url: "https://www.mercusys.ru/support/simulator" }
    ],
    instructions: [
      { name: "Все прошивки", url: "https://support.freedom-vrn.ru/guide/nastroyka-wi-fi-routerov/mercusys/nastroyka-wi-fi-marshrutizatora-mercusys-ac12g.html#ipoe" }
    ],
    info: `
      <h2>Mercusys</h2>
      <p><strong>IP:</strong> 192.168.1.1</p>
      <p><strong>IP:</strong> http://mwlogin.net</p>
      <p><strong>MAC:</strong> +1</p>
    `
  },
  {
    id: "xiaomi",
    name: "Xiaomi",
    logo: "assets/img/xiaomi.svg",
    emulators: [
      { name: "MI Router", url: "https://linserv.ru/Xiaomi/cgi-bin/luci/home#router" }
    ],
    instructions: [
      { name: "На английском", url: "https://help-wifi.com/xiaomi/podklyuchenie-i-nastrojka-xiaomi-mi-wi-fi-router-3/" },
      { name: "На китайском", url: "https://tcenter.ru/upload/stelecom-b2c/Xiaomi_mi_wifi_router_3_s_interfeysom_na_kitayskom.pdf" }
    ],
    info: `
      <h2>Xiaomi</h2>
      <p><strong>IP:</strong> 192.168.31.1</p>
      <p><strong>MAC:</strong> с этикетки</p>
    `
  },
  {
    id: "huawei",
    name: "Huawei",
    logo: "assets/img/huawei.svg",
    emulators: [
      { name: "Старый", url: "https://linserv.ru/HG8120H/index.asp" }
    ],
    instructions: [
      { name: "AX3", url: "https://consumer.huawei.com/ru/community/details/Statya-Nastroyka-routera-Huawei-WiFi-AX3/topicId-31438/" },
      { name: "Старая", url: "https://setuprouter.com/router/huawei/hg8245h/screenshots.html" }
    ],
    info: `
      <h2>Huawei</h2>
      <p><strong>IP:</strong> 192.168.3.1</p>
      <p><strong>MAC:</strong> +1</p>
    `
  },
  {
    id: "netis",
    name: "Netis",
    logo: "assets/img/netis.svg",
    emulators: [
      { name: "Новая (белая)", url: "https://linserv.ru/Netis-GP8501G/index.htm" },
      { name: "Старая (голубая)", url: "http://www.netisru.com/Uploads/Support/Emulators/WF2501_EN/index.htm" },
      { name: "Все эмуляторы", url: "https://linserv.ru/Netis-WF2501/" }
    ],
    instructions: [
      { name: "Инструкция", url: "https://my.volia.com/kiev/ru/faq/article/nastroika-wi-fi-routerov-netis" }
    ],
    info: `
      <h2>Netis</h2>
      <p><strong>IP:</strong> 192.168.1.1</p>
      <p><strong>IP:</strong> https://netis.cc</p>
      <p><strong>MAC:</strong> +1</p>
    `
  },
  {
    id: "snr",
    name: "SNR",
    logo: "assets/img/snr.svg",
    emulators: [
      { name: "SNR CPE Дом.ру", url: "https://linserv.ru/SNR-CPE-W4n/home.html" },
      { name: "SNR CPE W4N", url: "https://linserv.ru/SNR-CPE-W4N/home.html" }
    ],
    instructions: [
      { name: "Новая прошивка", url: "https://support.freedom-vrn.ru/guide/nastroyka-wi-fi-routerov/39/nastroyka-wi-fi-marshrutizatora-snr-cpe-me1.html#ipoe" },
      { name: "Старая", url: "https://netintel.ru/index.php?id=76" }
    ],
    info: `
      <h2>SNR</h2>
      <p><strong>IP:</strong> 192.168.1.1</p>
      <p><strong>MAC:</strong> с этикетки</p>
    `
  },
  {
    id: "wave",
    name: "Wave",
    logo: "assets/img/wave.svg",
    emulators: [
      { name: "Эмулятор", url: "../router-admin/index.html" }
    ],
    instructions: [],
    info: `
      <h2>Wave</h2>
      <p><strong>IP:</strong> 192.168.1.1</p>
      <p><strong>MAC:</strong> с этикетки</p>
      <p>Настроить можно не прошитый под ДОМ.РУ</p>
    `
  },
  {
    id: "apple",
    name: "Apple",
    logo: "assets/img/apple.svg",
    emulators: [
      { name: "Airport Utility", url: "https://chasms.com/osx/yosemite/apu1.htm" }
    ],
    instructions: [
      { name: "Мануал", url: "https://help.citylink.pro/category/38/question/214" }
    ],
    info: `
      <h2>Apple</h2>
      <p><strong>IP:</strong> 10.0.1.1</p>
      <p><strong>MAC:</strong> с этикетки</p>
    `
  },
  {
    id: "mikrotik",
    name: "Mikrotik",
    logo: "assets/img/mikrotik.svg",
    emulators: [
      { name: "Эмулятор без пароля", url: "http://demo.mt.lv/" }
    ],
    instructions: [
      { name: "Winbox", url: "https://www.technotrade.com.ua/Articles/mikrotik_router_setup.php" },
      { name: "QuickSet", url: "https://www.technotrade.com.ua/Articles/mikrotik_quickset_setup_2012-10-12.php" }
    ],
    info: `
      <h2>Mikrotik</h2>
      <p><strong>IP:</strong> 192.168.88.1</p>
      <p><strong>MAC:</strong> с этикетки</p>
    `
  },
  {
    id: "exotic",
    name: "Экзотика",
    logo: "assets/img/exotic.svg",
    emulators: [
      { name: "Netgear", url: "https://highspeed.tips/files/emulators/netgear_genie/start.html" },
      { name: "Linksys/Cisco", url: "https://linserv.ru/Linksys-E4200/" },
      { name: "Linksys", url: "https://linserv.ru/Linksys-WRT330N/" },
      { name: "UPVEL", url: "http://upvel.ru/support/emulyatoryi.html" },
      { name: "Totolink", url: "https://totolink.net/home/news/me_name/menu_listtpl/support/id/41.html" },
      { name: "Trendnet", url: "https://www.trendnet.com/emulators/TEW-923DAP_V1.0R/index.html" }
    ],
    instructions: [],
    info: `
      <h2>Экзотика</h2>
      <p>Netgear, Linksys, UPVEL, Totolink, Trendnet</p>
    `
  }
];

const grid = document.getElementById("grid");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const search = document.getElementById("search");

function render(list) {
  grid.innerHTML = "";
  list.forEach(r => {
    const mainUrl = r.emulators && r.emulators.length > 0 ? r.emulators[0].url : "#";
    grid.innerHTML += `
      <div class="card">
        <img src="${r.logo}" alt="${r.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2280%22>📶</text></svg>'">
        <h3>${r.name}</h3>
        <div class="actions">
          <a href="${mainUrl}" target="_blank" rel="noopener noreferrer">Эмулятор</a>
          <button onclick="openModal('${r.id}')">Подробнее</button>
        </div>
      </div>
    `;
  });
}

function openModal(id) {
  const router = routers.find(r => r.id === id);
  
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
    ${router.info}
    ${emulatorsHtml}
    ${instructionsHtml}
  `;
  modal.style.display = "flex";
}

document.getElementById("closeModal").onclick = () => {
  modal.style.display = "none";
};

modal.onclick = (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
};

search.oninput = () => {
  const q = search.value.toLowerCase();
  const filtered = routers.filter(r =>
    r.name.toLowerCase().includes(q)
  );
  render(filtered);
};

render(routers);

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

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
