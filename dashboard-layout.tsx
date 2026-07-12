"use client";

import {
    CaretRightIcon,
    ListIcon,
    MagnifyingGlassIcon,
    XIcon,
} from "@phosphor-icons/react";
import { type ElementType, type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type DashboardNavChild = {
    href: string;
    label: string;
    badge?: number;
};

export type DashboardNavItem = {
    href: string;
    label: string;
    icon: ElementType;
    children?: DashboardNavChild[];
    disabled?: boolean;
};

export type DashboardUser = {
    name: string;
    role?: string;
    subtitle?: string;
};

export type DashboardLayoutProps = {
    navItems: DashboardNavItem[];
    user?: DashboardUser;
    logo?: ReactNode;
    logoText?: string;
    currentPath?: string;
    onNavigate?: (href: string) => void;
    onNavHover?: (href: string) => void;
    headerTitle?: ReactNode;
    searchPlaceholder?: string;
    onSearch?: (query: string) => void;
    headerRight?: ReactNode;
    footer?: ReactNode;
    forceDrawer?: boolean;
    children: ReactNode;
};

function pathIsActive(currentPath: string, href: string) {
    return currentPath === href || currentPath.startsWith(`${href}/`);
}

function NavLeaf({
    label,
    icon: Icon,
    active,
    collapsed,
    disabled = false,
    onClick,
    onHover,
}: {
    label: string;
    icon: ElementType;
    active: boolean;
    collapsed: boolean;
    disabled?: boolean;
    onClick: () => void;
    onHover?: () => void;
}) {
    return (
        <button
            type="button"
            onClick={disabled ? undefined : onClick}
            onMouseEnter={disabled ? undefined : onHover}
            onFocus={disabled ? undefined : onHover}
            title={collapsed ? label : undefined}
            aria-current={active ? "page" : undefined}
            disabled={disabled}
            className={cn(
                "group mx-2 my-0.5 flex shrink-0 items-center gap-3 rounded-[4px] transition-all duration-200",
                collapsed
                    ? "h-10 w-10 justify-center"
                    : "h-9 w-[calc(100%-16px)] px-3 text-sm font-medium",
                disabled
                    ? "cursor-not-allowed text-[#4a4a4a]"
                    : active
                      ? "cursor-pointer bg-[#ffffff1a] text-white"
                      : "cursor-pointer text-[#cccccc] hover:bg-[#ffffff1a]",
            )}
        >
            <span className="flex shrink-0 items-center justify-center">
                <Icon
                    size={18}
                    weight={active && !disabled ? "fill" : "regular"}
                    className={
                        disabled
                            ? "text-[#4a4a4a]"
                            : active
                              ? "text-white"
                              : "text-[#cccccc]"
                    }
                />
            </span>
            {!collapsed && (
                <span
                    className={cn(
                        "truncate",
                        disabled
                            ? "text-[#4a4a4a]"
                            : active
                              ? "text-white"
                              : "text-[#cccccc]",
                    )}
                >
                    {label}
                </span>
            )}
        </button>
    );
}

function NavGroup({
    item,
    currentPath,
    collapsed,
    onNavigate,
    onNavHover,
}: {
    item: DashboardNavItem;
    currentPath: string;
    collapsed: boolean;
    onNavigate: (href: string) => void;
    onNavHover?: (href: string) => void;
}) {
    const { href, label, icon: Icon, children, disabled } = item;
    const groupActive = pathIsActive(currentPath, href);
    const [open, setOpen] = useState(true);
    const [prevGroupActive, setPrevGroupActive] = useState(groupActive);

    if (groupActive !== prevGroupActive) {
        setPrevGroupActive(groupActive);
        if (groupActive) setOpen(true);
    }

    if (collapsed) {
        return (
            <NavLeaf
                label={label}
                icon={Icon}
                active={groupActive}
                collapsed={true}
                disabled={disabled}
                onClick={() => onNavigate(children?.[0]?.href ?? href)}
                onHover={() => onNavHover?.(children?.[0]?.href ?? href)}
            />
        );
    }

    return (
        <div>
            <button
                type="button"
                disabled={disabled}
                onClick={() => {
                    if (groupActive) {
                        setOpen((v) => !v);
                    } else {
                        onNavigate(children?.[0]?.href ?? href);
                    }
                }}
                onMouseEnter={() => onNavHover?.(children?.[0]?.href ?? href)}
                onFocus={() => onNavHover?.(children?.[0]?.href ?? href)}
                className={cn(
                    "group mx-2 my-0.5 flex h-9 w-[calc(100%-16px)] items-center gap-3 rounded-[4px] px-3 py-2 text-sm font-medium transition-all duration-200",
                    disabled
                        ? "cursor-not-allowed text-[#4a4a4a]"
                        : groupActive
                          ? "cursor-pointer bg-[#ffffff1a] text-white"
                          : "cursor-pointer text-[#cccccc] hover:bg-[#ffffff1a]",
                )}
                aria-current={groupActive ? "page" : undefined}
            >
                <span className="flex shrink-0 items-center justify-center">
                    <Icon
                        size={18}
                        weight={groupActive && !disabled ? "fill" : "regular"}
                        className={
                            disabled
                                ? "text-[#4a4a4a]"
                                : groupActive
                                  ? "text-white"
                                  : "text-[#cccccc]"
                        }
                    />
                </span>
                <span
                    className={cn(
                        "flex-1 truncate text-left",
                        disabled
                            ? "text-[#4a4a4a]"
                            : groupActive
                              ? "text-white"
                              : "text-[#cccccc]",
                    )}
                >
                    {label}
                </span>
                {children && children.length > 0 && (
                    <CaretRightIcon
                        size={11}
                        weight="bold"
                        className={cn(
                            "shrink-0 transition-transform duration-200",
                            open ? "rotate-90" : "",
                            groupActive ? "text-white/60" : "text-[#555]",
                        )}
                    />
                )}
            </button>

            {children && children.length > 0 && (
                <div
                    className={cn(
                        "overflow-hidden transition-all duration-200 ease-out",
                        open ? "max-h-60" : "max-h-0",
                    )}
                    role="group"
                    aria-label={`${label} sections`}
                >
                    <div className="pb-1 pl-1">
                        {children.map((child) => {
                            const childActive =
                                currentPath === child.href ||
                                currentPath.startsWith(`${child.href}/`);
                            return (
                                <button
                                    key={child.href}
                                    type="button"
                                    onClick={() => onNavigate(child.href)}
                                    onMouseEnter={() => onNavHover?.(child.href)}
                                    onFocus={() => onNavHover?.(child.href)}
                                    className="group mx-2 my-0.5 flex h-8 w-[calc(100%-16px)] cursor-pointer items-center py-2 pr-4 pl-10 text-[13px]"
                                    aria-current={
                                        childActive ? "page" : undefined
                                    }
                                >
                                    <span
                                        className={cn(
                                            "truncate transition-colors duration-200",
                                            childActive
                                                ? "font-medium text-white"
                                                : "font-normal text-[#737373] group-hover:text-[#a8a8a8]",
                                        )}
                                    >
                                        {child.label}
                                    </span>
                                    {child.badge !== undefined && (
                                        <span
                                            className={cn(
                                                "ml-auto rounded px-1.5 py-0.5 text-[12px] font-medium tabular-nums leading-none",
                                                childActive
                                                    ? "bg-white/12 text-white"
                                                    : "bg-white/8 text-white/40",
                                            )}
                                        >
                                            {child.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

function SidebarContent({
    navItems,
    user,
    logo,
    logoText,
    currentPath,
    collapsed,
    footer,
    onNavigate,
    onNavHover,
}: {
    navItems: DashboardNavItem[];
    user?: DashboardUser;
    logo?: ReactNode;
    logoText?: string;
    currentPath: string;
    collapsed: boolean;
    footer?: ReactNode;
    onNavigate: (href: string) => void;
    onNavHover?: (href: string) => void;
}) {
    return (
        <>
            <div
                className={cn(
                    "flex h-16 shrink-0 items-center border-b border-white/10",
                    collapsed ? "justify-center px-3" : "gap-3 px-3.5",
                )}
            >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white/10">
                    {logo ?? (
                        <span className="text-[15px] font-bold text-white">
                            {logoText?.[0]?.toUpperCase() ?? "A"}
                        </span>
                    )}
                </div>

                {!collapsed && (
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-medium leading-none text-[#cccccc]">
                            {user?.name ?? "App"}
                        </p>
                        {(user?.role ?? user?.subtitle) && (
                            <p className="mt-1 truncate text-[11px] leading-none text-white/56">
                                {user?.role ?? user?.subtitle}
                            </p>
                        )}
                    </div>
                )}
            </div>

            <nav className="flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {navItems.map((item) =>
                        item.children && item.children.length > 0 ? (
                            <NavGroup
                                key={item.href}
                                item={item}
                                currentPath={currentPath}
                                collapsed={collapsed}
                                onNavigate={onNavigate}
                                onNavHover={onNavHover}
                            />
                        ) : (
                            <NavLeaf
                                key={item.href}
                                label={item.label}
                                icon={item.icon}
                                active={pathIsActive(currentPath, item.href)}
                                collapsed={collapsed}
                                disabled={item.disabled}
                                onClick={() => onNavigate(item.href)}
                                onHover={() => onNavHover?.(item.href)}
                            />
                        ),
                    )}
                </div>

                {footer && !collapsed && (
                    <div className="shrink-0 pb-2">{footer}</div>
                )}
            </nav>
        </>
    );
}

export function DashboardLayout({
    navItems,
    user,
    logo,
    logoText,
    currentPath = "/",
    onNavigate,
    onNavHover,
    headerTitle,
    searchPlaceholder = "Search…",
    onSearch,
    headerRight,
    footer,
    forceDrawer = false,
    children,
}: DashboardLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [search, setSearch] = useState("");
    const mobileCloseRef = useRef<HTMLButtonElement>(null);

    const navigate = (href: string) => {
        onNavigate?.(href);
        setMobileOpen(false);
    };

    useEffect(() => {
        if (!mobileOpen) return;

        mobileCloseRef.current?.focus();
        document.body.style.overflow = "hidden";

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMobileOpen(false);
        };
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = "";
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [mobileOpen]);

    return (
        <div className="flex h-full overflow-hidden bg-[#f5f5f5] text-[#202433]">
            {!forceDrawer && (
                <aside
                    style={{ width: sidebarCollapsed ? 56 : 224 }}
                    className="hidden shrink-0 flex-col bg-[#1b181e] text-white shadow-[8px_0_30px_rgba(13,14,18,0.18)] transition-[width] duration-300 ease-in-out lg:flex"
                >
                    <SidebarContent
                        navItems={navItems}
                        user={user}
                        logo={logo}
                        logoText={logoText}
                        currentPath={currentPath}
                        collapsed={sidebarCollapsed}
                        footer={footer}
                        onNavigate={navigate}
                        onNavHover={onNavHover}
                    />
                </aside>
            )}

            {mobileOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/50"
                        aria-hidden="true"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside
                        role="dialog"
                        aria-modal="true"
                        aria-label="Navigation"
                        className="fixed inset-y-0 left-0 z-50 flex w-56 flex-col bg-[#1b181e] text-white shadow-[8px_0_30px_rgba(13,14,18,0.18)]"
                    >
                        <button
                            ref={mobileCloseRef}
                            type="button"
                            onClick={() => setMobileOpen(false)}
                            className="absolute right-3 top-4 flex h-7 w-7 items-center justify-center rounded-[4px] text-[#999] transition hover:bg-white/8 hover:text-white"
                            aria-label="Close navigation"
                        >
                            <XIcon size={15} />
                        </button>
                        <SidebarContent
                            navItems={navItems}
                            user={user}
                            logo={logo}
                            logoText={logoText}
                            currentPath={currentPath}
                            collapsed={false}
                            footer={footer}
                            onNavigate={navigate}
                            onNavHover={onNavHover}
                        />
                    </aside>
                </>
            )}

            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                <header className="flex h-16 shrink-0 items-center gap-3 border-b border-[#d9d9d9] bg-white px-4">
                    <button
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] text-[#4d4d4d] transition hover:bg-black/4",
                            forceDrawer ? "flex" : "flex lg:hidden",
                        )}
                        aria-label="Open navigation"
                    >
                        <ListIcon size={19} />
                    </button>

                    {!forceDrawer && (
                        <button
                            type="button"
                            onClick={() => setSidebarCollapsed((v) => !v)}
                            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-[4px] text-[#4d4d4d] transition hover:bg-black/4 lg:flex"
                            aria-label={
                                sidebarCollapsed
                                    ? "Expand sidebar"
                                    : "Collapse sidebar"
                            }
                        >
                            <ListIcon size={19} />
                        </button>
                    )}

                    {headerTitle && (
                        <div className="min-w-0 flex-1">{headerTitle}</div>
                    )}

                    {onSearch && (
                        <div
                            className={cn(
                                "flex max-w-xs flex-1",
                                headerTitle ? "hidden md:flex" : "flex",
                            )}
                        >
                            <div className="relative w-full">
                                <MagnifyingGlassIcon
                                    size={14}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
                                />
                                <input
                                    type="search"
                                    placeholder={searchPlaceholder}
                                    aria-label={searchPlaceholder}
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        onSearch(e.target.value);
                                    }}
                                    className="h-9 w-full rounded-[4px] border border-[#e5e7eb] bg-[#f9fafb] pl-8 pr-3 text-sm text-[#1f2430] placeholder:text-[#9ca3af] focus:border-[#d1d5db] focus:bg-white focus:outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {headerRight && (
                        <div className="flex shrink-0 items-center gap-2">
                            {headerRight}
                        </div>
                    )}
                </header>

                <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
