// ============================================
// Subnet Calculator - Full featured
// ============================================

class SubnetCalculator {
    constructor() {
        this.initElements();
        this.initEventListeners();
        this.setupModalHandlers();
        // Автоматический расчет при загрузке (если есть значение)
        setTimeout(() => {
            if (this.subnetInput && this.subnetInput.value) {
                this.calculate();
            }
        }, 100);
    }

    /**
     * Настройка обработчиков модального окна
     */
    setupModalHandlers() {       
        const subnetCalcOpenBtn = document.getElementById('subnetCalcOpenBtn');
        const subnetModal = document.getElementById('subnetCalcModal');
        const closeSubnetCalc = document.getElementById('closeSubnetCalcModal');
        
        if (subnetCalcOpenBtn) {
            subnetCalcOpenBtn.addEventListener('click', () => {
                this.openModal();
            });
        }
        
        if (closeSubnetCalc) {
            closeSubnetCalc.addEventListener('click', () => {
                this.closeModal();
            });
        }
        
        if (subnetModal) {
            subnetModal.addEventListener('click', (e) => {
                if (e.target === subnetModal) {
                    this.closeModal();
                }
            });
            
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && subnetModal.classList.contains('active')) {
                    this.closeModal();
                }
            });
        }
    }

    /**
     * Открытие модалки
     */
    openModal() {
        const subnetModal = document.getElementById('subnetCalcModal');
        if (subnetModal) {
            subnetModal.classList.add('active');
            subnetModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            setTimeout(() => {
                if (this.subnetInput) {
                    this.subnetInput.focus();
                    this.subnetInput.select();
                }
            }, 300);
        }
    }

    /**
     * Закрытие модалки
     */
    closeModal() {
        const subnetModal = document.getElementById('subnetCalcModal');
        if (subnetModal) {
            subnetModal.classList.remove('active');
            setTimeout(() => {
                subnetModal.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
        }
    }

    /**
     * Инициализация DOM элементов
     */
    initElements() {
        this.subnetInput = document.getElementById('subnetInput');
        this.subnetCalcBtn = document.getElementById('subnetCalculateBtn');
        this.subnetClearBtn = document.getElementById('subnetClearBtn');
        this.subnetResult = document.getElementById('subnetResult');
    }

    /**
     * Инициализация обработчиков событий
     */
    initEventListeners() {
        if (this.subnetCalcBtn) {
            this.subnetCalcBtn.addEventListener('click', () => {
                this.calculate();
            });
        }

        if (this.subnetInput) {
            this.subnetInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.calculate();
                }
            });

            this.subnetInput.addEventListener('paste', (e) => {
                setTimeout(() => {
                    this.formatInput();
                }, 10);
            });
        }

        if (this.subnetClearBtn) {
            this.subnetClearBtn.addEventListener('click', () => {
                this.clearInput();
            });
        }
    }

    /**
     * Форматирование ввода (убираем лишние пробелы)
     */
    formatInput() {
        if (this.subnetInput) {
            this.subnetInput.value = this.subnetInput.value.trim();
        }
    }

    /**
     * Очистка поля ввода
     */
    clearInput() {
        if (this.subnetInput) {
            this.subnetInput.value = '';
            this.subnetInput.focus();
        }
        this.showPlaceholder();
    }

    /**
     * Показать плейсхолдер
     */
    showPlaceholder() {
        if (this.subnetResult) {
            this.subnetResult.innerHTML = `
                <div class="subnet-result-placeholder">
                    <p>Введите IP-адрес и маску</p>
                </div>
            `;
        }
    }

    /**
     * Показать ошибку
     */
    showError(error) {
        if (this.subnetResult) {
            this.subnetResult.innerHTML = `
                <div class="subnet-result-error">
                     ${error}
                </div>
            `;
        }
    }

    /**
     * Парсинг ввода (IP/маска)
     */
    parseInput(input) {
        // Убираем пробелы
        input = input.trim();
        
        // Проверяем формат IP/маска
        let ip, mask;
        
        // Формат: 192.168.1.0/24
        if (input.includes('/')) {
            const parts = input.split('/');
            ip = parts[0].trim();
            mask = parts[1].trim();
            
            // Если маска в формате CIDR
            if (/^\d+$/.test(mask)) {
                const cidr = parseInt(mask);
                if (cidr >= 0 && cidr <= 32) {
                    return { ip, cidr, mask: this.cidrToMask(cidr) };
                }
            }
            
            // Если маска в формате 255.255.255.0
            if (this.isValidIP(mask)) {
                const cidr = this.maskToCidr(mask);
                if (cidr !== -1) {
                    return { ip, cidr, mask };
                }
            }
            
            return null;
        }
        
        // Формат: 192.168.1.0 255.255.255.0 (с пробелом)
        if (input.includes(' ')) {
            const parts = input.split(/\s+/);
            if (parts.length === 2) {
                ip = parts[0].trim();
                mask = parts[1].trim();
                
                if (this.isValidIP(ip) && this.isValidIP(mask)) {
                    const cidr = this.maskToCidr(mask);
                    if (cidr !== -1) {
                        return { ip, cidr, mask };
                    }
                }
            }
        }
        
        return null;
    }

    /**
     * Проверка валидности IP-адреса
     */
    isValidIP(ip) {
        const parts = ip.split('.');
        if (parts.length !== 4) return false;
        return parts.every(part => {
            const num = parseInt(part);
            return num >= 0 && num <= 255 && part === String(num);
        });
    }

    /**
     * Преобразование CIDR в маску
     */
    cidrToMask(cidr) {
        if (cidr < 0 || cidr > 32) return null;
        const mask = ~0 << (32 - cidr);
        return [
            (mask >>> 24) & 0xFF,
            (mask >>> 16) & 0xFF,
            (mask >>> 8) & 0xFF,
            mask & 0xFF
        ].join('.');
    }

    /**
     * Преобразование маски в CIDR
     */
    maskToCidr(mask) {
        const parts = mask.split('.');
        if (parts.length !== 4) return -1;
        
        let binary = '';
        for (const part of parts) {
            const num = parseInt(part);
            if (num < 0 || num > 255) return -1;
            binary += num.toString(2).padStart(8, '0');
        }
        
        // Проверяем, что маска корректна (сначала единицы, потом нули)
        if (!/^1*0*$/.test(binary)) return -1;
        
        return binary.split('1').length - 1;
    }

    /**
     * Преобразование IP в 32-битное число
     */
    ipToNumber(ip) {
        const parts = ip.split('.');
        return parts.reduce((acc, part, i) => {
            return acc + (parseInt(part) << (24 - 8 * i));
        }, 0);
    }

    /**
     * Преобразование числа в IP
     */
    numberToIp(num) {
        return [
            (num >>> 24) & 0xFF,
            (num >>> 16) & 0xFF,
            (num >>> 8) & 0xFF,
            num & 0xFF
        ].join('.');
    }

		/**
 * Основной расчет
 */
