# takesih

Three.js로 만든 개인 포트폴리오입니다. 라온빌리어즈의 이용 흐름과 FlowCue 사례를 스크롤로 탐색할 수 있습니다.

## 로컬에서 보기

```sh
npm ci
npm run dev
```

## GitHub Pages에 배포

`main`에서 작업한 변경을 커밋하고 푸시한 뒤 `npm run deploy`를 실행하면 `dist`가 `gh-pages` 브랜치에 올라갑니다. 저장소의 GitHub Pages 소스는 `gh-pages` 브랜치의 루트입니다.

소개와 프로젝트 목록은 `index.html`, 이용 단계 문구와 스크롤 동작는 `src/main.js`, Three.js 조형물은 `src/sculpture.js`에서 수정할 수 있습니다.

매장 사진은 [라온빌리어즈 공개 사이트](https://takesih.github.io/laonad/)의 사진을 사용했습니다. 화면의 FlowCue 조형물과 데모는 기능을 설명하기 위한 예시입니다.
