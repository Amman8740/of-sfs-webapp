'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ModelsIcon,
  SchedulerIcon,
  PromoLinksIcon,
  MediaUploadIcon,
  NotificationsIcon,
  ChevronDownIcon,
  ProfileIcon,
  PeopleIcon,
  SettingsIcon,
} from '@/components/ui/icons';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useNavigation } from '@/components/layout/navigation-context';

interface UnifiedSidebarProps {
  children?: React.ReactNode;
  userType?: 'agency' | 'creator';
}

interface SidebarItem {
  key: string;
  label: string;
  href?: string;
  icon?: React.ElementType;
  collapsible?: boolean;
  children?: SidebarItem[];
}

export const UnifiedSidebar: React.FC<UnifiedSidebarProps> = ({
  children,
  userType = 'creator',
}) => {
  const pathname = usePathname();
  const { selectedOption, setSelectedOption } = useNavigation();

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
  };

  const isPathActive = (href?: string, key?: string): boolean => {
    // For agency users on /agency page, models tab should be active
    if (userType === 'agency' && key === 'models' && pathname === '/agency') {
      return true;
    }

    // For navigation-based tabs, check if current option matches
    if (key === selectedOption) {
      return true;
    }

    // Fallback to pathname matching
    return pathname === href;
  };

  const baseButtonClasses = (isActive: boolean) =>
    `flex items-center gap-3 px-3 py-2 cursor-pointer transition-all duration-200 rounded-lg ${isActive
      ? 'bg-primary-bg border border-primary-border text-primary-text shadow-sm'
      : 'hover:bg-gray-50 text-black hover:shadow-sm'
    }`;

  const iconClasses = (isActive: boolean) =>
    `w-6 h-6 transition-colors duration-200 ${isActive ? 'text-primary-text' : 'text-black'}`;

  const textClasses = (isActive: boolean) =>
    `font-medium transition-colors duration-200 ${isActive ? 'text-primary-text' : 'text-black'}`;

  // 🧱 Sidebar Items Definition
  const sidebarItems: SidebarItem[] = [
    { 
      key: 'models', 
      label: 'Models', 
      icon: ModelsIcon, 
      href: userType === 'agency' ? '/agency' : '/models'  // Agency navigates to agency page, creator navigates to models
    },
     ...(userType === 'creator'
    ? [{ key: 'profile', label: 'Profile', icon: ProfileIcon, href: '/profile' }]
    : []),
    {
      key: 'scheduler',
      label: 'SFS Scheduler',
      icon: SchedulerIcon,
      collapsible: true,
      children: userType === 'agency'
        ? [
          { key: 'scheduled-sfs', label: 'Scheduled SFS', href: '/scheduler/scheduled-sfs' },
          { key: 'smart-match', label: 'Smart Match', href: '/scheduler/smart-match' },
          { key: 'sfs-requests', label: 'SFS Requests', href: '/scheduler/sfs-requests' },
        ]
        : [
          { key: 'scheduled-sfs', label: 'Scheduled SFS', href: '/scheduler/scheduled-sfs' },
          { key: 'smart-match', label: 'Smart Match', href: '/scheduler/smart-match' },
          { key: 'sfs-requests', label: 'SFS requests', href: '/scheduler/sfs-requests' },
        ],
    },
    { key: 'promo-links', label: 'Promo Links', icon: PromoLinksIcon, href: '/promo-links' },
    { key: 'media-upload', label: 'Media Upload', icon: MediaUploadIcon, href: '/media-upload' },
    ...(userType === 'agency'
      ? [{ key: 'people', label: 'People', icon: PeopleIcon, href: '/people' }]
      : []),
  ];

  return (
    <aside className="fixed mt-3 h-[calc(100vh-4rem)] flex flex-col justify-between space-y-3 px-2 py-3 bg-white z-30 w-[288px]">
      <div className="w-[264px] flex flex-col space-y-3">
        {sidebarItems.map((item) =>
          item.collapsible ? (
            <Collapsible
              key={item.key}
              defaultOpen={item.children?.some((c) => isPathActive(c.href, c.key))}
            >
              <CollapsibleTrigger asChild>
                <SidebarButton
                  icon={item.icon}
                  label={item.label}
                  isActive={item.children?.some((c) => isPathActive(c.href, c.key)) ?? false}
                  onClick={() => handleOptionClick(item.key)}
                  baseButtonClasses={baseButtonClasses}
                  iconClasses={iconClasses}
                  textClasses={textClasses}
                  trailingIcon={<ChevronDownIcon className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />}
                />
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="flex flex-col py-2 space-y-3">
                  {item.children?.map((sub) => (
                    <SidebarButton
                      key={sub.key}
                      href={sub.href}
                      label={sub.label}
                      isActive={isPathActive(sub.href, sub.key)}
                      onClick={() => handleOptionClick(sub.key)}
                      baseButtonClasses={baseButtonClasses}
                      textClasses={textClasses}
                      iconClasses={iconClasses}
                      isSubItem
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <SidebarButton
              key={item.key}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={isPathActive(item.href, item.key)}
              onClick={() => handleOptionClick(item.key)}
              baseButtonClasses={baseButtonClasses}
              iconClasses={iconClasses}
              textClasses={textClasses}
            />
          )
        )}
      </div>
      <div className="w-[264px] flex flex-col space-y-3">
        <SidebarButton
          key="notifications"
          href="/notifications"
          icon={NotificationsIcon}
          label="Notifications"
          isActive={isPathActive('/notifications', 'notifications')}
          onClick={() => handleOptionClick('notifications')}
          baseButtonClasses={baseButtonClasses}
          iconClasses={iconClasses}
          textClasses={textClasses}
        />
        <SidebarButton
          key="settings"
          href="/account"
          icon={SettingsIcon}
          label="Settings"
          isActive={isPathActive('/account', 'settings')}
          onClick={() => handleOptionClick('settings')}
          baseButtonClasses={baseButtonClasses}
          iconClasses={iconClasses}
          textClasses={textClasses}
        />
        {children}
      </div>
    </aside>
  );
};

interface SidebarButtonProps {
  href?: string;
  icon?: React.ElementType;
  label: string;
  isActive: boolean;
  onClick?: () => void;
  trailingIcon?: React.ReactNode;
  baseButtonClasses: (isActive: boolean) => string;
  iconClasses: (isActive: boolean) => string;
  textClasses: (isActive: boolean) => string;
  isSubItem?: boolean;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({
  href,
  icon: Icon,
  label,
  isActive,
  onClick,
  trailingIcon,
  baseButtonClasses,
  iconClasses,
  textClasses,
  isSubItem = false,
}) => {
  const containerClass = `${baseButtonClasses(isActive)}`;

  const content = (
    <div className={containerClass}>
      <div className={isSubItem ? 'ml-9' : ''}>
        <div className="flex items-center gap-3">
          {Icon && <Icon className={iconClasses(isActive)} />}
          <span className={textClasses(isActive)}>{label}</span>
        </div>
      </div>
      {trailingIcon}
    </div>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return <div onClick={onClick}>{content}</div>;
};
