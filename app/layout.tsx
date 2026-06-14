import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import GlobalCosmos from "@/components/GlobalCosmos";
// import CometCursor removed – using vanilla JS implementation
import { Analytics } from "@vercel/analytics/next";

const cormorant = Cormorant_Garamond({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CosmosX | MIRAI",
  description: "Emotional space exploration experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#050816] text-white font-sans overflow-x-hidden">
        <GlobalCosmos />
        {/* Comet cursor (pure JS) */}
        <script dangerouslySetInnerHTML={{
          __html: '(function() {\n'
            + '  const trailLength = 12;\n'
            + '  const trail = [];\n'
            + '  for (let i = 0; i < trailLength; i++) {\n'
            + '    const el = document.createElement(\'div\');\n'
            + '    el.className = \'pointer-events-none fixed rounded-full\';\n'
            + '    el.style.width = `${12 - i * 0.8}px`;' + '\n'
            + '    el.style.height = `${12 - i * 0.8}px`;' + '\n'
            + '    el.style.background = `hsl(${(i * 30) % 360}, 80%, 60%)`;' + '\n'
            + '    el.style.opacity = `${1 - i * 0.07}`;' + '\n'
            + '    el.style.position = \'fixed\';\n'
            + '    el.style.transform = \'translate(-100px, -100px)\';\n'
            + '    el.style.transition = \'transform 0.05s linear\';\n'
            + '    document.body.appendChild(el);\n'
            + '    trail.push(el);\n'
            + '  }\n'
            + '  let mouse = { x: -100, y: -100 };\n'
            + '  window.addEventListener(\'mousemove\', e => { mouse = { x: e.clientX, y: e.clientY }; });\n'
            + '  function animate() {\n'
            + '    trail.unshift({ x: mouse.x, y: mouse.y });\n'
            + '    trail.splice(trailLength);\n'
            + '    trail.forEach((pos, i) => {\n'
            + '      const el = trail[i];\n'
            + '      el.style.transform = `translate(${pos.x - (6 - i)}px, ${pos.y - (6 - i)}px)`;\n'
            + '    });\n'
            + '    requestAnimationFrame(animate);\n'
            + '  }\n'
            + '  animate();\n'
            + '})();',
        }} />
        {children}
      </body>
    </html>
  );
}