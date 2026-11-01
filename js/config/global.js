/* =====================================================================
   CONFIGURAÇÕES GLOBAIS
   Tudo que vale para o jogo inteiro (tela, física, teclas, regras comuns).
   Este arquivo CRIA o objeto CONFIG. Os arquivos player.js, boss1.js, boss2.js
   e boss3.js (mesma pasta) acrescentam as partes de cada personagem a ele,
   por isso este arquivo precisa ser carregado ANTES dos outros.
   Descrição dos campos: LEIA-ME.md
   ===================================================================== */
const CONFIG = {
  canvas: { width: 800, height: 450 },
  groundY: 390,
  gravity: 0.7,
  stepsPerSecond: 60,

  controls: {
    moveLeft: ['arrowleft', 'a'],
    moveRight: ['arrowright', 'd'],
    jump: ['arrowup', 'w', ' '],
    shoot: ['j', 'x', 'z'],
    confirm: ['enter', ' '],
    restart: ['r'],
    back: ['escape'],
    toggleMute: ['m'],
  },

  images: {
    titleHelmet: 'imgs/helmet.png',
  },

  score: { normalHit: 10, chargedHit: 50, perfectVictory: 500 },

  contactDamage: { amount: 4, invulnerableFrames: 30, knockbackDistance: 30 },
  hitFlashFramesWhenShot: 8,
  muzzleFlashFrames: 10,
  hurtPoseFrames: 12,
  runAnimationSpeed: 0.28,
  overlayInputDelayFrames: 45,

  bosses: [],
};
