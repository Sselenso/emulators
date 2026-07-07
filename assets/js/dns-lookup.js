// ============================================
// DNS Lookup Tool - Using Google DNS API
// ============================================

class DNSLookup {
    constructor() {
        this.initElements();
        this.initEventListeners();
        this.setupModalHandlers();
    }

    /**
     * Настройка обработчиков модального окна
     */
    setupModalHandlers() {
        // Кнопка открытия модалки - используем ID dnsLookupOpenBtn
        const dnsOpenBtn = document.getElementById('dnsLookupOpenBtn');
        const dnsModal = document.getElementById('dnsLookupModal');
        const closeDnsModal = document.getElementById('closeDnsModal');
        
        if (dnsOpenBtn) {
            dnsOpenBtn.addEventListener('click', () => {
                this.openModal();
            });
        }
        
        if (closeDnsModal) {
            closeDnsModal.addEventListener('click', () => {
                this.closeModal();
            });
        }
        
        if (dnsModal) {
            dnsModal.addEventListener('click', (e) => {
                if (e.target === dnsModal) {
                    this.closeModal();
                }
            });
            
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && dnsModal.classList.contains('active')) {
                    this.closeModal();
                }
            });
        }
    }

    /**
     * Открытие модалки
     */
    openModal() {
        const dnsModal = document.getElementById('dnsLookupModal');
        if (dnsModal) {
            dnsModal.classList.add('active');
            dnsModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            setTimeout(() => {
                if (this.dnsInput) {
                    this.dnsInput.focus();
                    this.dnsInput.select();
                }
            }, 300);
        }
    }

    /**
     * Закрытие модалки
     */
    closeModal() {
        const dnsModal = document.getElementById('dnsLookupModal');
        if (dnsModal) {
            dnsModal.classList.remove('active');
            setTimeout(() => {
                dnsModal.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
        }
    }

    /**
     * Инициализация DOM элементов
     */
    initElements() {
        this.dnsInput = document.getElementById('dnsInput');
        this.dnsType = document.getElementById('dnsType');
        this.dnsLookupBtn = document.getElementById('dnsLookupBtn');
        this.dnsClearBtn = document.getElementById('dnsClearBtn');
        this.dnsResult = document.getElementById('dnsResult');
        this.dnsLoading = document.getElementById('dnsLoading');
    }

    /**
     * Инициализация обработчиков событий
     */
    initEventListeners() {
        if (this.dnsLookupBtn) {
            this.dnsLookupBtn.addEventListener('click', () => {
                this.lookup();
            });
        }

        if (this.dnsInput) {
            this.dnsInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.lookup();
                }
            });
        }

        if (this.dnsClearBtn) {
            this.dnsClearBtn.addEventListener('click', () => {
                this.clearInput();
            });
        }
    }

    /**
     * Очистка поля ввода
     */
    clearInput() {
        if (this.dnsInput) {
            this.dnsInput.value = '';
            this.dnsInput.focus();
        }
        this.showPlaceholder();
        this.hideLoading();
    }

    /**
     * Показать плейсхолдер
     */
    showPlaceholder() {
        if (this.dnsResult) {
            this.dnsResult.innerHTML = `
                <div class="dns-result-placeholder">
                    <p>Введите домен и выберите тип записи</p>
                </div>
            `;
        }
    }

    /**
     * Показать загрузку
     */
    showLoading() {
        if (this.dnsLoading) {
            this.dnsLoading.style.display = 'flex';
        }
        if (this.dnsResult) {
            this.dnsResult.innerHTML = `
                <div class="dns-result-content">
                    <p style="color: var(--color-text-secondary);">⏳ Выполняется DNS-запрос...</p>
                </div>
            `;
        }
    }

    /**
     * Скрыть загрузку
     */
    hideLoading() {
        if (this.dnsLoading) {
            this.dnsLoading.style.display = 'none';
        }
    }

    /**
     * Показать ошибку
     */
    showError(error) {
        if (this.dnsResult) {
            this.dnsResult.innerHTML = `
                <div class="dns-result-error">
                    ⚠️ ${error}
                </div>
            `;
        }
        this.hideLoading();
    }

    /**
     * DNS-запрос через Google DNS API
     */
    async lookup() {
        const domain = this.dnsInput ? this.dnsInput.value.trim() : '';
        const type = this.dnsType ? this.dnsType.value : 'A';
        
        if (!domain) {
            this.showError('Введите доменное имя');
            return;
        }

        // Простая валидация домена
        if (!/^[a-zA-Z0-9][a-zA-Z0-9-.]*\.[a-zA-Z]{2,}$/.test(domain) && domain !== 'localhost') {
            this.showError('Неверный формат домена. Пример: google.com');
            return;
        }

        this.showLoading();

        try {
            // Используем Google DNS API (DoH)
            const url = `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.displayResult(data, domain, type);

        } catch (error) {
            console.error('DNS lookup error:', error);
            
            // Пробуем альтернативный API (Cloudflare)
            try {
                const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/dns-json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                this.displayResult(data, domain, type);
            } catch (fallbackError) {
                this.showError(`Не удалось выполнить DNS-запрос: ${error.message || 'Ошибка сети'}`);
            }
        }
    }

    /**
     * Отображение результата
     */
    displayResult(data, domain, type) {
        this.hideLoading();

        if (!this.dnsResult) return;

        // Проверяем наличие записей
        const answers = data.Answer || data.answers || [];
        
        if (answers.length === 0) {
            this.dnsResult.innerHTML = `
                <div class="dns-result-content">
                    <div class="dns-result-no-records">
                        <span class="dns-icon">📭</span>
                        <p>Записи типа <strong>${type}</strong> для <strong>${domain}</strong> не найдены</p>
                        <p class="dns-hint">Возможно, домен не имеет записей этого типа</p>
                    </div>
                </div>
            `;
            return;
        }

        // Формируем таблицу с результатами
        let rows = '';
        let hasTtl = false;
        
        answers.forEach((record, index) => {
            const data = record.data || record.rdata || '';
            const ttl = record.TTL || record.ttl || '—';
            const name = record.name || record.ns || '';
            
            if (ttl !== '—') hasTtl = true;
            
            // Определяем тип записи
            let recordType = record.type || type;
            if (recordType === 1) recordType = 'A';
            else if (recordType === 28) recordType = 'AAAA';
            else if (recordType === 5) recordType = 'CNAME';
            else if (recordType === 15) recordType = 'MX';
            else if (recordType === 2) recordType = 'NS';
            else if (recordType === 16) recordType = 'TXT';
            else if (recordType === 6) recordType = 'SOA';
            else if (recordType === 255) recordType = 'ANY';
            
            const displayName = name || domain;
            
            rows += `
                <tr>
                    <td>${displayName}</td>
                    <td><span class="dns-record-type">${recordType}</span></td>
                    <td class="dns-record-data">${this.formatRecordData(data, recordType)}</td>
                    ${hasTtl ? `<td>${ttl}</td>` : ''}
                </tr>
            `;
        });

        // Заголовки таблицы
        let headers = `
            <th>Имя</th>
            <th>Тип</th>
            <th>Значение</th>
        `;
        if (hasTtl) {
            headers += `<th>TTL</th>`;
        }

        this.dnsResult.innerHTML = `
            <div class="dns-result-content">
                <div class="dns-result-summary">
                    <span class="dns-domain">📌 ${domain}</span>
                    <span class="dns-records-count">Найдено записей: ${answers.length}</span>
                </div>
                <div class="dns-table-wrapper">
                    <table class="dns-result-table">
                        <thead>
                            <tr>${headers}</tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                </div>                
            </div>
        `;

        // Добавляем обработчик для копирования
        const copyBtn = this.dnsResult.querySelector('.dns-copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const data = JSON.parse(decodeURIComponent(copyBtn._dnsCopyData));
                navigator.clipboard.writeText(JSON.stringify(data, null, 2))
                    .then(() => this.showNotification('✅ Данные скопированы в буфер'))
                    .catch(() => alert('Ошибка копирования'));
            });
        }
    }

    /**
     * Форматирование данных записи
     */
    formatRecordData(data, type) {
        if (!data) return '—';
        
        // Для MX записей форматируем как "priority mail-server"
        if (type === 'MX' && typeof data === 'object') {
            return `${data.priority || data.pref || 10} ${data.exchange || data.exch || ''}`;
        }
        
        // Если это объект с полем exchange (SOA)
        if (typeof data === 'object' && data.exchange) {
            return `${data.exchange} (serial: ${data.serial || '—'})`;
        }
        
        // Если это строка
        if (typeof data === 'string') {
            // Для TXT записей убираем кавычки
            if (type === 'TXT') {
                return data.replace(/^"(.*)"$/, '$1');
            }
            return data;
        }
        
        // Если это массив (для MX, NS)
        if (Array.isArray(data)) {
            return data.join(', ');
        }
        
        return String(data);
    }

    /**
     * Показать уведомление
     */
    showNotification(message) {
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
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('dnsInput')) {
        new DNSLookup();
    }
});