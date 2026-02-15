// utils.js
// Можно добавить сюда функции валидации, форматирования MAC-адресов и т.д.
function formatMac(mac) {
  return mac.replace(/[^0-9A-Fa-f]/g, '').match(/.{1,2}/g)?.join(':') || mac;
}