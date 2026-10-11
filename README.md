# O Cristal

![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?logo=javascript&logoColor=black)
![Phaser](https://img.shields.io/badge/Phaser-3.55-8A2BE2)
![HTML5](https://img.shields.io/badge/HTML5-canvas-E34F26?logo=html5&logoColor=white)

Jogo de plataforma 2D desenvolvido com Phaser 3 no projeto individual da quarta semana do Inteli. O jogador controla um personagem cientista que precisa coletar cristais verdadeiros enquanto desvia de cristais falsos espalhados pelo cenário e caindo do teto.

## Como jogar

| Tecla | Ação |
|---|---|
| ← | mover para a esquerda |
| → | mover para a direita |
| ↑ | pular |

- **Cristal verdadeiro:** cada coleta soma um ponto e o cristal reaparece em outra posição. São necessários 10 para vencer.
- **Cristal falso:** fica espalhado pelo mapa e cai do teto. Cada toque custa uma vida.
- **Objetivo:** coletar os 10 cristais verdadeiros antes de perder as 5 vidas.

## Funcionalidades

- Física arcade com gravidade, colisão com plataformas e pulo condicionado ao contato com o chão.
- Classes próprias para os cristais falsos estáticos e para os que caem atravessando as plataformas.
- Dificuldade progressiva: os cristais que caem ficam mais rápidos e surgem com mais frequência conforme a pontuação aumenta.
- Placar e contador de vidas em tela, com mensagem de fim de jogo.
- Tela inicial com modal de instruções.

## Stack

- JavaScript (ES6)
- [Phaser 3.55](https://phaser.io/) carregado via CDN
- HTML5 e CSS3

## Estrutura do repositório

```text
O-cristal/
├── index.html   # tela inicial e instruções
├── game.html    # página que carrega o jogo
├── Game.js      # cenas, física, regras e pontuação
└── assets/      # sprites, cenário e tela de login
```

## Como executar

O Phaser carrega as imagens por requisição HTTP, então o jogo precisa ser servido por um servidor local em vez de aberto direto pelo arquivo:

```bash
git clone https://github.com/JoseIsaias-AI/O-cristal.git
cd O-cristal
python -m http.server 8000
```

Depois, acesse `http://localhost:8000` no navegador. A extensão Live Server do VS Code também funciona.

## Autor

**José Isaías** · Engenharia de Computação no Inteli ·
[LinkedIn](https://www.linkedin.com/in/joseisaias) ·
[GitHub](https://github.com/JoseIsaias-AI)