calculate() {
    const input = this.subnetInput ? this.subnetInput.value.trim() : '';
    
    if (!input) {
        this.showError('Введите IP-адрес и маску подсети');
        return;
    }

    const parsed = this.parseInput(input);
    
    if (!parsed) {
        this.showError('Неверный формат. Используйте: 192.168.1.0/24 или 192.168.1.0 255.255.255.0');
        return;
    }

    const { ip, cidr, mask } = parsed;
    
    // Проверяем IP
    if (!this.isValidIP(ip)) {
        this.showError('Неверный IP-адрес');
        return;
    }

    // Вычисляем параметры подсети
    const ipNum = this.ipToNumber(ip);
    const maskNum = this.ipToNumber(mask);
    
    // Адрес сети
    const networkNum = ipNum & maskNum;
    const network = this.numberToIp(networkNum);
    
    // Широковещательный адрес
    const broadcastNum = networkNum | (~maskNum >>> 0);
    const broadcast = this.numberToIp(broadcastNum);
    
    // Для /32 особый случай - один хост
    let firstHost, lastHost, usableHosts;
    const totalHosts = Math.pow(2, 32 - cidr);
    
    if (cidr === 32) {
        // Для /32: первый и последний хост = сам адрес
        firstHost = ip;
        lastHost = ip;
        usableHosts = 1; // Только сам хост
    } else if (cidr === 31) {
        // Для /31: два хоста (точка-точка)
        firstHost = this.numberToIp(networkNum);
        lastHost = this.numberToIp(broadcastNum);
        usableHosts = 2;
    } else {
        // Для остальных: первый и последний хост (без сетевого и широковещательного)
        const firstNum = networkNum + 1;
        const lastNum = broadcastNum - 1;
        firstHost = this.numberToIp(firstNum);
        lastHost = this.numberToIp(lastNum);
        usableHosts = totalHosts - 2;
    }
    
    // Дополнительная информация
    const wildcard = this.numberToIp(~maskNum >>> 0);
    const binaryIp = ip.split('.').map(p => parseInt(p).toString(2).padStart(8, '0')).join('.');
    const binaryMask = mask.split('.').map(p => parseInt(p).toString(2).padStart(8, '0')).join('.');
    const hexIp = ip.split('.').map(p => parseInt(p).toString(16).toUpperCase().padStart(2, '0')).join('');
    const hexMask = mask.split('.').map(p => parseInt(p).toString(16).toUpperCase().padStart(2, '0')).join('');

    // Отображаем результат
    this.showResult({
        ip, mask, cidr,
        network, broadcast,
        firstHost, lastHost,
        totalHosts, usableHosts,
        wildcard,
        binaryIp, binaryMask,
        hexIp, hexMask
    });
}

