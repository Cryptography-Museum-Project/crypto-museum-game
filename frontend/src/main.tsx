import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import AdminApp from './admin/AdminApp.tsx';

// Простой "роутинг" без библиотек: /admin открывает админ-панель,
// любой другой путь — саму игру. Когда понадобится больше страниц,
// имеет смысл подключить react-router.
const isAdmin = window.location.pathname.startsWith('/admin');

createRoot(document.getElementById('root')!).render(
  <StrictMode>{isAdmin ? <AdminApp /> : <App />}</StrictMode>,
);
