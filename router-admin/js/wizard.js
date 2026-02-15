// js/wizard.js

/**
 * Унифицированный мастер настройки беспроводной сети
 * Объединяет все страницы: безопасность, расширенные настройки, контроль доступа, WPS, базовые настройки
 */

export function initWizard() {
  const tryInit = (attempt = 0) => {
    const welcome = document.getElementById('welcomeScreen');
    const wizard  = document.getElementById('wizardContainer');
    const start   = document.getElementById('startWizardBtn');

    if (welcome && wizard && start) {
      console.log("Мастер: элементы найдены, инициализация...");

      // Принудительно показываем приветственный экран
      welcome.style.display = 'block';
      wizard.style.display = 'none';

      // === Состояние мастера ===
      let currentStep = 1;
      const totalSteps = 7;
      const steps = Array.from({ length: totalSteps }, (_, i) => 
        document.getElementById(`step${i+1}`)
      ).filter(Boolean);

      const back   = document.getElementById('wizardBack');
      const next   = document.getElementById('wizardNext');
      const finish = document.getElementById('wizardFinish');

      // === Общие данные для всех страниц ===
      const wizardState = {
        // Базовая конфигурация (шаг 1)
        band: '2.4ГГц (B+G+N)',
        mode: 'AP (точка доступа)',
        ssid: 'XDM RUS',
        channelWidth: '20MHz',
        channel: 'Авто',
        broadcastSsid: 'Включено',
        wmm: 'Включено',
        maxClients: 64,
        
        // Безопасность (шаг 2)
        encryption: 'WPA2 WPA3 MIXED',
        cipherSuite: ['aes'],
        mgmtFrameProtection: 'possible',
        sha256: 'enabled',
        wifiKey: '',
        
        // Расширенные настройки (шаг 3)
        beaconInterval: 100,
        dtimPeriod: 1,
        preamble: 'long',
        aggregation: 'enabled',
        shortGI: 'enabled',
        wlanSplit: 'enabled',
        txBeamforming: 'enabled',
        rfPower: '100',
        dot11k: 'enabled',
        dot11v: 'enabled',
        bandSteering: 'enabled',
        
        // Контроль доступа (шаг 4)
        accessMode: 'allowed',
        accessRules: [
          { mac: '00:11:22:33:44:55', comment: 'Основной компьютер' },
          { mac: 'aa:bb:cc:dd:ee:ff', comment: 'Мобильный телефон' }
        ],
        
        // WPS (шаг 5)
        wpsDisabled: false,
        wpsPin: '87643513',
        
        // Дополнительно (шаг 6)
        txLimit: 0,
        rxLimit: 0,
        universalRepeater: false,
        extendedSsid: ''
      };

      // === Вспомогательные функции ===

      // Показать уведомление
      const showNotification = (message, isError = false) => {
        const notification = document.createElement('div');
        notification.className = 'wizard-notification';
        notification.style.cssText = `
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: ${isError ? '#f8d7da' : '#d4edda'};
          color: ${isError ? '#721c24' : '#155724'};
          padding: 12px 24px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 10000;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
          animation: slideIn 0.3s ease;
        `;
        notification.innerHTML = `
          <span>${isError ? '✕' : '✓'}</span>
          <span>${message}</span>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.style.opacity = '0';
          notification.style.transform = 'translateX(100%)';
          setTimeout(() => {
            if (notification.parentNode) {
              notification.remove();
            }
          }, 300);
        }, 3000);
      };

      // Генерация случайного PIN-кода (8 цифр)
      const generatePin = () => {
        let pin = '';
        for (let i = 0; i < 8; i++) {
          pin += Math.floor(Math.random() * 10);
        }
        return pin;
      };

      // Форматирование MAC-адреса
      const formatMAC = (mac) => {
        const clean = mac.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
        if (clean.length === 12) {
          return clean.match(/.{2}/g).join(':');
        }
        return mac;
      };

      // Валидация MAC-адреса
      const validateMAC = (mac) => {
        const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
        return macRegex.test(mac);
      };

      // === Инициализация всех шагов ===

      // Шаг 1: Базовые настройки
      const initStep1 = () => {
        const bandSelect = document.getElementById('step1-band');
        const modeSelect = document.getElementById('step1-mode');
        const ssidInput = document.getElementById('step1-ssid');
        const channelWidthSelect = document.getElementById('step1-channelWidth');
        const channelSelect = document.getElementById('step1-channel');
        const broadcastSelect = document.getElementById('step1-broadcast');
        const wmmSelect = document.getElementById('step1-wmm');
        const maxClientsInput = document.getElementById('step1-maxClients');
        const disableWlanCheck = document.getElementById('step1-disableWlan');

        // Загрузка сохраненных значений
        if (bandSelect) bandSelect.value = wizardState.band;
        if (modeSelect) modeSelect.value = wizardState.mode;
        if (ssidInput) ssidInput.value = wizardState.ssid;
        if (channelWidthSelect) channelWidthSelect.value = wizardState.channelWidth;
        if (broadcastSelect) broadcastSelect.value = wizardState.broadcastSsid;
        if (wmmSelect) wmmSelect.value = wizardState.wmm;
        if (maxClientsInput) maxClientsInput.value = wizardState.maxClients;

        // Обновление списка каналов при смене диапазона
        const updateChannels = () => {
          if (!bandSelect || !channelSelect) return;
          
          const band = bandSelect.value;
          const currentValue = channelSelect.value;
          
          channelSelect.innerHTML = '';
          
          const autoOption = document.createElement('option');
          autoOption.value = 'Авто';
          autoOption.textContent = 'Авто';
          autoOption.selected = currentValue === 'Авто' || !currentValue;
          channelSelect.appendChild(autoOption);
          
          if (band.includes('2.4ГГц')) {
            for (let i = 1; i <= 13; i++) {
              const option = document.createElement('option');
              option.value = i;
              option.textContent = i;
              option.selected = currentValue == i;
              channelSelect.appendChild(option);
            }
          } else {
            const channels = [36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 149, 153, 157, 161, 165];
            channels.forEach(ch => {
              const option = document.createElement('option');
              option.value = ch;
              option.textContent = ch;
              option.selected = currentValue == ch;
              channelSelect.appendChild(option);
            });
          }
        };

        if (bandSelect) {
          bandSelect.addEventListener('change', updateChannels);
        }

        // Валидация max клиентов
        if (maxClientsInput) {
          maxClientsInput.addEventListener('input', function() {
            let value = parseInt(this.value);
            if (isNaN(value) || value < 1) this.value = 1;
            if (value > 64) this.value = 64;
          });
        }

        // Сохранение данных шага
        const saveStep1 = () => {
          wizardState.band = bandSelect?.value || wizardState.band;
          wizardState.mode = modeSelect?.value || wizardState.mode;
          wizardState.ssid = ssidInput?.value || wizardState.ssid;
          wizardState.channelWidth = channelWidthSelect?.value || wizardState.channelWidth;
          wizardState.channel = channelSelect?.value || wizardState.channel;
          wizardState.broadcastSsid = broadcastSelect?.value || wizardState.broadcastSsid;
          wizardState.wmm = wmmSelect?.value || wizardState.wmm;
          wizardState.maxClients = parseInt(maxClientsInput?.value) || wizardState.maxClients;
          
          console.log('Шаг 1 сохранен:', wizardState);
        };

        updateChannels();
        return saveStep1;
      };

      // Шаг 2: Безопасность
      const initStep2 = () => {
        const encryptionSelect = document.getElementById('step2-encryption');
        const cipherTkip = document.getElementById('step2-cipher-tkip');
        const cipherAes = document.getElementById('step2-cipher-aes');
        const mgmtNone = document.getElementById('step2-mgmt-none');
        const mgmtPossible = document.getElementById('step2-mgmt-possible');
        const mgmtRequired = document.getElementById('step2-mgmt-required');
        const shaDisabled = document.getElementById('step2-sha-disabled');
        const shaEnabled = document.getElementById('step2-sha-enabled');
        const keyInput = document.getElementById('step2-key');
        const showPassword = document.getElementById('step2-show-password');

        // Загрузка сохраненных значений
        if (encryptionSelect) encryptionSelect.value = wizardState.encryption;
        if (cipherTkip) cipherTkip.checked = wizardState.cipherSuite.includes('tkip');
        if (cipherAes) cipherAes.checked = wizardState.cipherSuite.includes('aes');
        
        // Радио-кнопки защиты кадров
        if (mgmtNone && wizardState.mgmtFrameProtection === 'none') mgmtNone.checked = true;
        if (mgmtPossible && wizardState.mgmtFrameProtection === 'possible') mgmtPossible.checked = true;
        if (mgmtRequired && wizardState.mgmtFrameProtection === 'required') mgmtRequired.checked = true;
        
        // SHA256
        if (shaDisabled && wizardState.sha256 === 'disabled') shaDisabled.checked = true;
        if (shaEnabled && wizardState.sha256 === 'enabled') shaEnabled.checked = true;
        
        if (keyInput) keyInput.value = wizardState.wifiKey;

        // Показ пароля
        if (showPassword && keyInput) {
          showPassword.addEventListener('change', function() {
            keyInput.type = this.checked ? 'text' : 'password';
          });
        }

        // Сохранение данных шага
        const saveStep2 = () => {
          wizardState.encryption = encryptionSelect?.value || wizardState.encryption;
          
          wizardState.cipherSuite = [];
          if (cipherTkip?.checked) wizardState.cipherSuite.push('tkip');
          if (cipherAes?.checked) wizardState.cipherSuite.push('aes');
          
          if (mgmtNone?.checked) wizardState.mgmtFrameProtection = 'none';
          if (mgmtPossible?.checked) wizardState.mgmtFrameProtection = 'possible';
          if (mgmtRequired?.checked) wizardState.mgmtFrameProtection = 'required';
          
          if (shaDisabled?.checked) wizardState.sha256 = 'disabled';
          if (shaEnabled?.checked) wizardState.sha256 = 'enabled';
          
          wizardState.wifiKey = keyInput?.value || '';
          
          console.log('Шаг 2 сохранен:', wizardState);
        };

        return saveStep2;
      };

      // Шаг 3: Расширенные настройки
      const initStep3 = () => {
        const beaconInput = document.getElementById('step3-beacon');
        const dtimInput = document.getElementById('step3-dtim');
        const preambleLong = document.getElementById('step3-preamble-long');
        const preambleShort = document.getElementById('step3-preamble-short');
        const aggregationEnabled = document.getElementById('step3-aggregation-enabled');
        const aggregationDisabled = document.getElementById('step3-aggregation-disabled');
        const giEnabled = document.getElementById('step3-gi-enabled');
        const giDisabled = document.getElementById('step3-gi-disabled');
        const splitEnabled = document.getElementById('step3-split-enabled');
        const splitDisabled = document.getElementById('step3-split-disabled');
        const beamformingEnabled = document.getElementById('step3-beamforming-enabled');
        const beamformingDisabled = document.getElementById('step3-beamforming-disabled');
        const rfPower100 = document.getElementById('step3-rf-100');
        const rfPower70 = document.getElementById('step3-rf-70');
        const rfPower50 = document.getElementById('step3-rf-50');
        const rfPower35 = document.getElementById('step3-rf-35');
        const rfPower15 = document.getElementById('step3-rf-15');
        const dot11kEnabled = document.getElementById('step3-11k-enabled');
        const dot11kDisabled = document.getElementById('step3-11k-disabled');
        const dot11vEnabled = document.getElementById('step3-11v-enabled');
        const dot11vDisabled = document.getElementById('step3-11v-disabled');
        const bandSteeringEnabled = document.getElementById('step3-band-enabled');
        const bandSteeringDisabled = document.getElementById('step3-band-disabled');

        // Загрузка сохраненных значений
        if (beaconInput) beaconInput.value = wizardState.beaconInterval;
        if (dtimInput) dtimInput.value = wizardState.dtimPeriod;
        
        if (preambleLong && wizardState.preamble === 'long') preambleLong.checked = true;
        if (preambleShort && wizardState.preamble === 'short') preambleShort.checked = true;
        
        if (aggregationEnabled && wizardState.aggregation === 'enabled') aggregationEnabled.checked = true;
        if (aggregationDisabled && wizardState.aggregation === 'disabled') aggregationDisabled.checked = true;
        
        if (giEnabled && wizardState.shortGI === 'enabled') giEnabled.checked = true;
        if (giDisabled && wizardState.shortGI === 'disabled') giDisabled.checked = true;
        
        if (splitEnabled && wizardState.wlanSplit === 'enabled') splitEnabled.checked = true;
        if (splitDisabled && wizardState.wlanSplit === 'disabled') splitDisabled.checked = true;
        
        if (beamformingEnabled && wizardState.txBeamforming === 'enabled') beamformingEnabled.checked = true;
        if (beamformingDisabled && wizardState.txBeamforming === 'disabled') beamformingDisabled.checked = true;
        
        // Мощность RF
        const rfButtons = [rfPower100, rfPower70, rfPower50, rfPower35, rfPower15];
        rfButtons.forEach(btn => {
          if (btn && btn.value === wizardState.rfPower) btn.checked = true;
        });
        
        if (dot11kEnabled && wizardState.dot11k === 'enabled') dot11kEnabled.checked = true;
        if (dot11kDisabled && wizardState.dot11k === 'disabled') dot11kDisabled.checked = true;
        
        if (dot11vEnabled && wizardState.dot11v === 'enabled') dot11vEnabled.checked = true;
        if (dot11vDisabled && wizardState.dot11v === 'disabled') dot11vDisabled.checked = true;
        
        if (bandSteeringEnabled && wizardState.bandSteering === 'enabled') bandSteeringEnabled.checked = true;
        if (bandSteeringDisabled && wizardState.bandSteering === 'disabled') bandSteeringDisabled.checked = true;

        // Сохранение данных шага
        const saveStep3 = () => {
          wizardState.beaconInterval = parseInt(beaconInput?.value) || wizardState.beaconInterval;
          wizardState.dtimPeriod = parseInt(dtimInput?.value) || wizardState.dtimPeriod;
          
          if (preambleLong?.checked) wizardState.preamble = 'long';
          if (preambleShort?.checked) wizardState.preamble = 'short';
          
          if (aggregationEnabled?.checked) wizardState.aggregation = 'enabled';
          if (aggregationDisabled?.checked) wizardState.aggregation = 'disabled';
          
          if (giEnabled?.checked) wizardState.shortGI = 'enabled';
          if (giDisabled?.checked) wizardState.shortGI = 'disabled';
          
          if (splitEnabled?.checked) wizardState.wlanSplit = 'enabled';
          if (splitDisabled?.checked) wizardState.wlanSplit = 'disabled';
          
          if (beamformingEnabled?.checked) wizardState.txBeamforming = 'enabled';
          if (beamformingDisabled?.checked) wizardState.txBeamforming = 'disabled';
          
          // Определяем выбранную мощность RF
          const rfButtons = [rfPower100, rfPower70, rfPower50, rfPower35, rfPower15];
          rfButtons.forEach(btn => {
            if (btn?.checked) wizardState.rfPower = btn.value;
          });
          
          if (dot11kEnabled?.checked) wizardState.dot11k = 'enabled';
          if (dot11kDisabled?.checked) wizardState.dot11k = 'disabled';
          
          if (dot11vEnabled?.checked) wizardState.dot11v = 'enabled';
          if (dot11vDisabled?.checked) wizardState.dot11v = 'disabled';
          
          if (bandSteeringEnabled?.checked) wizardState.bandSteering = 'enabled';
          if (bandSteeringDisabled?.checked) wizardState.bandSteering = 'disabled';
          
          console.log('Шаг 3 сохранен:', wizardState);
        };

        return saveStep3;
      };

      // Шаг 4: Контроль доступа
      const initStep4 = () => {
        const accessModeSelect = document.getElementById('step4-accessMode');
        const macInput = document.getElementById('step4-macAddress');
        const commentInput = document.getElementById('step4-comment');
        const saveRuleBtn = document.getElementById('step4-saveRule');
        const addRuleBtn = document.getElementById('step4-addRule');
        const resetBtn = document.getElementById('step4-reset');
        const accessList = document.getElementById('step4-accessList');

        // Загрузка сохраненных значений
        if (accessModeSelect) accessModeSelect.value = wizardState.accessMode;

        // Рендеринг списка MAC-адресов
        const renderAccessList = () => {
          if (!accessList) return;
          
          accessList.innerHTML = '';
          
          if (wizardState.accessRules.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="3" style="text-align: center; color: #666; padding: 20px;">Список контроля доступа пуст</td>';
            accessList.appendChild(emptyRow);
          } else {
            wizardState.accessRules.forEach(rule => {
              const row = document.createElement('tr');
              row.innerHTML = `
                <td><code style="background: #f0f4f8; padding: 2px 6px; border-radius: 4px;">${rule.mac}</code></td>
                <td>${rule.comment || '-'}</td>
                <td>
                  <button class="wizard-btn wizard-btn-warning wizard-btn-sm" data-mac="${rule.mac}">Удалить</button>
                </td>
              `;
              accessList.appendChild(row);
            });

            // Привязка обработчиков удаления
            accessList.querySelectorAll('.wizard-btn-warning').forEach(btn => {
              btn.addEventListener('click', function() {
                const mac = this.dataset.mac;
                wizardState.accessRules = wizardState.accessRules.filter(r => r.mac !== mac);
                renderAccessList();
                showNotification('Правило удалено');
              });
            });
          }
        };

        // Сохранение правила
        if (saveRuleBtn) {
          saveRuleBtn.addEventListener('click', function() {
            let mac = macInput?.value.trim() || '';
            const comment = commentInput?.value.trim() || '';

            if (!mac) {
              showNotification('Введите MAC-адрес', true);
              macInput?.focus();
              return;
            }

            if (!validateMAC(mac)) {
              showNotification('Неверный формат MAC-адреса', true);
              macInput?.focus();
              return;
            }

            mac = formatMAC(mac);

            if (wizardState.accessRules.some(r => r.mac === mac)) {
              showNotification('Этот MAC-адрес уже существует', true);
              return;
            }

            wizardState.accessRules.push({ mac, comment });
            renderAccessList();
            showNotification('Правило добавлено');
            
            if (macInput) macInput.value = '';
            if (commentInput) commentInput.value = '';
          });
        }

        // Сброс полей
        if (resetBtn) {
          resetBtn.addEventListener('click', function() {
            if (macInput) macInput.value = '';
            if (commentInput) commentInput.value = '';
            showNotification('Поля сброшены');
          });
        }

        // Фокус на поле MAC
        if (addRuleBtn) {
          addRuleBtn.addEventListener('click', function() {
            macInput?.focus();
            showNotification('Введите MAC-адрес нового устройства');
          });
        }

        // Автоформатирование MAC-адреса
        if (macInput) {
          macInput.addEventListener('input', function() {
            let value = this.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
            if (value.length > 12) value = value.slice(0, 12);
            
            const parts = [];
            for (let i = 0; i < value.length; i += 2) {
              parts.push(value.substr(i, 2));
            }
            
            this.value = parts.join(':');
          });
        }

        // Сохранение данных шага
        const saveStep4 = () => {
          wizardState.accessMode = accessModeSelect?.value || wizardState.accessMode;
          console.log('Шаг 4 сохранен:', wizardState);
        };

        renderAccessList();
        return saveStep4;
      };

      // Шаг 5: WPS
      const initStep5 = () => {
        const disableWpsCheck = document.getElementById('step5-disableWps');
        const wpsStatusSelect = document.getElementById('step5-wpsStatus');
        const pinDisplay = document.getElementById('step5-pinDisplay');
        const regeneratePinBtn = document.getElementById('step5-regeneratePin');
        const startWpsBtn = document.getElementById('step5-startWps');
        const stopWpsBtn = document.getElementById('step5-stopWps');
        const clientPinInput = document.getElementById('step5-clientPin');
        const startPinBtn = document.getElementById('step5-startPin');
        const wpsProgress = document.getElementById('step5-wpsProgress');
        const progressFill = document.getElementById('step5-progressFill');
        const progressText = document.getElementById('step5-progressText');

        let wpsTimer = null;

        // Загрузка сохраненных значений
        if (disableWpsCheck) disableWpsCheck.checked = wizardState.wpsDisabled;
        if (wpsStatusSelect) {
          wpsStatusSelect.value = wizardState.wpsDisabled ? 'unconfigured' : 'configured';
        }
        
        // Обновление отображения PIN-кода
        const updatePinDisplay = (pin) => {
          if (pinDisplay) pinDisplay.textContent = pin;
        };
        updatePinDisplay(wizardState.wpsPin);

        // Обработка чекбокса "Отключить WPS"
        if (disableWpsCheck) {
          disableWpsCheck.addEventListener('change', function() {
            wizardState.wpsDisabled = this.checked;
            if (wpsStatusSelect) {
              wpsStatusSelect.value = this.checked ? 'unconfigured' : 'configured';
            }
            showNotification(this.checked ? 'WPS отключен' : 'WPS включен');
          });
        }

        // Генерация нового PIN-кода
        if (regeneratePinBtn) {
          regeneratePinBtn.addEventListener('click', function() {
            wizardState.wpsPin = generatePin();
            updatePinDisplay(wizardState.wpsPin);
            showNotification('Новый PIN-код сгенерирован');
          });
        }

        // Запуск WPS
        if (startWpsBtn) {
          startWpsBtn.addEventListener('click', function() {
            if (wizardState.wpsDisabled) {
              showNotification('WPS отключен. Включите WPS для использования', true);
              return;
            }

            if (wpsProgress) wpsProgress.style.display = 'flex';
            let progress = 0;
            
            const interval = setInterval(() => {
              progress += 10;
              if (progressFill) progressFill.style.width = progress + '%';
              
              if (progress >= 100) {
                clearInterval(interval);
                if (progressText) progressText.textContent = 'Устройство подключено';
                showNotification('Устройство успешно подключено через WPS');
                
                setTimeout(() => {
                  if (wpsProgress) wpsProgress.style.display = 'none';
                  if (progressFill) progressFill.style.width = '0%';
                }, 2000);
              } else {
                if (progressText) progressText.textContent = `Подключение... ${progress}%`;
              }
            }, 300);

            wpsTimer = interval;
          });
        }

        // Остановка WPS
        if (stopWpsBtn) {
          stopWpsBtn.addEventListener('click', function() {
            if (wpsTimer) {
              clearInterval(wpsTimer);
              if (wpsProgress) wpsProgress.style.display = 'none';
              if (progressFill) progressFill.style.width = '0%';
              showNotification('WPS остановлен');
            } else {
              showNotification('WPS не запущен', true);
            }
          });
        }

        // Запуск PIN-метода
        if (startPinBtn) {
          startPinBtn.addEventListener('click', function() {
            const pin = clientPinInput?.value.trim() || '';
            
            if (!pin) {
              showNotification('Введите PIN-код клиента', true);
              clientPinInput?.focus();
              return;
            }

            if (!/^\d{8}$/.test(pin)) {
              showNotification('PIN должен состоять из 8 цифр', true);
              clientPinInput?.focus();
              return;
            }

            if (wizardState.wpsDisabled) {
              showNotification('WPS отключен. Включите WPS для использования', true);
              return;
            }

            showNotification('WPS-соединение по PIN запущено');
            
            setTimeout(() => {
              showNotification('Устройство подключено по PIN');
              if (clientPinInput) clientPinInput.value = '';
            }, 2000);
          });
        }

        // Валидация ввода PIN-кода
        if (clientPinInput) {
          clientPinInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '').slice(0, 8);
          });
        }

        // Сохранение данных шага
        const saveStep5 = () => {
          wizardState.wpsDisabled = disableWpsCheck?.checked || false;
          console.log('Шаг 5 сохранен:', wizardState);
        };

        return saveStep5;
      };

      // Шаг 6: Дополнительно
      const initStep6 = () => {
        const txLimitInput = document.getElementById('step6-txLimit');
        const rxLimitInput = document.getElementById('step6-rxLimit');
        const repeaterCheck = document.getElementById('step6-repeater');
        const extendedSsidInput = document.getElementById('step6-extendedSsid');
        const repeaterField = document.getElementById('step6-repeaterField');

        // Загрузка сохраненных значений
        if (txLimitInput) txLimitInput.value = wizardState.txLimit;
        if (rxLimitInput) rxLimitInput.value = wizardState.rxLimit;
        if (repeaterCheck) repeaterCheck.checked = wizardState.universalRepeater;
        if (extendedSsidInput) extendedSsidInput.value = wizardState.extendedSsid;

        // Показать/скрыть поле SSID для повторителя
        const toggleRepeaterField = () => {
          if (repeaterField && repeaterCheck) {
            repeaterField.style.display = repeaterCheck.checked ? 'flex' : 'none';
          }
        };

        if (repeaterCheck) {
          repeaterCheck.addEventListener('change', toggleRepeaterField);
        }

        // Валидация числовых полей
        [txLimitInput, rxLimitInput].forEach(input => {
          if (input) {
            input.addEventListener('input', function() {
              let value = parseInt(this.value);
              if (isNaN(value) || value < 0) this.value = 0;
              if (value > 1000) this.value = 1000;
            });
          }
        });

        // Сохранение данных шага
        const saveStep6 = () => {
          wizardState.txLimit = parseInt(txLimitInput?.value) || 0;
          wizardState.rxLimit = parseInt(rxLimitInput?.value) || 0;
          wizardState.universalRepeater = repeaterCheck?.checked || false;
          wizardState.extendedSsid = extendedSsidInput?.value || '';
          
          console.log('Шаг 6 сохранен:', wizardState);
        };

        toggleRepeaterField();
        return saveStep6;
      };

      // === Инициализация всех шагов ===
      const stepSavers = [
        initStep1(),
        initStep2(),
        initStep3(),
        initStep4(),
        initStep5(),
        initStep6()
      ];

      // Функция сохранения всех шагов
      const saveAllSteps = () => {
        stepSavers.forEach(save => save());
        console.log('Все настройки сохранены:', wizardState);
        return wizardState;
      };

      // === Управление шагами ===

      function showStep(n) {
        if (n < 1 || n > totalSteps) return;
        steps.forEach((s, i) => s?.classList.toggle('active', i === n-1));
        if (back) back.disabled = n === 1;
        if (next) next.style.display = n < totalSteps ? 'inline-block' : 'none';
        if (finish) finish.style.display = n === totalSteps ? 'inline-block' : 'none';
        currentStep = n;
      }

      // === Обработчики событий ===

      start.addEventListener('click', e => {
        e.preventDefault();
        welcome.style.display = 'none';
        wizard.style.display = 'block';
        showStep(1);
      });

      back?.addEventListener('click', () => {
        if (currentStep > 1) {
          // Сохраняем текущий шаг перед переходом
          if (stepSavers[currentStep - 1]) stepSavers[currentStep - 1]();
          showStep(currentStep - 1);
        }
      });

      next?.addEventListener('click', () => {
        if (currentStep < totalSteps) {
          // Сохраняем текущий шаг перед переходом
          if (stepSavers[currentStep - 1]) stepSavers[currentStep - 1]();
          showStep(currentStep + 1);
        }
      });

      finish?.addEventListener('click', () => {
        // Сохраняем все шаги
        saveAllSteps();

        // Скрываем шаги и кнопки навигации
        wizard.querySelectorAll('.wizard-step').forEach(s => s.style.display = 'none');
        
        const buttonsContainer = wizard.querySelector('.wizard-buttons');
        if (buttonsContainer) {
          buttonsContainer.style.display = 'none';
        }

        // Экран перезагрузки
        const reboot = document.createElement('div');
        reboot.style.cssText = `
          text-align:center; 
          padding:80px 30px; 
          background:linear-gradient(135deg,#f0f4f8,#e0eaff); 
          border-radius:16px; 
          box-shadow:0 10px 30px rgba(0,102,153,0.15); 
          max-width:700px; 
          margin:60px auto;
        `;
        reboot.innerHTML = `
          <h2 style="color:#004466;font-size:28px;margin-bottom:20px;">Настройки сохранены!</h2>
          <div style="margin:40px 0;height:120px;position:relative;">
            <div style="
              width:80px;height:80px;
              border:8px solid #e0e0e0;
              border-top:8px solid #00a8e0;
              border-radius:50%;
              animation:spin 1.2s linear infinite;
              position:absolute;
              top:50%;left:50%;
              transform:translate(-50%,-50%);
            "></div>
          </div>
          <p style="font-size:18px;color:#555;margin:20px 0 40px;">
            Роутер перезагружается...<br>Подождите 30–60 секунд.
          </p>
          <div id="countdown" style="font-size:48px;font-weight:bold;color:#006699;margin:20px 0;">15</div>
          <p style="color:#777;font-size:16px;">
            Возврат через <span id="sec">15</span> сек...
          </p>
        `;
        wizard.appendChild(reboot);

        let sec = 15;
        const cd = reboot.querySelector('#countdown');
        const st = reboot.querySelector('#sec');

        const t = setInterval(() => {
          sec--;
          if (cd) cd.textContent = sec;
          if (st) st.textContent = sec;
          if (sec <= 0) {
            clearInterval(t);
            reboot.innerHTML = `
              <div style="padding:60px 20px;">
                <div style="font-size:80px;color:#28a745;margin-bottom:30px;">✔</div>
                <h2 style="color:#28a745;font-size:32px;margin-bottom:20px;">Перезагрузка завершена</h2>
                <p style="font-size:18px;color:#444;margin-bottom:40px;">Роутер запущен с новыми настройками.</p>
                <p style="font-size:16px;color:#666;">Возврат на начальный экран через 4 секунды...</p>
              </div>
            `;

            setTimeout(() => {
              wizard.querySelectorAll('.wizard-step').forEach(s => {
                s.style.display = '';
                s.classList.remove('active');
              });
              const step1 = document.querySelector('#step1');
              if (step1) step1.classList.add('active');

              const buttons = wizard.querySelector('.wizard-buttons');
              if (buttons) buttons.style.display = 'flex';

              welcome.style.display = 'block';
              wizard.style.display = 'none';
              reboot.remove();

              currentStep = 1;
              if (back) back.disabled = true;
              if (next) next.style.display = 'inline-block';
              if (finish) finish.style.display = 'none';

              showNotification('Роутер перезагружен. Мастер готов к новому использованию.');
            }, 4000);
          }
        }, 1000);
      });

      // Анимации
      if (!document.getElementById('wizard-animations')) {
        const st = document.createElement('style');
        st.id = 'wizard-animations';
        st.textContent = `
          @keyframes spin {
            0% { transform: translate(-50%,-50%) rotate(0deg); }
            100% { transform: translate(-50%,-50%) rotate(360deg); }
          }
          .wizard-notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 10000;
          }
        `;
        document.head.appendChild(st);
      }

      return true;
    }

    if (attempt < 20) {
      setTimeout(() => tryInit(attempt + 1), 100);
    } else {
      console.warn("Мастер: не удалось найти элементы после 20 попыток");
    }
  };

  tryInit();
  return true;
}

// Экспорт состояния для возможного использования в других модулях
export const getWizardState = () => {
  // Этот метод будет доступен для получения финальных настроек
  return window.__wizardState || null;
};