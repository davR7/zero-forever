# 📌 Zero Forever

Zero Forever é um jogo 2D de luta contra chefes em que você enfrenta três bosses em sequência, cada um com seu próprio estilo de combate.

Cada acerto vale pontos (o tiro carregado vale mais), cada boss derrotado soma ao score, e vencer uma luta sem tomar dano rende o bônus de vitória perfeita.

Feito com HTML5 Canvas e JavaScript puro, sem frameworks e sem servidor: é só abrir o index.html no navegador.

## Versões

**Versão 1.0.0** · primeira versão completa, com 3 bosses.

## Como foi feito
O jogo foi produzido com auxílio de inteligência artificial:

| Parte | Ferramenta |
|---|---|
| Código | Construído com a ajuda do Claude (Anthropic) |
| Sprites | Criados com o Gemini (Google), exceto o sprite do Zero (ver "Aviso") |
| Músicas e efeitos sonoros | Criados com o Gemini (Google) |

## Aviso
Zero Forever é um projeto de estudo, feito sem fins lucrativos. Não tem ligação com a Capcom e não é patrocinado nem aprovado por ela.

O personagem Zero (Mega Man X) é propriedade da Capcom Co., Ltd. O sprite de Zero foi baixado da internet e é usado aqui apenas para fins educacionais.

## Como jogar
Derrote os 3 bosses em sequência. Você recupera a vida ao derrotar cada um.

| Ação  | Teclas |
|---|----|
| Mover  | ← → ou A D |
| Pular (e pulo duplo) | ↑, W ou Espaço |
| Atirar (e tiro carregado) | J, X ou Z |
| Começar / próximo boss | Enter (ou toque na tela) |
| Reiniciar | R (ou toque na tela) |
| Som ligado/desligado | M ou botão 🔊 |

- **Pulo duplo:** aperte a tecla de pular de novo no ar (é preciso soltar e apertar de novo; segurar não vale).
- **Tiro carregado:** segure o tiro até ouvir o som de carga completa e solte para disparar um mega tiro. Soltar o botão antes da carga encher não dispara nada extra. Perder o foco da janela cancela a carga.

## Bosses
| # | Nome | Tipo | Vida | Como luta |
|---|---|---|---|---|
| 1 | TITAN | `claw` | 260 | Paira, levanta o canhão e dispara um meteoro de lava mirado em você |
| 2 | SHADOW ZERO | `shadow` | 200 | Rápido, pula, foge se você chega perto e atira roxo na horizontal sem aviso |
| 3 | CRYONOX | `ice` | 320 | Paira, carrega o cristal do peito e dispara um leque de estilhaços de gelo. Abaixo de 50% de vida entra em fúria (5 estilhaços, carga mais rápida) |

## Pastas
| Pasta / arquivo | O que tem |
|---|---|
| `index.html` | Página do jogo e ordem de carregamento dos scripts |
| `js/config/` | Todos os números do jogo (veja abaixo) |
| `js/labels.js` | Textos das telas |
| `js/assets.js` | Carrega as imagens |
| `js/input.js` | Teclado por ações (ex.: `jump`) |
| `js/audio.js` | `AUDIO_CONFIG` (músicas e efeitos) e `AudioManager` |
| `js/sprites.js` | Desenho dos personagens |
| `js/entities.js` | Projéteis, Zero e bosses |
| `js/ui.js` | Cenário, barras de vida, tela inicial e mensagens |
| `js/game.js` | Fluxo do jogo, colisões e laço principal |
| `sprites/`, `imgs/` | Imagens |
| `audio/music/`, `audio/sfx/` | MP3 das músicas e WAV dos efeitos |

Os scripts do `index.html` precisam ficar nesta ordem, porque cada um usa os anteriores: `labels`, `config/global`, `config/player`, `config/boss1` a `boss3`, `assets`, `input`, `audio`, `sprites`, `entities`, `ui`, `game`.

## Configuração (`js/config/`)
`global.js` cria o objeto `CONFIG`. `player.js` e `boss1.js` a `boss3.js` acrescentam as partes de cada personagem.

