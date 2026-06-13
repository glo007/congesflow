// Jeu d'icônes SVG inline (pas de dépendance externe), héritent de la couleur courante.
type P = { className?: string };
const base = (d: string) => ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    {d.split("|").map((p, i) => <path key={i} d={p} />)}
  </svg>
);

export const IconDashboard = base("M3 13h8V3H3v10z|M13 21h8V11h-8v10z|M13 3v6h8V3h-8z|M3 21h8v-6H3v6z");
export const IconCalendar = base("M8 2v4|M16 2v4|M3 10h18|M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z");
export const IconCheck = base("M20 6L9 17l-5-5");
export const IconX = base("M18 6L6 18|M6 6l12 12");
export const IconClock = base("M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z|M12 6v6l4 2");
export const IconLogout = base("M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4|M16 17l5-5-5-5|M21 12H9");
export const IconUser = base("M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2|M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z");
export const IconPlus = base("M12 5v14|M5 12h14");
export const IconInbox = base("M22 12h-6l-2 3h-4l-2-3H2|M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z");
export const IconWallet = base("M21 12V7H5a2 2 0 0 1 0-4h14v4|M3 5v14a2 2 0 0 0 2 2h16v-5|M18 12a2 2 0 0 0 0 4h3v-4h-3z");
export const IconUsers = base("M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2|M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z|M23 21v-2a4 4 0 0 0-3-3.87|M16 3.13a4 4 0 0 1 0 7.75");
export const IconSun = base("M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z|M12 1v2|M12 21v2|M4.22 4.22l1.42 1.42|M18.36 18.36l1.42 1.42|M1 12h2|M21 12h2|M4.22 19.78l1.42-1.42|M18.36 5.64l1.42-1.42");