/**
 * Отображение результата
 */
showResult(data) {
    if (!this.subnetResult) return;

    // Форматируем числа с разделителями
    const formatNumber = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };

    // Для /31 и /32 показываем пояснение
    let hostNote = '';
    if (data.cidr === 32) {
        hostNote = '<div class="subnet-note">ℹ️ /32 — это адрес одного хоста (без подсети)</div>';
    } else if (data.cidr === 31) {
        hostNote = '<div class="subnet-note">ℹ️ /31 — это подсеть точка-точка (2 хоста, без широковещательного)</div>';
    }

    this.subnetResult.innerHTML = `
        <div class="subnet-result-content">
            ${hostNote}
            <div class="subnet-result-grid">
                <div class="subnet-result-item">
                    <span class="subnet-label">Адрес сети</span>
                    <span class="subnet-value">${data.network}</span>
                </div>
                <div class="subnet-result-item">
                    <span class="subnet-label">Широковещательный</span>
                    <span class="subnet-value">${data.broadcast}</span>
                </div>
                <div class="subnet-result-item">
                    <span class="subnet-label">Первый хост</span>
                    <span class="subnet-value">${data.firstHost}</span>
                </div>
                <div class="subnet-result-item">
                    <span class="subnet-label"> Последний хост</span>
                    <span class="subnet-value">${data.lastHost}</span>
                </div>
                <div class="subnet-result-item">
                    <span class="subnet-label"> Всего адресов</span>
                    <span class="subnet-value">${formatNumber(data.totalHosts)}</span>
                </div>
                <div class="subnet-result-item">
                    <span class="subnet-label">Доступно хостов</span>
                    <span class="subnet-value">${formatNumber(data.usableHosts)}</span>
                </div>
            </div>
            
            <div class="subnet-result-details">
                <div class="subnet-detail-row">
                    <span class="subnet-detail-label">IP (HEX)</span>
                    <span class="subnet-detail-value">0x${data.hexIp}</span>
                </div>
                <div class="subnet-detail-row">
                    <span class="subnet-detail-label">Маска (HEX)</span>
                    <span class="subnet-detail-value">0x${data.hexMask}</span>
                </div>
                <div class="subnet-detail-row">
                    <span class="subnet-detail-label">Wildcard</span>
                    <span class="subnet-detail-value">${data.wildcard}</span>
                </div>
                <div class="subnet-detail-row">
                    <span class="subnet-detail-label">IP (бинарный)</span>
                    <span class="subnet-detail-value subnet-binary">${data.binaryIp}</span>
                </div>
                <div class="subnet-detail-row">
                    <span class="subnet-detail-label">Маска (бинарная)</span>
                    <span class="subnet-detail-value subnet-binary">${data.binaryMask}</span>
                </div>
            </div>
        </div>
    `;
}
    
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('subnetInput')) {
        new SubnetCalculator();
    }
});