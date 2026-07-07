// ============================================
// OUI Database Parser
// ============================================

class OUIParser {
    constructor() {
        this.ouiDatabase = new Map();
        this.isLoaded = false;
        this.loadingPromise = null;
    }

    /**
     * Загрузка и парсинг OUI файла
     */
    async loadOUI() {
        if (this.isLoaded) {
            return this.ouiDatabase;
        }

        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        this.loadingPromise = this._loadOUIFromFile();
        return this.loadingPromise;
    }

    /**
     * Загрузка OUI из файла
     */
    async _loadOUIFromFile() {
        try {
            console.log('Загрузка OUI базы данных...');
            
            const response = await fetch('./assets/data/oui.txt');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            this._parseOUIText(text);
            
            this.isLoaded = true;
            console.log(`OUI база загружена: ${this.ouiDatabase.size} записей`);
            
            return this.ouiDatabase;
            
        } catch (error) {
            console.error('Ошибка загрузки OUI базы:', error);
            this.loadingPromise = null;
            throw error;
        }
    }

    /**
     * Парсинг текста OUI файла
     */
    _parseOUIText(text) {
        const lines = text.split('\n');
        let currentOUI = null;
        let currentVendor = null;
        let isParsing = false;
        let skipHeader = true;

        for (let line of lines) {
            // Пропускаем пустые строки и заголовки
            if (line.trim() === '' || line.includes('OUI/MA-L') || line.includes('Organization')) {
                continue;
            }

            // Ищем строку с OUI в формате XX-XX-XX (hex)
            const hexMatch = line.match(/^([0-9A-F]{2}-[0-9A-F]{2}-[0-9A-F]{2})\s+\(hex\)\s+(.+)$/i);
            if (hexMatch) {
                // Сохраняем предыдущий OUI
                if (currentOUI && currentVendor) {
                    const normalizedOUI = this._normalizeOUI(currentOUI);
                    this.ouiDatabase.set(normalizedOUI, currentVendor.trim());
                }
                
                // Начинаем новый OUI
                currentOUI = hexMatch[1];
                currentVendor = hexMatch[2].trim();
                isParsing = true;
                continue;
            }

            // Ищем строку с OUI в формате XXXXXX (base 16)
            const base16Match = line.match(/^([0-9A-F]{6})\s+\(base 16\)\s+(.+)$/i);
            if (base16Match && isParsing) {
                // Обновляем название производителя (может быть более полным)
                if (base16Match[2].trim()) {
                    currentVendor = base16Match[2].trim();
                }
                continue;
            }

            // Если мы парсим OUI, и строка не пустая - это может быть адрес
            if (isParsing && line.trim() !== '' && !line.match(/^\s+[0-9A-F]{6}\s+\(base 16\)/i)) {
                // Пропускаем строки с адресом
                continue;
            }
        }

        // Сохраняем последний OUI
        if (currentOUI && currentVendor) {
            const normalizedOUI = this._normalizeOUI(currentOUI);
            this.ouiDatabase.set(normalizedOUI, currentVendor.trim());
        }
    }

    /**
     * Нормализация OUI (XX:XX:XX)
     */
    _normalizeOUI(oui) {
        // Убираем дефисы и приводим к верхнему регистру
        let normalized = oui.replace(/-/g, ':').toUpperCase();
        
        // Убеждаемся, что формат XX:XX:XX
        const parts = normalized.split(':');
        if (parts.length === 3) {
            return parts.map(p => p.padStart(2, '0')).join(':');
        }
        
        return normalized;
    }

    /**
     * Поиск производителя по MAC-адресу
     */
    async findVendor(mac) {
        try {
            await this.loadOUI();
            
            // Нормализуем MAC
            const normalizedMac = this._normalizeMAC(mac);
            if (!normalizedMac) {
                return null;
            }
            
            // Извлекаем OUI (первые 3 байта)
            const oui = normalizedMac.substring(0, 8);
            
            // Ищем в базе
            const vendor = this.ouiDatabase.get(oui);
            
            if (vendor) {
                return {
                    vendor: vendor,
                    mac: normalizedMac,
                    oui: oui,
                    source: 'local'
                };
            }
            
            return null;
            
        } catch (error) {
            console.error('Ошибка поиска в OUI базе:', error);
            return null;
        }
    }

    /**
     * Нормализация MAC-адреса
     */
    _normalizeMAC(mac) {
        // Удаляем все не-шестнадцатеричные символы
        let cleaned = mac.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
        
        // Проверяем длину
        if (cleaned.length !== 12) {
            return null;
        }
        
        // Форматируем с двоеточиями
        return cleaned.match(/.{1,2}/g).join(':');
    }

    /**
     * Получение статистики базы
     */
    getStats() {
        return {
            totalEntries: this.ouiDatabase.size,
            isLoaded: this.isLoaded
        };
    }
}

// Создаем глобальный экземпляр
window.ouiParser = new OUIParser();