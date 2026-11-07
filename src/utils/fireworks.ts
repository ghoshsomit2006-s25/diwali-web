/**
 * Canvas Fireworks & Celebration Engine with Realistic Physics
 * Supports Peony, Ring, Heart, Spiral, and Willow bursts.
 */

import { festiveAudio } from './audio';

export type BurstType = 'peony' | 'ring' | 'heart' | 'spiral' | 'willow';

interface Rocket {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  hue: number;
  burstType: BurstType;
  trail: { x: number; y: number; alpha: number }[];
  exploded: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  color: string;
  size: number;
  gravity: number;
  drag: number;
  sparkle: boolean;
  trail: { x: number; y: number }[];
}

export class FireworksEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private rockets: Rocket[] = [];
  private particles: Particle[] = [];
  private animId: number | null = null;
  private isAutoShowActive = false;
  private autoShowTimer: any = null;
  private autoShowInterval: any = null;
  private maxParticles = 650;
  private isReducedMotion = false;

  private colors = [
    '#FF9933', // Marigold orange
    '#FFD700', // Royal Gold
    '#FF1493', // Deep Pink
    '#00E5FF', // Cyan / Peacock
    '#76FF03', // Vivid Lime
    '#FF3D00', // Saffron
    '#E040FB', // Magenta
    '#FFF176', // Soft Sunlight
  ];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    // Check device performance & reduced motion
    const isMobile = window.innerWidth < 768;
    this.maxParticles = isMobile ? 320 : 650;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.isReducedMotion = media.matches;
    media.addEventListener('change', (e) => {
      this.isReducedMotion = e.matches;
    });

    this.resize();
    window.addEventListener('resize', this.handleResize);
  }

  private handleResize = () => {
    this.resize();
  };

  public resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  public start() {
    if (this.animId) return;
    const loop = () => {
      this.update();
      this.draw();
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  public stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    this.stopAutoShow();
  }

  public destroy() {
    this.stop();
    window.removeEventListener('resize', this.handleResize);
  }

  public launch(
    startX: number = Math.random() * this.canvas.width,
    targetX: number = Math.random() * this.canvas.width,
    targetY: number = 80 + Math.random() * (this.canvas.height * 0.45),
    burstType?: BurstType
  ) {
    if (this.isReducedMotion) return;

    const types: BurstType[] = ['peony', 'ring', 'heart', 'spiral', 'willow'];
    const chosenType = burstType || types[Math.floor(Math.random() * types.length)];
    const hue = Math.floor(Math.random() * 360);

    const dx = targetX - startX;
    const dy = targetY - this.canvas.height;
    const dist = Math.hypot(dx, dy);
    const speed = 14 + Math.random() * 4;
    const vx = (dx / dist) * speed;
    const vy = (dy / dist) * speed;

    this.rockets.push({
      x: startX,
      y: this.canvas.height,
      targetX,
      targetY,
      vx,
      vy,
      hue,
      burstType: chosenType,
      trail: [],
      exploded: false,
    });

    festiveAudio.playFireworkLaunch();
  }

  private explode(rocket: Rocket) {
    festiveAudio.playFireworkBoom(rocket.burstType === 'willow' || rocket.burstType === 'peony');
    if (Math.random() < 0.6) {
      festiveAudio.playFireworkCrackle();
    }

    const { targetX, targetY, burstType } = rocket;
    const baseColor = this.colors[Math.floor(Math.random() * this.colors.length)];
    const secondaryColor = this.colors[Math.floor(Math.random() * this.colors.length)];

    let count = 45;
    if (window.innerWidth < 768) count = 28;

    // Different burst shapes & physics
    switch (burstType) {
      case 'heart': {
        const heartCount = count;
        for (let i = 0; i < heartCount; i++) {
          const t = (i / heartCount) * Math.PI * 2;
          // Parametric heart: x = 16 sin^3(t), y = -(13 cos(t) - 5 cos(2t) - 2 cos(3t) - cos(4t))
          const hx = 16 * Math.pow(Math.sin(t), 3);
          const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
          const scale = 0.22 + Math.random() * 0.04;

          this.addParticle({
            x: targetX,
            y: targetY,
            vx: hx * scale,
            vy: hy * scale,
            alpha: 1,
            decay: 0.015,
            color: '#FF1493',
            size: 2.5,
            gravity: 0.03,
            drag: 0.96,
            sparkle: true,
            trail: [],
          });
        }
        break;
      }

      case 'ring': {
        const ringCount = count;
        const ringSpeed = 4 + Math.random() * 2;
        for (let i = 0; i < ringCount; i++) {
          const angle = (i / ringCount) * Math.PI * 2;
          this.addParticle({
            x: targetX,
            y: targetY,
            vx: Math.cos(angle) * ringSpeed,
            vy: Math.sin(angle) * ringSpeed,
            alpha: 1,
            decay: 0.018,
            color: baseColor,
            size: 2.4,
            gravity: 0.04,
            drag: 0.97,
            sparkle: false,
            trail: [],
          });
        }
        break;
      }

      case 'spiral': {
        const spiralCount = count;
        for (let i = 0; i < spiralCount; i++) {
          const angle = (i / spiralCount) * Math.PI * 6;
          const spd = 1.2 + (i / spiralCount) * 4.5;
          this.addParticle({
            x: targetX,
            y: targetY,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            alpha: 1,
            decay: 0.017,
            color: i % 2 === 0 ? baseColor : secondaryColor,
            size: 2.6,
            gravity: 0.04,
            drag: 0.96,
            sparkle: true,
            trail: [],
          });
        }
        break;
      }

      case 'willow': {
        // Slow falling golden cascades that sparkle
        const willowCount = Math.floor(count * 1.2);
        for (let i = 0; i < willowCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const spd = 1 + Math.random() * 4.5;
          this.addParticle({
            x: targetX,
            y: targetY,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            alpha: 1,
            decay: 0.009, // Stays in sky longer
            color: '#FFD700',
            size: 2.2,
            gravity: 0.065, // Flows downward gracefully
            drag: 0.97,
            sparkle: true,
            trail: [],
          });
        }
        break;
      }

      case 'peony':
      default: {
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const spd = 1.5 + Math.random() * 5.5;
          this.addParticle({
            x: targetX,
            y: targetY,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            alpha: 1,
            decay: 0.016 + Math.random() * 0.008,
            color: Math.random() > 0.4 ? baseColor : secondaryColor,
            size: 2.2 + Math.random() * 1.5,
            gravity: 0.045,
            drag: 0.965,
            sparkle: Math.random() > 0.5,
            trail: [],
          });
        }
        break;
      }
    }
  }

  private addParticle(p: Particle) {
    if (this.particles.length < this.maxParticles) {
      this.particles.push(p);
    }
  }

  private update() {
    // 1. Update Rockets
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];
      r.trail.push({ x: r.x, y: r.y, alpha: 1 });
      if (r.trail.length > 7) r.trail.shift();

      r.x += r.vx;
      r.y += r.vy;

      // When close to target height, explode
      if (r.vy < 0 && r.y <= r.targetY) {
        this.explode(r);
        this.rockets.splice(i, 1);
      }
    }

    // 2. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 4) p.trail.shift();

      p.vx *= p.drag;
      p.vy *= p.drag;
      p.vy += p.gravity;

      p.x += p.vx;
      p.y += p.vy;

      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Rocket trails
    this.ctx.save();
    this.rockets.forEach((r) => {
      this.ctx.strokeStyle = '#FFE082';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      r.trail.forEach((t, idx) => {
        if (idx === 0) this.ctx.moveTo(t.x, t.y);
        else this.ctx.lineTo(t.x, t.y);
      });
      this.ctx.stroke();

      // Rocket glowing head
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.shadowColor = '#FF9933';
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.restore();

    // Draw Particles with trails & sparkles
    this.ctx.save();
    this.particles.forEach((p) => {
      this.ctx.globalAlpha = Math.max(0, p.alpha);

      // Trailing tail
      if (p.trail.length > 1) {
        this.ctx.strokeStyle = p.color;
        this.ctx.lineWidth = p.size * 0.8;
        this.ctx.beginPath();
        p.trail.forEach((pt, idx) => {
          if (idx === 0) this.ctx.moveTo(pt.x, pt.y);
          else this.ctx.lineTo(pt.x, pt.y);
        });
        this.ctx.stroke();
      }

      // Main particle dot
      this.ctx.fillStyle = p.sparkle && Math.random() > 0.4 ? '#FFFFFF' : p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 8;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.restore();
  }

  // Auto Fireworks Show (30-second choreographed spectacle)
  public startAutoShow(onComplete?: () => void) {
    if (this.isAutoShowActive) return;
    this.isAutoShowActive = true;

    const types: BurstType[] = ['peony', 'ring', 'heart', 'spiral', 'willow'];
    let count = 0;

    this.autoShowInterval = setInterval(() => {
      count++;
      const randX = 0.15 * this.canvas.width + Math.random() * (0.7 * this.canvas.width);
      const randTargetX = 0.1 * this.canvas.width + Math.random() * (0.8 * this.canvas.width);
      const randTargetY = 70 + Math.random() * (this.canvas.height * 0.4);
      const type = types[count % types.length];

      this.launch(randX, randTargetX, randTargetY, type);

      // Double burst occasionally
      if (count % 3 === 0) {
        setTimeout(() => {
          const t2 = types[(count + 1) % types.length];
          this.launch(randX + (Math.random() * 80 - 40), randTargetX + 60, randTargetY + 30, t2);
        }, 300);
      }
    }, 1100);

    // Stop after 30 seconds
    this.autoShowTimer = setTimeout(() => {
      this.stopAutoShow();
      if (onComplete) onComplete();
    }, 30000);
  }

  public stopAutoShow() {
    this.isAutoShowActive = false;
    if (this.autoShowInterval) {
      clearInterval(this.autoShowInterval);
      this.autoShowInterval = null;
    }
    if (this.autoShowTimer) {
      clearTimeout(this.autoShowTimer);
      this.autoShowTimer = null;
    }
  }

  public isAutoShowRunning(): boolean {
    return this.isAutoShowActive;
  }
}
