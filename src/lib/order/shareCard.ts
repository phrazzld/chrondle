import type { OrderScore } from "../../types/orderGameState";

export type OrderShareResult = "correct" | "incorrect";

export interface OrderSharePayload {
  dateLabel: string;
  puzzleNumber: number;
  results: OrderShareResult[]; // length 6 (✓ / ✗)
  score: OrderScore;
  url?: string;
}

const WIDTH = 720;
const HEIGHT = 400;
const CARD_RADIUS = 32;

/**
 * Renders a shareable canvas summarizing an Order puzzle result.
 * Must be executed in the browser (depends on DOM canvas APIs).
 */
export async function generateOrderShareCard(
  payload: OrderSharePayload,
): Promise<HTMLCanvasElement> {
  if (typeof document === "undefined") {
    throw new Error("generateOrderShareCard must run in the browser");
  }

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to acquire 2D context");
  }

  drawBackground(ctx);
  drawHeader(ctx, payload);
  drawResults(ctx, payload.results);
  drawScore(ctx, payload.score);
  drawFooter(ctx, payload.url ?? "https://www.chrondle.app");

  return canvas;
}

export async function copyOrderShareCardToClipboard(payload: OrderSharePayload) {
  const canvas = await generateOrderShareCard(payload);
  if (!navigator.clipboard || !canvas.toBlob) {
    throw new Error("Clipboard API or canvas blob unsupported");
  }

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve));
  if (!blob) {
    throw new Error("Failed to generate share image");
  }

  await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "#111827";
  roundRect(ctx, 20, 20, WIDTH - 40, HEIGHT - 40, CARD_RADIUS);
  ctx.fill();
}

function drawHeader(ctx: CanvasRenderingContext2D, payload: OrderSharePayload) {
  ctx.fillStyle = "#f8fafc";
  ctx.font = "700 32px 'Space Grotesk', system-ui";
  ctx.fillText("CHRONDLE ORDER", 60, 80);

  ctx.font = "400 20px 'Space Grotesk', system-ui";
  ctx.fillStyle = "#cbd5f5";
  const subtitle = `#${payload.puzzleNumber} · ${payload.dateLabel}`;
  ctx.fillText(subtitle, 60, 110);
}

function drawResults(ctx: CanvasRenderingContext2D, results: OrderShareResult[]) {
  const startX = 60;
  const startY = 160;
  const cellWidth = 90;

  ctx.font = "700 56px 'Space Grotesk', system-ui";

  results.forEach((result, idx) => {
    const x = startX + idx * cellWidth;
    ctx.fillStyle = result === "correct" ? "#34d399" : "#f87171";
    ctx.fillText(result === "correct" ? "✓" : "✗", x, startY);
  });
}

function drawScore(ctx: CanvasRenderingContext2D, score: OrderScore) {
  ctx.fillStyle = "#f8fafc";
  ctx.font = "600 28px 'Space Grotesk', system-ui";
  ctx.fillText(`${score.totalScore} pts`, 60, 240);

  ctx.font = "400 20px 'Space Grotesk', system-ui";
  ctx.fillStyle = "#cbd5f5";
  ctx.fillText(
    `${score.correctPairs}/${score.totalPairs} pairs correct · ${score.hintMultiplier.toFixed(2)}× multiplier`,
    60,
    270,
  );
}

function drawFooter(ctx: CanvasRenderingContext2D, url: string) {
  ctx.fillStyle = "#94a3b8";
  ctx.font = "400 18px 'Space Grotesk', system-ui";
  ctx.fillText(url, 60, 330);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}
