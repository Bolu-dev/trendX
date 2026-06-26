"use client";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/lib/wagmi";
import "@rainbow-me/rainbowkit/styles.css";

import { WalletAdapterNetwork, WalletError } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo, useCallback, useSyncExternalStore } from "react";
import "@solana/wallet-adapter-react-ui/styles.css";

import { ChainProvider } from "./ChainContext";

// Singleton instance to prevent QueryClient re-allocation issues on hot reload
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function SolanaProvider({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Mainnet;

  // Use a stable custom RPC or standard public mainnet endpoint fallbacks safely
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Stable memoized instances mapping explicit deep-linking hooks
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  );

  const onError = useCallback((error: WalletError) => {
    // Silently ignore standard user-rejections or trivial UI cancellations to avoid production spam console logs
    if (
      error.name === "WalletNotFoundError" ||
      error.message?.includes("Unexpected error") ||
      error.message?.includes("User rejected")
    ) {
      return;
    }
    console.warn("Solana Wallet Infrastructure Error:", error.message ?? error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      {/* autoConnect set to false to protect your custom multi-chain UI tabs from colliding */}
      <WalletProvider wallets={wallets} onError={onError} autoConnect={false}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default function WalletProviders({ children }: WalletProvidersProps) {
  const mounted = useIsMounted();

  if (!mounted) {
    // Exact dark layout shell match to perfectly avoid hydration flicker layout shift
    return <div className="min-h-screen bg-[#09090B]" />;
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ChainProvider>
            <SolanaProvider>{children}</SolanaProvider>
          </ChainProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

interface WalletProvidersProps {
  children: React.ReactNode;
}
