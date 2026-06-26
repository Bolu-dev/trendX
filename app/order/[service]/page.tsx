"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useSendTransaction } from "wagmi";
import { parseEther } from "viem";
import {
  SystemProgram,
  Transaction,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { getService } from "@/lib/services";
import { getLivePrices, usdToEth, usdToSol } from "@/lib/prices";
import Link from "next/link";
import { useChain } from "@/providers/ChainContext";
import type { SolanaProvider } from "@/lib/solana";
import "@/lib/solana";
import { PhantomIcon, SolflareIcon } from "@/components/WalletIcons";

const ETH_RECEIVER = "0xc4f80E940ddEdC508163E8541512b48F0Beb922C";
const SOL_RECEIVER = "2WvB4xXUVVsQgy8BUXYPyUE3fwiXc1q9w7ucS48rd3WF";
const SOL_RPC = "https://solana-rpc.publicnode.com";

interface PageProps {
  params: Promise<{ service: string }>;
}

function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
    navigator.userAgent,
  );
}

function SolanaConnectButton() {
  const { setSolAddress, setSolWallet } = useChain();
  const [connecting, setConnecting] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const hasPhantom =
    typeof window !== "undefined" && !!window.phantom?.solana?.isPhantom;
  const hasSolflare =
    typeof window !== "undefined" && !!window.solflare?.isSolflare;

  async function connectWith(wallet: "phantom" | "solflare") {
    setShowPicker(false);
    setConnecting(true);
    try {
      if (wallet === "phantom") {
        if (isMobile()) {
          window.open(
            `https://phantom.app/ul/browse/${encodeURIComponent(window.location.href)}?ref=${encodeURIComponent(window.location.origin)}`,
            "_blank",
          );
          return;
        }
        const provider = window.phantom?.solana;
        if (!provider) {
          window.open("https://phantom.app", "_blank");
          return;
        }
        await provider.disconnect().catch(() => {});
        await new Promise((r) => setTimeout(r, 200));
        const resp = await provider.connect({ onlyIfTrusted: false });
        setSolAddress(resp.publicKey.toBase58());
        setSolWallet("phantom");
      } else {
        if (isMobile()) {
          window.open(
            `https://solflare.com/ul/v1/browse/${encodeURIComponent(window.location.href)}?ref=${encodeURIComponent(window.location.origin)}`,
            "_blank",
          );
          return;
        }
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

  function handleClick() {
    if (isMobile()) {
      setShowPicker(true);
      return;
    }
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

  return (
    <>
      <button
        onClick={handleClick}
        disabled={connecting}
        className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-orange-500/50 text-black font-bold py-3 rounded-xl text-sm transition-all"
      >
        {connecting ? "Connecting..." : "Connect SOL Wallet"}
      </button>

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
                    {isMobile() ? "Open app" : "Installed"}
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
                    {isMobile() ? "Open app" : "Installed"}
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

export default function OrderPage({ params }: PageProps) {
  const { service: serviceId } = use(params);
  const service = getService(serviceId);
  const router = useRouter();

  const [contractAddress, setContractAddress] = useState("");
  const [telegram, setTelegram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [ethAmount, setEthAmount] = useState<number | null>(null);
  const [solAmount, setSolAmount] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(true);
  const [priceError, setPriceError] = useState("");

  const {
    activeChain: chain,
    setActiveChain: setChain,
    solAddress,
    solWallet,
  } = useChain();
  const { isConnected: ethConnected } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();

  const isConnected = chain === "eth" ? ethConnected : !!solAddress;

  useEffect(() => {
    if (!service) return;
    let cancelled = false;

    async function loadPrices() {
      try {
        const { eth, sol } = await getLivePrices();
        if (cancelled) return;
        setEthAmount(usdToEth(service!.usdPrice, eth));
        setSolAmount(usdToSol(service!.usdPrice, sol));
        setPriceError("");
      } catch {
        if (cancelled) return;
        setPriceError("Could not load live price. Please refresh.");
      } finally {
        if (cancelled) return;
        setPriceLoading(false);
      }
    }

    loadPrices();
    return () => {
      cancelled = true;
    };
  }, [service]);

  if (!service) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Service not found</p>
          <Link
            href="/"
            className="text-orange-400 hover:text-orange-300 text-sm"
          >
            Back home
          </Link>
        </div>
      </div>
    );
  }

  async function handlePayment() {
    if (!contractAddress.trim()) {
      setError("Please enter your coin contract address");
      return;
    }
    if (!telegram.trim()) {
      setError("Please enter your Telegram handle");
      return;
    }
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }
    if (!service) return;

    setError("");
    setLoading(true);

    try {
      const { eth: ethPriceUsd, sol: solPriceUsd } = await getLivePrices();

      if (chain === "eth") {
        const ethToSend = usdToEth(service.usdPrice, ethPriceUsd);

        const hash = await sendTransactionAsync({
          to: ETH_RECEIVER as `0x${string}`,
          value: parseEther(ethToSend.toString()),
        });

        const queryParams = new URLSearchParams({
          hash,
          service: service.id,
          chain: "eth",
          amount: ethToSend.toString(),
          usdPrice: service.usdPrice.toString(),
          contract: contractAddress,
          telegram,
          twitter,
          notes,
        });
        router.push(`/confirm?${queryParams.toString()}`);
      } else {
        if (!solAddress) throw new Error("Wallet not connected");
        if (!solWallet)
          throw new Error(
            "Could not determine which Solana wallet is connected",
          );

        const provider: SolanaProvider | null =
          solWallet === "phantom"
            ? (window.phantom?.solana ?? null)
            : solWallet === "solflare"
              ? (window.solflare ?? null)
              : null;

        if (!provider) {
          throw new Error(
            `${solWallet} extension not found. Please reconnect your wallet.`,
          );
        }

        try {
          await provider.connect({ onlyIfTrusted: true });
        } catch {
          await provider.connect({ onlyIfTrusted: false });
        }

        const solToSend = usdToSol(service.usdPrice, solPriceUsd);
        const senderKey = new PublicKey(solAddress);
        const receiverKey = new PublicKey(SOL_RECEIVER);

        async function fetchBlockhash(): Promise<string> {
          const rpcRes = await fetch(SOL_RPC, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method: "getLatestBlockhash",
              params: [{ commitment: "confirmed" }],
            }),
          });
          if (!rpcRes.ok) {
            throw new Error(
              "Could not reach the Solana network. Please try again.",
            );
          }
          const rpcData = await rpcRes.json();
          const blockhash = rpcData?.result?.value?.blockhash;
          if (!blockhash) {
            throw new Error(
              "Could not fetch a valid blockhash. Please try again.",
            );
          }
          return blockhash;
        }

        let signature: string | null = null;
        let lastError: Error | null = null;
        const maxAttempts = 2;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            const blockhash = await fetchBlockhash();

            const transaction = new Transaction();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = senderKey;
            transaction.add(
              SystemProgram.transfer({
                fromPubkey: senderKey,
                toPubkey: receiverKey,
                lamports: Math.round(solToSend * LAMPORTS_PER_SOL),
              }),
            );

            const signed = await provider.signTransaction(transaction);
            const serialized = Buffer.from(signed.serialize()).toString(
              "base64",
            );

            const sendRes = await fetch(SOL_RPC, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "sendTransaction",
                params: [serialized, { encoding: "base64" }],
              }),
            });

            if (!sendRes.ok) {
              throw new Error(
                "Failed to broadcast transaction. Please try again.",
              );
            }

            const sendData = await sendRes.json();

            if (sendData.error) {
              throw new Error(sendData.error.message ?? "Transaction failed");
            }

            if (!sendData.result) {
              throw new Error(
                "Transaction did not return a signature. Please check your wallet.",
              );
            }

            signature = sendData.result;
            break;
          } catch (attemptErr: unknown) {
            lastError =
              attemptErr instanceof Error
                ? attemptErr
                : new Error("Transaction failed");
            const isBlockhashError = lastError.message
              .toLowerCase()
              .includes("blockhash");
            if (!isBlockhashError || attempt === maxAttempts) {
              throw lastError;
            }
          }
        }

        if (!signature) {
          throw lastError ?? new Error("Transaction failed");
        }

        const queryParams = new URLSearchParams({
          hash: signature,
          service: service.id,
          chain: "sol",
          amount: solToSend.toString(),
          usdPrice: service.usdPrice.toString(),
          contract: contractAddress,
          telegram,
          twitter,
          notes,
        });
        router.push(`/confirm?${queryParams.toString()}`);
      }
    } catch (err: unknown) {
      console.error("FULL PAYMENT ERROR:", err);
      const message = err instanceof Error ? err.message : "Transaction failed";
      const lowerMessage = message.toLowerCase();

      let friendlyMessage = "Something went wrong. Please try again.";

      if (lowerMessage.includes("rejected")) {
        friendlyMessage = "Transaction rejected in wallet";
      } else if (
        lowerMessage.includes("0x1") ||
        lowerMessage.includes("insufficient")
      ) {
        friendlyMessage =
          "Insufficient balance in your wallet for this payment";
      } else if (lowerMessage.includes("blockhash")) {
        friendlyMessage = "Network timing issue, please try again";
      } else if (
        lowerMessage.includes("rate limit") ||
        lowerMessage.includes("429")
      ) {
        friendlyMessage =
          "Too many requests, please wait a moment and try again";
      }

      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#09090B] px-4 py-24">
      <div className="max-w-lg mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm mb-8 transition-colors"
        >
          Back
        </Link>

        <div className="mb-8">
          <span
            className={`inline-block text-xs font-medium px-2.5 py-1 rounded-md mb-3 ${
              service.featured
                ? "bg-orange-500/15 text-orange-400"
                : "bg-white/5 text-zinc-400"
            }`}
          >
            {service.badge}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {service.title}
          </h1>
          <p className="text-zinc-500 text-sm leading-relaxed">
            {service.longDescription}
          </p>
        </div>

        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-sm">You pay</span>
            <div className="text-right">
              <div className="text-white font-bold">${service.usdPrice}</div>
              <div className="text-zinc-600 text-xs">
                {priceLoading
                  ? "Loading live price..."
                  : priceError
                    ? priceError
                    : chain === "eth"
                      ? `≈ ${ethAmount} ETH`
                      : `≈ ${solAmount} SOL`}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-zinc-400 text-xs font-medium mb-2 uppercase tracking-wider">
            Pay with
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setChain("eth")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                chain === "eth"
                  ? "bg-orange-500/15 border-orange-500/40 text-orange-400"
                  : "bg-white/5 border-white/5 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              ETH
            </button>
            <button
              onClick={() => setChain("sol")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                chain === "sol"
                  ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-400"
                  : "bg-white/5 border-white/5 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              SOL
            </button>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-zinc-400 text-xs font-medium mb-2 uppercase tracking-wider">
              Coin Contract Address *
            </label>
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="0x... or Solana address"
              className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-xs font-medium mb-2 uppercase tracking-wider">
              Telegram Handle *
            </label>
            <input
              type="text"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder="@yourhandle"
              className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-xs font-medium mb-2 uppercase tracking-wider">
              X / Twitter{" "}
              <span className="text-zinc-600 normal-case">(optional)</span>
            </label>
            <input
              type="text"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="@yourhandle"
              className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-xs font-medium mb-2 uppercase tracking-wider">
              Notes{" "}
              <span className="text-zinc-600 normal-case">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific instructions for the provider..."
              rows={3}
              className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {!isConnected ? (
          <div className="space-y-3">
            <p className="text-zinc-500 text-xs text-center">
              Connect your wallet to pay
            </p>
            <div className="flex justify-center">
              {chain === "eth" ? <ConnectButton /> : <SolanaConnectButton />}
            </div>
          </div>
        ) : (
          <button
            onClick={handlePayment}
            disabled={loading || priceLoading}
            className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-orange-500/50 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-xl text-sm transition-all"
          >
            {loading
              ? "Waiting for wallet approval..."
              : priceLoading
                ? "Loading price..."
                : `Pay $${service.usdPrice} \u2192`}
          </button>
        )}

        <p className="text-zinc-600 text-xs text-center mt-4 leading-relaxed">
          Payment goes directly on-chain to the provider. All sales are final.
          Crypto amount is calculated at live market rate when you pay.
        </p>
      </div>
    </main>
  );
}
