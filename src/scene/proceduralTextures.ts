import * as THREE from 'three';

/**
 * Generates a fine horizontal brushed-metal roughness/bump texture for 24k Royal Gold.
 */
export function createBrushedGoldTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y++) {
      const shade = 110 + Math.floor(Math.sin(y * 0.7) * 18 + (Math.random() - 0.5) * 32);
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(0, y, size, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 2);
  texture.colorSpace = THREE.NoColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates a subtle pebbled leather texture for the shuttlecock cork base.
 */
export function createCorkLeatherTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#f5f1e6';
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 1800; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 0.6 + Math.random() * 1.3;
      const v = 225 + Math.floor(Math.random() * 25);
      ctx.fillStyle = `rgba(${v}, ${v - 5}, ${v - 14}, 0.45)`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Soft radial glow sprite for ambient golden championship dust particles.
 */
export function createGoldParticleSprite(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const grad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    grad.addColorStop(0, 'rgba(255, 240, 185, 1)');
    grad.addColorStop(0.35, 'rgba(212, 175, 55, 0.75)');
    grad.addColorStop(0.7, 'rgba(212, 175, 55, 0.18)');
    grad.addColorStop(1, 'rgba(212, 175, 55, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
