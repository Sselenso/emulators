// ============================================
// MAC Vendor Lookup - Only Local Database with Simple Progress Bar
// ============================================

class MACVendorLookup {
	constructor() {
		this.history = JSON.parse(localStorage.getItem('macHistory') || '[]');
		this.initElements();
		this.initEventListeners();
		this.updateHistoryUI();
		this.checkOUILoaded();
		this.setupModalHandlers();
	}

	/**
	 * Настройка обработчиков модального окна
	 */
	setupModalHandlers() {
		const macModalBtn = document.getElementById('macModalBtn');
		const macModal = document.getElementById('macModal');
		const closeMacModal = document.getElementById('closeMacModal');

		if (macModalBtn) {
			macModalBtn.addEventListener('click', () => {
				this.openModal();
			});
		}

		if (closeMacModal) {
			closeMacModal.addEventListener('click', () => {
				this.closeModal();
			});
		}

		if (macModal) {
			macModal.addEventListener('click', e => {
				if (e.target === macModal) {
					this.closeModal();
				}
			});

			document.addEventListener('keydown', e => {
				if (e.key === 'Escape' && macModal.classList.contains('active')) {
					this.closeModal();
				}
			});
		}
	}

	/**
	 * Открытие модалки
	 */
	openModal() {
		const macModal = document.getElementById('macModal');
		if (macModal) {
			macModal.classList.add('active');
			macModal.style.display = 'flex';
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
		const macModal = document.getElementById('macModal');
		if (macModal) {
			macModal.classList.remove('active');
			setTimeout(() => {
				macModal.style.display = 'none';
				document.body.style.overflow = '';
			}, 300);
		}
	}

	/**
	 * Проверка загрузки OUI базы
	 */
	async checkOUILoaded() {
		try {
			if (typeof window.ouiParser !== 'undefined') {
				const stats = window.ouiParser.getStats();
				if (!stats.isLoaded) {
					console.log('Загрузка OUI базы данных...');
					await window.ouiParser.loadOUI();
					console.log('OUI база загружена успешно');
					this.updateStatus('ready', `✅ База готова (${stats.totalEntries} записей)`);
				} else {
					this.updateStatus('ready', `✅ База готова (${stats.totalEntries} записей)`);
				}
			} else {
				this.updateStatus('error', '❌ Парсер OUI не загружен');
			}
		} catch (error) {
			console.warn('Не удалось загрузить OUI базу:', error);
			this.updateStatus('error', '❌ Ошибка загрузки базы данных');
		}
	}

	/**
	 * Обновление статуса
	 */
	updateStatus(state, message) {
		console.log('Status:', state, message);
	}

	/**
	 * Инициализация DOM элементов
	 */
	initElements() {
		this.macInput = document.getElementById('macInput');
		this.macLookupBtn = document.getElementById('macLookupBtn');
		this.macClearBtn = document.getElementById('macClearBtn');
		this.macLoading = document.getElementById('macLoading');
		this.historyList = document.getElementById('historyList');
		this.macHistory = document.getElementById('macHistory');
		this.clearHistoryBtn = document.getElementById('clearHistory');

		// Элементы прогресс-бара
		this.progressContainer = document.getElementById('progressContainer');
		this.progressBar = document.getElementById('progressBar');

		// Элемент для результата
		this.macResult = document.getElementById('macResult');
	}

	/**
	 * Инициализация обработчиков событий
	 */
	initEventListeners() {
		if (this.macLookupBtn) {
			this.macLookupBtn.addEventListener('click', () => {
				this.handleLookup();
			});
		}

		if (this.macInput) {
			this.macInput.addEventListener('keypress', e => {
				if (e.key === 'Enter') {
					this.handleLookup();
				}
			});

			this.macInput.addEventListener('input', e => {
				this.formatMacInput(e);
			});

			this.macInput.addEventListener('paste', e => {
				setTimeout(() => {
					this.formatMacInput(e);
				}, 10);
			});
		}

		if (this.macClearBtn) {
			this.macClearBtn.addEventListener('click', () => {
				this.clearInput();
			});
		}

		if (this.clearHistoryBtn) {
			this.clearHistoryBtn.addEventListener('click', () => {
				this.clearHistory();
			});
		}
	}

	/**
	 * Форматирование MAC-адреса при вводе
	 */
	formatMacInput(e) {
		let value = this.macInput.value.replace(/[^0-9A-Fa-f]/g, '');

		if (value.length > 12) {
			value = value.substring(0, 12);
		}

		let formatted = '';
		for (let i = 0; i < value.length; i += 2) {
			if (i > 0 && i < 12) {
				formatted += ':';
			}
			formatted += value.substring(i, i + 2).toUpperCase();
		}

		if (this.macInput.value !== formatted) {
			this.macInput.value = formatted;
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
		this.hideProgress();
		this.hideLoading();
	}

	/**
	 * Очистка результата
	 */
	clearResult() {
		if (this.macResult) {
			this.macResult.innerHTML = `
                <div class="mac-result-placeholder">                    
                    <p>Введите MAC-адрес для поиска</p>
                </div>
            `;
		}
	}

	/**
	 * Показать результат
	 */
	showResult(vendor, mac, oui, source) {
		if (this.macResult) {
			this.macResult.innerHTML = `
                <div class="mac-result-content mac-result-success">
                    <div class="mac-result-vendor">                        
                        <span class="vendor-name">${vendor}</span>
                    </div>
                    <div class="mac-result-details">                      
                        <span>OUI: ${oui || mac.substring(0, 8)}</span>                        
                    </div>
                </div>
            `;
		}
	}

	/**
	 * Показать ошибку
	 */

	showError(error, mac, oui) {
		if (this.macResult) {
			this.macResult.innerHTML = `
            <div class="mac-result-error">
                ${error}
								<div class="mac-result-details">
                <span class="mac-error-oui">OUI: ${oui || mac?.substring(0, 8) || '-'}</span></div>
            </div>
        `;
		}
	}

	/**
	 * Показать прогресс-бар
	 */
	showProgress() {
		if (this.progressContainer) {
			this.progressContainer.style.display = 'block';
		}
		if (this.progressBar) {
			this.progressBar.style.width = '0%';
		}
	}

	/**
	 * Обновить прогресс-бар
	 */
	updateProgress(percent) {
		if (this.progressBar) {
			this.progressBar.style.width = Math.min(100, Math.max(0, percent)) + '%';
		}
	}

	/**
	 * Скрыть прогресс-бар
	 */
	hideProgress() {
		if (this.progressContainer) {
			this.progressContainer.style.display = 'none';
		}
	}

	/**
	 * Плавная анимация прогресс-бара
	 */
	async animateProgress(targetPercent, duration = 800) {
		return new Promise(resolve => {
			const startTime = Date.now();
			const startPercent = parseInt(this.progressBar?.style.width || '0');

			const animate = () => {
				const elapsed = Date.now() - startTime;
				const progress = Math.min(1, elapsed / duration);

				// Плавная кривая (ease-out)
				const eased = 1 - Math.pow(1 - progress, 3);
				const currentPercent = startPercent + (targetPercent - startPercent) * eased;

				this.updateProgress(currentPercent);

				if (progress < 1) {
					requestAnimationFrame(animate);
				} else {
					this.updateProgress(targetPercent);
					resolve();
				}
			};

			animate();
		});
	}

	/**
	 * Показать состояние загрузки
	 */
	showLoading(message = 'Поиск производителя...') {
		if (this.macLoading) {
			this.macLoading.style.display = 'flex';
			const span = this.macLoading.querySelector('span');
			if (span) span.textContent = message;
		}
	}

	/**
	 * Скрыть состояние загрузки
	 */
	hideLoading() {
		if (this.macLoading) {
			this.macLoading.style.display = 'none';
		}
	}

	/**
	 * Нормализация MAC-адреса
	 */
	normalizeMac(mac) {
		let cleaned = mac.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();

		if (cleaned.length !== 12) {
			return null;
		}

		return cleaned.match(/.{1,2}/g).join(':');
	}

	/**
	 * Поиск в локальной OUI базе
	 */
	async searchLocal(mac) {
		try {
			if (typeof window.ouiParser !== 'undefined') {
				const result = await window.ouiParser.findVendor(mac);
				if (result && result.vendor) {
					return {
						vendor: result.vendor,
						mac: result.mac,
						oui: result.oui,
						source: '💾 Локальная база',
						error: null,
					};
				}
			}
			return null;
		} catch (error) {
			console.warn('Ошибка при поиске в локальной базе:', error);
			return null;
		}
	}

	/**
	 * Поиск с прогрессом (только локальная база)
	 */
	async getVendorLocal(mac) {
		const normalized = this.normalizeMac(mac);

		if (!normalized) {
			return {
				vendor: null,
				error: 'Неверный формат MAC-адреса',
			};
		}

		this.showProgress();

		await this.animateProgress(100, 1200);

		await new Promise(resolve => setTimeout(resolve, 300));

		const localResult = await this.searchLocal(normalized);

		this.hideProgress();

		if (localResult && localResult.vendor) {
			return localResult;
		}

		return {
			vendor: null,
			mac: normalized,
			oui: normalized.substring(0, 8),
			error: 'Производитель не найден',
		};
	}

	/**
	 * Обработка поиска
	 */
	async handleLookup() {
		const mac = this.macInput.value.trim();

		if (!mac) {
			this.showError(' Пожалуйста, введите MAC-адрес');
			return;
		}

		// Очищаем результат перед поиском
		this.clearResult();

		const result = await this.getVendorLocal(mac);

		if (result.error) {
			this.showError(result.error, result.mac, result.oui);
		} else if (result.vendor) {
			this.showResult(result.vendor, result.mac, result.oui, result.source);
			this.addToHistory(result.mac, result.vendor, result.source);
		} else {
			this.showError(' Производитель не найден', result.mac, result.oui);
		}
	}

	/**
	 * Добавление в историю
	 */
	addToHistory(mac, vendor, source) {
		this.history = this.history.filter(item => item.mac !== mac);

		this.history.unshift({
			mac,
			vendor,
			source: source || '💾 Локальная база',
			timestamp: Date.now(),
		});

		if (this.history.length > 10) {
			this.history = this.history.slice(0, 10);
		}

		localStorage.setItem('macHistory', JSON.stringify(this.history));
		this.updateHistoryUI();
	}

	/**
	 * Обновление UI истории
	 */
	updateHistoryUI() {
		if (!this.historyList || !this.macHistory) return;

		if (this.history.length === 0) {
			this.macHistory.style.display = 'none';
			return;
		}

		this.macHistory.style.display = 'block';
		this.historyList.innerHTML = this.history
			.map(
				(item, index) => `
            <li data-mac="${item.mac}" data-index="${index}">
                <span class="history-mac">${item.mac}</span>
                <span class="history-vendor">→ ${item.vendor}</span>
                <span class="history-source">${item.source || '💾'}</span>
                <button class="history-remove" data-index="${index}" title="Удалить">×</button>
            </li>
        `,
			)
			.join('');

		this.historyList.querySelectorAll('li').forEach(el => {
			el.addEventListener('click', e => {
				if (e.target.classList.contains('history-remove')) {
					return;
				}
				const mac = el.dataset.mac;
				if (this.macInput) {
					this.macInput.value = mac;
					this.handleLookup();
				}
			});

			const removeBtn = el.querySelector('.history-remove');
			if (removeBtn) {
				removeBtn.addEventListener('click', e => {
					e.stopPropagation();
					const index = parseInt(removeBtn.dataset.index);
					this.removeFromHistory(index);
				});
			}
		});
	}

	/**
	 * Удаление из истории по индексу
	 */
	removeFromHistory(index) {
		this.history.splice(index, 1);
		localStorage.setItem('macHistory', JSON.stringify(this.history));
		this.updateHistoryUI();
	}

	/**
	 * Очистка всей истории
	 */
	clearHistory() {
		if (this.history.length === 0) return;

		if (confirm('Очистить всю историю поиска?')) {
			this.history = [];
			localStorage.removeItem('macHistory');
			this.updateHistoryUI();
		}
	}
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
	if (document.getElementById('macInput')) {
		if (typeof window.ouiParser === 'undefined') {
			console.warn('OUI парсер не загружен!');
			window.ouiParser = {
				findVendor: async () => null,
				loadOUI: async () => {},
				getStats: () => ({ isLoaded: false, totalEntries: 0 }),
			};
		}

		new MACVendorLookup();
	}
});
