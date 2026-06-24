import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#09090B] px-4 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-orange-500/15 border border-orange-500/30 flex items-center justify-center mx-auto mb-6">
          <span className="text-orange-400 font-bold text-xl">404</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Page not found
        </h1>
        <p className="text-zinc-500 text-sm leading-relaxed mb-8">
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="bg-orange-500 hover:bg-orange-400 text-black font-bold py-3 px-6 rounded-xl text-sm transition-all"
          >
            Back to home
          </Link>
          <Link
            href="/order/boost"
            className="bg-white/5 hover:bg-white/10 border border-white/5 text-white font-medium py-3 px-6 rounded-xl text-sm transition-all"
          >
            View services
          </Link>
        </div>
      </div>
    </main>
  );
}
