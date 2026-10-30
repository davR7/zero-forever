/* =====================================================================
   BOSS 3: CRYONOX (tipo "ice", gelo)
   Atributos, quadros do sprite e ataque (estilhaços de gelo) do Cryonox.
   Acrescenta partes ao CONFIG criado em global.js.
   Estrutura (igual nos 3 bosses): imagens, atributos (CONFIG.bosses.push),
   quadros do sprite e efeito do ataque.
   Descrição dos campos: LEIA-ME.md
   ===================================================================== */

CONFIG.images.iceBoss = 'sprites/boss3_cryonox.png';
CONFIG.images.iceAttack = 'sprites/ice_shard.png';

CONFIG.bosses.push({
  type: 'ice',
  name: 'CRYONOX',
  healthBarColor: '#3fe0f0',

  startX: 640,
  scale: 1,
  hitHalfWidth: 50,
  hitHeight: 170,
  maxHealth: 320,
  moveSpeed: 1.5,
  defeatScore: 3000,

  ai: {
    decisionFramesMin: 45, decisionFramesRandom: 60,
    preferredDistance: 280, standStillChance: 0.25,
  },

  attack: {
    style: 'iceSlash',
    damage: 22, speed: 6.5, radius: 12,
    cooldown: 110, range: 620, chancePerFrame: 0.035,
    windupFrames: 40,
    recoveryFrames: 24,
    shards: 3,
    spread: 0.3,
  },

  enrage: { below: 0.5, shards: 5, cooldown: 70, windupFrames: 28 },
});

CONFIG.cryonoxFrames = {
  cellWidth: 184, cellHeight: 211,
  anchorX: 98,
  groundOffsetY: 205,
  idleFrame: 0,
  walkCycle: [1],
  walkAnimationRate: 0.5,
  castFrame: 4,
  muzzle: { x: 82, y: 118 },
  windupPoses: [2, 3],
  hover: { pixels: 7, speed: 0.07 },
};

CONFIG.iceAttackEffect = {
  frameWidth: 72, frameHeight: 72, frameCount: 4,
  anchorX: 36, anchorY: 36,
  introFrames: 6,
  framesPerStep: 5,
  sequence: [1, 2, 3],
  drawScale: 0.8, glowColor: '#40e0ff', glowBlur: 14,
};
