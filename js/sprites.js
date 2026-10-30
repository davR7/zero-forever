/* =====================================================================
   DESENHO DOS PERSONAGENS
   Cada "renderer" sabe desenhar um tipo de sprite. Para um personagem
   novo com outra folha de imagem, crie um renderer novo aqui com o
   método draw(ctx, fighter).
   ===================================================================== */

/* Desenha o Zero (jogador) e o Zero sombrio (2º boss): ambos usam a mesma
   organização de quadros, só com cores diferentes. A imagem original olha
   para a ESQUERDA, então espelhamos quando o personagem olha para a direita. */
class ZeroSpriteRenderer {
  constructor(sheetImage) {
    this.sheet = sheetImage;
    this.frames = CONFIG.zeroFrames;
    this.hasRunRow = sheetImage.naturalHeight >= this.frames.run.minSheetHeight;
  }

  draw(ctx, fighter) {
    const shooting = fighter.muzzleFlashTimer > 0;
    const onGround = !fighter.isAirborne;
    ctx.save();
    if (fighter.hitFlashTimer % 4 > 1) ctx.globalAlpha = 0.4;   // pisca ao levar dano

    if (fighter.hurtTimer > 0) this.drawHurtFrame(ctx, fighter);
    else if (shooting && onGround && fighter.isMoving) this.drawRunShootFrame(ctx, fighter);
    else if (!shooting && onGround && fighter.landingTimer <= 0 && fighter.isMoving && this.hasRunRow) this.drawRunFrame(ctx, fighter);
    else if (!shooting && (fighter.isAirborne || fighter.landingTimer > 0)) this.drawJumpFrame(ctx, fighter);
    else this.drawStaticFrame(ctx, fighter, this.staticFrameFor(fighter));
    ctx.restore();
  }

  /** Pose parada: tiro ou em pé (pulo e aterrissagem têm quadros próprios: drawJumpFrame). */
  staticFrameFor(fighter) {
    const frames = this.frames;
    if (fighter.muzzleFlashTimer > 0) return fighter.muzzleFlashTimer > 5 ? frames.muzzleFlash : frames.aiming;
    return frames.idle;
  }

  /** Move a origem para os pés do personagem e espelha conforme a direção. */
  placeOnGround(ctx, fighter, anchorX, anchorY) {
    const scale = fighter.scale;
    ctx.translate(fighter.x, fighter.y);
    ctx.scale(fighter.facing < 0 ? scale : -scale, scale);
    ctx.translate(-anchorX, -anchorY);
  }

  drawStaticFrame(ctx, fighter, frame) {
    this.placeOnGround(ctx, fighter, frame.anchorX, frame.height - this.frames.footPadding);
    ctx.drawImage(this.sheet, frame.x, frame.y, frame.width, frame.height, 0, 0, frame.width, frame.height);
  }

  /** Desenha um quadro de uma lista em que todos têm o mesmo tamanho e os pés na última linha. */
  drawGridFrame(ctx, fighter, set, frame, anchorX = set.anchorX) {
    this.placeOnGround(ctx, fighter, anchorX, set.frameHeight);
    ctx.drawImage(this.sheet, frame.x, frame.y, set.frameWidth, set.frameHeight, 0, 0, set.frameWidth, set.frameHeight);
  }

  /** No ar: o quadro vem de quanto do arco já foi feito (velocidade vertical de -pulo a +pulo). No chão logo após cair: quadro de aterrissagem. */
  drawJumpFrame(ctx, fighter) {
    const jump = this.frames.jump;
    let index = jump.landingFrame;
    if (fighter.isAirborne) {
      const progress = Math.max(0, Math.min(1, (fighter.velocityY + fighter.jumpSpeed) / (2 * fighter.jumpSpeed)));
      index = Math.min(jump.airFrames - 1, Math.floor(progress * jump.airFrames));
    }
    const frame = jump.frames[index];
    this.drawGridFrame(ctx, fighter, jump, frame, frame.anchorX);
  }

