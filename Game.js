// Dimensões do jogo
const larguraJogo = 1400;
const alturaJogo = 1450;

const config = {
    type: Phaser.AUTO,
    width: larguraJogo,
    height: alturaJogo,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let personagem;
let plataforma;
let plataforma2;
let plataforma3;
let cristal;
let cristaisFalsos;          // grupo: cristais falsos estáticos (lógica original)
let cristaisCaindo;          // grupo: cristais falsos que caem do teto
let cursors;

let posicoesCristal = [];
let posicoesCristalFalso = [];

let pontos = 0;
let vidas = 5;
let textoPlacar;
let textoVidas;
let jogoFinalizado = false;

let overlayEscuro;
let caixaDialogo;
let textoDialogo;

// Controle de spawn dos cristais caindo
let timerSpawnCaindo;
let velocidadeQueda = 250;       // velocidade inicial de queda (px/s)
let intervaloSpawn  = 3000;      // intervalo inicial entre spawns (ms)
let pontosUltimaAtualizacao = -1; // para evitar recriar o timer desnecessariamente


// =========================
// CLASSE CRISTAL FALSO (estático – lógica original)
// =========================
class CristalFalso extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y) {
        super(scene, x, y, 'CristalFalso');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.1);
        this.setBounce(0.3);
        this.setCollideWorldBounds(true);

        // colidir com plataformas
        [plataforma, plataforma2, plataforma3].forEach(p => {
            scene.physics.add.collider(this, p);
        });
    }

    mover(personagem) {
        let posicaoValida = false;
        let novaPosicao;

        while (!posicaoValida) {
            novaPosicao = Phaser.Utils.Array.GetRandom(posicoesCristalFalso);

            let distancia = Phaser.Math.Distance.Between(
                novaPosicao.x, novaPosicao.y,
                personagem.x, personagem.y
            );

            if (distancia > 200) {
                posicaoValida = true;
            }
        }

        this.setPosition(novaPosicao.x, novaPosicao.y);
        this.setVelocity(0);
    }
}


// =========================
// CRISTAL CAINDO (passa por plataformas, mata ao tocar personagem)
// =========================
function criarCristalCaindo(scene) {
    if (jogoFinalizado) return;

    // X aleatório com margem das bordas
    const margemX = 60;
    const x = Phaser.Math.Between(margemX, larguraJogo - margemX);
    const y = -40; // nasce acima do topo visível

    // Usa o grupo sem física própria de gravidade → usamos velocidade manual
    const sprite = scene.physics.add.image(x, y, 'CristalFalso').setScale(0.13);

    // Desativa gravidade do engine para este sprite e aplica velocidade manual
    sprite.body.setAllowGravity(false);
    sprite.setVelocityY(velocidadeQueda);

    // Leve oscilação horizontal para parecer mais orgânico
    const oscilacao = Phaser.Math.Between(-40, 40);
    sprite.setVelocityX(oscilacao);

    // Adiciona ao grupo de controle
    cristaisCaindo.add(sprite);

    // Overlap com personagem → perde vida
    scene.physics.add.overlap(personagem, sprite, (jogador, cristalCaindo) => {
        if (jogoFinalizado) return;

        vidas--;
        textoVidas.setText("Vidas: " + vidas);

        // efeito flash no personagem
        scene.tweens.add({
            targets: personagem,
            alpha: 0,
            duration: 80,
            yoyo: true,
            repeat: 3
        });

        // Destrói o cristal após o hit
        cristalCaindo.destroy();

        if (vidas <= 0) {
            textoVidas.setText("GAME OVER");
            personagem.setVelocity(0);
            personagem.body.enable = false;
            jogoFinalizado = true;
        }
    });
}

// Recria o timer de spawn com o intervalo atual
function reiniciarTimerSpawn(scene) {
    if (timerSpawnCaindo) {
        timerSpawnCaindo.remove(false);
    }

    timerSpawnCaindo = scene.time.addEvent({
        delay: intervaloSpawn,
        callback: () => criarCristalCaindo(scene),
        loop: true
    });
}


// =========================
// PRELOAD
// =========================
function preload() {
    this.load.image('background',    'assets/cenario.png');
    this.load.image('plataforma',    'assets/plataforma.png');
    this.load.image('cristal',       'assets/Cristal.png');
    this.load.image('CristalFalso',  'assets/CristalFalso.png');
    this.load.spritesheet('personagem', 'assets/cientista.png', {
        frameWidth: 32,
        frameHeight: 64
    });
}


