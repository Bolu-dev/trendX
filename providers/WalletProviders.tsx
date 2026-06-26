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
// Explicitly import the legacy wallet adapters for native mobile deep-linking compatibility
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo, useCallback, useSyncExternalStore } from "react";
import "@solana/wallet-adapter-react-ui/styles.css";

import { ChainProvider } from "./ChainContext";

const queryClient = new QueryClient();

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function SolanaProvider({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Instantiate the concrete adapters here so your custom mobile picking layout
  // has a direct registry to hook into for deep-linking
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  );

  const onError = useCallback((error: WalletError) => {
    if (
      error.message?.includes("Unexpected error") ||
      error.message?.includes("User rejected")
    )
      return;
    console.warn("Solana wallet error:", error.message ?? error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect={false}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default function WalletProviders({ children }: WalletProvidersProps) {
  const mounted = useIsMounted();

  if (!mounted) {
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
