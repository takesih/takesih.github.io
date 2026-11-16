import './style.css';

const steps = {
  start: {
    name: '자리 선택', context: '매장 키오스크', title: ['어떤 자리에서', '시작할까요?'],
    description: '이용 가능한 당구대를 확인하고 자리를 선택합니다.', statuses: ['이용 가능', '이용 중'],
  },
  play: {
    name: '경기 진행', context: '당구대 옆 점수판', title: ['지금의 경기를', '한눈에.'],
    description: '점수판에서 경기 진행을 확인하고 기록과 리플레이를 살펴봅니다.', statuses: ['경기 중', '점수판'],
  },
  finish: {
    name: '정리와 결제', context: '키오스크와 운영 화면', title: ['경기를 마치면', '정산으로.'],
    description: '경기를 종료하고 당구대 주변을 정리한 뒤 결제합니다.', statuses: ['경기 종료', '결제'],
  },
};

const heroStage = document.querySelector('.hero-stage');
const demo = document.querySelector('.demo-frame');
const demoCopy = document.querySelector('.demo-copy');
const demoContext = document.querySelector('#demo-context');
const demoTitle = document.querySelector('#demo-title');
const demoDescription = document.querySelector('#demo-description');
const demoStatusOne = document.querySelector('#demo-status-one');
const demoStatusTwo = document.querySelector('#demo-status-two');
const demoButtons = [...document.querySelectorAll('.hero-options button, .demo-steps button')];
const heroCanvas = document.querySelector('#sculpture');
const flowStory = document.querySelector('.flow-story');
const flowStage = document.querySelector('.story-stage');
const storyCaption = document.querySelector('#flow-scene-name');
const sceneItems = [...document.querySelectorAll('.flow-steps li')].map((element) => ({
  element,
  button: element.querySelector('button'),
  description: element.querySelector('.step-description'),
  mode: element.id.slice('flow-'.length),
}));

let heroView;
let storyView;
let selected = 'start';
let activeItem;
let scheduled = false;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function selectHero(mode) {
  if (mode === selected) return;
  const step = steps[mode];
  selected = mode;
  demo.dataset.mode = mode;
  heroStage.dataset.mode = mode;
  demoContext.textContent = step.context;
  demoTitle.replaceChildren(step.title[0], document.createElement('br'), step.title[1]);
  demoDescription.textContent = step.description;
  demoStatusOne.textContent = step.statuses[0];
  demoStatusTwo.textContent = step.statuses[1];
  for (const button of demoButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.mode === mode));
  }
  if (!reducedMotion.matches) {
    demoCopy.classList.remove('scene-change');
    requestAnimationFrame(() => demoCopy.classList.add('scene-change'));
  }
  heroView?.show(mode);
}

for (const button of demoButtons) {
  button.addEventListener('click', () => selectHero(button.dataset.mode));
}

function activateStory(item) {
  if (activeItem === item) return;
  activeItem = item;
  for (const scene of sceneItems) {
    const expanded = scene === item;
    scene.element.classList.toggle('is-current', expanded);
    scene.button.setAttribute('aria-expanded', String(expanded));
    scene.description.inert = !expanded;
  }
  flowStage.dataset.mode = item.mode;
  storyCaption.textContent = steps[item.mode].name;
  storyView?.show(item.mode);
}

function focusLine() {
  return window.innerHeight * (window.innerWidth <= 700 ? 0.72 : 0.52);
}

function updateScroll() {
  scheduled = false;
  const anchor = focusLine();
  const positions = sceneItems.map(({ element }) => element.getBoundingClientRect());
  const first = positions[0];
  const last = positions.at(-1);
  const progress = Math.max(0, Math.min(1, (anchor - first.top) / (last.bottom - first.top)));
  const currentIndex = Math.max(0, positions.findLastIndex(({ top }) => top <= anchor));
  activateStory(sceneItems[currentIndex]);
  flowStory.style.setProperty('--journey-progress', progress.toFixed(3));

  const hero = heroStage.getBoundingClientRect();
  heroView?.setProgress(Math.max(0, Math.min(1, -hero.top / hero.height)));
  storyView?.setProgress(progress);
}

function scheduleScroll() {
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(updateScroll);
  }
}
for (const item of sceneItems) {
  item.button.addEventListener('click', () => {
    activateStory(item);
    const delta = item.element.getBoundingClientRect().top - focusLine() + 24;
    window.scrollBy({ top: delta, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  });
}
flowStory.classList.add('story-ready');
window.addEventListener('scroll', scheduleScroll, { passive: true });
window.addEventListener('resize', scheduleScroll);
window.addEventListener('load', scheduleScroll);
scheduleScroll();

async function start() {
  try {
    const { createSculpture } = await import('./sculpture.js');
    heroView = createSculpture(heroCanvas, heroStage, { resetButton: document.querySelector('#reset-angle') });
    heroView.show(selected);
    storyView = createSculpture(document.querySelector('#flow-sculpture'), flowStage, { interactive: false });
    storyView.show(flowStage.dataset.mode);
    scheduleScroll();
  } catch {
    // The stage controls and scroll story work with the CSS artwork.
  }
}

start();
