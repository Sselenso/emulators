// js/form-handler.js
import { initWizard } from './wizard.js';

export function initFormHandlersIn(container = document) {
  // #showClientsBtn обрабатывается локальным скриптом в wlan24g-basic и др., не дублируем

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