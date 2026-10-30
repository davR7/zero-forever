/* =====================================================================
   BOSS 1: TITAN (tipo "claw", robô de garras)
   Atributos, quadros do sprite e ataque (meteoro de lava) do Titan.
   Acrescenta partes ao CONFIG criado em global.js.
   Estrutura (igual nos 3 bosses): imagens, atributos (CONFIG.bosses.push),
   quadros do sprite e efeito do ataque.
   Descrição dos campos: LEIA-ME.md
   ===================================================================== */

CONFIG.images.clawBoss = 'sprites/boss1_titan.png';
CONFIG.images.meteorAttack = 'sprites/meteor_blast.png';

CONFIG.bosses.push({
  type: 'claw',
  name: 'TITAN',
  healthBarColor: '#e8a020',

  startX: 640,
  scale: 1,
  hitHalfWidth: 68,
  hitHeight: 176,
  maxHealth: 260,
  moveSpeed: 1.8,
  defeatScore: 1000,

  ai: {
    decisionFramesMin: 50, decisionFramesRandom: 70,
    preferredDistance: 300, standStillChance: 0.2,
  },

  attack: {
    style: 'fireSlash',
    damage: 40, speed: 5.5, radius: 16,
    cooldown: 110, range: 520, chancePerFrame: 0.03,
    windupFrames: 28,
    recoveryFrames: 16,
  },
});

CONFIG.titanFrames = {
  cellWidth: 187, cellHeight: 189,
  anchorX: 93.6,
  groundOffsetY: 184,
  idleFrame: 0,
  walkCycle: [0, 1, 2, 1],
  walkAnimationRate: 0.5,
  castFrame: 3,
  muzzle: { x: 54.4, y: 118 },
};

CONFIG.meteorAttackEffect = {
  frameWidth: 98, frameHeight: 68, frameCount: 4,
  anchorX: 59, anchorY: 34,
  introFrames: 6,
  framesPerStep: 6,
  sequence: [1, 2, 3, 2],
  drawScale: 1.0, glowColor: '#ff6a10', glowBlur: 12,
};
