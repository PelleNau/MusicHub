interface DrawPlayheadOptions {
  ctx: CanvasRenderingContext2D;
  beat: number;
  pixelsPerBeat: number;
  height: number;
  showTriangle?: boolean;
}

export function drawPlayhead({
  ctx,
  beat,
  pixelsPerBeat,
  height,
  showTriangle = false,
}: DrawPlayheadOptions) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const x = beat * pixelsPerBeat;
  ctx.strokeStyle = "hsl(var(--playhead))";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 1, 0);
  ctx.lineTo(x + 1, height);
  ctx.stroke();

  if (showTriangle) {
    ctx.fillStyle = "hsl(var(--playhead))";
    ctx.beginPath();
    ctx.moveTo(x - 5, 0);
    ctx.lineTo(x + 7, 0);
    ctx.lineTo(x + 1, 8);
    ctx.closePath();
    ctx.fill();
  }
}
