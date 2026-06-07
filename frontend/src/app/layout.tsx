import { PrimeReactProvider } from 'primereact/api';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/lib/auth/context';
import { ToastProvider } from '@/lib/toast/context';
import { ConfirmProvider } from '@/lib/confirm/context';
import LocaleProvider from '@/components/LocaleProvider';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <PrimeReactProvider>
      <LocaleProvider />
      <html lang="ru">
        <head>
          <title>АВ-Вокзал</title>
          <link rel="icon" href="/logo_black.svg" type="image/svg+xml" sizes="any" />
        </head>
        <body className="p-0 m-0 overflow-y-auto overflow-x-clip min-h-screen flex flex-col">
          <AuthProvider>
            <ToastProvider>
              <ConfirmProvider>
                <Navbar className="sticky top-0 z-50" />
                <main className="flex-1 container mx-auto px-4 py-4">{children}</main>
              </ConfirmProvider>
            </ToastProvider>
          </AuthProvider>
          <footer className="bg-gray-800 text-white py-8 mt-auto">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-lg font-bold mb-3">АВ-Вокзал</h3>
                  <p className="text-gray-300 text-sm">Современный сервис бронирования междугородних автобусных билетов. Путешествуйте с комфортом!</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-3">Навигация</h3>
                  <ul className="space-y-2 text-sm">
                    <li><a href="/routes" className="text-gray-300 hover:text-white">Маршруты</a></li>
                    <li><a href="/schedule" className="text-gray-300 hover:text-white">Расписание</a></li>
                    <li><a href="/tickets" className="text-gray-300 hover:text-white">Купить билет</a></li>
                    <li><a href="/profile/tickets" className="text-gray-300 hover:text-white">Мои билеты</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-3">Контакты</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li><i className="pi pi-phone mr-2"></i>+7 (999) 000-00-00</li>
                    <li><i className="pi pi-envelope mr-2"></i>info@avvokzal.ru</li>
                    <li><i className="pi pi-map-marker mr-2"></i>г. Москва, ул. Примерная, д. 1</li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-700 mt-6 pt-6 text-center text-sm text-gray-400">© 2026 АВ-Вокзал. Все права защищены.</div>
            </div>
          </footer>
        </body>
      </html>
    </PrimeReactProvider>
  );
}
