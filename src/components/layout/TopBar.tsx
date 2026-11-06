import React, { useEffect, useState } from 'react';
import { Bell, Check, ChevronDown, Download, Share, Sparkles, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const TopBar: React.FC = () => {
  const {
    user,
    toggleAiDrawer,
    activeLessonForPlayer,
    notifications,
    markNotificationsRead,
    clearNotifications,
  } = useApp();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [showIosInstallHelp, setShowIosInstallHelp] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if ('Notification' in window) setNotificationPermission(Notification.permission);
    const isAppleMobile = /iPhone|iPad|iPod/.test(navigator.userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    setIsIos(isAppleMobile && !isStandalone);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const handleAppInstalled = () => setInstallPrompt(null);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const enableBrowserNotifications = async () => {
    if (!('Notification' in window)) {
      setNotificationPermission('unsupported');
      return;
    }
    try {
      setNotificationPermission(await Notification.requestPermission());
    } catch (error) {
      console.error('Impossible de demander l’autorisation des notifications.', error);
      setNotificationPermission('denied');
    }
  };

  const toggleNotifications = () => {
    const nextOpen = !showNotifications;
    setShowNotifications(nextOpen);
    if (nextOpen) markNotificationsRead();
  };

  const unreadNotifications = notifications.filter(notification => !notification.read).length;

  const installApp = async () => {
    if (!installPrompt) {
      setShowIosInstallHelp(true);
      return;
    }
    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
    } catch (error) {
      console.error('Impossible de lancer l’installation de Parla.', error);
      setInstallPrompt(null);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 min-w-0 items-center justify-between gap-2 border-b border-[#EAE4DA] bg-[#FBF9F5] pl-16 pr-3 sm:px-6 lg:px-8">
      
      {/* Left Breadcrumb Context */}
      <div className="flex min-w-0 items-center gap-2 text-xs text-[#7A7169]">
        {activeLessonForPlayer ? (
          <div className="flex min-w-0 items-center gap-2 font-medium">
            <span>Parcours {activeLessonForPlayer.level}</span>
            <span>›</span>
            <span className="truncate text-[#1F1A17] font-semibold">{activeLessonForPlayer.title}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 font-medium">
            <span className="hidden sm:inline">Parcours {user.italianLevel}</span>
            <span>›</span>
            <span className="truncate text-[#1F1A17] font-semibold">Tableau de bord</span>
          </div>
        )}
      </div>

      {/* Right User Actions */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        
        <span className="hidden rounded-xl border border-[#EAE4DA] bg-[#F5F1EA] px-3 py-1.5 text-[11px] font-bold text-[#C04A33] sm:inline">
          Niveau {user.italianLevel}
        </span>

        {/* Global AI Assistant Trigger Button */}
        <button
          onClick={toggleAiDrawer}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EDF6F2] text-[#2A6F55] border border-[#CDE3D8] hover:bg-[#E3EFE9] text-xs font-semibold transition-colors"
        >
          <Sparkles size={14} />
          <span className="hidden sm:inline">Tuteur IA</span>
        </button>

        {(installPrompt || isIos) && (
          <button
            onClick={installApp}
            aria-label="Installer Parla"
            title="Installer Parla"
            className="flex items-center gap-1.5 rounded-xl border border-[#F6D9CE] bg-[#FDF4ED] px-2.5 py-1.5 text-xs font-semibold text-[#C04A33] transition-colors hover:bg-[#FBE9DF] sm:px-3"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Installer</span>
          </button>
        )}

        <div className="relative">
          <button
            type="button"
            title="Notifications"
            aria-label={`Notifications${unreadNotifications ? `, ${unreadNotifications} non lues` : ''}`}
            aria-expanded={showNotifications}
            onClick={toggleNotifications}
            className="relative rounded-xl p-2 text-[#7A7169] transition-colors hover:bg-[#F5F1EA] hover:text-[#1F1A17]"
          >
            <Bell size={18} />
            {unreadNotifications > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C04A33] px-1 text-[9px] font-bold text-white">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>
          {showNotifications && (
            <section
              aria-label="Centre de notifications"
              className="absolute right-0 z-50 mt-2 max-h-[min(75vh,32rem)] w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-[#EAE4DA] bg-white shadow-parla-lg"
            >
              <div className="flex items-center justify-between border-b border-[#F2ECE3] p-4">
                <div>
                  <h2 className="font-serif text-lg text-[#1F1A17]">Notifications</h2>
                  <p className="text-[11px] text-[#7A7169]">
                    {unreadNotifications ? `${unreadNotifications} non lue${unreadNotifications > 1 ? 's' : ''}` : 'Tout est à jour'}
                  </p>
                </div>
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={clearNotifications}
                    className="rounded-lg p-2 text-[#7A7169] hover:bg-[#F5F1EA] hover:text-[#C04A33]"
                    aria-label="Effacer les notifications"
                    title="Effacer les notifications"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-5 text-center text-sm text-[#7A7169]">Aucune notification pour le moment.</p>
                ) : (
                  <ul className="divide-y divide-[#F2ECE3]">
                    {notifications.map(notification => (
                      <li key={notification.id} className={`p-4 ${notification.read ? 'bg-white' : 'bg-[#FDF8F3]'}`}>
                        <p className="text-sm font-semibold text-[#1F1A17]">{notification.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-[#68605A]">{notification.message}</p>
                        <time className="mt-2 block text-[10px] text-[#8A817A]" dateTime={notification.createdAt}>
                          {new Date(notification.createdAt).toLocaleString('fr-FR')}
                        </time>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="border-t border-[#F2ECE3] p-3">
                {notificationPermission === 'granted' ? (
                  <p className="flex items-center gap-2 text-xs font-medium text-[#2A6F55]">
                    <Check size={15} /> Notifications du navigateur activées
                  </p>
                ) : notificationPermission === 'denied' ? (
                  <p className="text-xs leading-relaxed text-[#7A7169]">
                    Autorisation refusée. Vous pouvez l’activer dans les paramètres du navigateur.
                  </p>
                ) : notificationPermission === 'unsupported' ? (
                  <p className="text-xs text-[#7A7169]">Les notifications du navigateur ne sont pas disponibles ici.</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => void enableBrowserNotifications()}
                    className="w-full rounded-xl bg-[#2A6F55] px-3 py-2 text-xs font-semibold text-white hover:bg-[#235D48]"
                  >
                    Activer les notifications du navigateur
                  </button>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Profile Avatar Pill */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(prev => !prev)}
            className="flex items-center gap-2 rounded-2xl p-1.5 pr-1.5 transition-colors hover:bg-[#F5F1EA] sm:pr-2.5"
          >
            <div className="w-8 h-8 rounded-full bg-[#C04A33] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="hidden max-w-28 truncate text-xs font-semibold text-[#1F1A17] sm:inline">{user.name}</span>
            <ChevronDown size={14} className="hidden text-[#8A817A] sm:block" />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#EAE4DA] shadow-parla-lg p-2 z-50 text-xs space-y-1">
              <div className="p-3 border-b border-[#F2ECE3] space-y-0.5">
                <p className="font-bold text-[#1F1A17]">{user.name}</p>
                <p className="text-[11px] text-[#8A817A]">{user.email}</p>
                <div className="pt-1 flex items-center gap-2 text-[11px]">
                  <span className="text-[#C04A33] font-semibold">{user.xpPoints} XP</span>
                  <span>•</span>
                  <span className="text-[#2A6F55] font-semibold">{user.streakDays}j de série</span>
                </div>
              </div>

              <div className="border-b border-[#F2ECE3] p-3 sm:hidden">
                <p className="text-[11px] font-semibold text-[#7A7169]">
                  Niveau actuel : <span className="text-[#C04A33]">{user.italianLevel}</span>
                </p>
              </div>

            </div>
          )}
        </div>

      </div>

      {showIosInstallHelp && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[#1F1A17]/40 p-3 sm:items-center">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
            className="w-full max-w-sm rounded-3xl border border-[#EAE4DA] bg-[#FBF9F5] p-5 shadow-parla-lg"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 id="ios-install-title" className="font-serif text-xl text-[#1F1A17]">Installer Parla</h2>
              <button
                onClick={() => setShowIosInstallHelp(false)}
                aria-label="Fermer"
                className="rounded-xl p-2 text-[#68605A] hover:bg-[#F5F1EA]"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm leading-relaxed text-[#68605A]">
              Dans Safari, touchez <Share size={15} className="mx-1 inline-block align-[-2px]" />{' '}
              <strong className="text-[#1F1A17]">Partager</strong>, puis choisissez{' '}
              <strong className="text-[#1F1A17]">Sur l’écran d’accueil</strong> pour installer l’application.
            </p>
          </section>
        </div>
      )}

    </header>
  );
};
