/* =====================================================================
   PERSONAGENS E PROJÉTEIS
   Projectile  - tiros (do jogador ou dos bosses)
   Fighter     - base de todo lutador: posição, vida, física, timers
   Player      - o Zero controlado por você
   Boss        - base dos bosses; ClawBoss (1º), ShadowBoss (2º) e IceBoss (3º)
   ===================================================================== */

class Projectile {
  /**
   * owner: 'player' ou 'boss' (quem atirou)
   * style: 'buster' (bolinha amarela), 'chargeSlash' (tiro carregado do Zero), 'purpleSlash' (roxo),
   *        'fireSlash' (meteoro do Titan) ou 'iceSlash' (gelo do Cryonox)
   */
  constructor({ x, y, velocityX, velocityY = 0, damage, radius, owner, style, hitSound = null, hitScore = 0 }) {
    this.x = x;
    this.y = y;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.damage = damage;
    this.radius = radius;
    this.owner = owner;
    this.style = style;
    this.hitSound = hitSound;       // som ao acertar (padrão: o do tipo de dono)
    this.hitScore = hitScore;       // pontos que o jogador ganha ao acertar o boss com este tiro
    this.age = 0;
    this.expired = false;
  }

  update() {
    this.x += this.velocityX;
    this.y += this.velocityY;
    this.age++;
    const { width } = CONFIG.canvas;
    if (this.x < -80 || this.x > width + 80 || this.y > CONFIG.groundY + 30 || this.y < -100) this.expired = true;
  }

  draw(ctx, assets) {
    if (this.style === 'purpleSlash' && assets.isReady('energyAttack')) this.drawSlash(ctx, assets.get('energyAttack'), CONFIG.energyAttackEffect);
    else if (this.style === 'fireSlash' && assets.isReady('meteorAttack')) this.drawSlash(ctx, assets.get('meteorAttack'), CONFIG.meteorAttackEffect);
    else if (this.style === 'chargeSlash' && assets.isReady('chargeAttack')) this.drawSlash(ctx, assets.get('chargeAttack'), CONFIG.chargeAttackEffect);
    else if (this.style === 'iceSlash' && assets.isReady('iceAttack')) this.drawSlash(ctx, assets.get('iceAttack'), CONFIG.iceAttackEffect);
    else this.drawBuster(ctx);
  }

  drawBuster(ctx) {
    const color = this.owner === 'player' ? CONFIG.player.attack.color : CONFIG.energyAttackEffect.glowColor;
    ctx.save();
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /** Animação: quadro 0 (explosão) por um instante, depois o loop (fx.sequence, ou os quadros 1 a N). */
  drawSlash(ctx, image, fx) {
    const { frameWidth, frameHeight } = fx;
    const anchorX = fx.anchorX ?? frameWidth / 2;              // ponto do quadro que fica sobre o projétil
    const anchorY = fx.anchorY ?? frameHeight / 2;
    const step = Math.floor((this.age - fx.introFrames) / fx.framesPerStep);
    let frame;
    if (this.age < fx.introFrames) frame = 0;                          // explosão inicial
    else if (fx.sequence) frame = fx.sequence[step % fx.sequence.length]; // ordem própria (ex.: cresce e volta)
    else frame = 1 + step % (fx.frameCount - 1);                       // quadros 1..N em loop
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(Math.atan2(this.velocityY, this.velocityX));   // aponta para onde está indo
    if (this.velocityX < 0) ctx.scale(1, -1);                 // mantém o desenho "de pé" ao ir para a esquerda
    ctx.scale(fx.drawScale, fx.drawScale);
    ctx.shadowColor = fx.glowColor;
    ctx.shadowBlur = fx.glowBlur;
    ctx.drawImage(image, frame * frameWidth, 0, frameWidth, frameHeight,
                  -anchorX, -anchorY, frameWidth, frameHeight);
    ctx.restore();
  }
}

/* ---------------------------------------------------------------------
   Fighter: tudo que Zero e bosses têm em comum.
   x, y = posição dos PÉS. facing = 1 (direita) ou -1 (esquerda).
   --------------------------------------------------------------------- */
class Fighter {
  constructor({ x, scale, maxHealth, facing, hitHalfWidth, hitHeight }) {
    this.x = x;
    this.y = CONFIG.groundY;
    this.velocityY = 0;
    this.scale = scale;
    this.facing = facing;
    this.maxHealth = maxHealth;
    this.health = maxHealth;
    this.hitHalfWidth = hitHalfWidth;   // área que leva dano (metade da largura)
    this.hitHeight = hitHeight;         // área que leva dano (altura, a partir dos pés)

    this.shotCooldown = 0;              // quadros até poder atirar de novo
    this.muzzleFlashTimer = 0;          // pose de tiro
    this.hurtTimer = 0;                 // pose de dano
    this.showsHurtPose = true;          // false = leva dano sem mudar de pose (bosses)
    this.hitFlashTimer = 0;             // piscando ao levar dano (e protegido de contato)
    this.landingTimer = 0;              // pose de aterrissagem
    this.jumpSpeed = 14;                // velocidade inicial do pulo (define qual quadro do pulo aparece)
    this.isMoving = false;
    this.animationTime = 0;
    this.renderer = null;               // quem desenha este personagem (ver sprites.js)
  }

