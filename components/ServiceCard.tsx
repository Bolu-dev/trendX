"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Service } from "@/lib/services";
import { getLivePrices, usdToEth, usdToSol } from "@/lib/prices";

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const [ethAmount, setEthAmount] = useState<number | null>(null);
  const [solAmount, setSolAmount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getLivePrices()
      .then(({ eth, sol }) => {
        if (cancelled) return;
        setEthAmount(usdToEth(service.usdPrice, eth));
        setSolAmount(usdToSol(service.usdPrice, sol));
      })
      .catch(() => {
        if (cancelled) return;
        setEthAmount(null);
        setSolAmount(null);
      });
    return () => {
      cancelled = true;
    };
  }, [service.usdPrice]);

  const colors: Record<string, string> = {
    orange: "bg-orange-500/15 text-orange-400",
    cyan: "bg-cyan-500/15 text-cyan-400",
    purple: "bg-purple-500/15 text-purple-400",
    blue: "bg-blue-500/15 text-blue-400",
  };

  return (
    <div
      className={`relative flex flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${
        service.featured
          ? "bg-zinc-900 border border-orange-500/40 shadow-lg shadow-orange-500/5"
          : "bg-zinc-900/60 border border-white/5 hover:border-white/10"
      }`}
    >
      <span
        className={`self-start text-xs font-medium px-2.5 py-1 rounded-md mb-5 ${
          colors[service.badgeColor] ?? "bg-white/5 text-zinc-400"
        }`}
      >
        {service.badge}
      </span>

      <h3 className="text-base font-semibold text-white mb-2">
        {service.title}
      </h3>
      <p className="text-zinc-500 text-sm leading-relaxed mb-8">
        {service.description}
      </p>

      <div className="mt-auto mb-6 space-y-1">
        <div className="flex items-baseline gap-2">
          <span
            className={`text-2xl font-bold ${service.featured ? "text-orange-400" : "text-white"}`}
          >
            ${service.usdPrice}
          </span>
          <span className="text-zinc-600 text-xs">/ {service.duration}</span>
        </div>
        <div className="text-zinc-500 text-xs">
          {ethAmount && solAmount
            ? `${ethAmount} ETH or ${solAmount} SOL`
            : "Loading live price..."}
        </div>
      </div>

      <Link
        href={`/order/${service.id}`}
        className={`w-full text-center py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          service.featured
            ? "bg-orange-500 hover:bg-orange-400 text-black"
            : "bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5"
        }`}
      >
        Pay & Order →
      </Link>
    </div>
  );
}
