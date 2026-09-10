# 별엽서 (Star Post)

핸드폰을 하늘로 들면 지금 그 방향에 있는 별과 별자리를 보여주고, 별자리를 우표로 찍어 엽서에 붙이는 웹앱입니다.
서버 없이 정적 파일만으로 동작합니다.

## 파일
- `index.html` / `style.css` / `app.js` — 앱 전체
- `img/` — 시안 이미지(배경, 스탬프 기계, 우표, 도장, 엽서, 우표 생성 버튼). 원본 PNG는 폴더 최상위에 그대로 있음
- `data/sky.js` — 별 3,232개(5.6등급까지) + 별자리 89개 선 데이터 (d3-celestial 데이터 가공)

## GitHub Pages 배포
1. GitHub에서 새 저장소 생성 (예: `starpost`)
2. 이 폴더에서
   ```bash
   git remote add origin https://github.com/<아이디>/starpost.git
   git push -u origin main
   ```
3. 저장소 **Settings → Pages → Source: Deploy from a branch → main / (root)** 저장
4. 1~2분 후 `https://<아이디>.github.io/starpost/` 에서 접속

## 사용 시 주의
- 방향 센서·위치는 **https**에서만 동작합니다 (GitHub Pages는 https라 OK).
- iPhone은 "하늘 보러 가기" 버튼을 누를 때 뜨는 **동작 및 방향 허용** 팝업에서 허용해야 합니다.
- 카카오톡 인앱 브라우저는 카메라를 막는 경우가 있습니다. 카메라 없이도 별은 보이며, 카메라를 쓰려면 우측 상단 `⋯ → 다른 브라우저로 열기`를 사용하세요.
- 방향이 어긋나면 화면을 좌우로 드래그해서 방위를 보정할 수 있습니다. 센서가 없는 PC에서는 드래그로 하늘을 둘러봅니다.
- 낮에도 별 위치를 계산해서 보여주며, 우표도 찍을 수 있습니다.
- 우표·엽서 내용은 기기 브라우저(localStorage)에 저장됩니다. 엽서에는 우표 6장까지 붙습니다.
- 스탬프 기계 창에 별자리가 안 들어오면 두 손가락으로 오므려(핀치) 축소하세요.