### `global.js`
| Campo | O que faz |
|---|---|
| `canvas` | Tamanho da tela (800x450) |
| `groundY` | Altura do chão (Y dos pés) |
| `gravity` | Gravidade |
| `stepsPerSecond` | O jogo roda em passo fixo (60/s), igual em qualquer monitor |
| `controls` | Teclas de cada ação (letras minúsculas; `' '` é a barra de espaço) |
| `images` | Imagens que não são de um personagem (capacete da tela inicial) |
| `contactDamage` | Dano ao encostar no boss: `amount`, `invulnerableFrames`, `knockbackDistance` |
| `hitFlashFramesWhenShot` | Tempo piscando ao levar um tiro |
| `muzzleFlashFrames` | Tempo da pose de tiro |
| `hurtPoseFrames` | Tempo da pose de dano (só o Zero usa; `0` desliga) |
| `runAnimationSpeed` | Velocidade da animação de andar/correr (Zero e Zero sombrio) |
| `overlayInputDelayFrames` | Espera antes de aceitar input nas telas de mensagem |
| `bosses` | Lista dos bosses, preenchida pelos `bossN.js` |

### `player.js` (Zero)
| Campo | O que faz |
|---|---|
| `player` | `name`, `startX`, `scale` (tamanho na tela), `maxHealth` (100), `moveSpeed`, `jumpSpeed`, `healBetweenBosses` (1.0 = vida cheia; 0.5 = metade) |
| `player.attack` | Tiro normal: `cooldown`, `damage`, `speed`, `radius`, `color`, `bufferFrames` (quanto tempo um aperto fica guardado durante o intervalo) |
| `player.chargeShot` | Tiro carregado: `startDelay` (quadros segurando antes de começar a carregar), `chargeFrames` (quadros para encher; ~1,3 s no total), `damage` (30), `speed`, `radius`, `recoveryFrames` (intervalo até o próximo tiro normal) |
| `zeroFrames` | Quadros do sprite do Zero (e do Shadow Zero): `x, y, width, height` do quadro na folha e `anchorX` (coluna do corpo sobre a posição do personagem). Inclui `idle`, `aiming`, `muzzleFlash`, `jumpRising`, `falling`, `landing`, `run`, `runShoot` e `hurt` |
| `chargeAttackEffect` | Aparência do tiro carregado (ver "Efeito do ataque") |
| `chargeEffect` | Brilhos ao redor do corpo enquanto carrega: `maxSparkles` (10), `orbitX`/`orbitY`, `orbitSpeed`, `pixel`, `colors`, `glowColor` |

### `boss1.js`, `boss2.js`, `boss3.js`
Os três seguem a mesma estrutura: imagens, atributos (`CONFIG.bosses.push`), quadros do sprite e efeito do ataque.

| Grupo | Campos |
|---|---|
| Identidade | `type` (escolhe a classe em `BOSS_TYPES` e a música em `AUDIO_CONFIG`), `name`, `healthBarColor` |
| Corpo | `startX`, `scale` (tamanho na tela), `hitHalfWidth` (metade da largura que leva dano), `hitHeight`, `maxHealth`, `moveSpeed` |
| `ai` | `decisionFramesMin` + `decisionFramesRandom` (decide a cada X quadros o que fazer). Titan e Cryonox: `preferredDistance` e `standStillChance`. Shadow Zero: `retreatDistance` (foge abaixo dessa distância) |
| `attack` | `style` (aparência do projétil, ver `Projectile.draw`), `damage`, `speed`, `radius`, `cooldown`, `range`, `chancePerFrame` |
| `attack` (Titan e Cryonox) | `windupFrames` (tempo preparando até o tiro sair) e `recoveryFrames` (tempo na pose depois do tiro) |
| `attack` (Shadow Zero) | Atira na hora, sem preparação. `verticalRange`: só atira se o jogador estiver a até essa diferença de altura. `range: 800` cobre a tela toda |
| `attack` (Cryonox) | `shards` (estilhaços por disparo) e `spread` (abertura entre eles, em radianos) |
| `jump` (Shadow Zero) | `speed` e `chance` (probabilidade de pular a cada decisão da IA) |
| `enrage` (Cryonox) | `below` (fração de vida que ativa a fúria), `shards`, `cooldown` e `windupFrames` (substituem os de `attack`) |

**Quadros do sprite** (`titanFrames`, `cryonoxFrames`; o Shadow Zero usa `zeroFrames`):
`cellWidth`, `cellHeight`, `anchorX` (eixo do corpo no quadro), `groundOffsetY` (linha que toca o chão), `idleFrame`, `walkCycle` (ordem dos quadros ao andar), `walkAnimationRate`, `castFrame` (pose de disparo) e `muzzle` (ponta do canhão/mão: `x` à frente e `y` acima do chão).
Só do Cryonox: `windupPoses` (a carga é dividida igualmente entre esses quadros) e `hover` (sobe-e-desce: `pixels` e `speed`).