// =========================
// CREATE
// =========================
function create() {

    this.physics.world.setBounds(0, 0, larguraJogo, alturaJogo);
    this.add.image(larguraJogo / 2, alturaJogo / 2, 'background');

    overlayEscuro = this.add.rectangle(
        larguraJogo / 2, alturaJogo / 2,
        larguraJogo, alturaJogo,
        0x000000
    );
    overlayEscuro.setAlpha(0.6);
    overlayEscuro.setDepth(10);

    plataforma = this.physics.add.staticImage(larguraJogo / 2, alturaJogo / 2.5, 'plataforma')
        .setScale(0.4).refreshBody();
    plataforma.body.setSize(270, 50, true);

    plataforma2 = this.physics.add.staticImage(larguraJogo / 3, alturaJogo / 1.6, 'plataforma')
        .setScale(0.4).refreshBody();
    plataforma2.body.setSize(270, 50, true);

    plataforma3 = this.physics.add.staticImage(larguraJogo / 1.6, alturaJogo / 1.2, 'plataforma')
        .setScale(0.4).refreshBody();
    plataforma3.body.setSize(270, 50, true);

    cristal = this.physics.add.sprite(larguraJogo / 2, 100, 'cristal').setScale(0.1);
    cristal.setBounce(0.3);
    cristal.setCollideWorldBounds(true);

    [plataforma, plataforma2, plataforma3].forEach(p => {
        this.physics.add.collider(cristal, p);
    });

    personagem = this.physics.add.sprite(800, 200, 'personagem').setScale(2);
    personagem.setCollideWorldBounds(true);
    personagem.setBounce(0.1);

    this.physics.add.collider(personagem, plataforma);
    this.physics.add.collider(personagem, plataforma2);
    this.physics.add.collider(personagem, plataforma3);

    // Grupos
    cristaisFalsos  = this.physics.add.group(); // estáticos (lógica original)
    cristaisCaindo  = this.physics.add.group(); // caindo do teto (sem colisão com plataformas)

    this.physics.add.overlap(personagem, cristal, coletarCristal, null, this);
    this.physics.add.overlap(personagem, cristaisFalsos, coletarCristalFalso, null, this);
    // O overlap dos cristaisCaindo é adicionado individualmente em criarCristalCaindo()

    textoPlacar = this.add.text(40, 40, "Cristais: 0/10", {
        fontSize: "40px",
        fill: "#ffffff"
    });

    textoVidas = this.add.text(40, 100, "Vidas: 5", {
        fontSize: "40px",
        fill: "#ff0000"
    });

    posicoesCristal = [
        { x: larguraJogo / 2,   y: alturaJogo / 2.5 - 80 },
        { x: larguraJogo / 3,   y: alturaJogo / 1.6 - 80 },
        { x: larguraJogo / 1.6, y: alturaJogo / 1.2 - 80 },
        { x: larguraJogo / 4,   y: alturaJogo / 2   - 80 },
        { x: larguraJogo / 1.3, y: alturaJogo / 1.8 - 80 }
    ];

    posicoesCristalFalso = [
        { x: larguraJogo / 2.4, y: alturaJogo / 2   - 80 },
        { x: larguraJogo / 4.6, y: alturaJogo / 1.6 - 80 },
        { x: larguraJogo / 2.2, y: alturaJogo / 1.2 - 80 },
        { x: larguraJogo / 5,   y: alturaJogo / 2   - 80 },
        { x: larguraJogo / 1.1, y: alturaJogo / 1.7 - 80 }
    ];

    // Cria primeiro cristal falso estático
    adicionarCristalFalso(this);

    // Inicia o timer de cristais caindo
    reiniciarTimerSpawn(this);

    // Spawn imediato do primeiro cristal caindo
    criarCristalCaindo(this);

    cursors = this.input.keyboard.createCursorKeys();

    this.anims.create({
        key: 'andarDireita',
        frames: this.anims.generateFrameNumbers('personagem', { start: 31, end: 40 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'andarEsquerda',
        frames: this.anims.generateFrameNumbers('personagem', { start: 21, end: 29 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'parado',
        frames: [{ key: 'personagem', frame: 0 }],
        frameRate: 20
    });
}


// =========================
// UPDATE
// =========================
function update() {

    if (jogoFinalizado) return;

    personagem.setVelocityX(0);

    if (cursors.left.isDown) {
        personagem.setVelocityX(-200);
        personagem.anims.play('andarEsquerda', true);
    }
    else if (cursors.right.isDown) {
        personagem.setVelocityX(200);
        personagem.anims.play('andarDireita', true);
    }
    else {
        personagem.anims.play('parado', true);
    }

    if (cursors.up.isDown && (personagem.body.touching.down || personagem.body.blocked.down)) {
        personagem.setVelocityY(-450);
    }

    // Remove cristais caindo que saíram da tela (passaram do fundo)
    cristaisCaindo.getChildren().forEach(c => {
        if (c.y > alturaJogo + 60) {
            c.destroy();
        }
    });
}


// =========================
// FUNÇÕES
// =========================

function coletarCristal(personagem, cristal) {

    if (jogoFinalizado) return;

    pontos++;
    textoPlacar.setText("Cristais: " + pontos + "/10");

    let posicao = Phaser.Utils.Array.GetRandom(posicoesCristal);
    cristal.setPosition(posicao.x, posicao.y);
    cristal.setVelocity(0);

    atualizarDificuldade(this);

    if (pontos >= 10) {
        jogoFinalizado = true;
        personagem.setVelocity(0);
        personagem.body.enable = false;
        mostrarDialogoVitoria.call(this);
    }
}

function coletarCristalFalso(personagem, cristalFalso) {

    if (jogoFinalizado) return;

    vidas--;
    textoVidas.setText("Vidas: " + vidas);

    cristalFalso.mover(personagem);

    if (vidas <= 0) {
        textoVidas.setText("GAME OVER");
        personagem.setVelocity(0);
        personagem.body.enable = false;
        jogoFinalizado = true;
    }
}

function adicionarCristalFalso(scene) {

    let posicao = Phaser.Utils.Array.GetRandom(posicoesCristalFalso);
    let novoCristal = new CristalFalso(scene, posicao.x, posicao.y);
    cristaisFalsos.add(novoCristal);
}

function atualizarDificuldade(scene) {

    let quantidade;

    if (pontos < 2) {
        quantidade = 1;
        velocidadeQueda = 250;
        intervaloSpawn  = 3000;
    }
    else if (pontos < 4) {
        quantidade = 3;
        velocidadeQueda = 320;
        intervaloSpawn  = 2500;
    }
    else if (pontos < 6) {
        quantidade = 4;
        velocidadeQueda = 400;
        intervaloSpawn  = 2000;
    }
    else if (pontos < 8) {
        quantidade = 5;
        velocidadeQueda = 480;
        intervaloSpawn  = 1500;
    }
    else {
        quantidade = 6;
        velocidadeQueda = 580;
        intervaloSpawn  = 1000;
    }

    // Remove cristais falsos estáticos e recria com nova quantidade
    cristaisFalsos.clear(true, true);
    for (let i = 0; i < quantidade; i++) {
        adicionarCristalFalso(scene);
    }

    // Reinicia o timer com novo intervalo
    reiniciarTimerSpawn(scene);
}

function mostrarDialogoVitoria() {

    // Para todos os cristais caindo
    cristaisCaindo.clear(true, true);
    if (timerSpawnCaindo) timerSpawnCaindo.remove(false);

    this.tweens.add({
        targets: overlayEscuro,
        alpha: 0,
        duration: 2000
    });

    caixaDialogo = this.add.rectangle(
        larguraJogo / 2,
        alturaJogo - 200,
        larguraJogo - 200,
        250,
        0x000000
    );

    caixaDialogo.setStrokeStyle(4, 0xffffff);
    caixaDialogo.setDepth(20);
    caixaDialogo.setAlpha(0.85);

    textoDialogo = this.add.text(
        larguraJogo / 2 - (larguraJogo - 300) / 2,
        alturaJogo - 280,
        "Energia restaurada!\n\n" +
        "Os cristais verdadeiros foram integrados ao núcleo central.\n" +
        "O laboratório voltou a funcionar.",
        {
            fontSize: "36px",
            fill: "#ffffff",
            wordWrap: { width: larguraJogo - 300 }
        }
    );

    textoDialogo.setDepth(21);
}