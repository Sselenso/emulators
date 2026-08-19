// ============================================
// MAC Calculator - Calculate next MAC address
// ============================================

class MACCalculator {
    constructor() {
        this.initElements();
        this.initEventListeners();
        this.setupModalHandlers();
    }

    /**
     * Настройка обработчиков модального окна
     */
    setupModalHandlers() {
        const macCalcOpenBtn = document.getElementById('macCalcOpenBtn');
        const macCalcModal = document.getElementById('macCalcModal');
        const closeMacCalcModal = document.getElementById('closeMacCalcModal');
        
        if (macCalcOpenBtn) {
            macCalcOpenBtn.addEventListener('click', () => {
                this.openModal();
            });
        }
        
        if (closeMacCalcModal) {
            closeMacCalcModal.addEventListener('click', () => {
                this.closeModal();
            });
        }
        
        if (macCalcModal) {
            macCalcModal.addEventListener('click', (e) => {
                if (e.target === macCalcModal) {
                    this.closeModal();
                }
            });
            
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && macCalcModal.classList.contains('active')) {
                    this.closeModal();
                }
            });
        }
    }

    /**
     * Открытие модалки
     */
    openModal() {
        const macCalcModal = document.getElementById('macCalcModal');
        if (macCalcModal) {
            macCalcModal.classList.add('active');
            macCalcModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            setTimeout(() => {
                if (this.macInput) {
                    this.macInput.focus();
                }
            }, 300);
        }
    }

    /**
     * Закрытие модалки
     */
    closeModal() {
        const macCalcModal = document.getElementById('macCalcModal');
        if (macCalcModal) {
            macCalcModal.classList.remove('active');
            setTimeout(() => {
                macCalcModal.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
        }
    }

    /**
     * Инициализация DOM элементов
     */
    initElements() {
        this.macInput = document.getElementById('macCalcInput');
        this.macCalcBtn = document.getElementById('macCalcCalculateBtn');
        this.macClearBtn = document.getElementById('macCalcClearBtn');
        this.macResult = document.getElementById('macCalcResult');
        this.macCalcInfo = document.getElementById('macCalcInfo');
        this.currentMacDisplay = document.getElementById('currentMac');
        this.nextMacDisplay = document.getElementById('nextMac');
    }

    /**
     * Инициализация обработчиков событий
     */
    initEventListeners() {
        if (this.macCalcBtn) {
            this.macCalcBtn.addEventListener('click', () => {
                this.handleCalculate();
            });
        }

        if (this.macInput) {
            this.macInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleCalculate();
                }
            });

            this.macInput.addEventListener('input', (e) => {
                this.formatHexInput(e);
            });

            this.macInput.addEventListener('paste', (e) => {
                setTimeout(() => {
                    this.formatHexInput(e);
                }, 10);
            });
        }

        if (this.macClearBtn) {
            this.macClearBtn.addEventListener('click', () => {
                this.clearInput();
            });
        }
    }

    /**
     * Форматирование HEX ввода (только 0-9A-F)
     */
    formatHexInput(e) {
        let value = this.macInput.value.toUpperCase().replace(/[^0-9A-F]/g, '');
        
        if (value.length > 4) {
            value = value.substring(0, 4);
        }
        
        if (this.macInput.value !== value) {
            this.macInput.value = value;
        }
    }

    /**
     * Очистка поля ввода
     */
    clearInput() {
        if (this.macInput) {
            this.macInput.value = '';
            this.macInput.focus();
        }
        this.clearResult();
        this.hideInfo();
    }

    /**
     * Очистка результата
     */
    clearResult() {
        if (this.macResult) {
            this.macResult.innerHTML = `
                <div class="mac-result-placeholder">
                    <p>Введите последние 4 цифры MAC-адреса</p>
                </div>
            `;
        }
        this.hideInfo();
    }

    /**
     * Показать информацию
     */
    showInfo() {
        if (this.macCalcInfo) {
            this.macCalcInfo.style.display = 'block';
        }
    }

    /**
     * Скрыть информацию
     */
    hideInfo() {
        if (this.macCalcInfo) {
            this.macCalcInfo.style.display = 'none';
        }
    }

    /**
     * Показать результат (только следующий MAC)
     */
    showResult(nextMac) {
        if (this.macResult) {
            this.macResult.innerHTML = `
                <div class="mac-result-content mac-result-success">
                    <div class="mac-result-next">
                        <span class="next-label">Следующий MAC:</span>
                        <span class="next-mac">${nextMac}</span>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Показать ошибку
     */
    showError(error) {
        if (this.macResult) {
            this.macResult.innerHTML = `
                <div class="mac-result-error">
                    ${error}
                </div>
            `;
        }
        this.hideInfo();
    }

    /**
     * Расчет следующего MAC-адреса
     */
    calculateNextMAC(lastFour) {
        // Проверяем, что введено 4 HEX символа
        if (!/^[0-9A-F]{4}$/.test(lastFour)) {
            return { 
                error: '❌ Введите 4 HEX символа (0-9, A-F)',
                next: null
            };
        }

        // Конвертируем в десятичное число
        const currentDec = parseInt(lastFour, 16);
        
        // Проверяем, что число в диапазоне
        if (isNaN(currentDec) || currentDec < 0 || currentDec > 65535) {
            return {
                error: '❌ Некорректное значение',
                next: null
            };
        }

        // Добавляем 1
        let nextDec = currentDec + 1;
        
        // Если переполнение (FFFF -> 0000)
        if (nextDec > 65535) {
            nextDec = 0;
        }
        
        // Конвертируем обратно в HEX
        const nextHex = nextDec.toString(16).toUpperCase().padStart(4, '0');
        
        return {
            next: nextHex,
            error: null
        };
    }

    /**
     * Обработка расчета
     */
    handleCalculate() {
        const input = this.macInput.value.trim().toUpperCase();
        
        if (!input) {
            this.showError(' Введите последние 4 цифры MAC-адреса');
            return;
        }

        const result = this.calculateNextMAC(input);
        
        if (result.error) {
            this.showError(result.error);
            return;
        }

        // Показываем только следующий MAC
        this.showResult(result.next);
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('macCalcInput')) {
        new MACCalculator();
    }
});