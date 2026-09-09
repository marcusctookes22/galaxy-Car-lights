import Image from "next/image";
import { siteConfig } from "@/lib/site";
import { publicPath } from "@/lib/publicPath";
export function Brand({ compact = false }: { compact?: boolean }) {
  return <Image src={publicPath("/brand/galaxy-logo.webp")} alt={siteConfig.shortName} width={560} height={431} sizes="110px" className={`block h-auto object-contain ${compact ? "w-[90px]" : "w-[110px] max-sm:w-[90px]"}`} />;
}
