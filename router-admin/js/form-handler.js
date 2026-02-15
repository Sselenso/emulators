// js/form-handler.js
import { initWizard } from './wizard.js';

export function initFormHandlersIn(container = document) {
  // Общие обработчики (для других страниц)
  container.querySelectorAll('#showClientsBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      alert('Список подключённых устройств (демо)');
    });
  });

  container.querySelectorAll('.save-btn, .save-apply-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      alert('Настройки сохранены (демо-режим)');
    });
  });

  container.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      if (confirm('Отменить изменения?')) {
        location.reload();
      }
    });
  });

  // Специально для мастера
  const wizardInitialized = initWizard();
  if (wizardInitialized) {
    console.log('Мастер настройки успешно инициализирован');
  }
}