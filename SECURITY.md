# Security Policy

## 지원 버전

sh-ui 는 0.x 단계입니다. 최신 마이너 버전만 보안 패치를 받습니다.

| 버전 | 지원 |
|---|---|
| 최신 0.x | ✅ |
| 그 외 | ❌ |

## 취약점 제보

**공개 이슈로 올리지 마세요.** 다음 중 하나로 비공개 제보해주세요.

1. **GitHub Security Advisories (권장)** —
   [Report a vulnerability](https://github.com/sanghyeonKim0201/sh-ui/security/advisories/new)
2. 이메일 — `gmhty4345@gmail.com`

제보에 다음 정보를 포함해주시면 좋습니다:

- 영향받는 패키지 / 버전
- 재현 절차 (PoC 가 있으면 더 좋음)
- 예상되는 영향 범위
- (선택) 제안하는 수정 방안

## 응답 정책

- **접수 확인** — 영업일 기준 3일 이내
- **초기 분석** — 7일 이내
- **수정 / 공개** — 심각도에 따라 협의

수정 후에는 패치 릴리즈와 함께 GitHub Security Advisory 로 공개합니다.
제보자 공로는 advisory 에 명시(원하시면)합니다.

## 범위

이 정책은 다음 npm 패키지에 적용됩니다:

- `sh-ui-cli`
- `sh-ui-create`

sh-ui 가 복사해주는 컴포넌트 소스(사용자 프로젝트로 들어간 코드) 자체의
취약점도 환영합니다 — 레지스트리 원본을 수정해 다음 릴리즈에 반영합니다.