**Efeito do ataque** (`meteorAttackEffect`, `energyAttackEffect`, `iceAttackEffect`, `chargeAttackEffect`):
`frameWidth`, `frameHeight`, `frameCount`, `anchorX`/`anchorY` (ponto do quadro que fica sobre o projétil), `introFrames` (quanto tempo o 1º quadro aparece), `framesPerStep` (velocidade da animação), `sequence` (ordem do loop), `drawScale`, `glowColor`, `glowBlur`.

### Sprites
Todos olham para a **direita** (a folha do Zero original olha para a esquerda e é espelhada pelo código).

| Arquivo | Conteúdo |
|---|---|
| `zero.png`, `boss2_shadow_zero.png` | Folha 502x293, mesma organização. Linha y=158: correr (10 quadros). Linha y=203: correr atirando (10 quadros de 48x43). Linha y=250: dano (2 quadros, o 1º no começo e o 2º no fim da pose) |
| `boss1_titan.png` | 4 quadros de 187x189: parado, 2 de andar e pose do canhão |
| `boss3_cryonox.png` | 5 quadros de 184x211: parado, se movendo, carga 1, carga máxima, disparo |
| `meteor_blast.png` | 4 quadros de 98x68. Quadro 0 = explosão ao sair; 1 a 3 = a pedra em 3 tamanhos (loop `[1, 2, 3, 2]`) |
| `energy_blast.png`, `ice_shard.png` | 4 quadros de 72x72. Quadro 0 = explosão ao sair; 1 a 3 = projétil em loop |
| `charge_blast.png` | 5 quadros de 96x64. Quadro 0 = orbe de disparo; 1 a 4 = projétil em loop |

## Áudio
Tudo fica em `AUDIO_CONFIG` (`js/audio.js`), com duas seções de mesmo formato. Cada som tem `{ file, volume }` e o volume final é (volume geral da seção) x (volume do som), de 0 a 1.

| Seção | Pasta | Como funciona |
|---|---|---|
| `music` | `audio/music/` | A chave é o `type` do boss. Toca em loop durante a luta e para quando ela termina |
| `sfx` | `audio/sfx/` | A chave é o nome usado no código (`this.audio.play('playerShot')`). `poolSize` = quantas cópias de cada efeito podem tocar ao mesmo tempo |

| Boss | Música |
|---|---|
| TITAN (`claw`) | `steel_against_stone.mp3` |
| SHADOW ZERO (`shadow`) | `steadfast.mp3` |
| CRYONOX (`ice`) | `victory_at_the_summit.mp3` |

`where_the_hero_rests.mp3` está na pasta, mas ainda não é usada.

Efeitos: `playerShot`, `bossShot` (Titan e Shadow Zero), `iceCharge`, `iceShot`, `chargeStart`, `chargeReady`, `chargeShot`, `chargeHit` (tiro carregado acerta), `bossHit` (tiro normal acerta), `playerHit`.

`AudioManager` oferece `playMusic(tipoDoBoss)`, `stopMusic()`, `play('efeito')`, `toggleMute()` e `unlock()`.

## Tarefas comuns
- **Mudar vida, dano ou velocidade:** `js/config/player.js` (Zero) ou o `bossN.js` do boss.
- **Mudar a ordem dos bosses:** reordene as linhas `<script src="js/config/bossN.js">` no `index.html` (cada arquivo faz `CONFIG.bosses.push`).
- **Mudar teclas:** `CONFIG.controls` em `js/config/global.js`.
- **Mudar textos das telas:** `LABELS.texts` em `js/labels.js`.
- **Trocar um som:** substitua o arquivo (mesmo nome) ou mude o `file` em `AUDIO_CONFIG`.
- **Novo efeito sonoro:** coloque o `.wav` em `audio/sfx/`, adicione uma linha em `AUDIO_CONFIG.sfx.sounds` e chame `this.audio.play('nome')`.
- **Novo boss:**
  1. Copie um `bossN.js`, ajuste e registre as imagens em `CONFIG.images`. Campos que o boss não usa podem ser omitidos, mas só o que a classe dele lê faz efeito.
  2. Crie um renderer em `sprites.js` (método `draw(ctx, boss)`).
  3. Crie a classe em `entities.js` (`extends Boss`, com `update` e `createRenderer`) e registre em `BOSS_TYPES`.
  4. Inclua o `<script>` dele no `index.html`, depois do `boss3.js`.
  5. Acrescente a música dele em `AUDIO_CONFIG.music.tracks`, com o mesmo `type`.

Desenvolvido por **Davidson Ratis** · [GitHub](https://github.com/davR7) · [LinkedIn](https://www.linkedin.com/in/davidson-ratis/)
