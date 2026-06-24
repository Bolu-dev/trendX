export type ServiceId = "boost" | "raid" | "bundle";

export interface Service {
  id: ServiceId;
  title: string;
  description: string;
  longDescription: string;
  usdPrice: number;
  duration: string;
  badge: string;
  badgeColor: string;
  featured: boolean;
}

export const services: Service[] = [
  {
    id: "boost",
    title: "Coin Boost",
    description: "Volume and visibility boost across multiple platforms",
    longDescription:
      "Coordinated volume boost across DEX platforms to push your coin up the rankings and attract attention from traders and bots. We also deploy trusted KOLs to push your coin across Twitter and Telegram groups for maximum organic reach.",
    usdPrice: 300,
    duration: "Per boost",
    badge: "Trending",
    badgeColor: "cyan",
    featured: true,
  },
  {
    id: "raid",
    title: "Telegram Raid",
    description: "Coordinated community raid on target Telegram groups",
    longDescription:
      "A team raids target Telegram groups with your coin info, driving community awareness and new holders.",
    usdPrice: 150,
    duration: "Per raid",
    badge: "Raid",
    badgeColor: "purple",
    featured: false,
  },
  {
    id: "bundle",
    title: "Full Package",
    description: "Boost + raid bundled together for maximum impact",
    longDescription:
      "Everything in one shot. Volume boost and Telegram raid running together for maximum visibility and community growth.",
    usdPrice: 500,
    duration: "Full campaign",
    badge: "Best Value",
    badgeColor: "blue",
    featured: false,
  },
];

export function getService(id: string): Service | undefined {
  return services.find((s) => s.id === id);
}
