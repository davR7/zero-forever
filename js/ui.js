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

/* ---------------------------------------------------------------------
   Escolha de personagem: painel de madeira com um cartão por personagem.
   Os botões SIM/NÃO NÃO são desenhados aqui: são HTML + CSS (index.html / styles.css).
   --------------------------------------------------------------------- */
class CharacterSelectScreen {
  constructor() {
    this.card = { width: 138, height: 184, gap: 18, y: 106 };
    this.panelSize = { width: 553, height: 395 };       // tamanho original de imgs/menu_painel_tech.png
    this.titleCenter = { x: 277, y: 47 };               // centro da barra do cabeçalho (entre os rebites), em pixels da imagem do painel
  }

  /** Retângulos dos cartões, centralizados na tela. */
  cardRects(count) {
    const { width, height, gap, y } = this.card;
    const total = count * width + (count - 1) * gap;
    const startX = (CONFIG.canvas.width - total) / 2;
    return Array.from({ length: count }, (_, i) => ({ x: startX + i * (width + gap), y, w: width, h: height }));
  }

  /** Qual cartão está em (x, y) do canvas? -1 se nenhum. */
  cardAt(x, y, count) {
    return this.cardRects(count).findIndex((r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
  }

  draw(ctx, assets, timeInSeconds, focusedIndex) {
    const { width, height } = CONFIG.canvas;
    const texts = LABELS.texts;
    this.drawBackground(ctx, timeInSeconds);
    this.drawPanel(ctx, assets);

    const panel = this.panelRect();
    const titleX = panel.x + this.titleCenter.x * panel.scale;
    const titleY = panel.y + this.titleCenter.y * panel.scale;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';                         // centraliza na vertical também
    ctx.lineJoin = 'round';
    ctx.font = 'bold 15px "Courier New", monospace';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#021622';
    ctx.strokeText(texts.chooseCharacter, titleX, titleY);
    ctx.save();
    ctx.shadowColor = '#2ab8ff';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#c8f4ff';
    ctx.fillText(texts.chooseCharacter, titleX, titleY);
    ctx.restore();
    ctx.textBaseline = 'alphabetic';

    const rects = this.cardRects(CONFIG.characters.length);
    CONFIG.characters.forEach((character, i) => this.drawCard(ctx, assets, rects[i], character, i === focusedIndex, timeInSeconds));

    ctx.font = '11px "Courier New", monospace';
    const hintWidth = ctx.measureText(texts.selectHint).width + 20;
    ctx.fillStyle = 'rgba(4, 14, 24, 0.78)';            // faixa escura: o texto não se perde nas trilhas do circuito
    ctx.beginPath();
    ctx.roundRect((width - hintWidth) / 2, 305, hintWidth, 18, 5);
    ctx.fill();
    ctx.fillStyle = '#a9e4ff';
    ctx.fillText(texts.selectHint, width / 2, 318);

    ctx.fillStyle = 'rgba(0,0,0,0.12)';                  // linhas de "TV antiga", igual à tela de título
    for (let y = 0; y < height; y += 4) ctx.fillRect(0, y, width, 2);
  }

  drawBackground(ctx, timeInSeconds) {
    const { width, height } = CONFIG.canvas;
    const background = ctx.createLinearGradient(0, 0, 0, height);
    background.addColorStop(0, '#050b18');              // azul-marinho: combina com o brilho do painel
    background.addColorStop(1, '#10213a');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 50; i++) {
      const twinkle = (Math.sin(timeInSeconds * 2 + i) + 1) / 2;
      ctx.fillStyle = `rgba(200,235,255,${0.15 + 0.5 * twinkle})`;
      ctx.fillRect((i * 97) % width, (i * 53) % 350, 2, 2);
    }
  }

  /** Onde o painel é desenhado no canvas (centralizado), com a escala usada. */
  panelRect() {
    const { width, height } = CONFIG.canvas;
    const scale = CONFIG.characterMenu.panelScale;
    const w = this.panelSize.width * scale, h = this.panelSize.height * scale;
    return { x: Math.round((width - w) / 2), y: Math.round((height - h) / 2), w, h, scale };
  }

  drawPanel(ctx, assets) {
    const { x, y, w, h } = this.panelRect();
    if (assets.isReady('menuPanel')) {
      ctx.drawImage(assets.get('menuPanel'), x, y, w, h);
    } else {                                              // sem a imagem: painel simples
      ctx.fillStyle = '#0b1a26';
      ctx.fillRect(x + 20, y + 40, w - 40, h - 60);
    }
  }

  drawCard(ctx, assets, r, character, focused, timeInSeconds) {
    const texts = LABELS.texts;
    ctx.save();
    ctx.fillStyle = focused ? 'rgba(6, 22, 38, 0.9)' : 'rgba(4, 12, 22, 0.78)';
    ctx.strokeStyle = focused ? '#5fe0ff' : '#3d6f8f';
    ctx.lineWidth = focused ? 3 : 2;
    if (focused) { ctx.shadowColor = '#2ab8ff'; ctx.shadowBlur = 14; }
    ctx.beginPath();
    ctx.roundRect(r.x, r.y, r.w, r.h, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.textAlign = 'center';
    if (character.locked) {
      ctx.fillStyle = 'rgba(150, 210, 240, 0.25)';
      ctx.font = 'bold 56px "Courier New", monospace';
      ctx.fillText('?', r.x + r.w / 2, r.y + 100);
      ctx.font = 'bold 13px "Courier New", monospace';
      ctx.fillStyle = focused ? '#ffd27a' : '#7fa3b8';
      ctx.fillText(texts.comingSoon, r.x + r.w / 2, r.y + r.h - 22);
      return;
    }

    ctx.font = 'bold 17px "Courier New", monospace';
    ctx.fillStyle = focused ? '#ffd27a' : '#9fc9de';
    ctx.fillText(character.name, r.x + r.w / 2, r.y + 24);

    const bob = focused ? Math.round(Math.sin(timeInSeconds * 3) * 2) : 0;
    this.drawPortrait(ctx, assets, character, r.x + r.w / 2, r.y + 112 + bob);
    this.drawStats(ctx, character.settings, r);
  }

  /** Quadro parado do personagem com os pés em (centerX, footY), olhando para a direita. */
  drawPortrait(ctx, assets, character, centerX, footY) {
    if (!assets.isReady(character.image)) return;
    const frame = character.frames[character.portraitFrame];
    const scale = 1.6;
    ctx.save();
    ctx.translate(centerX, footY);
    ctx.scale(-scale, scale);                              // a folha original olha para a esquerda
    ctx.translate(-frame.anchorX, -(frame.height - character.frames.footPadding));
    ctx.drawImage(assets.get(character.image), frame.x, frame.y, frame.width, frame.height, 0, 0, frame.width, frame.height);
    ctx.restore();
  }

  /** Uma linha por atributo: nome, barra (proporcional ao limite em CONFIG.characterMenu.statCaps) e o valor em número. */
  drawStats(ctx, settings, r) {
    const texts = LABELS.texts, caps = CONFIG.characterMenu.statCaps;
    const rows = [
      [texts.statHealth, settings.maxHealth, caps.health],
      [texts.statSpeed, settings.moveSpeed, caps.speed],
      [texts.statDamage, settings.attack.damage, caps.damage],
      [texts.statCharge, settings.chargeShot.damage, caps.charge],   // dano do tiro carregado
    ];
    const number = (n) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
    ctx.font = 'bold 11px "Courier New", monospace';
    rows.forEach(([label, value, cap], i) => {
      const y = r.y + 128 + i * 14;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#9fc9de';
      ctx.fillText(label, r.x + 8, y + 7);
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(r.x + 54, y, 50, 8);
      ctx.fillStyle = '#35c8ff';
      ctx.fillRect(r.x + 54, y, Math.round(50 * Math.max(0, Math.min(1, value / cap))), 8);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(number(value), r.x + r.w - 8, y + 7);
    });
    ctx.textAlign = 'center';
  }
}
