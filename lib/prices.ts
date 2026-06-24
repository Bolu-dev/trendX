export async function getLivePrices(): Promise<{ eth: number; sol: number }> {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,solana&vs_currencies=usd",
  );
  if (!res.ok) {
    throw new Error("Could not fetch live prices. Please try again.");
  }
  const data = await res.json();
  const eth = data?.ethereum?.usd;
  const sol = data?.solana?.usd;
  if (!eth || !sol) {
    throw new Error("Invalid price data received. Please try again.");
  }
  return { eth, sol };
}

export function usdToEth(usd: number, ethPrice: number): number {
  return Number((usd / ethPrice).toFixed(6));
}

export function usdToSol(usd: number, solPrice: number): number {
  return Number((usd / solPrice).toFixed(4));
}
