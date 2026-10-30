/* Lê o teclado e responde por AÇÕES (ex.: 'jump'), não por teclas.
   As teclas de cada ação ficam em CONFIG.controls (js/config/global.js). */
class InputController {
  constructor(bindings) {
    this.bindings = bindings;
    this.heldKeys = new Set();
    this.pressedThisStep = new Set();
    this.releasedThisStep = new Set();
    const keysThatScrollThePage = ['arrowup', 'arrowdown', ' '];

    window.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      if (!this.heldKeys.has(key)) this.pressedThisStep.add(key);
      this.heldKeys.add(key);
      if (keysThatScrollThePage.includes(key)) event.preventDefault();
    });
    window.addEventListener('keyup', (event) => {
      const key = event.key.toLowerCase();
      if (this.heldKeys.delete(key)) this.releasedThisStep.add(key);
    });
    window.addEventListener('blur', () => this.heldKeys.clear());
  }

  /** A ação está sendo mantida pressionada agora? */
  isActive(action) {
    return this.bindings[action].some((key) => this.heldKeys.has(key));
  }

  /** A ação foi apertada neste passo do jogo (uma vez só)? */
  wasPressed(action) {
    return this.bindings[action].some((key) => this.pressedThisStep.has(key));
  }

  /** A ação foi solta neste passo do jogo (e nenhuma outra tecla dela continua apertada)?
      Perder o foco da janela NÃO conta como soltar. */
  wasReleased(action) {
    return this.bindings[action].some((key) => this.releasedThisStep.has(key)) && !this.isActive(action);
  }

  /** Chamado ao fim de cada passo do jogo. */
  endStep() { this.pressedThisStep.clear(); this.releasedThisStep.clear(); }
}
