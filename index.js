const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Player {
    constructor() {
        this.velocity = {
            x: 0,
            y: 0
        };

        this.rotation = 0;

        const image = new Image();
        image.src = './assets/spaceship.png';
        image.onload = () => {
            const scale = 0.15;

            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;

            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height - 20
            };
        }
    }

    draw() {
        context.save();
        context.translate(
            player.position.x + player.width / 2, 
            player.position.y + player.height / 2
        );

        context.rotate(this.rotation);

        context.translate(
            -(player.position.x + player.width / 2), 
            -(player.position.y + player.height / 2)
        );

        context.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);    
 
        context.restore();
    }

    update() {
        if (this.image) {
            this.draw();
            this.position.x += this.velocity.x;
        }
    }
}

class Projectile {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;

        this.radius = 3;
    }

    draw() {
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = 'red';
        context.fill();
        context.closePath();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Particle {
    constructor({ position, velocity, radius, color, fades = true }) {
        this.position = position;
        this.velocity = velocity;

        this.radius = radius;
        this.color = color;
        this.opacity = 1;
        this.fades = fades;
    }

    draw() {
        context.save();
        context.globalAlpha = this.opacity;
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = this.color;;
        context.fill();
        context.closePath();
        context.restore();
    }
 
    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.fades) {
            this.opacity -= 0.01;
        }
    }
}

class InvaderProjectile {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;

        this.width = 3;
        this.height = 10;
    }

    draw() {
        context.fillStyle = 'white';
        context.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Invader {
    constructor({ position }) {
        this.velocity = {
            x: 0,
            y: 0
        };

        const image = new Image();
        image.src = './assets/invader.png';
        image.onload = () => {
            const scale = 1;

            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;

            this.position = {
                x: position.x,
                y: position.y
            };
        }
    }

    draw() {
        context.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);    
    }

    update({ velocity }) {
        if (this.image) {
            this.draw();
            this.position.x += velocity.x;
            this.position.y += velocity.y;
        }
    }

    shoot(invaderProjectiles) {
        invaderProjectiles.push(new InvaderProjectile({
            position: {
                x: this.position.x + this.width / 2,
                y: this.position.y + this.height
            },
            velocity: {
                x: 0,
                y: 5
            }
        }));
    }
}

const createParticles = (object, color) => {
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle({
            position: {
                x: object.position.x + object.width / 2,
                y: object.position.y + object.height / 2
            },
            velocity: {
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2
            },
            radius: Math.random() * 3,
            color: color || '#BAA0DE'
        }));
    }
}

class Grid {
    constructor() {
        this.position = {
            x: 0,
            y: 0
        };

        this.velocity = {
            x: 4,
            y: 0
        };

        this.invaders = [];

        const columns = Math.floor(Math.random() * 10 + 5);
        const rows = Math.floor(Math.random() * 5 + 2);

        this.width = columns * 40;

        for (let i = 0; i < columns; i++) {
            for (let j = 0; j < rows; j++) {
                this.invaders.push(new Invader({
                    position: {
                        x: i * 40,
                        y: j * 40
                    }
                }));
            }
        }
    }

    update() {
        this.invaders.forEach((invader, invaderIdx) => {
            invader.update({ velocity: this.velocity });

            projectiles.forEach((projectile, projectileIdx) => {
                if (projectile.position.y - projectile.radius <= invader.position.y + invader.height &&
                    projectile.position.x + projectile.radius >= invader.position.x &&
                    projectile.position.x - projectile.radius <= invader.position.x + invader.width &&
                    projectile.position.y + projectile.radius >= invader.position.y
                ) {
                    createParticles(invader);
                        
                    setTimeout(() => {
                        this.invaders.splice(invaderIdx, 1);
                        projectiles.splice(projectileIdx, 1);

                        if (this.invaders.length > 0) {
                            const firstInvader = this.invaders[0];
                            const lastInvader = this.invaders[this.invaders.length - 1];

                            this.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width;
                            this.position.x = firstInvader.position.x;
                        }
                    }, 0);
                }
            });
        });

        this.velocity.y = 0;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
            this.velocity.x *= -1;
            this.velocity.y = 30;
        }
    }
}

const keys = {
    a: { 
        pressed: false
    },
    d: {
        pressed: false
    },
    space: {
        pressed: false
    }
};

let frames = 0;

const player = new Player();
const projectiles = [];
const grids = [];
const invaderProjectiles = [];
const particles = [];

for (let i = 0; i < 50; i++) {
    particles.push(new Particle({
        position: {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        },
        velocity: {
            x: 0,
            y: 0.3
        },
        radius: 3,
        color: 'gray',
        fades: false
    }));
}

function animate() {
    requestAnimationFrame(animate);
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    player.update();

    particles.forEach((particle, index) => {
        if (particle.position.y - particle.radius >= canvas.height) {
            particle.position.x = Math.random() * canvas.width;
            particle.position.y = -particle.radius;
        }
        
        if (particle.opacity <= 0) {
            setTimeout(() => particles.splice(index, 1), 0);
        } else {
            particle.update();
        }
    });

    invaderProjectiles.forEach((invaderProjectile, index) => {
        if (invaderProjectile.position.y + invaderProjectile.height >= canvas.height) {
            setTimeout(() => invaderProjectiles.splice(index, 1), 0);
        } else {
            invaderProjectile.update();
        }

        if (invaderProjectile.position.y + invaderProjectile.height >= player.position.y &&
            invaderProjectile.position.x + invaderProjectile.width >= player.position.x &&
            invaderProjectile.position.x <= player.position.x + player.width
        ) {
            console.log('You died');
            setTimeout(() => invaderProjectiles.splice(index, 1), 0);
            createParticles(player, 'white');
        }
    });

    projectiles.forEach((projectile, index) => {
        if (projectile.position.y + projectile.radius <= 0) {
            setTimeout(() => projectiles.splice(index, 1), 0);
        } else {
            projectile.update();
        }
    });

    grids.forEach((grid) => {
        grid.update();

        if (frames % 100 === 0 && grid.invaders.length > 0) {
            const randomInvaderIndex = Math.floor(Math.random() * (grid.invaders.length - 1));
            grid.invaders[randomInvaderIndex].shoot(invaderProjectiles);         
        }
    });

    player.velocity.x = 0;
    player.rotation = 0;

    if (keys.a.pressed && player.position.x >= 0) {
        player.velocity.x = -5;
        player.rotation = -0.15;
    } else if (keys.d.pressed && player.position.x + player.width <= canvas.width) {
        player.velocity.x = 5;
        player.rotation = 0.15;
    }

    if (frames % Math.floor((Math.random() * 1000) + 1000) === 0) {
        grids.push(new Grid());
    }

    frames++;
}

animate();

addEventListener('keydown', ({ key }) => {
    switch (key) {
        case 'a':
            keys.a.pressed = true;
            break;
        case 'd':
            keys.d.pressed = true;
            break;
        case ' ':
            projectiles.push(new Projectile({
                position: {
                    x: player.position.x + player.width / 2,
                    y: player.position.y
                },
                velocity: {
                    x: 0,
                    y: -10
                }
            }));
            break;
    }
});

addEventListener('keyup', ({ key }) => {
    switch (key) {
        case 'a':
            keys.a.pressed = false;
            break;
        case 'd':
            keys.d.pressed = false;
            break;
        case ' ':
            break;
    }
});