  get isOnGround() { return this.y >= CONFIG.groundY; }
  get isAirborne() { return this.y < CONFIG.groundY - 1; }
  get isDefeated() { return this.health <= 0; }

  /** Gravidade, limites da tela e contagem regressiva dos timers. */
  applyPhysics() {
    const wasAirborne = this.y < CONFIG.groundY;
    this.velocityY += CONFIG.gravity;
    this.y += this.velocityY;
    if (this.y >= CONFIG.groundY) {
      this.y = CONFIG.groundY;
      this.velocityY = 0;
      if (wasAirborne) this.landingTimer = 7;
    }
    if (this.landingTimer > 0) this.landingTimer--;
    this.x = Math.max(this.hitHalfWidth, Math.min(CONFIG.canvas.width - this.hitHalfWidth, this.x));
    if (this.shotCooldown > 0) this.shotCooldown--;
    if (this.muzzleFlashTimer > 0) this.muzzleFlashTimer--;
    if (this.hurtTimer > 0) this.hurtTimer--;
    if (this.hitFlashTimer > 0) this.hitFlashTimer--;
  }

  takeDamage(amount, flashFrames = CONFIG.hitFlashFramesWhenShot) {
    this.health = Math.max(0, this.health - amount);
    this.hitFlashTimer = flashFrames;
    if (this.showsHurtPose) this.hurtTimer = CONFIG.hurtPoseFrames;
  }

  /** Avança a animação de andar enquanto está se movendo no chão. */
  advanceAnimation() {
    if (this.isMoving && this.isOnGround) this.animationTime += CONFIG.runAnimationSpeed;
  }

  /** Ponto aproximado do "peito", usado para mirar. */
  get chestPosition() {
    return { x: this.x, y: this.y - this.hitHeight * 0.5 };
  }

  draw(ctx) {
    if (this.renderer) this.renderer.draw(ctx, this);
  }
}

/* ---------------------------------------------------------------------
   Player: o Zero controlado pelo teclado.
   --------------------------------------------------------------------- */
class Player extends Fighter {
  constructor() {
    const settings = CONFIG.player;
    super({
      x: settings.startX, scale: settings.scale, maxHealth: settings.maxHealth, facing: 1,
      hitHalfWidth: 34 * settings.scale * 0.35, hitHeight: 50 * settings.scale,
    });
    this.settings = settings;
    this.jumpSpeed = settings.jumpSpeed;
    this.shootHeld = false;         // o botão de tiro estava apertado no passo anterior?
    this.chargeHold = 0;            // quadros seguidos com o botão de tiro apertado
    this.shotBuffer = 0;            // aperto guardado durante o intervalo entre tiros (quadros restantes)
    this.airJumpsUsed = 0;          // pulos extras já usados no ar (zera ao tocar o chão)
    this.doubleJumpRingTimer = 0;   // quadros restantes do anel visual do pulo duplo
    this.doubleJumpRingX = 0;       // onde o anel foi criado (ele fica parado no ar)
    this.doubleJumpRingY = 0;
  }

