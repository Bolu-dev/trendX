'use client'

import { createContext, useContext, useState } from 'react'

type Chain = 'eth' | 'sol'
type SolWalletType = 'phantom' | 'solflare' | null

interface ChainContextType {
  activeChain: Chain
  setActiveChain: (chain: Chain) => void
  solAddress: string | null
  setSolAddress: (address: string | null) => void
  solWallet: SolWalletType
  setSolWallet: (wallet: SolWalletType) => void
}

const ChainContext = createContext<ChainContextType>({
  activeChain: 'eth',
  setActiveChain: () => {},
  solAddress: null,
  setSolAddress: () => {},
  solWallet: null,
  setSolWallet: () => {},
})

export function ChainProvider({ children }: { children: React.ReactNode }) {
  const [activeChain, setActiveChain] = useState<Chain>('eth')
  const [solAddress, setSolAddress] = useState<string | null>(null)
  const [solWallet, setSolWallet] = useState<SolWalletType>(null)

  return (
    <ChainContext.Provider
      value={{
        activeChain,
        setActiveChain,
        solAddress,
        setSolAddress,
        solWallet,
        setSolWallet,
      }}
    >
      {children}
    </ChainContext.Provider>
  )
}

export function useChain() {
  return useContext(ChainContext)
}