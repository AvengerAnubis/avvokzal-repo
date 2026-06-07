'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className = '' }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { isAuthenticated, user, isLoading } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  };

  const toggleDropdown = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  return (
    <nav className={`bg-slate-800 text-white ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img src="/logo_white.svg" alt="АВ-Вокзал" className="h-9" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            <DesktopMenu 
              closeMenu={closeMenu} 
              isAuthenticated={isAuthenticated} 
              user={user}
              isLoading={isLoading}
            />
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded hover:bg-slate-700 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <i className={`pi ${isMenuOpen ? 'pi-times' : 'pi-bars'} text-xl`}></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <MobileMenu
              closeMenu={closeMenu}
              activeDropdown={activeDropdown}
              toggleDropdown={toggleDropdown}
              isAuthenticated={isAuthenticated}
              user={user}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </nav>
  );
}

function DesktopMenu({ 
  closeMenu, 
  isAuthenticated, 
  user,
  isLoading 
}: { 
  closeMenu: () => void;
  isAuthenticated: boolean;
  user: any;
  isLoading: boolean;
}) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // Don't render anything while loading
  if (isLoading) return null;

  return (
    <>
      <Link href="/" className="px-3 py-2 rounded hover:bg-slate-700 transition-colors flex items-center gap-2" onClick={closeMenu}>
        <i className="pi pi-home"></i>
        <span>Главная</span>
      </Link>
      <Link href="/routes" className="px-3 py-2 rounded hover:bg-slate-700 transition-colors flex items-center gap-2" onClick={closeMenu}>
        <i className="pi pi-map"></i>
        <span>Маршруты</span>
      </Link>
      <Link href="/schedule" className="px-3 py-2 rounded hover:bg-slate-700 transition-colors flex items-center gap-2" onClick={closeMenu}>
        <i className="pi pi-calendar"></i>
        <span>Расписание</span>
      </Link>

      {/* Role-based conditional rendering */}
      {!isAuthenticated ? (
        // Guest - show login link
        <Link href="/auth/login" className="px-3 py-2 rounded hover:bg-slate-700 transition-colors flex items-center gap-2" onClick={closeMenu}>
          <i className="pi pi-sign-in"></i>
          <span>Вход</span>
        </Link>
      ) : (
        // Authenticated user
        <>
          {user?.role === 'ADMIN' && (
            // Admin dropdown
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('admin')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="px-3 py-2 rounded hover:bg-slate-700 transition-colors flex items-center gap-2">
                <i className="pi pi-cog"></i>
                <span>Администрирование</span>
                <i className="pi pi-chevron-down text-xs"></i>
              </button>
              {activeDropdown === 'admin' && (
                <div className="absolute top-full left-0 bg-slate-800 border border-slate-600 rounded shadow-lg min-w-48 py-1 z-50">
                  <Link href="/admin" className="block px-4 py-2 hover:bg-slate-700 transition-colors flex items-center gap-2" onClick={closeMenu}>
                    <i className="pi pi-home"></i>
                    <span>Дашборд</span>
                  </Link>
                  <Link href="/admin/routes" className="block px-4 py-2 hover:bg-slate-700 transition-colors flex items-center gap-2" onClick={closeMenu}>
                    <i className="pi pi-map"></i>
                    <span>Маршруты</span>
                  </Link>
                  <Link href="/admin/users" className="block px-4 py-2 hover:bg-slate-700 transition-colors flex items-center gap-2" onClick={closeMenu}>
                    <i className="pi pi-users"></i>
                    <span>Пользователи</span>
                  </Link>
                  <Link href="/admin/bookings" className="block px-4 py-2 hover:bg-slate-700 transition-colors flex items-center gap-2" onClick={closeMenu}>
                    <i className="pi pi-list"></i>
                    <span>Бронирования</span>
                  </Link>
                  <div className="border-t border-slate-600 my-1"></div>
                  <Link href="/profile/settings" className="block px-4 py-2 hover:bg-slate-700 transition-colors flex items-center gap-2" onClick={closeMenu}>
                    <i className="pi pi-cog"></i>
                    <span>Настройки</span>
                  </Link>
                  <Link href="/logout" className="block px-4 py-2 hover:bg-slate-700 transition-colors flex items-center gap-2" onClick={closeMenu}>
                    <i className="pi pi-sign-out"></i>
                    <span>Выйти</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {user?.role === 'OPERATOR' && (
            // Operator dropdown
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('operator')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="px-3 py-2 rounded hover:bg-slate-700 transition-colors flex items-center gap-2">
                <i className="pi pi-desktop"></i>
                <span>Оператор</span>
                <i className="pi pi-chevron-down text-xs"></i>
              </button>
              {activeDropdown === 'operator' && (
                <div className="absolute top-full left-0 bg-slate-800 border border-slate-600 rounded shadow-lg min-w-48 py-1 z-50">
                  <Link href="/operator" className="block px-4 py-2 hover:bg-slate-700 transition-colors flex items-center gap-2" onClick={closeMenu}>
                    <i className="pi pi-home"></i>
                    <span>Дашборд</span>
                  </Link>
                  <Link href="/schedule" className="block px-4 py-2 hover:bg-slate-700 transition-colors flex items-center gap-2" onClick={closeMenu}>
                    <i className="pi pi-calendar"></i>
                    <span>Расписание</span>
                  </Link>
                  <div className="border-t border-slate-600 my-1"></div>
                  <Link href="/profile/settings" className="block px-4 py-2 hover:bg-slate-700 transition-colors flex items-center gap-2" onClick={closeMenu}>
                    <i className="pi pi-cog"></i>
                    <span>Настройки</span>
                  </Link>
                  <Link href="/logout" className="block px-4 py-2 hover:bg-slate-700 transition-colors flex items-center gap-2" onClick={closeMenu}>
                    <i className="pi pi-sign-out"></i>
                    <span>Выйти</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {user?.role === 'DRIVER' && (
            // Driver dropdown
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('driver')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="px-3 py-2 rounded hover:bg-slate-700 transition-colors flex items-center gap-2">
                <i className="pi pi-car"></i>
                <span>Водитель</span>
                <i className="pi pi-chevron-down text-xs"></i>
              </button>
              {activeDropdown === 'driver' && (
                <div className="absolute top-full left-0 bg-slate-800 border border-slate-600 rounded shadow-lg min-w-48 py-1 z-50">
                  <Link href="/driver" className="block px-4 py-2 hover:bg-slate-700 transition-colors flex items-center gap-2" onClick={closeMenu}>
                    <i className="pi pi-home"></i>
                    <span>Дашборд</span>
                  </Link>
                  <Link href="/schedule" className="block px-4 py-2 hover:bg-slate-700 transition-colors flex items-center gap-2" onClick={closeMenu}>
                    <i className="pi pi-calendar"></i>
                    <span>Расписание</span>
                  </Link>
                  <div className="border-t border-slate-600 my-1"></div>
                  <Link href="/profile/settings" className="block px-4 py-2 hover:bg-slate-700 transition-colors flex items-center gap-2" onClick={closeMenu}>
                    <i className="pi pi-cog"></i>
                    <span>Настройки</span>
                  </Link>
                  <Link href="/logout" className="block px-4 py-2 hover:bg-slate-700 transition-colors flex items-center gap-2" onClick={closeMenu}>
                    <i className="pi pi-sign-out"></i>
                    <span>Выйти</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Личный кабинет Dropdown (for regular users) */}
          {(user?.role === 'USER' || !user?.role) && (
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('profile')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="px-3 py-2 rounded hover:bg-slate-700 transition-colors flex items-center gap-2">
                <i className="pi pi-user"></i>
                <span>{user?.firstName || 'Личный кабинет'}</span>
                <i className="pi pi-chevron-down text-xs"></i>
              </button>
              {activeDropdown === 'profile' && (
                <div className="absolute top-full left-0 bg-slate-800 border border-slate-600 rounded shadow-lg min-w-48 py-1 z-50">
                  <Link href="/profile/tickets" className="block px-4 py-2 hover:bg-slate-700 transition-colors flex items-center gap-2" onClick={closeMenu}>
                    <i className="pi pi-ticket"></i>
                    <span>Мои билеты</span>
                  </Link>
                  <Link href="/profile/favorites" className="block px-4 py-2 hover:bg-slate-700 transition-colors flex items-center gap-2" onClick={closeMenu}>
                    <i className="pi pi-heart"></i>
                    <span>Избранное</span>
                  </Link>
                  <div className="border-t border-slate-600 my-1"></div>
                  <Link href="/profile/settings" className="block px-4 py-2 hover:bg-slate-700 transition-colors flex items-center gap-2" onClick={closeMenu}>
                    <i className="pi pi-cog"></i>
                    <span>Настройки</span>
                  </Link>
                  <Link href="/logout" className="block px-4 py-2 hover:bg-slate-700 transition-colors flex items-center gap-2" onClick={closeMenu}>
                    <i className="pi pi-sign-out"></i>
                    <span>Выйти</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}

function MobileMenu({
  closeMenu,
  activeDropdown,
  toggleDropdown,
  isAuthenticated,
  user,
  isLoading
}: {
  closeMenu: () => void;
  activeDropdown: string | null;
  toggleDropdown: (label: string) => void;
  isAuthenticated: boolean;
  user: any;
  isLoading: boolean;
}) {
  // Don't render anything while loading
  if (isLoading) return null;

  return (
    <div className="flex flex-col gap-1">
      <Link href="/" className="px-3 py-2 rounded hover:bg-slate-700 transition-colors flex items-center gap-2" onClick={closeMenu}>
        <i className="pi pi-home"></i>
        <span>Главная</span>
      </Link>
      <Link href="/routes" className="px-3 py-2 rounded hover:bg-slate-700 transition-colors flex items-center gap-2" onClick={closeMenu}>
        <i className="pi pi-map"></i>
        <span>Маршруты</span>
      </Link>
      <Link href="/schedule" className="px-3 py-2 rounded hover:bg-slate-700 transition-colors flex items-center gap-2" onClick={closeMenu}>
        <i className="pi pi-calendar"></i>
        <span>Расписание</span>
      </Link>

      {/* Role-based conditional rendering for mobile */}
      {!isAuthenticated ? (
        // Guest
        <Link href="/auth/login" className="px-3 py-2 rounded hover:bg-slate-700 transition-colors flex items-center gap-2" onClick={closeMenu}>
          <i className="pi pi-sign-in"></i>
          <span>Вход</span>
        </Link>
      ) : (
        // Authenticated - show based on role
        <>
          {user?.role === 'ADMIN' && (
            <div>
              <button onClick={() => toggleDropdown('admin')} className="w-full px-3 py-2 rounded hover:bg-slate-700 transition-colors flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <i className="pi pi-cog"></i>
                  <span>Администрирование</span>
                </span>
                <i className={`pi ${activeDropdown === 'admin' ? 'pi-chevron-up' : 'pi-chevron-down'}`}></i>
              </button>
              {activeDropdown === 'admin' && (
                <div className="pl-6 flex flex-col gap-1">
                  <Link href="/admin" className="px-3 py-2 rounded hover:bg-slate-700 transition-colors" onClick={closeMenu}>Дашборд</Link>
                  <Link href="/admin/routes" className="px-3 py-2 rounded hover:bg-slate-700 transition-colors" onClick={closeMenu}>Маршруты</Link>
                  <Link href="/admin/users" className="px-3 py-2 rounded hover:bg-slate-700 transition-colors" onClick={closeMenu}>Пользователи</Link>
                  <Link href="/admin/bookings" className="px-3 py-2 rounded hover:bg-slate-700 transition-colors" onClick={closeMenu}>Бронирования</Link>
                  <div className="border-t border-slate-600 my-1"></div>
                  <Link href="/profile/settings" className="px-3 py-2 rounded hover:bg-slate-700 transition-colors" onClick={closeMenu}>Настройки</Link>
                  <Link href="/logout" className="px-3 py-2 rounded hover:bg-slate-700 transition-colors" onClick={closeMenu}>Выйти</Link>
                </div>
              )}
            </div>
          )}

          {user?.role === 'OPERATOR' && (
            <div>
              <button onClick={() => toggleDropdown('operator')} className="w-full px-3 py-2 rounded hover:bg-slate-700 transition-colors flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <i className="pi pi-desktop"></i>
                  <span>Оператор</span>
                </span>
                <i className={`pi ${activeDropdown === 'operator' ? 'pi-chevron-up' : 'pi-chevron-down'}`}></i>
              </button>
              {activeDropdown === 'operator' && (
                <div className="pl-6 flex flex-col gap-1">
                  <Link href="/operator" className="px-3 py-2 rounded hover:bg-slate-700 transition-colors" onClick={closeMenu}>Дашборд</Link>
                  <Link href="/schedule" className="px-3 py-2 rounded hover:bg-slate-700 transition-colors" onClick={closeMenu}>Расписание</Link>
                  <div className="border-t border-slate-600 my-1"></div>
                  <Link href="/profile/settings" className="px-3 py-2 rounded hover:bg-slate-700 transition-colors" onClick={closeMenu}>Настройки</Link>
                  <Link href="/logout" className="px-3 py-2 rounded hover:bg-slate-700 transition-colors" onClick={closeMenu}>Выйти</Link>
                </div>
              )}
            </div>
          )}

          {user?.role === 'DRIVER' && (
            <div>
              <button onClick={() => toggleDropdown('driver')} className="w-full px-3 py-2 rounded hover:bg-slate-700 transition-colors flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <i className="pi pi-car"></i>
                  <span>Водитель</span>
                </span>
                <i className={`pi ${activeDropdown === 'driver' ? 'pi-chevron-up' : 'pi-chevron-down'}`}></i>
              </button>
              {activeDropdown === 'driver' && (
                <div className="pl-6 flex flex-col gap-1">
                  <Link href="/driver" className="px-3 py-2 rounded hover:bg-slate-700 transition-colors" onClick={closeMenu}>Дашборд</Link>
                  <Link href="/schedule" className="px-3 py-2 rounded hover:bg-slate-700 transition-colors" onClick={closeMenu}>Расписание</Link>
                  <div className="border-t border-slate-600 my-1"></div>
                  <Link href="/profile/settings" className="px-3 py-2 rounded hover:bg-slate-700 transition-colors" onClick={closeMenu}>Настройки</Link>
                  <Link href="/logout" className="px-3 py-2 rounded hover:bg-slate-700 transition-colors" onClick={closeMenu}>Выйти</Link>
                </div>
              )}
            </div>
          )}

          {/* Profile for regular users */}
          {(user?.role === 'USER' || !user?.role) && (
            <div>
              <button onClick={() => toggleDropdown('profile')} className="w-full px-3 py-2 rounded hover:bg-slate-700 transition-colors flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <i className="pi pi-user"></i>
                  <span>{user?.firstName || 'Личный кабинет'}</span>
                </span>
                <i className={`pi ${activeDropdown === 'profile' ? 'pi-chevron-up' : 'pi-chevron-down'}`}></i>
              </button>
              {activeDropdown === 'profile' && (
                <div className="pl-6 flex flex-col gap-1">
                  <Link href="/profile/tickets" className="px-3 py-2 rounded hover:bg-slate-700 transition-colors" onClick={closeMenu}>Мои билеты</Link>
                  <Link href="/profile/favorites" className="px-3 py-2 rounded hover:bg-slate-700 transition-colors" onClick={closeMenu}>Избранное</Link>
                  <div className="border-t border-slate-600 my-1"></div>
                  <Link href="/profile/settings" className="px-3 py-2 rounded hover:bg-slate-700 transition-colors" onClick={closeMenu}>Настройки</Link>
                  <Link href="/logout" className="px-3 py-2 rounded hover:bg-slate-700 transition-colors" onClick={closeMenu}>Выйти</Link>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}