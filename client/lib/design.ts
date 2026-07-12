export const design = {
    card: "rounded-[4px] border border-white/75 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]",
    panel: "rounded-[4px] bg-white shadow-[0_2px_6px_#1a181e0a]",
    hoverCard:
        "rounded-[4px] border border-white/80 bg-white shadow-[0_14px_32px_rgba(15,23,42,0.16)]",
    cursorTooltip:
        "pointer-events-none fixed z-50 inline-flex w-max max-w-none flex-col rounded-[4px] px-2 py-1.5 text-left",

    pageShell: "h-full rounded-[10px] bg-[#f7f7f7]",
    pageTitle: "text-[22px] font-semibold text-gray-900",
    pageSubtitle: "mt-1 text-sm text-gray-500",
    sectionTitle: "text-base font-semibold text-gray-900",
    sectionSubtitle: "mt-1 text-sm text-gray-500",
    pageContainer: "mx-auto max-w-[1480px]",

    fieldGroup: "rounded-[4px] border border-gray-100 bg-[#fafafa] px-4 py-3",
    input: "h-10 w-full rounded-[4px] border border-gray-300 bg-white px-3 text-sm text-[#1f2430] placeholder:text-gray-400 transition focus:border-[#2b7fd3] focus:outline-none focus:ring-2 focus:ring-[#2b7fd3]/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60",
    searchInput:
        "border-gray-200 focus:border-[#2b7fd3] focus:ring-2 focus:ring-[#2b7fd3]/15",
    select: "h-10 rounded-[4px] border border-gray-300 bg-white px-3 text-sm text-[#1f2430] transition focus:border-[#2b7fd3] focus:outline-none focus:ring-2 focus:ring-[#2b7fd3]/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60",
    selectWide: "w-[220px]",
    selectFull: "w-full",
    label: "text-sm font-medium text-[#1f2430]",
    hint: "text-xs text-gray-500",

    dropdownTrigger:
        "inline-flex h-10 w-[220px] cursor-pointer items-center justify-between gap-2 rounded-[4px] border border-gray-300 bg-white px-3 text-sm text-[#1f2430] transition hover:border-gray-400 focus:outline-none focus-visible:border-[#2b7fd3] focus-visible:ring-2 focus-visible:ring-[#2b7fd3]/20",
    dropdownMenu: "w-[220px] rounded-[4px] bg-white p-1",

    primaryButton:
        "inline-flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-[4px] border border-[#2C5EAD] bg-[#2C5EAD] px-8 text-sm font-medium text-white transition hover:border-[#244f96] hover:bg-[#244f96] disabled:pointer-events-none disabled:opacity-50",
    secondaryButton:
        "inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[4px] border border-gray-200 bg-white px-3 text-sm font-medium text-[#1f2430] transition hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50",
    successButton:
        "inline-flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-[4px] bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:pointer-events-none disabled:opacity-50",
    dangerButton:
        "inline-flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-[4px] border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:pointer-events-none disabled:opacity-50",
    whatsappButton:
        "inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[4px] border border-gray-200 bg-white px-3 text-sm font-medium text-[#0d7a4c] transition hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50",

    tabList:
        "inline-flex gap-1 rounded-[4px] bg-white p-1 shadow-[0_2px_6px_#1a181e0a]",
    tab: "cursor-pointer rounded-[4px] px-4 py-2 text-sm font-medium text-gray-600 transition hover:text-[#1f2430]",
    tabActive:
        "cursor-pointer rounded-[4px] bg-[#1b181e] px-4 py-2 text-sm font-medium text-white shadow-[0_1px_2px_rgba(26,24,30,0.12)]",
    detachedTabList: "flex flex-wrap gap-3",
    detachedTab:
        "cursor-pointer rounded-[4px] border-[1.5px] border-[#e5e5e5] bg-[#e5e5e5] px-[15px] py-2 text-sm leading-5 font-medium text-gray-500 outline-none transition-all duration-300 hover:border-[#1e264080] hover:bg-white hover:text-black hover:shadow-[0_2px_6px_#1a181e0a]",
    detachedTabActive:
        "border-[#1e264080] bg-white text-[#1a181e] shadow-[0_2px_6px_#1a181e0a]",

    error: "rounded-[4px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700",
    success:
        "rounded-[4px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800",

    chip: "inline-flex rounded-[4px] bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700",
    link: "cursor-pointer text-sm font-medium text-[#2b7fd3] transition hover:text-[#1f6bb8]",
} as const;