  /** 0 a 1: quanto da carga já foi feito (0 = sem brilhos, 1 = carga cheia). */
  get chargeProgress() {
    const charge = this.settings.chargeShot;
    return Math.max(0, Math.min(1, (this.chargeHold - charge.startDelay) / charge.chargeFrames));
  }
  get isFullyCharged() { return this.chargeProgress >= 1; }

  update(input, game) {
    const movingLeft = input.isActive('moveLeft');
    const movingRight = input.isActive('moveRight');
    this.isMoving = movingLeft || movingRight;
    this.x += (movingRight ? this.settings.moveSpeed : 0) - (movingLeft ? this.settings.moveSpeed : 0);

    this.updateJumping(input);
    this.updateShooting(input, game);

    // Vira para o lado em que você anda; parado, mantém a última direção.
    if (movingLeft && !movingRight) this.facing = -1;
    else if (movingRight && !movingLeft) this.facing = 1;

    this.applyPhysics();
  }

  /** No chão: pula (segurar a tecla continua pulando de novo ao pousar).
      No ar: um NOVO aperto da tecla dá o pulo duplo (segurar não conta). */
  updateJumping(input) {
    const jump = this.settings.doubleJump;
    if (this.doubleJumpRingTimer > 0) this.doubleJumpRingTimer--;

    if (this.isOnGround) {
      this.airJumpsUsed = 0;
      if (input.isActive('jump')) this.velocityY = -this.settings.jumpSpeed;
      return;
    }

    // Só vale se o impulso realmente ajuda (um aperto duplo rapidíssimo, no início da subida, é ignorado
    // em vez de frear o pulo) e se ainda restam pulos extras.
    const wouldBoost = this.velocityY > -jump.speed;
    if (input.wasPressed('jump') && this.airJumpsUsed < jump.extraJumps && wouldBoost) {
      this.velocityY = -jump.speed;
      this.airJumpsUsed++;
      this.doubleJumpRingTimer = jump.ringFrames;
      this.doubleJumpRingX = this.x;
      this.doubleJumpRingY = this.y;
    }
  }

  /** Apertar = tiro normal. Segurar = carregar. Soltar com a carga cheia = tiro forte. */
  updateShooting(input, game) {
    const holding = input.isActive('shoot');
    const pressed = input.wasPressed('shoot') || (holding && !this.shootHeld);
    if (pressed && !this.shoot(game)) this.shotBuffer = this.settings.attack.bufferFrames;   // ainda no intervalo: guarda o aperto
    else if (this.shotBuffer > 0) {                                                       // aperto guardado: atira assim que puder
      this.shotBuffer--;
      if (this.shoot(game)) this.shotBuffer = 0;
    }

    if (holding) {
      this.advanceCharge(game);
    } else {
      if (this.shootHeld && input.wasReleased('shoot') && this.isFullyCharged) this.fireChargedShot(game);
      this.chargeHold = 0;          // soltou (ou perdeu o foco): a carga some
    }
    this.shootHeld = holding;
  }

  advanceCharge(game) {
    const charge = this.settings.chargeShot;
    this.chargeHold++;
    if (this.chargeHold === charge.startDelay + 1) game.audio.play('chargeStart');
    if (this.chargeHold === charge.startDelay + charge.chargeFrames) game.audio.play('chargeReady');
  }

  /** Ponto de onde os tiros saem. */
  get muzzlePosition() {
    return { x: this.x + this.facing * 28 * this.scale, y: this.y - this.hitHeight * 0.55 };
  }

  /** Dá um tiro normal. Devolve false se ainda estava no intervalo entre tiros. */
  shoot(game) {
    if (this.shotCooldown > 0) return false;
    const attack = this.settings.attack;
    const muzzle = this.muzzlePosition;
    this.shotCooldown = attack.cooldown;
    this.muzzleFlashTimer = CONFIG.muzzleFlashFrames;
    game.spawnProjectile(new Projectile({
      x: muzzle.x, y: muzzle.y,
      velocityX: this.facing * attack.speed,
      damage: attack.damage, radius: attack.radius, owner: 'player', style: 'buster',
      hitScore: CONFIG.score.normalHit,
    }), 'playerShot');
    return true;
  }

