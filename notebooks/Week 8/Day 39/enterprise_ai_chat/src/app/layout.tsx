import type { Metadata } from "next";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xander’s · Your restaurant assistant",
  description: "Chat with Xander’s assistant about the menu, prices, and your order.",
  applicationName: "Xander’s Assistant",
  openGraph: { title: "Xander’s Assistant", description: "A little help with the menu, prices, and your order.", type: "website" },
  other: { "page-type": "software", "site-kind": "software" },
};
const themeScript = `(function(){try{var t=localStorage.getItem('xander.theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch(e){}})()`;
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" data-type="software" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head><body>{children}</body></html>;
}
