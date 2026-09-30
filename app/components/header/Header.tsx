import { useStore } from '@nanostores/react';
import { Form, Link, useRouteLoaderData } from '@remix-run/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import type { loader as rootLoader } from '~/root';

export function Header() {
  const chat = useStore(chatStore);
  const rootData = useRouteLoaderData<typeof rootLoader>('root');
  const user = rootData?.user ?? null;
  const authConfigured = rootData?.authConfigured ?? false;

  return (
    <header
      className={classNames('flex items-center p-5 border-b h-[var(--header-height)]', {
        'border-transparent': !chat.started,
        'border-bolt-elements-borderColor': chat.started,
      })}
    >
      <div className="flex items-center gap-2 z-logo text-bolt-elements-textPrimary cursor-pointer">
        <div className="i-ph:sidebar-simple-duotone text-xl" />
        <a href="/" className="text-2xl font-semibold text-accent flex items-center gap-2">
          {/* Keep upstream logo assets; visible CybrBuild text label for brand clarity */}
          <img src="/logo-light-styled.png" alt="CybrBuild" className="w-[90px] inline-block dark:hidden" />
          <img src="/logo-dark-styled.png" alt="CybrBuild" className="w-[90px] inline-block hidden dark:block" />
          <span className="text-lg font-semibold text-bolt-elements-textPrimary tracking-tight">CybrBuild</span>
        </a>
      </div>
      {chat.started && (
        <>
          <span className="flex-1 px-4 truncate text-center text-bolt-elements-textPrimary">
            <ClientOnly>{() => <ChatDescription />}</ClientOnly>
          </span>
          <ClientOnly>
            {() => (
              <div className="mr-1">
                <HeaderActionButtons />
              </div>
            )}
          </ClientOnly>
        </>
      )}
      {!chat.started && <div className="flex-1" />}
      <div className="ml-auto flex items-center gap-3 pl-3">
        {user ? (
          <>
            {user.image ? (
              <img src={user.image} alt="" className="w-7 h-7 rounded-full border border-bolt-elements-borderColor" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-bolt-elements-background-depth-3 flex items-center justify-center text-xs text-bolt-elements-textSecondary">
                {(user.name || user.email || '?').slice(0, 1).toUpperCase()}
              </div>
            )}
            <span className="hidden sm:inline text-xs text-bolt-elements-textSecondary max-w-[140px] truncate">
              {user.name || user.email}
            </span>
            <Form action="/auth/logout" method="post">
              <button
                type="submit"
                className="text-xs px-2.5 py-1 rounded-md border border-bolt-elements-borderColor text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3"
              >
                Sign out
              </button>
            </Form>
          </>
        ) : (
          <Link
            to={authConfigured ? '/auth/google' : '/login'}
            className="text-xs px-2.5 py-1 rounded-md border border-bolt-elements-borderColor text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
