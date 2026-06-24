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
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo, useCallback, useSyncExternalStore } from "react";
import "@solana/wallet-adapter-react-ui/styles.css";

import { ChainProvider, useChain } from "./ChainContext";

const queryClient = new QueryClient();

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function SolanaProvider({ children }: { children: React.ReactNode }) {
  const { activeChain } = useChain();
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Empty array — Phantom and Solflare auto-register via Wallet Standard
  // Only activate the Solana provider when SOL tab is selected
  const wallets = useMemo(() => [], [activeChain]);

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