  fireChargedShot(game) {
    const charge = this.settings.chargeShot;
    const muzzle = this.muzzlePosition;
    this.shotCooldown = charge.recoveryFrames;            // pequena pausa antes do próximo tiro normal
    this.muzzleFlashTimer = CONFIG.muzzleFlashFrames;
    game.spawnProjectile(new Projectile({
      x: muzzle.x, y: muzzle.y,
      velocityX: this.facing * charge.speed,
      damage: charge.damage, radius: charge.radius, owner: 'player',
      style: 'chargeSlash', hitSound: 'chargeHit', hitScore: CONFIG.score.chargedHit,
    }), 'chargeShot');
  }

  /** Recupera uma fração da vida máxima (1 = vida cheia). */
  heal(fraction) {
    this.health = Math.min(this.maxHealth, this.health + this.maxHealth * fraction);
  }

  /** Volta para a posição inicial entre as lutas. */
  resetPosition() {
    this.x = this.settings.startX;
    this.y = CONFIG.groundY;
    this.velocityY = 0;
    this.facing = 1;
    this.isMoving = false;
    this.shootHeld = false;
    this.chargeHold = 0;
    this.shotBuffer = 0;
    this.airJumpsUsed = 0;
    this.doubleJumpRingTimer = 0;
  }

  /* ----------------------------- desenho ----------------------------- */
  draw(ctx) {
    const progress = this.chargeProgress;
    if (this.doubleJumpRingTimer > 0) this.drawDoubleJumpRing(ctx);
    if (progress > 0) this.drawChargeGlow(ctx, progress);     // luz atrás do corpo
    super.draw(ctx);
    if (progress > 0) this.drawChargeSparkles(ctx, progress); // brilhos à frente
  }

