import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#09090B] px-4 py-10">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-orange-500 flex items-center justify-center text-black font-bold text-xs">
            T
          </div>
          <span className="text-white font-semibold text-sm">
            Trend<span className="text-orange-400">X</span>
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6">
          <Link
            href="/order/boost"
            className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
          >
            Coin Boost
          </Link>
          <Link
            href="/order/raid"
            className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
          >
            Telegram Raid
          </Link>
          <Link
            href="/order/bundle"
            className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
          >
            Full Package
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-zinc-600 text-xs">
          &copy; {new Date().getFullYear()} TrendX. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
