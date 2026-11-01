/* =====================================================================
   CONFIGURAÇÕES DO JOGADOR (ZERO)
   Atributos, tiros, quadros do sprite e efeitos do Zero.
   Acrescenta partes ao CONFIG criado em global.js.
   CONFIG.zeroFrames também é usado pelo SHADOW ZERO (boss2).
   Descrição dos campos: LEIA-ME.md
   ===================================================================== */

CONFIG.images.zero = 'sprites/zero.png';
CONFIG.images.chargeAttack = 'sprites/charge_blast.png';

CONFIG.player = {
  name: 'ZERO',
  startX: 120,
  scale: 1.6,
  maxHealth: 100,
  moveSpeed: 4.5,
  jumpSpeed: 13.5,
  // Pulo duplo: solte e aperte o pulo novamente no ar para dar um segundo impulso.
  // speed = força do 2º pulo (10 = até 1,5x a altura do pulo normal).
  // extraJumps = pulos extras no ar (1 = pulo duplo). ringFrames = duração do efeito visual.
  doubleJump: { speed: 10, extraJumps: 1, ringFrames: 14 },
  healBetweenBosses: 1.0,
  attack: { cooldown: 16, damage: 5, speed: 10, radius: 5, color: '#ffff00', bufferFrames: 14 },
  chargeShot: {
    startDelay: 14,
    chargeFrames: 66,
    damage: 18, speed: 11, radius: 18,
    recoveryFrames: 6,
  },
};

CONFIG.zeroFrames = {
  footPadding: 3,
  idle: { x: 101, y: 2, width: 34, height: 50, anchorX: 16 },
  aiming: { x: 46, y: 52, width: 43, height: 50, anchorX: 27 },
  muzzleFlash: { x: 98, y: 52, width: 56, height: 50, anchorX: 40 },
  // Pulo: 8 quadros numa só linha (y=250), todos com os pés na última linha da célula.
  // Os 7 primeiros acompanham o arco do pulo (subida -> topo -> descida); o 8º é a aterrissagem.
  jump: {
    frameWidth: 48, frameHeight: 56, airFrames: 7, landingFrame: 7,
    frames: [
      { x: 0, y: 250, anchorX: 16.0 },
      { x: 48, y: 250, anchorX: 11.3 },
      { x: 96, y: 250, anchorX: 12.8 },
      { x: 144, y: 250, anchorX: 17.7 },
      { x: 192, y: 250, anchorX: 20.4 },
      { x: 240, y: 250, anchorX: 20.4 },
      { x: 288, y: 250, anchorX: 15.7 },
      { x: 336, y: 250, anchorX: 17.0 },
    ],
  },
  runShoot: {
    frameWidth: 48, frameHeight: 43, anchorX: 21, speedMultiplier: 1.15,
    frames: [
      { x: 2, y: 203 }, { x: 52, y: 203 }, { x: 102, y: 203 }, { x: 152, y: 203 },
      { x: 202, y: 203 }, { x: 252, y: 203 }, { x: 302, y: 203 }, { x: 352, y: 203 },
      { x: 402, y: 203 }, { x: 452, y: 203 },
    ],
  },
  hurt: {
    frameWidth: 48, frameHeight: 43, anchorX: 21,
    frames: [{ x: 2, y: 308 }, { x: 52, y: 308 }],
  },
  run: {
    minSheetHeight: 190, frameWidth: 45, frameHeight: 43, speedMultiplier: 1.15,
    frames: [
      { x: 2, y: 158, anchorX: 21.1 }, { x: 49, y: 158, anchorX: 20.0 },
      { x: 96, y: 158, anchorX: 19.2 }, { x: 143, y: 158, anchorX: 19.4 },
      { x: 190, y: 158, anchorX: 19.5 }, { x: 237, y: 158, anchorX: 20.8 },
      { x: 284, y: 158, anchorX: 20.9 }, { x: 331, y: 158, anchorX: 19.3 },
      { x: 378, y: 158, anchorX: 19.8 }, { x: 425, y: 158, anchorX: 19.6 },
    ],
  },
};

CONFIG.chargeAttackEffect = {
  frameWidth: 96, frameHeight: 64, frameCount: 5,
  anchorX: 68, anchorY: 32,
  introFrames: 6,
  framesPerStep: 4,
  drawScale: 1.6, glowColor: '#40b0ff', glowBlur: 16,
};

CONFIG.chargeEffect = {
  maxSparkles: 10,
  orbitX: 30, orbitY: 46,
  orbitSpeed: 0.07,
  pixel: 2,
  colors: ['#ffffff', '#b8f4ff', '#50a8f8'],
  glowColor: '#40b0ff',
};
