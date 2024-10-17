const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

const gravity = 0.7;

const background = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  imageSrc: './img/background.png'
});

const shop = new Sprite({
  position: {
    x: 670,
    y: 184
  },
  imageSrc: './img/shop.png',
  scale: 2.75,
  framesMax: 6
});

const player = new Fighter({
  position: {
    x: 0,
    y: 0
  },
  velocity: {
    x: 0,
    y: 0
  },
  imageSrc: './img/Idle.png',
  framesMax: 8,
  scale: 2.5,
  offset: {
    x: 215,
    y: 210
  },
  sprites: {
    idle: {
      imageSrc: './img/Idle.png',
      framesMax: 8
    },
    run: {
      imageSrc: './img/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: './img/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: './img/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: './img/Attack2.png',
      framesMax: 8
    },
    takeHit: {
      imageSrc: './img/Take Hit.png',
      framesMax: 3
    },
    death: {
      imageSrc: './img/Death.png',
      framesMax: 7
    }
  },
  attackBox: {
    offset: {
      x: 100,
      y: 50
    },
    width: 160,
    height: 50
  }
});

const enemy = new Fighter({
  position: {
    x: 400,
    y: 100
  },
  velocity: {
    x: 0,
    y: 0
  },
  color: 'blue',
  imageSrc: './img/kenji-idle.png',
  framesMax: 6,
  scale: 1.6,
  offset: {
    x: 100,
    y: 20
  },
  sprites: {
    idle: {
      imageSrc: './img/kenji-idle.png',
      framesMax: 6
    },
    run: {
      imageSrc: './img/kenji-run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: './img/kenji-jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: './img/kenji-fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: './img/kenji-Attack.png',
      framesMax: 8
    },
    takeHit: {
      imageSrc: './img/kenji-take-hit.png',
      framesMax: 4
    },
    death: {
      imageSrc: './img/kenji-Death.png',
      framesMax: 7
    }
  },
  attackBox: {
    offset: {
      x: -200,
      y: 50
    },
    width: 170,
    height: 50
  }
});

const keys = {
  a: { pressed: false },
  d: { pressed: false },
  ArrowRight: { pressed: false },
  ArrowLeft: { pressed: false }
};

decreaseTimer();

const rightBoundaryOffset = 90;

function animate() {
  window.requestAnimationFrame(animate);
  c.fillStyle = 'black';
  c.fillRect(0, 0, canvas.width, canvas.height);
  background.update();
  shop.update();
  c.fillStyle = 'rgba(255, 255, 255, 0.15)';
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  enemy.update();

  // Reset velocity
  player.velocity.x = 0;
  enemy.velocity.x = 0;

  // Player movement
  handlePlayerMovement();

  // Enemy movement
  handleEnemyMovement();

  // Detect collision and handle hits
  handleCollision();

  // End game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId });
    document.addEventListener('keydown', newGameKey);
  }
}

function handlePlayerMovement() {
  if (keys.a.pressed && player.lastKey === 'a') {
    player.velocity.x = -5;
    if (player.position.x + player.velocity.x >= 0) {
      player.switchSprite('run');
    } else {
      player.velocity.x = 0;
    }
  } else if (keys.d.pressed && player.lastKey === 'd') {
    player.velocity.x = 5;
    if (player.position.x + player.width + player.velocity.x <= canvas.width - rightBoundaryOffset) {
      player.switchSprite('run');
    } else {
      player.velocity.x = 0;
    }
  } else {
    player.switchSprite('idle');
  }

  // Jumping logic
  if (player.velocity.y < 0) {
    player.switchSprite('jump');
  } else if (player.velocity.y > 0) {
    player.switchSprite('fall');
  }
}

function handleEnemyMovement() {
  if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
    enemy.velocity.x = -5;
    if (enemy.position.x + enemy.velocity.x >= 0) {
      enemy.switchSprite('run');
    } else {
      enemy.velocity.x = 0;
    }
  } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
    enemy.velocity.x = 5;
    if (enemy.position.x + enemy.width + enemy.velocity.x <= canvas.width - rightBoundaryOffset) {
      enemy.switchSprite('run');
    } else {
      enemy.velocity.x = 0;
    }
  } else {
    enemy.switchSprite('idle');
  }

  // Jumping logic
  if (enemy.velocity.y < 0) {
    enemy.switchSprite('jump');
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite('fall');
  }
}

function handleCollision() {
  // Player hit detection
  if (rectangularCollision({ rectangle1: player, rectangle2: enemy }) && player.isAttacking && player.framesCurrent === 4) {
    enemy.takeHit();
    player.isAttacking = false;
    gsap.to('#enemyHealth', { width: enemy.health + '%' });
  }

  // Player miss detection
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false;
  }

  // Enemy hit detection
  if (rectangularCollision({ rectangle1: enemy, rectangle2: player }) && enemy.isAttacking && enemy.framesCurrent === 2) {
    player.takeHit();
    enemy.isAttacking = false;
    gsap.to('#playerHealth', { width: player.health + '%' });
  }

  // Enemy miss detection
  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false;
  }
}

animate();

window.addEventListener('keydown', (event) => {
  if (!player.dead) {
    switch (event.key) {
      case 'd':
        keys.d.pressed = true;
        player.lastKey = 'd';
        break;
      case 'a':
        keys.a.pressed = true;
        player.lastKey = 'a';
        break;
      case 'w':
        // Prevent double jump by checking if player is on the ground
        if (!player.isJumping) {
          player.velocity.y = -20;
          player.isJumping = true;
        }
        break;
      case ' ':
        player.attack();
        break;
    }
  }

  if (!enemy.dead) {
    switch (event.key) {
      case 'ArrowRight':
        keys.ArrowRight.pressed = true;
        enemy.lastKey = 'ArrowRight';
        break;
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = true;
        enemy.lastKey = 'ArrowLeft';
        break;
      case 'ArrowUp':
        // Prevent double jump by checking if enemy is on the ground
        if (!enemy.isJumping) {
          enemy.velocity.y = -20;
          enemy.isJumping = true;
        }
        break;
      case 'ArrowDown':
        enemy.attack();
        break;
    }
  }
});

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'd':
      keys.d.pressed = false;
      break;
    case 'a':
      keys.a.pressed = false;
      break;
  }

  // Enemy keys
  switch (event.key) {
    case 'ArrowRight':
      keys.ArrowRight.pressed = false;
      break;
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = false;
      break;
  }
});

// New game logic
window.addEventListener('keydown', (event) => {
  if (event.key === 'n' || event.key === 'N' || event.key === 'y' || event.key === 'Y') {
    player.health = 100;
    enemy.health = 100;
    player.dead = false;
    enemy.dead = false;
    // Reset player and enemy positions if needed
    player.position.x = 0;
    enemy.position.x = 400;
    // Reset health bars
    gsap.to('#playerHealth', { width: player.health + '%' });
    gsap.to('#enemyHealth', { width: enemy.health + '%' });
  }
});
