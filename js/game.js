/* =====================================================================
   GAME: controla o fluxo do jogo (telas), o laço principal e as colisões.

   Estados:
     loading      -> carregando as imagens
     title        -> tela inicial
     playing      -> luta em andamento
     bossDefeated -> um boss caiu, falta(m) outro(s)
     gameOver     -> o jogador perdeu
     victory      -> todos os bosses derrotados
   ===================================================================== */
class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.canvas.width = CONFIG.canvas.width;
    this.canvas.height = CONFIG.canvas.height;
    this.ctx = this.canvas.getContext('2d');
    this.muteButton = document.getElementById('muteButton');

    this.assets = new Assets(CONFIG.images);
    this.input = new InputController(CONFIG.controls);
    this.audio = new AudioManager();
    this.stage = new Stage();
    this.hud = new Hud();
    this.titleScreen = new TitleScreen();
    this.overlay = new MessageOverlay();

    this.state = 'loading';
    this.framesInState = 0;
    this.player = null;
    this.boss = null;
    this.bossIndex = 0;
    this.projectiles = [];

    this.score = 0;
    this.tookDamageThisFight = false;   // false = ainda dá para a vitória perfeita
    this.fightResult = null;            // pontos da luta que acabou (para a tela de mensagem)

    this.lastTimestamp = 0;
    this.accumulator = 0;
  }

  async start() {
    this.bindEvents();
    requestAnimationFrame((time) => this.frame(time));
    await this.assets.load();
    this.setState('title');
  }

  bindEvents() {
    const unlockAudio = () => this.audio.unlock();
    window.addEventListener('keydown', unlockAudio);
    window.addEventListener('pointerdown', unlockAudio);
    this.canvas.addEventListener('pointerdown', () => this.handleCanvasPress());
    this.muteButton.addEventListener('click', () => { this.audio.unlock(); this.toggleMute(); });
  }

  setState(newState) {
    this.state = newState;
    this.framesInState = 0;
  }

  get hasInputDelayPassed() { return this.framesInState > CONFIG.overlayInputDelayFrames; }
  get bossNumber() { return this.bossIndex + 1; }
  get isLastBoss() { return this.bossIndex >= CONFIG.bosses.length - 1; }

  toggleMute() {
    const muted = this.audio.toggleMute();
    this.muteButton.textContent = muted ? '🔇' : '🔊';
  }

  /* ----------------------------- fluxo ----------------------------- */
  startNewRun() {
    this.player = new Player();
    this.player.renderer = new ZeroSpriteRenderer(this.assets.get('zero'));
    this.bossIndex = 0;
    this.score = 0;
    this.beginBossFight();
  }

  beginBossFight() {
    this.boss = createBoss(CONFIG.bosses[this.bossIndex]);
    this.boss.renderer = this.boss.createRenderer(this.assets);
    this.projectiles = [];
    this.tookDamageThisFight = false;
    this.fightResult = null;
    this.player.resetPosition();
    this.audio.playMusic(CONFIG.bosses[this.bossIndex].type);   // música do boss
    this.setState('playing');
  }

  startNextBoss() {
    this.bossIndex++;
    this.player.heal(CONFIG.player.healBetweenBosses);
    this.beginBossFight();
  }

  handleCanvasPress() {
    if (this.state === 'title') this.startNewRun();
    else if (this.state === 'bossDefeated' && this.hasInputDelayPassed) this.startNextBoss();
    else if ((this.state === 'gameOver' || this.state === 'victory') && this.hasInputDelayPassed) this.startNewRun();
  }

  /* ----------------------------- atualização ----------------------------- */
  update() {
    this.framesInState++;
    if (this.input.wasPressed('toggleMute')) this.toggleMute();

    switch (this.state) {
      case 'title':
        if (this.input.wasPressed('confirm')) this.startNewRun();
        break;
      case 'playing':
        this.updateBattle();
        break;
      case 'bossDefeated':
        if (this.hasInputDelayPassed && this.input.wasPressed('confirm')) this.startNextBoss();
        break;
      case 'gameOver':
      case 'victory':
        if (this.input.wasPressed('restart') || (this.hasInputDelayPassed && this.input.wasPressed('confirm'))) this.startNewRun();
        break;
    }
  }

  updateBattle() {
    this.player.update(this.input, this);
    this.boss.update(this.player, this);
    this.player.advanceAnimation();
    this.boss.advanceAnimation();
    this.updateProjectiles();
    this.checkContactDamage();
    this.checkBattleEnd();
  }

  spawnProjectile(projectile, soundName) {
    this.projectiles.push(projectile);
    if (soundName) this.audio.play(soundName);
  }

  updateProjectiles() {
    for (const projectile of this.projectiles) {
      projectile.update();
      const target = projectile.owner === 'player' ? this.boss : this.player;
      if (this.projectileHitsTarget(projectile, target)) {
        target.takeDamage(projectile.damage);
        projectile.expired = true;
        if (projectile.owner === 'player') this.score += projectile.hitScore;
        else this.tookDamageThisFight = true;
        this.audio.play(projectile.owner === 'player' ? (projectile.hitSound || 'bossHit') : 'playerHit');
      }
    }
    this.projectiles = this.projectiles.filter((projectile) => !projectile.expired);
  }

  projectileHitsTarget(projectile, target) {
    return Math.abs(projectile.x - target.x) < target.hitHalfWidth + projectile.radius
      && projectile.y > target.y - target.hitHeight
      && projectile.y < target.y;
  }

  /** Encostar no boss tira vida do jogador e o empurra para longe. */
  checkContactDamage() {
    const player = this.player;
    const boss = this.boss;
    const touching = Math.abs(player.x - boss.x) < player.hitHalfWidth + boss.hitHalfWidth
      && player.y > boss.y - boss.hitHeight;
    if (touching && player.hitFlashTimer === 0) {
      const contact = CONFIG.contactDamage;
      player.takeDamage(contact.amount, contact.invulnerableFrames);
      this.tookDamageThisFight = true;
      player.x += (player.x >= boss.x ? 1 : -1) * contact.knockbackDistance;
      this.audio.play('playerHit');
    }
  }

  checkBattleEnd() {
    if (this.boss.isDefeated) {
      this.awardBossDefeat();
      this.setState(this.isLastBoss ? 'victory' : 'bossDefeated');
    }
    else if (this.player.isDefeated) this.setState('gameOver');
    else return;
    this.audio.stopMusic();         // luta terminou
  }

  /** Soma os pontos do boss derrotado e, sem ter levado dano na luta, o bônus de vitória perfeita. */
  awardBossDefeat() {
    const bossPoints = this.boss.definition.defeatScore;
    const perfectPoints = this.tookDamageThisFight ? 0 : CONFIG.score.perfectVictory;
    this.score += bossPoints + perfectPoints;
    this.fightResult = { bossPoints, perfectPoints };
  }

  /** Linhas de pontuação mostradas na tela de mensagem do fim da luta. */
  get scoreSummaryLines() {
    const texts = LABELS.texts;
    const lines = [];
    if (this.fightResult) {
      lines.push({ text: texts.bossPoints(this.fightResult.bossPoints) });
      if (this.fightResult.perfectPoints > 0) lines.push({ text: texts.perfectVictory(this.fightResult.perfectPoints), color: '#ffd700' });
    }
    lines.push({ text: `${texts.score} ${this.score}`, color: '#7fe0ff' });
    return lines;
  }

  /* ----------------------------- desenho ----------------------------- */
  draw(timeInSeconds) {
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;

    if (this.state === 'loading') {
      ctx.fillStyle = '#0a0a18';
      ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 20px "Courier New", monospace';
      ctx.fillText(LABELS.texts.loading, CONFIG.canvas.width / 2, CONFIG.canvas.height / 2);
      return;
    }
    if (this.state === 'title') {
      this.titleScreen.draw(ctx, this.assets, timeInSeconds);
      return;
    }

    this.drawBattleScene(ctx);
    const texts = LABELS.texts;

    const summary = this.scoreSummaryLines;
    if (this.state === 'bossDefeated') this.overlay.draw(ctx, texts.bossDefeated(this.boss.name), texts.nextBossHint, summary);
    else if (this.state === 'gameOver') this.overlay.draw(ctx, texts.cpuWon(this.boss.name), texts.restartHint, summary);
    else if (this.state === 'victory') this.overlay.draw(ctx, texts.playerWon, texts.restartHint, summary);
  }

  drawBattleScene(ctx) {
    this.stage.draw(ctx);
    this.boss.draw(ctx);
    this.player.draw(ctx);
    for (const projectile of this.projectiles) projectile.draw(ctx, this.assets);
    this.hud.draw(ctx, this.player, this.boss, this.bossNumber, this.score);
  }

  /* ----------------------------- laço principal ----------------------------- */
  /** Roda a lógica em passos fixos (60 por segundo) e desenha a cada quadro da tela. */
  frame(timestamp) {
    if (!this.lastTimestamp) this.lastTimestamp = timestamp;
    this.accumulator += Math.min(timestamp - this.lastTimestamp, 100);
    this.lastTimestamp = timestamp;

    const stepDuration = 1000 / CONFIG.stepsPerSecond;
    while (this.accumulator >= stepDuration) {
      this.update();
      this.input.endStep();
      this.accumulator -= stepDuration;
    }
    this.draw(timestamp / 1000);
    requestAnimationFrame((time) => this.frame(time));
  }
}

const game = new Game();
game.start();
