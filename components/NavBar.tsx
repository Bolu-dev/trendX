"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useChain } from "@/providers/ChainContext";
import { useState } from "react";
import { useDisconnect } from "wagmi";
import "@/lib/solana";
import { PhantomIcon, SolflareIcon } from "@/components/WalletIcons";

function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
    navigator.userAgent,
  );
}

export default function Navbar() {
  const {
    activeChain,
    setActiveChain,
    solAddress,
    setSolAddress,
    setSolWallet,
  } = useChain();
  const [connecting, setConnecting] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [showMobileGuide, setShowMobileGuide] = useState<
    "phantom" | "solflare" | null
  >(null);
  const { disconnect: disconnectEVM } = useDisconnect();

  const shortAddress = solAddress
    ? `${solAddress.slice(0, 4)}...${solAddress.slice(-4)}`
    : null;

  function handleSolTabClick() {
    disconnectEVM();
    setActiveChain("sol");
  }

  async function connectWith(wallet: "phantom" | "solflare") {
    setShowPicker(false);

    if (isMobile()) {
      setShowMobileGuide(wallet);
      return;
    }

    setConnecting(true);
    try {
      disconnectEVM();
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (wallet === "phantom") {
        const provider = window.phantom?.solana;
        if (!provider) {
          window.open("https://phantom.app", "_blank");
          return;
        }
        await provider.disconnect().catch(() => {});
        await new Promise((resolve) => setTimeout(resolve, 200));
        const resp = await provider.connect({ onlyIfTrusted: false });
        setSolAddress(resp.publicKey.toBase58());
        setSolWallet("phantom");
      } else {
        const provider = window.solflare;
        if (!provider) {
          window.open("https://solflare.com/download", "_blank");
          return;
        }
        const resp = await provider.connect({ onlyIfTrusted: false });
        setSolAddress(
          resp.publicKey?.toBase58() ?? provider.publicKey?.toBase58() ?? null,
        );
        setSolWallet("solflare");
      }
    } catch (err) {
      console.warn("Solana connect error:", err);
    } finally {
      setConnecting(false);
    }
  }

  function handleConnectClick() {
    if (isMobile()) {
      setShowPicker(true);
      return;
    }
    const hasPhantom = !!window.phantom?.solana?.isPhantom;
    const hasSolflare = !!window.solflare?.isSolflare;
    if (hasPhantom && hasSolflare) {
      setShowPicker(true);
    } else if (hasPhantom) {
      connectWith("phantom");
    } else if (hasSolflare) {
      connectWith("solflare");
    } else {
      window.open("https://phantom.app", "_blank");
    }
  }

  async function disconnectSolana() {
    try {
      await window.phantom?.solana?.disconnect().catch(() => {});
      await window.solflare?.disconnect().catch(() => {});
    } catch (err) {
      console.warn("Solana disconnect error:", err);
    } finally {
      setSolAddress(null);
      setSolWallet(null);
    }
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#09090B]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-500 flex items-center justify-center text-black font-bold text-xs sm:text-sm">
              T
            </div>
            <span className="font-semibold text-white text-sm sm:text-base tracking-tight">
              Trend<span className="text-orange-400">X</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center bg-white/5 border border-white/5 rounded-lg p-1 gap-1">
              <button
                onClick={() => setActiveChain("eth")}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeChain === "eth"
                    ? "bg-orange-500 text-black"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                ETH
              </button>
              <button
                onClick={handleSolTabClick}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeChain === "sol"
                    ? "bg-orange-500 text-black"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                SOL
              </button>
            </div>

            <div className="scale-90 sm:scale-100 origin-right">
              {activeChain === "eth" ? (
                <ConnectButton showBalance={false} chainStatus="none" />
              ) : solAddress ? (
                <button
                  onClick={disconnectSolana}
                  className="flex items-center gap-2 bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-orange-500/25 transition-all"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  {shortAddress}
                </button>
              ) : (
                <button
                  onClick={handleConnectClick}
                  disabled={connecting}
                  className="bg-orange-500 hover:bg-orange-400 disabled:bg-orange-500/50 text-black text-xs font-bold px-4 py-2 rounded-lg transition-all"
                >
                  {connecting ? "Connecting..." : "Connect SOL"}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Wallet picker modal */}
      {showPicker && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          onClick={() => setShowPicker(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-semibold text-sm mb-1">
              Connect Solana Wallet
            </h3>
            <p className="text-zinc-500 text-xs mb-5">
              Choose your wallet to continue
            </p>
            <div className="space-y-3">
              <button
                onClick={() => connectWith("phantom")}
                className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl px-4 py-3 transition-all"
              >
                <PhantomIcon size={32} />
                <div className="text-left">
                  <div className="text-white text-sm font-medium">Phantom</div>
                  <div className="text-zinc-500 text-xs">
                    {isMobile() ? "Open in app" : "Installed"}
                  </div>
                </div>
              </button>
              <button
                onClick={() => connectWith("solflare")}
                className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl px-4 py-3 transition-all"
              >
                <SolflareIcon size={32} />
                <div className="text-left">
                  <div className="text-white text-sm font-medium">Solflare</div>
                  <div className="text-zinc-500 text-xs">
                    {isMobile() ? "Open in app" : "Installed"}
                  </div>
                </div>
              </button>
            </div>
            <button
              onClick={() => setShowPicker(false)}
              className="w-full mt-4 text-zinc-600 hover:text-zinc-400 text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Mobile guide modal */}
      {showMobileGuide && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          onClick={() => setShowMobileGuide(null)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-5">
              {showMobileGuide === "phantom" ? (
                <PhantomIcon size={36} />
              ) : (
                <SolflareIcon size={36} />
              )}
              <div>
                <h3 className="text-white font-semibold text-sm">
                  Open in{" "}
                  {showMobileGuide === "phantom" ? "Phantom" : "Solflare"}
                </h3>
                <p className="text-zinc-500 text-xs">Follow these steps</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <p className="text-zinc-400 text-sm">
                  Open your{" "}
                  <span className="text-white font-medium">
                    {showMobileGuide === "phantom" ? "Phantom" : "Solflare"}
                  </span>{" "}
                  wallet app
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <p className="text-zinc-400 text-sm">
                  Tap the{" "}
                  <span className="text-white font-medium">browser icon</span>{" "}
                  inside the app
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <p className="text-zinc-400 text-sm">
                  Go to{" "}
                  <span className="text-orange-400 font-mono text-xs">
                    trendxcrypto.vercel.app
                  </span>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  4
                </div>
                <p className="text-zinc-400 text-sm">
                  Connect your wallet and complete your order
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowMobileGuide(null)}
              className="w-full bg-orange-500 hover:bg-orange-400 text-black font-bold py-2.5 rounded-xl text-sm transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