  /** Anel que se abre e some sob os pés no instante do pulo duplo (confirma que o 2º pulo saiu). */
  drawDoubleJumpRing(ctx) {
    const total = this.settings.doubleJump.ringFrames;
    const t = 1 - this.doubleJumpRingTimer / total;           // 0 -> 1
    ctx.save();
    ctx.globalAlpha = 0.7 * (1 - t);
    ctx.strokeStyle = '#b8f4ff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#40b0ff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(this.doubleJumpRingX, this.doubleJumpRingY, 10 + 26 * t, 3 + 7 * t, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  /** Halo suave ao redor do corpo; pulsa quando a carga está cheia. */
  drawChargeGlow(ctx, progress) {
    const pulse = progress >= 1 ? 0.5 + 0.5 * Math.sin(this.chargeHold * 0.35) : 0;
    const alpha = 0.1 + 0.18 * progress + 0.15 * pulse;
    const center = this.chestPosition;
    const radius = 44 + 14 * progress;
    const gradient = ctx.createRadialGradient(center.x, center.y, 4, center.x, center.y, radius);
    gradient.addColorStop(0, `rgba(160,230,255,${alpha})`);
    gradient.addColorStop(1, 'rgba(64,176,255,0)');
    ctx.save();
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /** Brilhos em cruz girando ao redor do peito. Um novo brilho surge a cada 1/maxSparkles da carga. */
  drawChargeSparkles(ctx, progress) {
    const fx = CONFIG.chargeEffect;
    const full = progress >= 1;
    const count = Math.max(1, Math.ceil(progress * fx.maxSparkles));
    const time = this.chargeHold;
    const center = this.chestPosition;
    const unit = fx.pixel;

    ctx.save();
    ctx.shadowColor = fx.glowColor;
    ctx.shadowBlur = full ? 12 : 8;
    for (let i = 0; i < count; i++) {
      const angle = (i / fx.maxSparkles) * Math.PI * 2 + time * fx.orbitSpeed * (full ? 1.8 : 1);
      const radiusFactor = 0.75 + 0.25 * (((i * 37) % 10) / 10) + 0.08 * Math.sin(time * 0.15 + i);
      const px = Math.round((center.x + Math.cos(angle) * fx.orbitX * radiusFactor) / unit) * unit;
      const py = Math.round((center.y + Math.sin(angle) * fx.orbitY * radiusFactor) / unit) * unit;

      const twinkle = Math.sin(time * 0.25 + i * 1.9);               // pisca: o braço da cruz cresce e encolhe
      const arm = (twinkle > 0.6 ? 3 : twinkle > 0 ? 2 : 1) + (full ? 1 : 0);
      ctx.fillStyle = full && twinkle > 0 ? '#ffffff' : fx.colors[(i + Math.floor(time / 6)) % fx.colors.length];
      ctx.fillRect(px, py, unit, unit);                                          // centro
      ctx.fillRect(px - arm * unit, py, arm * unit, unit);                       // esquerda
      ctx.fillRect(px + unit, py, arm * unit, unit);                             // direita
      ctx.fillRect(px, py - arm * unit, unit, arm * unit);                       // cima
      ctx.fillRect(px, py + unit, unit, arm * unit);                             // baixo
    }
    ctx.restore();
  }
}

/* ---------------------------------------------------------------------
   Boss: base dos bosses. Cada boss implementa update(player, game) e
   createRenderer(assets).
   --------------------------------------------------------------------- */
class Boss extends Fighter {
  constructor(definition) {
    super({
      x: definition.startX, maxHealth: definition.maxHealth, facing: -1,
      scale: definition.scale, hitHalfWidth: definition.hitHalfWidth, hitHeight: definition.hitHeight,
    });
    this.definition = definition;
    if (definition.jump) this.jumpSpeed = definition.jump.speed;
    this.name = definition.name;
    this.healthBarColor = definition.healthBarColor;
    this.showsHurtPose = false;     // boss não esboça reação ao levar dano (só pisca)
    this.aiTimer = 0;               // quadros até a próxima decisão
    this.moveDirection = -1;        // -1 esquerda, 1 direita, 0 parado
  }

  update(player, game) { throw new Error('Boss.update() precisa ser implementado'); }
  createRenderer(assets) { throw new Error('Boss.createRenderer() precisa ser implementado'); }

  directionToward(player) { return player.x > this.x ? 1 : -1; }

  /** Inverte o sentido ao chegar nas bordas da tela. */
  bounceOffScreenEdges() {
    const margin = this.hitHalfWidth + 2;
    if (this.x <= margin) this.moveDirection = 1;
    else if (this.x >= CONFIG.canvas.width - margin) this.moveDirection = -1;
  }
}

/* 1º boss: robô de garras. Anda devagar e, de tempos em tempos, para,
   levanta o canhão e dispara um ataque roxo MIRADO no jogador. */
class ClawBoss extends Boss {
  constructor(definition) {
    super(definition);
    this.state = 'walking';         // 'walking' ou 'aiming'
    this.aimTimer = 0;
  }

  get isAiming() { return this.state === 'aiming'; }

  createRenderer(assets) { return new ClawBossSpriteRenderer(assets.get('clawBoss')); }

  update(player, game) {
    const toward = this.directionToward(player);
    if (this.isAiming) this.updateAiming(player, game, toward);
    else this.updateWalking(player, toward);
    this.applyPhysics();
  }

  updateWalking(player, toward) {
    const ai = this.definition.ai;
    const attack = this.definition.attack;
    const distance = Math.abs(player.x - this.x);

    if (--this.aiTimer <= 0) {
      this.aiTimer = ai.decisionFramesMin + Math.floor(Math.random() * ai.decisionFramesRandom);
      if (distance > ai.preferredDistance + 80) this.moveDirection = toward;
      else if (distance < ai.preferredDistance - 100) this.moveDirection = -toward;
      else if (Math.random() < ai.standStillChance) this.moveDirection = 0;
      else this.moveDirection = Math.random() < 0.5 ? toward : -toward;
    }
    this.bounceOffScreenEdges();

    this.isMoving = this.moveDirection !== 0;
    this.x += this.moveDirection * this.definition.moveSpeed;
    this.facing = this.isMoving ? this.moveDirection : toward;

    if (this.shotCooldown <= 0 && distance < attack.range && Math.random() < attack.chancePerFrame) {
      this.state = 'aiming';
      this.aimTimer = 0;
    }
  }

  updateAiming(player, game, toward) {
    const attack = this.definition.attack;
    this.isMoving = false;
    this.facing = toward;           // sempre de frente para o jogador ao mirar
    this.aimTimer++;
    if (this.aimTimer === attack.windupFrames) this.fireAimedShot(player, game);
    if (this.aimTimer >= attack.windupFrames + attack.recoveryFrames) {
      this.state = 'walking';
      this.shotCooldown = attack.cooldown;
    }
  }

  /** Dispara da ponta do canhão em direção ao peito do jogador. */
  fireAimedShot(player, game) {
    const attack = this.definition.attack;
    const muzzle = CONFIG.titanFrames.muzzle;
    const startX = this.x + this.facing * muzzle.x;
    const startY = this.y - muzzle.y;
    const target = player.chestPosition;
    const dx = target.x - startX;
    const dy = target.y - startY;
    const length = Math.hypot(dx, dy) || 1;
    game.spawnProjectile(new Projectile({
      x: startX, y: startY,
      velocityX: attack.speed * dx / length, velocityY: attack.speed * dy / length,
      damage: attack.damage, radius: attack.radius, owner: 'boss', style: attack.style,
    }), 'bossShot');
  }
}

/* 2º boss: Zero sombrio. Anda, pula, foge quando você chega perto e
   atira o ataque roxo na horizontal. */
class ShadowBoss extends Boss {
  createRenderer(assets) { return new ZeroSpriteRenderer(assets.get('shadowBoss')); }

  update(player, game) {
    const ai = this.definition.ai;
    const attack = this.definition.attack;
    const toward = this.directionToward(player);

    if (--this.aiTimer <= 0) {
      this.aiTimer = ai.decisionFramesMin + Math.floor(Math.random() * ai.decisionFramesRandom);
      this.moveDirection = Math.random() < 0.5 ? -1 : 1;
      if (Math.abs(this.x - player.x) < ai.retreatDistance) this.moveDirection = -toward;   // foge de perto
      const jump = this.definition.jump;
      if (Math.random() < jump.chance && this.isOnGround) this.velocityY = -jump.speed;
    }
    this.bounceOffScreenEdges();

    this.isMoving = true;
    this.x += this.moveDirection * this.definition.moveSpeed;
    this.facing = this.moveDirection;                 // olha para onde anda

    const closeEnoughVertically = Math.abs(this.y - player.y) < attack.verticalRange;
    const closeEnoughHorizontally = Math.abs(this.x - player.x) < attack.range;
    if (closeEnoughVertically && closeEnoughHorizontally && Math.random() < attack.chancePerFrame) {
      this.facing = toward;                           // vira para o jogador para atirar
      this.shoot(game, toward);
    }
    if (this.muzzleFlashTimer > 0) this.facing = toward;

    this.applyPhysics();
  }

  shoot(game, direction) {
    if (this.shotCooldown > 0) return;
    const attack = this.definition.attack;
    this.shotCooldown = attack.cooldown;
    this.muzzleFlashTimer = CONFIG.muzzleFlashFrames;
    game.spawnProjectile(new Projectile({
      x: this.x + direction * 28 * this.scale,
      y: this.y - this.hitHeight * 0.55,
      velocityX: direction * attack.speed,
      damage: attack.damage, radius: attack.radius, owner: 'boss', style: attack.style,
    }), 'bossShot');
  }
}

/* 3º boss: Cryonox (tipo gelo). Paira devagar mantendo distância. De tempos
   em tempos PARA e carrega o cristal do peito (aviso), depois estica o braço
   e dispara um leque de estilhaços de gelo mirados no jogador. Abaixo da
   metade da vida entra em fúria: mais estilhaços, carga mais rápida. */
class IceBoss extends Boss {
  constructor(definition) {
    super(definition);
    this.state = 'walking';         // 'walking', 'charging' ou 'casting'
    this.stateTimer = 0;
    this.hoverTime = 0;             // anima o sobe-e-desce
  }

  get isCharging() { return this.state === 'charging'; }
  get isCasting() { return this.state === 'casting'; }
  get isEnraged() { return this.health <= this.maxHealth * this.definition.enrage.below; }

  /** 0 a 1: quanto da carga já foi feito (usado no brilho do peito). */
  get chargeProgress() {
    return this.isCharging ? this.stateTimer / this.currentChargeFrames : 0;
  }
  get currentChargeFrames() {
    const { attack, enrage } = this.definition;
    return this.isEnraged ? enrage.windupFrames : attack.windupFrames;
  }

  createRenderer(assets) { return new IceBossSpriteRenderer(assets.get('iceBoss')); }

  update(player, game) {
    const toward = this.directionToward(player);
    this.hoverTime += CONFIG.cryonoxFrames.hover.speed;
    if (this.isCharging) this.updateCharging(toward, game);
    else if (this.isCasting) this.updateCasting(player, game, toward);
    else this.updateWalking(player, toward, game);
    this.applyPhysics();
  }

  updateWalking(player, toward, game) {
    const ai = this.definition.ai;
    const attack = this.definition.attack;
    const distance = Math.abs(player.x - this.x);

    if (--this.aiTimer <= 0) {
      this.aiTimer = ai.decisionFramesMin + Math.floor(Math.random() * ai.decisionFramesRandom);
      if (distance > ai.preferredDistance + 80) this.moveDirection = toward;
      else if (distance < ai.preferredDistance - 100) this.moveDirection = -toward;
      else if (Math.random() < ai.standStillChance) this.moveDirection = 0;
      else this.moveDirection = Math.random() < 0.5 ? toward : -toward;
    }
    this.bounceOffScreenEdges();

    this.isMoving = this.moveDirection !== 0;
    this.x += this.moveDirection * this.definition.moveSpeed;
    this.facing = this.isMoving ? this.moveDirection : toward;

    if (this.shotCooldown <= 0 && distance < attack.range && Math.random() < attack.chancePerFrame) {
      this.state = 'charging';
      this.stateTimer = 0;
      game.audio.play('iceCharge');
    }
  }

  updateCharging(toward, game) {
    this.isMoving = false;
    this.facing = toward;
    this.stateTimer++;
    if (this.stateTimer >= this.currentChargeFrames) {
      this.state = 'casting';
      this.stateTimer = 0;
    }
  }

  updateCasting(player, game, toward) {
    const attack = this.definition.attack;
    this.isMoving = false;
    this.facing = toward;
    if (this.stateTimer === 0) this.fireShardFan(player, game);
    this.stateTimer++;
    if (this.stateTimer >= attack.recoveryFrames) {
      this.state = 'walking';
      this.shotCooldown = this.isEnraged ? this.definition.enrage.cooldown : attack.cooldown;
    }
  }

  /** Leque de estilhaços saindo da mão, centrado no peito do jogador. */
  fireShardFan(player, game) {
    const attack = this.definition.attack;
    const muzzle = CONFIG.cryonoxFrames.muzzle;
    const startX = this.x + this.facing * muzzle.x;
    const startY = this.y - muzzle.y;
    const target = player.chestPosition;
    const baseAngle = Math.atan2(target.y - startY, target.x - startX);
    const count = this.isEnraged ? this.definition.enrage.shards : attack.shards;
    for (let i = 0; i < count; i++) {
      const angle = baseAngle + (i - (count - 1) / 2) * attack.spread;
      game.spawnProjectile(new Projectile({
        x: startX, y: startY,
        velocityX: attack.speed * Math.cos(angle), velocityY: attack.speed * Math.sin(angle),
        damage: attack.damage, radius: attack.radius, owner: 'boss', style: attack.style,
      }), i === 0 ? 'iceShot' : null);
    }
  }
}

/* Registro dos tipos de boss: o campo "type" em CONFIG.bosses (js/config/boss1.js, boss2.js, boss3.js...) escolhe a classe. */
const BOSS_TYPES = { claw: ClawBoss, shadow: ShadowBoss, ice: IceBoss };

function createBoss(definition) {
  const BossClass = BOSS_TYPES[definition.type];
  if (!BossClass) throw new Error('Tipo de boss desconhecido: ' + definition.type);
  return new BossClass(definition);
}
