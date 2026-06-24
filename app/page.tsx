import Footer from "@/components/Footer";
import Navbar from "@/components/NavBar";
import ServiceCard from "@/components/ServiceCard";
import { services } from "@/lib/services";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#09090B]">
      <Navbar />

      {/* Hero */}
      <section className="pt-36 pb-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block text-xs font-medium text-orange-400 bg-orange-500/10 border border-orange-500/15 px-3 py-1 rounded-full mb-8 tracking-wide">
            Crypto Marketing, All On Chain
          </span>

          <h1 className="text-5xl font-bold text-white leading-[1.15] tracking-tight mb-5">
            Get your coin, <span className="text-orange-400">trending</span>
            <br />
            in less than 24 hours.
          </h1>

          <p className="text-zinc-500 text-base leading-relaxed mb-12 max-w-lg mx-auto">
            DEX screens, volume boosts, and Telegram raids. Pay with ETH or SOL
            all straight to the provider, no middlemen.
          </p>

          {/* Stats */}
          <div className="inline-flex items-center gap-6 bg-zinc-900/80 border border-white/5 rounded-2xl px-8 py-4">
            <div className="text-center">
              <div className="text-xl font-bold text-white">500+</div>
              <div className="text-zinc-600 text-xs mt-0.5">Orders done</div>
            </div>
            <div className="w-px h-6 bg-white/5" />
            <div className="text-center">
              <div className="text-xl font-bold text-white">24h</div>
              <div className="text-zinc-600 text-xs mt-0.5">Avg delivery</div>
            </div>
            <div className="w-px h-6 bg-white/5" />
            <div className="text-center">
              <div className="text-xl font-bold text-cyan-400">SOL + ETH</div>
              <div className="text-zinc-600 text-xs mt-0.5">Accepted</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="pb-28 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-zinc-600 text-xs font-semibold uppercase tracking-widest mb-8">
            Services
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="pb-28 px-4">
        <div className="max-w-lg mx-auto">
          <p className="text-center text-zinc-600 text-xs font-semibold uppercase tracking-widest mb-10">
            How it works
          </p>

          <div className="space-y-10">
            {[
              {
                step: "01",
                title: "Connect your wallet",
                desc: "MetaMask, Phantom, or any WalletConnect wallet. Pick ETH or SOL from the top nav.",
              },
              {
                step: "02",
                title: "Pick a service",
                desc: "Enter your coin contract address, Telegram handle, and any notes for the provider.",
              },
              {
                step: "03",
                title: "Approve the transfer",
                desc: "Your wallet pops up with the exact amount. One click — funds go on-chain directly to the provider.",
              },
              {
                step: "04",
                title: "Order goes live",
                desc: "You get a confirmation page with your transaction hash. Provider starts immediately.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-5 items-start">
                <div className="text-orange-500/60 font-mono text-sm w-8 shrink-0 pt-0.5">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm mb-1">
                    {item.title}
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer/>
    </main>
  );
}
