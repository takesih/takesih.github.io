import {
  AmbientLight,
  BufferGeometry,
  CanvasTexture,
  CylinderGeometry,
  DirectionalLight,
  Float32BufferAttribute,
  Group,
  HemisphereLight,
  LineBasicMaterial,
  LineLoop,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const TWO_PI = 2 * Math.PI;

function material(color, roughness = 0.32) {
  return new MeshStandardMaterial({ color, roughness, metalness: 0.23 });
}

function rounded(width, height, depth, radius, color) {
  return new Mesh(new RoundedBoxGeometry(width, height, depth, 4, radius), material(color));
}

function makeTable() {
  const table = new Group();
  table.add(rounded(3.55, 0.33, 2.28, 0.13, '#a45337'));

  const felt = rounded(3.28, 0.075, 2.01, 0.055, '#3c8667');
  felt.position.y = 0.185;
  table.add(felt);

  const wood = '#bd734d';
  for (const sign of [-1, 1]) {
    const longRail = rounded(3.52, 0.24, 0.18, 0.06, wood);
    longRail.position.set(0, 0.24, sign * 1.04);
    const endRail = rounded(0.19, 0.24, 1.94, 0.06, wood);
    endRail.position.set(sign * 1.66, 0.24, 0);
    table.add(longRail, endRail);
    for (const side of [-1, 1]) {
      const leg = rounded(0.28, 0.49, 0.23, 0.055, '#68402d');
      leg.position.set(sign * 1.26, -0.31, side * 0.72);
      table.add(leg);
    }
  }
  const ballGeometry = new SphereGeometry(0.19, 28, 24);
  const ballLayout = [
    [0.61, 0.30, '#f1eee1'], [-0.58, -0.36, '#ebad3f'], [0.45, -0.47, '#d65542'],
  ];
  for (const [x, z, color] of ballLayout) {
    const ball = new Mesh(ballGeometry, material(color, 0.19));
    ball.position.set(x, 0.4, z);
    table.add(ball);
  }
  const cue = new Mesh(new CylinderGeometry(0.019, 0.04, 2, 14), material('#e4b678', 0.42));
  cue.position.set(-0.28, 0.27, 0.65);
  cue.rotation.set(0, 0, 1.40);
  table.add(cue);
  table.rotation.set(0.79, -0.39, -0.27);
  table.scale.setScalar(1.13);
  return table;
}

function makeScoreboard() {
  const board = new Group();
  board.add(rounded(3.08, 1.9, 0.24, 0.15, '#737e54'));
  const face = document.createElement('canvas');
  face.width = 700;
  face.height = 380;
  const ctx = face.getContext('2d');
  ctx.fillStyle = '#222b22';
  ctx.fillRect(0, 0, 700, 380);
  ctx.fillStyle = '#aeb798';
  ctx.font = '600 31px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('SCOREBOARD', 350, 70);
  ctx.fillStyle = '#e5ebca';
  ctx.font = '700 146px monospace';
  ctx.fillText('12', 178, 254);
  ctx.fillStyle = '#f2be68';
  ctx.fillText('08', 522, 254);
  ctx.fillStyle = '#626f4c';
  ctx.fillRect(348, 123, 4, 143);
  ctx.fillStyle = '#b9c8a1';
  ctx.font = '500 25px monospace';
  ctx.fillText('A', 178, 320);
  ctx.fillText('B', 522, 320);

  const texture = new CanvasTexture(face);
  texture.colorSpace = SRGBColorSpace;
  const display = new Mesh(new PlaneGeometry(2.81, 1.61), new MeshBasicMaterial({ map: texture }));
  display.position.z = 0.126;
  board.add(display);
  const stand = rounded(1.64, 0.22, 0.69, 0.08, '#a8ad7b');
  stand.position.y = -1.06;
  board.add(stand);
  board.rotation.set(-0.14, -0.45, -0.13);
  return board;
}

function makeCheckout() {
  const group = new Group();
  const kiosk = rounded(1.61, 2.42, 0.46, 0.18, '#a3a2ce');
  const base = rounded(1.89, 0.23, 0.77, 0.09, '#807fad');
  base.position.y = -1.21;
  const screen = rounded(1.22, 1.18, 0.032, 0.055, '#302c42');
  screen.position.set(0, 0.44, 0.239);
  const footer = rounded(1.04, 0.09, 0.032, 0.02, '#b6adcc');
  footer.position.set(0, -0.48, 0.241);
  group.add(kiosk, base, screen, footer);
  for (let i = 0; i < 3; i++) {
    const mark = rounded(i === 2 ? 0.72 : 0.83, 0.068, 0.039, 0.02, i === 2 ? '#d9b769' : '#c8b8de');
    mark.position.set(0, 0.72 - 0.23 * i, 0.266);
    group.add(mark);
  }
  const receipt = rounded(0.68, 0.92, 0.04, 0.04, '#f3e3c6');
  receipt.position.set(0.96, -0.25, 0.68);
  receipt.rotation.z = -0.26;
  for (let i = 0; i < 3; i++) {
    const line = rounded(0.47 - 0.06 * i, 0.042, 0.012, 0.012, '#997261');
    line.position.set(-0.02, 0.20 - i * 0.17, 0.026);
    receipt.add(line);
  }
  group.add(receipt);
  group.rotation.set(-0.13, -0.37, -0.16);
  group.scale.setScalar(1.17);
  return group;
}

function addOrbit(scene) {
  const halo = new LineBasicMaterial({ color: '#d7dcaa', transparent: true, opacity: 0.24 });
  for (let j = 0; j < 2; j++) {
    const knots = [];
    for (let i = 0; i < 100; i++) {
      const angle = i / 100 * TWO_PI;
      knots.push(new Vector3(Math.cos(angle) * (2.42 + j * 0.24), Math.sin(angle) * (2.24 + j * 0.17), 0));
    }
    const ring = new LineLoop(new BufferGeometry().setFromPoints(knots), halo);
    ring.rotation.set(0.76 + j * 0.2, -0.28, 0.31 - j * 0.6);
    scene.add(ring);
  }
  const coords = [
    -2.54, 1.83, -0.1, -2.27, -1.53, 0.11, 2.56, -0.31, 0.17,
    1.77, 2.1, -0.13, 0.95, -2.28, 0.1, -2.74, -0.45, -0.3, 2.19, 1.48, 0.36,
  ];
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(coords, 3));
  scene.add(new Points(geometry, new PointsMaterial({ color: '#e6daac', size: 0.040, opacity: 0.8, transparent: true })));
}

