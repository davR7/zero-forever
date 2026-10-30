/* =====================================================================
   BOSS 2: SHADOW ZERO (tipo "shadow", Zero sombrio)
   Atributos e ataque roxo do Zero sombrio.
   Os quadros do sprite dele vêm de CONFIG.zeroFrames (player.js).
   Acrescenta partes ao CONFIG criado em global.js.
   Estrutura (igual nos 3 bosses): imagens, atributos (CONFIG.bosses.push),
   quadros do sprite e efeito do ataque.
   Descrição dos campos: LEIA-ME.md
   ===================================================================== */

CONFIG.images.shadowBoss = 'sprites/boss2_shadow_zero.png';
CONFIG.images.energyAttack = 'sprites/energy_blast.png';

CONFIG.bosses.push({
  type: 'shadow',
  name: 'SHADOW ZERO',
  healthBarColor: '#b45cfb',

  startX: 660,
  scale: 2.2,
  hitHalfWidth: 26.18,
  hitHeight: 110,
  maxHealth: 200,
  moveSpeed: 2.3,
  defeatScore: 2000,

  ai: {
    decisionFramesMin: 30, decisionFramesRandom: 50,
    retreatDistance: 200,
  },

  attack: {
    style: 'purpleSlash',
    damage: 20, speed: 7, radius: 16,
    cooldown: 42, range: 800, chancePerFrame: 0.05,
    verticalRange: 200,
  },

  jump: { speed: 15, chance: 0.35 },
});

CONFIG.energyAttackEffect = {
  frameWidth: 72, frameHeight: 72, frameCount: 4,
  anchorX: 36, anchorY: 36,
  introFrames: 6,
  framesPerStep: 5,
  sequence: [1, 2, 3],
  drawScale: 1.2, glowColor: '#b050ff', glowBlur: 14,
};
