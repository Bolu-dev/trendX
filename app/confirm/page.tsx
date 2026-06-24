'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef } from 'react'
import Link from 'next/link'
import { getService } from '@/lib/services'

async function sendTelegramNotification(message: string) {
  const token = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN
  const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID
  if (!token || !chatId) return
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    }),
  })
}

function ConfirmContent() {
  const searchParams = useSearchParams()
  const notified = useRef(false)

  const hash = searchParams.get('hash')
  const serviceId = searchParams.get('service')
  const chain = searchParams.get('chain') as 'eth' | 'sol'
  const amount = searchParams.get('amount')
  const usdPrice = searchParams.get('usdPrice')
  const contract = searchParams.get('contract')
  const telegram = searchParams.get('telegram')
  const twitter = searchParams.get('twitter')
  const notes = searchParams.get('notes')
  const service = getService(serviceId ?? '')

  const explorerUrl = chain === 'eth'
    ? `https://etherscan.io/tx/${hash}`
    : `https://solscan.io/tx/${hash}`

  const shortHash = hash
    ? `${hash.slice(0, 8)}...${hash.slice(-8)}`
    : 'N/A'

  useEffect(() => {
    if (notified.current || !hash || !service) return
    notified.current = true

    const message = [
      '🚀 New TrendX Order',
      '',
      `Service: ${service.title}`,
      `Chain: ${chain === 'eth' ? 'Ethereum (ETH)' : 'Solana (SOL)'}`,
      `Price: $${usdPrice ?? service.usdPrice}`,
      `Amount paid: ${amount ?? 'N/A'} ${chain === 'eth' ? 'ETH' : 'SOL'}`,
      `TX Hash: ${hash}`,
      '',
      `Contract: ${contract ?? 'N/A'}`,
      `Telegram: ${telegram ?? 'N/A'}`,
      `Twitter: ${twitter ? '@' + twitter.replace('@', '') : 'N/A'}`,
      `Notes: ${notes || 'None'}`,
      '',
      `Explorer: ${explorerUrl}`,
    ].join('\n')

    sendTelegramNotification(message)
  }, [hash, service, chain, amount, usdPrice, contract, telegram, twitter, notes, explorerUrl])

  return (
    <main className="min-h-screen bg-[#09090B] px-4 py-24">
      <div className="max-w-lg mx-auto text-center">

        <div className="w-16 h-16 rounded-full bg-orange-500/15 border border-orange-500/30 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-orange-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Payment confirmed
        </h1>
        <p className="text-zinc-500 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          Your order is live. The provider has been notified and will
          start your service immediately.
        </p>

        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-5 mb-6 text-left space-y-4">

          {service && (
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 text-sm">Service</span>
              <span className="text-white text-sm font-medium">{service.title}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-sm">Chain</span>
            <span className={`text-sm font-semibold ${
              chain === 'eth' ? 'text-orange-400' : 'text-cyan-400'
            }`}>
              {chain === 'eth' ? 'Ethereum' : 'Solana'}
            </span>
          </div>

          {usdPrice && (
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 text-sm">Price</span>
              <span className="text-white text-sm font-medium">${usdPrice}</span>
            </div>
          )}

          {amount && (
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 text-sm">Amount paid</span>
              <span className="text-white text-sm font-medium">
                {amount} {chain === 'eth' ? 'ETH' : 'SOL'}
              </span>
            </div>
          )}

          {contract && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-zinc-500 text-sm shrink-0">Contract</span>
              <span className="text-white text-xs font-mono truncate">{contract}</span>
            </div>
          )}

          {telegram && (
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 text-sm">Telegram</span>
              <span className="text-white text-sm">{telegram}</span>
            </div>
          )}

          {twitter && (
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 text-sm">Twitter</span>
              <span className="text-white text-sm">{twitter}</span>
            </div>
          )}

          <div className="pt-3 border-t border-white/5">
            <span className="text-zinc-500 text-xs block mb-1">
              Transaction hash
            </span>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-300 text-xs font-mono break-all transition-colors"
            >
              {shortHash}
            </a>
          </div>

        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 mb-8 text-left">
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
            What happens next
          </p>
          <div className="space-y-2.5">
            {[
              'Provider receives your order details via Telegram instantly',
              'Service starts within 1 hour of payment confirmation',
              'You can track your transaction on the explorer link above',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500/60 mt-1.5 shrink-0" />
                <p className="text-zinc-500 text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 text-white font-medium py-3 rounded-xl text-sm transition-all text-center"
          >
            Back to home
          </Link>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-orange-500 hover:bg-orange-400 text-black font-bold py-3 rounded-xl text-sm transition-all text-center"
          >
            View on explorer
          </a>
        </div>

      </div>
    </main>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  )
}