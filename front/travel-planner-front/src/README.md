# 🗺️ AI 여행 플래너 (AI Travel Planner)

> **LLM 기반 맞춤형 일정 추천 및 카카오 지도 실시간 매핑, Redis + JWT 보안 아키텍처를 결합한 스마트 여행 플랫폼**  
> 사용자의 예산, 동반자, 취향을 분석하여 최적의 동선을 설계하고, 실존 장소 검증 알고리즘을 통해 신뢰할 수 있는 일정을 제공합니다.

---

## 🚀 Key Features (주요 기능)

- **AI 맞춤형 경로 추천**: 단 몇 개의 키워드와 예산 설정만으로 동선 최적화가 끝난 일정을 1초 만에 빌드합니다.
- **지능형 AI 챗봇**: 일정 생성 중 궁금한 점이나 세부 변경 사항을 실시간 대화로 소통하며 맞춤 가이드를 제공받습니다.
- **카카오 지도 실시간 매핑**: AI가 추천한 명소들을 카카오 맵 API와 동기화하여 마커 및 라인으로 직관적인 동선을 시각화합니다.
- **예산 최적화 엔진**: 카테고리별(식비, 숙박비, 입장료 등) 표준 물가를 기반으로 예상 총 소요 비용을 미리 산출해 줍니다.

---

## 🛠 Tech Stack (기술 스택)

### Frontend
- React, Tailwind CSS, Lucide React, React Router

### Backend
- Java, Spring Boot, Spring Data JPA, Spring Security

### Database & Storage
- Oracle SQL, Redis (In-Memory DB)

### AI & External API
- Groq API (Llama 3.3 70B), Kakao Map API

---

## 💡 Core Technical Accomplishments (핵심 기술적 성과)

### 1. 데이터 정제 및 유령 장소 차단 알고리즘 (Hallucination 방어)
- 유저가 입력한 다양한 형태의 행정구역명을 백엔드에서 전처리하여 표준화합니다.
- **2-Step Validation**: 1차(`지역명 + 장소명`), 2차(`장소명 단독`)로 카카오 맵 API와 교차 검색 검증을 수행합니다.
- API 매칭에 최종 실패한 가짜/유령 장소는 DB 저장 단계에서 **자동 스킵(Skip)** 처리하여 시스템의 안정성과 신뢰성을 확보했습니다.

### 2. Redis & JWT 기반 이중 토큰 보안 아키텍처
- **보안성 확보**: 로그인 성공 시 `Access Token(30분 만료)`과 `Refresh Token`을 동시 발급하며, 두 토큰 모두 클라이언트 **쿠키(Cookie)**에 안전하게 분할 저장됩니다.
- **고속 세션 제어**: 초고속 조회가 가능한 인메모리 데이터베이스 **Redis 서버**에 Refresh Token을 매핑하여 저장함으로써, 서버의 세션 제어권을 완벽히 확보했습니다.

### 3. Seamless UX (인터셉터 기반 자동 토큰 갱신)
- 사용자가 서비스를 이용하는 도중 30분이 지나 Access Token이 만료되면, 백엔드 인터셉터 단에서 쿠키와 Redis의 Refresh Token 유효성을 검증합니다.
- 토큰이 유효할 경우 사용자의 개입(재로그인) 없이 **Access Token을 자동 재발급하고 만료 시간을 30분으로 초기화**하여 끊김 없는 유연한 사용자 경험을 제공합니다.
