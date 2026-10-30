/* =====================================================================
   INTERFACE: cenário, barras de vida, tela inicial e mensagens.
   ===================================================================== */

class Stage {
  draw(ctx) {
    const { width, height } = CONFIG.canvas;
    ctx.fillStyle = '#1b1b2e';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#2a2a45';
    ctx.fillRect(0, CONFIG.groundY, width, height - CONFIG.groundY);
    ctx.fillStyle = '#5555ff';
    ctx.fillRect(0, CONFIG.groundY, width, 3);
  }
}

class HealthBar {
  constructor({ x, y, color, alignRight = false, width = 300, height = 18 }) {
    Object.assign(this, { x, y, color, alignRight, width, height });
  }

  draw(ctx, label, health, maxHealth, colorOverride) {
    const { x, y, width, height } = this;
    const filledWidth = width * health / maxHealth;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(x - 2, y - 2, width + 4, height + 4);
    ctx.fillStyle = '#400';
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = colorOverride || this.color;
    ctx.fillRect(this.alignRight ? x + width - filledWidth : x, y, filledWidth, height);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = this.alignRight ? 'right' : 'left';
    ctx.fillText(`${label} ${Math.ceil(health)}`, this.alignRight ? x + width - 6 : x + 6, y + 13);
  }
}

/* Barras de vida do jogador (esquerda) e do boss (direita). */
class Hud {
  constructor() {
    this.playerBar = new HealthBar({ x: 20, y: 16, color: '#33dd33' });
    this.bossBar = new HealthBar({ x: CONFIG.canvas.width - 320, y: 16, color: '#ee3333', alignRight: true });
  }

  draw(ctx, player, boss, bossNumber, score) {
    this.playerBar.draw(ctx, CONFIG.player.name, player.health, player.maxHealth);
    this.bossBar.draw(ctx, `BOSS ${bossNumber} - ${boss.name}`, boss.health, boss.maxHealth, boss.healthBarColor);
    this.drawScore(ctx, score);
  }

  /** Pontuação no centro do topo, entre as duas barras de vida. */
  drawScore(ctx, score) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${LABELS.texts.score} ${String(score).padStart(6, '0')}`, CONFIG.canvas.width / 2, 30);
  }
}

class TitleScreen {
  draw(ctx, assets, timeInSeconds) {
    const { width, height } = CONFIG.canvas;
    const texts = LABELS.texts;

    const background = ctx.createLinearGradient(0, 0, 0, height);
    background.addColorStop(0, '#0a0a18');
    background.addColorStop(1, '#2a0a1a');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 50; i++) {                       // estrelas piscando
      const twinkle = (Math.sin(timeInSeconds * 2 + i) + 1) / 2;
      ctx.fillStyle = `rgba(255,255,255,${0.15 + 0.5 * twinkle})`;
      ctx.fillRect((i * 97) % width, (i * 53) % 350, 2, 2);
    }

    if (assets.isReady('titleHelmet')) {                 // capacete flutuando
      const helmet = assets.get('titleHelmet');
      const scale = 3;
      const drawWidth = helmet.width * scale;
      const drawHeight = helmet.height * scale;
      const bob = Math.round(Math.sin(timeInSeconds * 2) * 4);
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(width / 2, 340, 70 - bob, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.drawImage(helmet, Math.round((width - drawWidth) / 2), 125 + bob, drawWidth, drawHeight);
    }

    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';
    ctx.font = 'bold 64px "Courier New", monospace';
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#2a0008';
    ctx.strokeText(texts.title, width / 2, 92);
    const titleGradient = ctx.createLinearGradient(0, 42, 0, 96);
    titleGradient.addColorStop(0, '#ffffff');
    titleGradient.addColorStop(0.5, '#ff5050');
    titleGradient.addColorStop(1, '#b00018');
    ctx.fillStyle = titleGradient;
    ctx.fillText(texts.title, width / 2, 92);

    if (Math.floor(timeInSeconds * 2) % 2 === 0) {      // texto piscando
      ctx.font = 'bold 20px "Courier New", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(texts.pressStart, width / 2, 420);
    }

    ctx.fillStyle = 'rgba(0,0,0,0.12)';                  // linhas de "TV antiga"
    for (let y = 0; y < height; y += 4) ctx.fillRect(0, y, width, 2);
  }
}

/* Tela escurecida com título, linhas de detalhe (pontuação) e subtítulo (fim de luta, vitória, derrota). */
class MessageOverlay {
  draw(ctx, title, subtitle, details = []) {
    const { width, height } = CONFIG.canvas;
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(0, 0, width, height);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    const titleY = 215 - 22 * details.length;
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(title, width / 2, titleY);

    let lineY = titleY + 15;
    ctx.font = 'bold 18px sans-serif';
    for (const detail of details) {
      lineY += 30;
      ctx.fillStyle = detail.color || '#ffffff';
      ctx.fillText(detail.text, width / 2, lineY);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.fillText(subtitle, width / 2, lineY + 45);
  }
}
