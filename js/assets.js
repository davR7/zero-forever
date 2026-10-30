/* Carrega e guarda as imagens do jogo. */
class Assets {
  constructor(imagePaths) {
    this.imagePaths = imagePaths;
    this.images = {};
  }

  /** Carrega todas as imagens. Uma imagem com erro não trava o jogo. */
  load() {
    const loaders = Object.entries(this.imagePaths).map(([name, path]) => new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve();
      image.onerror = () => { console.warn('Não foi possível carregar a imagem:', path); resolve(); };
      image.src = path;
      this.images[name] = image;
    }));
    return Promise.all(loaders);
  }

  get(name) { return this.images[name]; }

  isReady(name) {
    const image = this.images[name];
    return Boolean(image && image.complete && image.naturalWidth > 0);
  }
}