  drawRunFrame(ctx, fighter) {
    const run = this.frames.run;
    const frame = run.frames[Math.floor(fighter.animationTime * run.speedMultiplier) % run.frames.length];
    this.drawGridFrame(ctx, fighter, run, frame, frame.anchorX);
  }

  /** Correndo e atirando ao mesmo tempo. */
  drawRunShootFrame(ctx, fighter) {
    const run = this.frames.runShoot;
    const frame = run.frames[Math.floor(fighter.animationTime * run.speedMultiplier) % run.frames.length];
    this.drawGridFrame(ctx, fighter, run, frame);
  }

  /** Levando dano: o 1º quadro no começo e o 2º no fim. */
  drawHurtFrame(ctx, fighter) {
    const hurt = this.frames.hurt;
    const firstHalf = fighter.hurtTimer > CONFIG.hurtPoseFrames / 2;
    this.drawGridFrame(ctx, fighter, hurt, hurt.frames[firstHalf ? 0 : 1]);
  }
}

/* Desenha o robô de garras (1º boss). A imagem original olha para a DIREITA. */
class ClawBossSpriteRenderer {
  constructor(sheetImage) {
    this.sheet = sheetImage;
    this.frames = CONFIG.titanFrames;
  }

  draw(ctx, boss) {
    const frames = this.frames;
    let frameIndex = frames.idleFrame;
    if (boss.isAiming) frameIndex = frames.castFrame;
    else if (boss.isMoving) frameIndex = frames.walkCycle[Math.floor(boss.animationTime * frames.walkAnimationRate) % frames.walkCycle.length];

    ctx.save();
    if (boss.hitFlashTimer % 4 > 1) ctx.globalAlpha = 0.6;
    ctx.translate(boss.x, boss.y);
    ctx.scale(boss.facing > 0 ? 1 : -1, 1);
    ctx.translate(-frames.anchorX, -frames.groundOffsetY);
    ctx.drawImage(this.sheet, frameIndex * frames.cellWidth, 0, frames.cellWidth, frames.cellHeight,
                  0, 0, frames.cellWidth, frames.cellHeight);
    ctx.restore();
  }
}

/* Desenha o Cryonox (3º boss). A imagem original olha para a DIREITA.
   Quadros: parado, se movendo, carga (2 estágios) e disparo. Ele paira
   (sobe e desce só no desenho; a hitbox fica no chão). */
class IceBossSpriteRenderer {
  constructor(sheetImage) {
    this.sheet = sheetImage;
    this.frames = CONFIG.cryonoxFrames;
  }

  /** Escolhe o quadro pelo estado do boss. */
  frameFor(boss) {
    const frames = this.frames;
    if (boss.isCasting) return frames.castFrame;
    if (boss.isCharging) {
      const stages = frames.windupPoses;
      return stages[Math.min(stages.length - 1, Math.floor(boss.chargeProgress * stages.length))];
    }
    if (boss.isMoving) return frames.walkCycle[Math.floor(boss.animationTime * frames.walkAnimationRate) % frames.walkCycle.length];
    return frames.idleFrame;
  }

  draw(ctx, boss) {
    const frames = this.frames;
    const hover = boss.isCasting ? 0 : (Math.sin(boss.hoverTime) + 1) / 2 * frames.hover.pixels;
    const direction = boss.facing > 0 ? 1 : -1;

    ctx.save();
    if (boss.hitFlashTimer % 4 > 1) ctx.globalAlpha = 0.6;
    ctx.translate(boss.x, boss.y - hover);
    ctx.scale(direction, 1);
    ctx.translate(-frames.anchorX, -frames.groundOffsetY);
    ctx.drawImage(this.sheet, this.frameFor(boss) * frames.cellWidth, 0, frames.cellWidth, frames.cellHeight,
                  0, 0, frames.cellWidth, frames.cellHeight);
    ctx.restore();
  }
}
