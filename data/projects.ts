import type { Project } from "@/types/content";
import { publicPath } from "@/lib/publicPath";
export const projects: Project[] = [
  { id:"starlight-gold", label:"01 / Starlight + ambient", title:"Starlight & Gold", image:publicPath("/images/install-starlight-gold.webp"), alt:"Completed Lamborghini Urus interior with blue starlight headliner, warm gold roof accents and orange leather seats" },
  { id:"violet-starlight", label:"02 / Starlight headliner", title:"Violet After Dark", image:publicPath("/images/install-violet-starlight.webp"), alt:"Completed violet starlight headliner with illuminated edges around two roof panels above dark leather seats" },
  { id:"blue-ambient", label:"03 / Ambient interior", title:"Electric Blue", image:publicPath("/images/install-blue-ambient.webp"), alt:"Completed SUV lighting installation with electric blue ambient strips along open doors, illuminated footwells and a starlight ceiling" },
];
