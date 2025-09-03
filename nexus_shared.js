// Shared utilities and classes for Nexus visualization
// drawCore with animated rings and glow
export function drawCore(ctx, x, y, color, baseRadius, ringAngle1, ringAngle2, opacity = 1.0) {
  ctx.globalAlpha = opacity;
  const pulse = Math.sin(Date.now() * 0.002) * 5;
  const radius = baseRadius + pulse;

  ctx.strokeStyle = color + '80';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(x, y, radius * 1.5, radius * 0.5, ringAngle1, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = color + '40';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, y, radius * 0.8, radius * 1.8, ringAngle2, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 4; i > 0; i--) {
    const bloomRadius = radius + i * 10;
    const grad = ctx.createRadialGradient(x, y, radius, x, y, bloomRadius);
    grad.addColorStop(0, color + '20');
    grad.addColorStop(1, color + '00');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, bloomRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1.0;
}

// Keep drawing units in CSS pixels; scale the canvas with devicePixelRatio externally.

export function getClientAreaPosition() {
  const sideBorder = (window.outerWidth - window.innerWidth) / 2;
  const topBorder = (window.outerHeight - window.innerHeight) - sideBorder; // approx
  const clientLeftOnScreen = window.screenX + sideBorder;
  const clientTopOnScreen = window.screenY + topBorder;
  return {
    x: clientLeftOnScreen,
    y: clientTopOnScreen,
    width: window.innerWidth,
    height: window.innerHeight,
    cx: window.innerWidth / 2,
    cy: window.innerHeight / 2,
  };
}

export function resizeCanvasHiDPI(canvas, ctx, w, h, dpr = window.devicePixelRatio || 1) {
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function drawBackgroundShared(ctx, stars, nebulaColors, screenX, screenY, w, h) {
  if (w === 0 || h === 0) return;
  nebulaColors.forEach((neb) => {
    const grad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.r);
    grad.addColorStop(0, neb.color);
    grad.addColorStop(1, 'rgba(0,0,5,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  });
  ctx.fillStyle = '#FFF';
  stars.forEach((star) => {
    const parallaxX = screenX / (star.z * 10);
    const parallaxY = screenY / (star.z * 10);
    let x = (star.x - parallaxX) % w;
    let y = (star.y - parallaxY) % h;
    if (x < 0) x += w;
    if (y < 0) y += h;
    const size = (3 - star.z) * 0.5;
    ctx.globalAlpha = (1 / star.z) * 0.5;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

export function lerpColor(color1, color2, amount) {
  const c1 = color1.match(/\d+/g).map(Number);
  const c2 = color2.match(/\d+/g).map(Number);
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * amount);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * amount);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * amount);
  return `rgba(${r}, ${g}, ${b}, 0.9)`;
}

export function calculateDistance(pos1, pos2) {
  const dx = pos1.x + pos1.width / 2 - (pos2.x + pos2.width / 2);
  const dy = pos1.y + pos1.height / 2 - (pos2.y + pos2.height / 2);
  return { dist: Math.hypot(dx, dy) };
}

export class Particle {
  constructor({ x, y, vx = 0, vy = 0, life = Math.random() * 180, color, targetX, targetY, }) {
    this.x = x; this.y = y; this.vx = vx; this.vy = vy;
    this.life = life; this.baseLife = this.life > 0 ? this.life : 180;
    this.color = color;
    this.wavePhase = Math.random() * Math.PI * 2;
    this.waveAmplitude = Math.random() * 15 + 5;
    this.waveFreq = Math.random() * 0.1 + 0.1;
    this.targetX = targetX; this.targetY = targetY;
    this.pathAngle = targetX && targetY ? Math.atan2(targetY - y, targetX - x) : 0;
  }

  update(attractorX, attractorY, attractionForce) {
    const dx = attractorX - this.x;
    const dy = attractorY - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 1) {
      this.vx += (dx / dist) * attractionForce;
      this.vy += (dy / dist) * attractionForce;
    }
    if (this.targetX && this.targetY) {
      this.pathAngle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
    }
    const spiralStrength = 0.02 * attractionForce;
    this.vx += -Math.sin(this.pathAngle) * spiralStrength;
    this.vy += Math.cos(this.pathAngle) * spiralStrength;
    const t = performance.now() * 0.001;
    const noise = Math.sin(0.15 * this.x + 0.2 * this.y + t * 2 + this.wavePhase);
    this.vx += noise * 0.05;
    this.vy += Math.cos(0.2 * this.x - 0.15 * this.y + t * 1.7) * 0.05;

    this.x += this.vx; this.y += this.vy;
    this.vx *= 0.98; this.vy *= 0.98;
    this.life--;
  }

  draw(ctx, blendColor = null, blendAmount = 0) {
    let finalColor = this.color;
    if (blendColor && blendAmount > 0) {
      finalColor = lerpColor(this.color, blendColor, blendAmount);
    }
    const alpha = (this.life / this.baseLife) * 0.9;
    const flicker = Math.random() * 0.2 + 0.8;
    const waveOffset = Math.sin(this.life * this.waveFreq + this.wavePhase) * this.waveAmplitude;
    const perpX = -Math.sin(this.pathAngle);
    const perpY = Math.cos(this.pathAngle);
    const drawX = this.x + perpX * waveOffset;
    const drawY = this.y + perpY * waveOffset;
    const tailLength = 8 + this.waveAmplitude / 2;
    const tailX = drawX - this.vx * tailLength;
    const tailY = drawY - this.vy * tailLength;

    const grad = ctx.createLinearGradient(drawX, drawY, tailX, tailY);
    grad.addColorStop(0, finalColor.replace(/[\d.]+\)$/g, `${alpha * flicker})`));
    grad.addColorStop(1, finalColor.replace(/[\d.]+\)$/g, `0)`));
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(drawX, drawY);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();
  }
}

export function drawPartnerCoreOverlay(ctx, myPos, otherPos, color, ringAngle1, ringAngle2) {
  if (!otherPos) return;
  const px = otherPos.x - myPos.x + otherPos.cx;
  const py = otherPos.y - myPos.y + otherPos.cy;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawCore(ctx, px, py, color, 28, ringAngle1, ringAngle2, 0.6);
  ctx.strokeStyle = '#ffffff30';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(px, py, 30, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export function drawMergeArcs(ctx, x1, y1, x2, y2, color = '#a855f7') {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  const normX = -dy / (dist || 1);
  const normY = dx / (dist || 1);
  const t = performance.now() * 0.001;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = -1; i <= 1; i++) {
    const sway = Math.sin(t * 2 + i) * (dist * 0.06);
    const cpx = midX + normX * (sway + i * 20);
    const cpy = midY + normY * (sway - i * 20);
    ctx.strokeStyle = color + '80';
    ctx.lineWidth = 1.5 + (i === 0 ? 0.5 : 0);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(cpx, cpy, x2, y2);
    ctx.stroke();
  }
  const pulse = (Math.sin(t * 3) + 1) * 0.5;
  ctx.strokeStyle = color + '60';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(midX, midY, 12 + pulse * 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export function updateParticleListShared(ctx, channel, list, myPos, otherPos, attractorX, attractorY, attractionForce, targetId, blendColor, blendAmount) {
  for (let i = list.length - 1; i >= 0; i--) {
    const p = list[i];
    p.update(attractorX, attractorY, attractionForce * 0.5);
    const screenX = myPos.x + p.x;
    const screenY = myPos.y + p.y;

    const inOtherWindow = otherPos && screenX >= otherPos.x && screenX <= otherPos.x + otherPos.width && screenY >= otherPos.y && screenY <= otherPos.y + otherPos.height;
    if (inOtherWindow) {
      // draw once pre-transfer to avoid a 1-frame gap
      p.draw(ctx, blendColor, blendAmount);
      channel.postMessage({
        type: 'particle_transfer',
        target: targetId,
        particle: { x: screenX - otherPos.x, y: screenY - otherPos.y, vx: p.vx, vy: p.vy, life: p.life, color: p.color },
      });
      list.splice(i, 1);
      continue;
    }

    // send ghost near boundary for continuity
    const ghostThreshold = 30;
    const nearBoundary = p.x > myPos.width - ghostThreshold || p.x < ghostThreshold || p.y > myPos.height - ghostThreshold || p.y < ghostThreshold;
    if (otherPos && nearBoundary) {
      channel.postMessage({
        type: 'ghost_particle',
        target: targetId,
        particle: { x: screenX - otherPos.x, y: screenY - otherPos.y, vx: p.vx, vy: p.vy, life: p.life, color: p.color },
      });
    }

    p.draw(ctx, blendColor, blendAmount);
    if (p.life <= 0) list.splice(i, 1);
  }
}

