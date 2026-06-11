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
          { name: 'Home', href: '#' },
          { name: 'Timeline', href: '#history' },
          { name: 'Simulator', href: '#simulator' },
          { name: 'Missions', href: '#' },
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
        <Link href="#" className="text-white/80 hover:text-white transition-colors text-sm tracking-wider font-sans">
          Log In
        </Link>
        <button className="bg-white text-[#050816] px-6 py-2 rounded-lg font-sans text-sm font-bold hover:-translate-y-0.5 shadow-lg transition-transform">
          Sign Up
        </button>
      </div>
    </header>
  );
}
