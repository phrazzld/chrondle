import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { GamesGallery } from "@/components/GamesGallery";

const BOT_USER_AGENT = /bot|crawl|spider|slurp|duckduckgo|baiduspider|bingpreview|yandex/i;
const MODE_COOKIE = "chrondle_mode";

export default function SmartHomepage() {
  const cookieStore = cookies();
  const mode = cookieStore.get(MODE_COOKIE)?.value;
  const userAgent = headers().get("user-agent") ?? "";
  const isBot = BOT_USER_AGENT.test(userAgent);

  if (!isBot && mode === "classic") {
    redirect("/classic");
  }

  if (!isBot && mode === "order") {
    redirect("/order");
  }

  return <GamesGallery />;
}
