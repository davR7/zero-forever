/* =====================================================================
   ÁUDIO. Toda a configuração de som fica em AUDIO_CONFIG, neste arquivo.
   - music: um MP3 para cada boss, em audio/music/.
   - sfx:   um WAV para cada efeito, em audio/sfx/.
   Em ambos, cada item tem { file, volume }: o volume final é
   (volume geral da seção) x (volume do item), de 0 a 1.
   Para trocar um som, substitua o arquivo (mesmo nome) ou mude o caminho.
   ===================================================================== */

const AUDIO_CONFIG = {
  /* Músicas. Chave = "type" do boss (campo "type" em js/config/bossN.js) ou "menu" (escolha de personagem). Tocam em loop. */
  music: {
    volume: 0.5,                // volume geral da música
    tracks: {
      claw: { file: 'audio/music/steel_against_stone.mp3', volume: 1 },   // 1º boss: TITAN
      shadow: { file: 'audio/music/steadfast.mp3', volume: 1 },   // 2º boss: SHADOW ZERO
      ice: { file: 'audio/music/victory_at_the_summit.mp3', volume: 1 },   // 3º boss: CRYONOX
      menu: { file: 'audio/music/where_the_hero_rests.mp3', volume: 1 },   // tela de escolha de personagem
    },
  },

  /* Efeitos sonoros. Chave = nome usado no código em audio.play('nome').
     Para criar um novo: coloque o .wav em audio/sfx/ e adicione uma linha em "sounds". */
  sfx: {
    volume: 1,                  // volume geral dos efeitos
    poolSize: 4,                // quantas cópias de cada efeito podem tocar ao mesmo tempo
    sounds: {
      playerShot: { file: 'audio/sfx/player_shot.wav', volume: 1 },   // tiro do Zero
      bossShot: { file: 'audio/sfx/boss_shot.wav', volume: 1 },   // ataque dos bosses (Titan / Shadow Zero)
      iceCharge: { file: 'audio/sfx/ice_charge.wav', volume: 1 },   // Cryonox carregando
      iceShot: { file: 'audio/sfx/ice_shot.wav', volume: 1 },   // Cryonox disparando
      chargeStart: { file: 'audio/sfx/charge_start.wav', volume: 1 },   // Zero começa a carregar
      chargeReady: { file: 'audio/sfx/charge_ready.wav', volume: 1 },   // carga cheia
      chargeShot: { file: 'audio/sfx/charge_shot.wav', volume: 1 },   // disparo carregado
      chargeHit: { file: 'audio/sfx/charge_hit.wav', volume: 1 },   // tiro carregado acerta o boss
      bossHit: { file: 'audio/sfx/boss_hit.wav', volume: 1 },   // tiro normal acerta o boss
      playerHit: { file: 'audio/sfx/player_hit.wav', volume: 1 },   // Zero leva dano
    },
  },
};

class AudioManager {
  constructor() {
    this.muted = false;
    this.tracks = {};               // mp3 já carregados, por tipo de boss
    this.currentMusic = null;       // música tocando agora
    this.sfxPools = {};             // por efeito: { elements: [Audio...], next: índice do próximo a usar }
    this.preloadEffects();
  }

  /** Carrega todos os WAV de uma vez, para o primeiro disparo já sair sem atraso.
      Usa elementos <audio>, que funcionam até abrindo o index.html direto do disco. */
  preloadEffects() {
    const { sounds, poolSize } = AUDIO_CONFIG.sfx;
    for (const [name, sfx] of Object.entries(sounds)) {
      const elements = [];
      for (let i = 0; i < poolSize; i++) {
        const element = new Audio(sfx.file);
        element.preload = 'auto';
        element.addEventListener('error', () => console.warn('Não foi possível carregar o som:', sfx.file));
        elements.push(element);
      }
      this.sfxPools[name] = { elements, next: 0 };
    }
  }

  /** Navegadores só liberam som depois de um clique/tecla. Chame em qualquer interação. */
  unlock() {
    if (this.currentMusic && this.currentMusic.paused) this.currentMusic.play().catch(() => { });
  }

  toggleMute() {
    this.muted = !this.muted;
    this.applyMute();
    return this.muted;
  }

  applyMute() {
    for (const track of Object.values(this.tracks)) track.muted = this.muted;
    for (const pool of Object.values(this.sfxPools)) {
      for (const element of pool.elements) element.muted = this.muted;
    }
  }

  /* ---------- música (arquivos mp3) ---------- */
  /** Toca a música do boss (veja AUDIO_CONFIG.music.tracks), em loop. */
  playMusic(bossType) {
    this.stopMusic();
    const music = AUDIO_CONFIG.music;
    const settings = music.tracks[bossType];
    if (!settings) return;
    if (!this.tracks[bossType]) {
      const track = new Audio(settings.file);
      track.loop = true;
      this.tracks[bossType] = track;
    }
    const track = this.tracks[bossType];
    track.volume = Math.max(0, Math.min(1, music.volume * (settings.volume ?? 1)));
    track.muted = this.muted;
    track.currentTime = 0;
    track.play().catch(() => { });   // o navegador pode bloquear até a primeira interação (unlock tenta de novo)
    this.currentMusic = track;
  }

  stopMusic() {
    if (!this.currentMusic) return;
    this.currentMusic.pause();
    this.currentMusic = null;
  }

  /* ---------- efeitos sonoros (arquivos WAV) ---------- */
  /** Toca um efeito pelo nome (veja AUDIO_CONFIG.sfx.sounds). Várias cópias podem soar juntas (rodízio). */
  play(effectName) {
    const sfx = AUDIO_CONFIG.sfx.sounds[effectName];
    const pool = this.sfxPools[effectName];
    if (!sfx || !pool) return;
    const element = pool.elements[pool.next];
    pool.next = (pool.next + 1) % pool.elements.length;
    element.muted = this.muted;
    element.volume = Math.max(0, Math.min(1, AUDIO_CONFIG.sfx.volume * (sfx.volume ?? 1)));
    element.currentTime = 0;
    element.play().catch(() => { });
  }
}
