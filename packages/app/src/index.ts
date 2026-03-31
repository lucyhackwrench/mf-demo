// Async import обязателен для Module Federation.
// Позволяет MF runtime инициализировать shared scope ДО того,
// как выполнится код приложения и начнутся импорты.
import('./bootstrap');
