"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useChain } from "@/providers/ChainContext";
import { useState, useEffect } from "react";
import { useDisconnect } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
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
  const [showPicker, setShowPicker] = useState(false);
  const { disconnect: disconnectEVM } = useDisconnect();

  // Grab Solana wallet control hooks
  const {
    select,
    wallets,
    publicKey,
    disconnect: disconnectSolanaApp,
    wallet,
    connecting,
    connect,
  } = useWallet();

  // 1. Keep your custom Global Context in sync with the Solana Adapter State
  useEffect(() => {
    if (publicKey) {
      setSolAddress(publicKey.toBase58());
      setSolWallet(
        wallet?.adapter.name.toLowerCase().includes("phantom")
          ? "phantom"
          : "solflare",
      );
    } else {
      setSolAddress(null);
      setSolWallet(null);
    }
  }, [publicKey, wallet, setSolAddress, setSolWallet]);

  // 2. Watch for wallet selection changes and immediately force execute the native prompt trigger
  useEffect(() => {
    if (wallet && !publicKey && activeChain === "sol") {
      const executeConnection = async () => {
        try {
          await connect();
        } catch (err) {
          console.warn("Wallet connection flow rejected or canceled:", err);
        }
      };
      executeConnection();
    }
  }, [wallet, publicKey, connect, activeChain]);

  const shortAddress = solAddress
    ? `${solAddress.slice(0, 4)}...${solAddress.slice(-4)}`
    : null;

  function handleSolTabClick() {
    disconnectEVM();
    setActiveChain("sol");
  }

  // 3. FIXED & HYBRIDIZED: Direct deep-linking on mobile, secure adapter injections on desktop
  async function connectWith(walletName: "Phantom" | "Solflare") {
    setShowPicker(false);
    disconnectEVM();

    // IF MOBILE: Execute bulletproof universal deep-links directly
    if (isMobile()) {
      const currentUrl = encodeURIComponent(window.location.href);
      const origin = encodeURIComponent(window.location.origin);

      if (walletName === "Phantom") {
        window.location.href = `https://phantom.app/ul/v1/connect?app_url=${origin}&redirect_link=${currentUrl}`;
      } else {
        window.location.href = `https://solflare.com/ul/v1/connect?app_url=${origin}&redirect_link=${currentUrl}`;
      }
      return;
    }

    // IF DESKTOP: Match against library array adapters
    const targetWallet = wallets.find((w) =>
      w.adapter.name.toLowerCase().includes(walletName.toLowerCase()),
    );

    if (targetWallet) {
      try {
        select(targetWallet.adapter.name);
      } catch (err) {
        console.error("Failed to select via adapter registry:", err);
      }
    } else {
      try {
        select(walletName as any);
      } catch (err) {
        try {
          if (walletName === "Phantom" && window.phantom?.solana) {
            const resp = await window.phantom.solana.connect();
            setSolAddress(resp.publicKey.toBase58());
            setSolWallet("phantom");
          } else if (walletName === "Solflare" && window.solflare) {
            const resp = await window.solflare.connect();
            setSolAddress(
              resp.publicKey?.toBase58() ??
                window.solflare.publicKey?.toBase58() ??
                null,
            );
            setSolWallet("solflare");
          }
        } catch (fallbackErr) {
          console.error(
            "Direct injection fallback connection failed:",
            fallbackErr,
          );
        }
      }
    }
  }

  function handleConnectClick() {
    setShowPicker(true);
  }

  async function handleDisconnectSolana() {
    await disconnectSolanaApp().catch(() => {});
    setSolAddress(null);
    setSolWallet(null);
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
                  onClick={handleDisconnectSolana}
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
                onClick={() => connectWith("Phantom")}
                className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl px-4 py-3 transition-all"
              >
                <PhantomIcon size={32} />
                <div className="text-left">
                  <div className="text-white text-sm font-medium">Phantom</div>
                  <div className="text-zinc-500 text-xs">
                    {isMobile() ? "Open in app" : "Extension"}
                  </div>
                </div>
              </button>
              <button
                onClick={() => connectWith("Solflare")}
                className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl px-4 py-3 transition-all"
              >
                <SolflareIcon size={32} />
                <div className="text-left">
                  <div className="text-white text-sm font-medium">Solflare</div>
                  <div className="text-zinc-500 text-xs">
                    {isMobile() ? "Open in app" : "Extension"}
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
    </>
  );
}
