/* =====================================================================
   PERSONAGENS JOGÁVEIS (tela de escolha de personagem)
   Cada item de CONFIG.characters vira um cartão no menu. Cartões com
   locked: true aparecem como "EM BREVE" e não podem ser escolhidos.
   Precisa ser carregado DEPOIS de player.js (usa CONFIG.player e zeroFrames).

   Para adicionar um personagem:
   1. Coloque o sprite em sprites/ e registre em CONFIG.images (ex.: CONFIG.images.hero = '...').
   2. Crie os atributos dele (como CONFIG.player em player.js) e, se o sprite tiver outra
      organização de quadros, uma classe de desenho nova em js/sprites.js.
   3. Troque um item "locked" por ele (campos abaixo) e registre a classe de desenho em
      CHARACTER_RENDERERS (js/game.js).

   Campos:
     id            nome interno
     name          nome mostrado no cartão
     settings      atributos de luta (vida, velocidade, tiros, pulo...), formato de CONFIG.player
     image         chave em CONFIG.images com a folha de sprites
     renderer      nome da classe que desenha o personagem (veja CHARACTER_RENDERERS)
     frames        quadros do sprite (CONFIG.zeroFrames etc.)
     portraitFrame qual quadro de "frames" aparece no cartão
   ===================================================================== */

CONFIG.images.menuPanel = 'imgs/menu-painel.png';

CONFIG.characters = [
  {
    id: 'zero', name: 'ZERO',
    settings: CONFIG.player,
    image: 'zero', renderer: 'ZeroSpriteRenderer',
    frames: CONFIG.zeroFrames, portraitFrame: 'idle',
  },
  { id: 'slot2', locked: true },
  { id: 'slot3', locked: true },
];

CONFIG.characterMenu = {
  panelScale: 1.1,                                      // tamanho do painel no canvas (542x388 original)
  statCaps: { health: 150, speed: 7, damage: 10, charge: 50 },      // valor que enche a barra de cada atributo
};
