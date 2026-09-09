import { handleContact } from "@/lib/contact/handler.server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  return handleContact(request);
}
