import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 p-6 md:px-12 flex justify-between items-center bg-transparent pointer-events-auto">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 22 22 22"></polygon>
        </svg>
        <span className="font-sans font-bold text-white tracking-widest text-xl">COSMOSX</span>
      </div>

      {/* Center: Nav Links */}
      <nav className="hidden md:flex items-center gap-8">
        {[
          { name: 'Home', href: '/' },
          { name: 'Timeline', href: '/#history' },
          { name: 'Missions', href: '/missions' },
          { name: 'About', href: '#' }
        ].map((item) => (
          <Link 
            key={item.name} 
            href={item.href} 
            className="hover:drop-shadow-[0_0_15px_rgba(255,255,255,1)] transition-all text-sm tracking-wider font-sans animate-periodic-text-glow"
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-6">
        <Link href="/simulate" className="bg-[#1e1a4d]/80 border border-[#818cf8] text-white px-5 py-2.5 rounded-lg font-sans text-xs tracking-widest font-bold shadow-[0_0_15px_rgba(129,140,248,0.3)] hover:shadow-[0_0_25px_rgba(129,140,248,0.6)] hover:-translate-y-0.5 transition-all backdrop-blur-md cursor-pointer flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
          </svg>
          SIMULATOR
        </Link>
      </div>
    </header>
  );
}
