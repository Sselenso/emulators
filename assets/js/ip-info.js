// ============================================
// IP Info Tool - Using ip-api.com (HTTPS + Batch)
// ============================================

class IPInfo {
    constructor() {
        this.initElements();
        this.initEventListeners();
        this.setupModalHandlers();
    }

    /**
     * Настройка обработчиков модального окна
     */
    setupModalHandlers() {
        const ipInfoOpenBtn = document.getElementById('ipInfoOpenBtn');
        const ipInfoModal = document.getElementById('ipInfoModal');
        const closeIpInfoModal = document.getElementById('closeIpInfoModal');
        
        if (ipInfoOpenBtn) {
            ipInfoOpenBtn.addEventListener('click', () => {
                this.openModal();
            });
        }
        
        if (closeIpInfoModal) {
            closeIpInfoModal.addEventListener('click', () => {
                this.closeModal();
            });
        }
        
        if (ipInfoModal) {
            ipInfoModal.addEventListener('click', (e) => {
                if (e.target === ipInfoModal) {
                    this.closeModal();
                }
            });
            
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && ipInfoModal.classList.contains('active')) {
                    this.closeModal();
                }
            });
        }
    }

    /**
     * Открытие модалки
     */
    openModal() {
        const ipInfoModal = document.getElementById('ipInfoModal');
        if (ipInfoModal) {
            ipInfoModal.classList.add('active');
            ipInfoModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            setTimeout(() => {
                if (this.ipInput) {
                    this.ipInput.focus();
                    this.ipInput.select();
                }
            }, 300);
        }
    }

    /**
     * Закрытие модалки
     */
    closeModal() {
        const ipInfoModal = document.getElementById('ipInfoModal');
        if (ipInfoModal) {
            ipInfoModal.classList.remove('active');
            setTimeout(() => {
                ipInfoModal.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
        }
    }

    /**
     * Инициализация DOM элементов
     */
    initElements() {
        this.ipInput = document.getElementById('ipInfoInput');
        this.ipLookupBtn = document.getElementById('ipInfoLookupBtn');
        this.ipClearBtn = document.getElementById('ipInfoClearBtn');
        this.ipResult = document.getElementById('ipInfoResult');
        this.ipLoading = document.getElementById('ipInfoLoading');
        this.ipMap = document.getElementById('ipInfoMap');
    }

    /**
     * Инициализация обработчиков событий
     */
    initEventListeners() {
        if (this.ipLookupBtn) {
            this.ipLookupBtn.addEventListener('click', () => {
                this.lookup();
            });
        }

        if (this.ipInput) {
            this.ipInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.lookup();
                }
            });
        }

        if (this.ipClearBtn) {
            this.ipClearBtn.addEventListener('click', () => {
                this.clearInput();
            });
        }
    }

    /**
     * Очистка поля ввода
     */
    clearInput() {
        if (this.ipInput) {
            this.ipInput.value = '';
            this.ipInput.focus();
        }
        this.showPlaceholder();
        this.hideLoading();
        this.hideMap();
    }

    /**
     * Показать плейсхолдер
     */
    showPlaceholder() {
        if (this.ipResult) {
            this.ipResult.innerHTML = `
                <div class="ip-info-result-placeholder">
                    <p>Введите IP-адрес или домен для получения информации</p>
                </div>
            `;
        }
        this.hideMap();
    }

    /**
     * Показать загрузку
     */
    showLoading() {
        if (this.ipLoading) {
            this.ipLoading.style.display = 'flex';
        }
        if (this.ipResult) {
            this.ipResult.innerHTML = `
                <div class="ip-info-result-content">
                    <p style="color: var(--color-text-secondary);">⏳ Получение информации...</p>
                </div>
            `;
        }
        this.hideMap();
    }

    /**
     * Скрыть загрузку
     */
    hideLoading() {
        if (this.ipLoading) {
            this.ipLoading.style.display = 'none';
        }
    }

    /**
     * Показать ошибку
     */
    showError(error) {
        if (this.ipResult) {
            this.ipResult.innerHTML = `
                <div class="ip-info-result-error">
                    ⚠️ ${error}
                </div>
            `;
        }
        this.hideLoading();
        this.hideMap();
    }

    /**
     * Проверка валидности IP или домена
     */
    isValidQuery(query) {
        // Проверка IP
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (ipRegex.test(query)) {
            const parts = query.split('.');
            return parts.every(p => parseInt(p) >= 0 && parseInt(p) <= 255);
        }
        
        // Проверка домена
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-.]*\.[a-zA-Z]{2,}$/;
        return domainRegex.test(query);
    }

    /**
     * IP Info запрос через ip-api.com (HTTPS + JSON)
     */
    async lookup() {
        const query = this.ipInput ? this.ipInput.value.trim() : '';
        
        if (!query) {
            this.showError('Введите IP-адрес или домен');
            return;
        }

        // Проверяем, что это не домен с несколькими IP
        // Если это домен - используем одиночный запрос
        const isDomain = /^[a-zA-Z0-9][a-zA-Z0-9-.]*\.[a-zA-Z]{2,}$/.test(query);
        
        this.showLoading();

        try {
            let data;
            
            if (isDomain) {
                // Для доменов используем одиночный запрос (не batch)
                const url = `http://ip-api.com/json/${encodeURIComponent(query)}?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query&lang=ru`;
                
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                data = await response.json();
                
                if (data.status === 'fail') {
                    this.showError(data.message || 'Не удалось найти информацию');
                    return;
                }
                
                this.displayResult(data, query);
                return;
            }

            // Для IP используем batch запрос (может пригодиться в будущем)
            // Но для одного IP можно использовать обычный запрос
            const url = `http://ip-api.com/json/${encodeURIComponent(query)}?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query&lang=ru`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            data = await response.json();
            
            if (data.status === 'fail') {
                this.showError(data.message || 'Не удалось найти информацию');
                return;
            }
            
            this.displayResult(data, query);

        } catch (error) {
            console.error('IP Info error:', error);
            this.showError(`Не удалось получить информацию: ${error.message || 'Ошибка сети'}`);
        }
    }

    /**
     * Отображение результата
     */
    displayResult(data, query) {
        this.hideLoading();

        if (!this.ipResult) return;

        // Определяем статус
        const isMobile = data.mobile ? '📱 Мобильный' : '💻 Стационарный';
        const isProxy = data.proxy ? '🔒 Анонимный (VPN/Proxy)' : '🌐 Публичный';
        const isHosting = data.hosting ? '☁️ Хостинг/Дата-центр' : '🏠 Домашний/Офисный';

        // Формируем HTML
        let infoHtml = `
            <div class="ip-info-result-content">
                <div class="ip-info-result-summary">
                    <span class="ip-info-query">📌 ${data.query || query}</span>
                    <span class="ip-info-status">${data.country || '—'}</span>
                </div>
                <div class="ip-info-grid">
        `;

        // Добавляем поля с данными
        const fields = [
            { label: '🌍 Страна', value: data.country ? `${data.country} (${data.countryCode || ''})` : null },
            { label: '📍 Регион', value: data.regionName || data.region || null },
            { label: '🏙️ Город', value: data.city || null },
            { label: '📮 Почтовый индекс', value: data.zip || null },
            { label: '🗺️ Координаты', value: (data.lat && data.lon) ? `${data.lat}, ${data.lon}` : null },
            { label: '🕐 Часовой пояс', value: data.timezone || null },
            { label: '💰 Валюта', value: data.currency || null },
            { label: '🏢 Провайдер', value: data.isp || null },
            { label: '📋 Организация', value: data.org || null },
            { label: '🔢 ASN', value: data.as || null },
            { label: '📱 Тип', value: isMobile },
            { label: '🔒 Безопасность', value: isProxy },
            { label: '☁️ Размещение', value: isHosting },
            { label: '🔃 Reverse DNS', value: data.reverse || null },
        ];

        fields.forEach(field => {
            if (field.value) {
                infoHtml += `
                    <div class="ip-info-item">
                        <span class="ip-info-label">${field.label}</span>
                        <span class="ip-info-value">${field.value}</span>
                    </div>
                `;
            }
        });

        infoHtml += `
                </div>
                <div class="ip-info-result-footer">
                    <span class="ip-info-api-source">Источник: ip-api.com</span>
                </div>
            </div>
        `;

        this.ipResult.innerHTML = infoHtml;

        // Показываем карту, если есть координаты
        if (data.lat && data.lon && data.lat !== 0 && data.lon !== 0) {
            this.showMap(data.lat, data.lon, data.city || data.regionName || '');
        } else {
            this.hideMap();
        }
    }

    /**
     * Показать карту через iframe
     */
    showMap(lat, lon, title) {
        if (!this.ipMap) return;
        
        this.ipMap.style.display = 'block';
        this.ipMap.style.height = '200px';
        this.ipMap.style.background = 'var(--color-bg-surface)';
        this.ipMap.style.borderRadius = 'var(--radius-sm)';
        this.ipMap.style.border = '1px solid var(--color-border)';
        this.ipMap.style.overflow = 'hidden';
        
        const url = `https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.05}%2C${lat-0.05}%2C${lon+0.05}%2C${lat+0.05}&layer=mapnik&marker=${lat}%2C${lon}`;
        
        this.ipMap.innerHTML = `
            <iframe 
                src="${url}" 
                style="width: 100%; height: 100%; border: none;"
                loading="lazy"
                title="Карта"
            ></iframe>
        `;
    }

    /**
     * Скрыть карту
     */
    hideMap() {
        if (this.ipMap) {
            this.ipMap.style.display = 'none';
        }
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('ipInfoInput')) {
        new IPInfo();
    }
});