export function createSculpture(canvas, stage, { resetButton, interactive = true } = {}) {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
  renderer.setClearColor(0x000000, 0);
  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1, 0.1, 40);
  camera.position.z = 7.45;
  const tilt = new Group();
  scene.add(tilt);

  const objects = { start: makeTable(), play: makeScoreboard(), finish: makeCheckout() };
  for (const object of Object.values(objects)) tilt.add(object);
  addOrbit(scene);

  scene.add(new HemisphereLight('#fff4d5', '#816858', 1.45));
  scene.add(new AmbientLight('#f1e4c1', 0.35));
  const key = new DirectionalLight('#fff0c5', 3.4);
  key.position.set(-3.8, 4.8, 4.8);
  scene.add(key);
  const rim = new DirectionalLight('#d4dea6', 1.8);
  rim.position.set(4, 1.6, -3);
  scene.add(rim);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let targetX = 0;
  let targetY = 0;
  let pointer;
  let visible = true;
  let raf = 0;
  let lastDraw = 0;
  let progress = 0;

  function render() {
    renderer.render(scene, camera);
  }
  function resize() {
    const { clientWidth: width, clientHeight: height } = stage;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = width < 350 ? 8.5 : 7.65;
    camera.updateProjectionMatrix();
    render();
  }
  new ResizeObserver(resize).observe(stage);

  function animate(time) {
    raf = 0;
    if (!visible || reduced.matches || document.hidden) return;
    if (time - lastDraw >= 1000 / 42) {
      const scrollTilt = interactive ? progress * 0.43 : progress * 0.57 - 0.18;
      tilt.rotation.x = MathUtils.lerp(tilt.rotation.x, targetX + Math.sin(time * 0.00051) * 0.075, 0.12);
      tilt.rotation.y = MathUtils.lerp(tilt.rotation.y, targetY + Math.sin(time * 0.00037) * 0.14 + scrollTilt, 0.12);
      tilt.scale.setScalar(MathUtils.lerp(tilt.scale.x, 1, 0.13));
      render();
      lastDraw = time;
    }
    raf = requestAnimationFrame(animate);
  }
  function resume() {
    if (!raf && visible && !reduced.matches && !document.hidden) raf = requestAnimationFrame(animate);
  }
  function applyRotation() {
    if (reduced.matches) {
      tilt.scale.setScalar(1);
      tilt.rotation.set(targetX, targetY, 0);
      render();
    }
  }
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    resume();
  }, { rootMargin: '30px' }).observe(stage);
  document.addEventListener('visibilitychange', resume);
  reduced.addEventListener('change', () => {
    applyRotation();
    resume();
  });

  canvas.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || !event.isPrimary) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (pointer?.id !== event.pointerId) return;
    targetX = MathUtils.clamp(targetX + (event.clientY - pointer.y) * 0.012, -1.3, 1.3);
    targetY += (event.clientX - pointer.x) * 0.014;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    applyRotation();
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    canvas.addEventListener(type, (event) => {
      if (pointer?.id === event.pointerId) pointer = undefined;
    });
  }
  canvas.addEventListener('keydown', (event) => {
    const delta = { ArrowLeft: [0, -0.24], ArrowRight: [0, 0.24], ArrowUp: [-0.21, 0], ArrowDown: [0.21, 0] }[event.key];
    if (!delta) return;
    event.preventDefault();
    targetX = MathUtils.clamp(targetX + delta[0], -1.3, 1.3);
    targetY += delta[1];
    applyRotation();
  });
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    visible = false;
    stage.classList.remove('has-webgl');
    if (resetButton) resetButton.hidden = true;
    canvas.tabIndex = -1;
    canvas.setAttribute('aria-hidden', 'true');
  });
  canvas.addEventListener('webglcontextrestored', () => {
    visible = true;
    stage.classList.add('has-webgl');
    if (resetButton) resetButton.hidden = false;
    if (interactive) { canvas.tabIndex = 0; canvas.removeAttribute('aria-hidden'); }
    resize();
    resume();
  });

  function resetAngle() {
    targetX = 0;
    targetY = 0;
    tilt.rotation.set(0, 0, 0);
    render();
  }
  function show(mode) {
    for (const [name, object] of Object.entries(objects)) object.visible = name === mode;
    tilt.scale.setScalar(reduced.matches ? 1 : 0.83);
    resetAngle();
  }
  stage.classList.add('has-webgl');
  if (resetButton) {
    resetButton.hidden = false;
    resetButton.addEventListener('click', resetAngle);
  }
  if (interactive) {
    canvas.tabIndex = 0;
    canvas.removeAttribute('aria-hidden');
  }
  show('start');
  resize();
  resume();
  return { show, setProgress(value) { progress = value; } };
}
