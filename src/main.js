import './style.css';

const steps = {
  start: { label: 'TABLE / SELECT', summary: '키오스크에서 이용할 당구대를 고릅니다.', name: '자리 선택' },
  play: { label: 'GAME / SCORE', summary: '당구대 옆 점수판으로 경기 진행을 확인합니다.', name: '경기 진행' },
  finish: { label: 'SESSION / CHECKOUT', summary: '당구대를 정리하고 키오스크에서 결제합니다.', name: '정리와 결제' },
};

const stage = document.querySelector('.stage');
const buttons = [...document.querySelectorAll('.scene-controls button')];
const stepLink = document.querySelector('#scene-link');
const canvas = document.querySelector('#sculpture');
const flowStory = document.querySelector('.flow-story');
const flowStage = document.querySelector('.story-stage');
const flowSteps = [...document.querySelectorAll('.flow-steps li')];
let heroView;
let storyView;

function select(mode) {
  const step = steps[mode];
  stage.dataset.mode = mode;
  stage.querySelector('#object-label').textContent = step.label;
  document.querySelector('#scene-summary').textContent = step.summary;
  stepLink.href = '#flow-' + mode;
  stepLink.setAttribute('aria-label', step.name + ' 단계 보기');
  for (const button of buttons) {
    button.setAttribute('aria-pressed', String(button.dataset.mode === mode));
  }
  heroView?.show(mode);
}

for (const button of buttons) {
  button.addEventListener('click', () => select(button.dataset.mode));
}

canvas.tabIndex = -1;
canvas.setAttribute('aria-hidden', 'true');

let scheduled = false;
let lastMode;

function updateScroll() {
  scheduled = false;
  const viewport = window.innerHeight;
  const narrow = window.innerWidth <= 680;
  const anchor = viewport * (narrow ? 0.73 : 0.54);
  const first = flowSteps[0].getBoundingClientRect();
  const last = flowSteps.at(-1).getBoundingClientRect();
  const progress = Math.max(0, Math.min(1, (anchor - first.top) / (last.bottom - first.top)));
  flowStory.style.setProperty('--journey-progress', progress.toFixed(3));
  const active = flowSteps.findLast((step) => step.getBoundingClientRect().top <= anchor) || flowSteps[0];
  const mode = active.id.slice('flow-'.length);

  if (mode !== lastMode) {
    for (const step of flowSteps) step.classList.toggle('is-current', step === active);
    flowStage.dataset.mode = mode;
    flowStage.querySelector('#flow-scene-name').textContent = steps[mode].name;
    storyView?.show(mode);
    lastMode = mode;
  }
  const heroRect = stage.getBoundingClientRect();
  heroView?.setProgress(Math.max(0, Math.min(1, -heroRect.top / heroRect.height)));
  storyView?.setProgress(progress);
}

function scheduleScroll() {
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(updateScroll);
  }
}
window.addEventListener('scroll', scheduleScroll, { passive: true });
window.addEventListener('resize', scheduleScroll);
scheduleScroll();

async function start() {
  try {
    const { createSculpture } = await import('./sculpture.js');
    heroView = createSculpture(canvas, stage, { resetButton: document.querySelector('#reset-angle') });
    select(stage.dataset.mode);
    storyView = createSculpture(document.querySelector('#flow-sculpture'), flowStage, { interactive: false });
    storyView.show(flowStage.dataset.mode);
    scheduleScroll();
  } catch {
    // Navigation, scroll highlights, and the CSS illustration remain available.
  }
}

start();
