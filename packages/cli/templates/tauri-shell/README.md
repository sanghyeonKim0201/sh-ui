# {{project_name}} — Tauri 데스크탑 셸

이 디렉토리는 Tauri 2.x 의 Rust 코드입니다. 부모 디렉토리의 vite SPA 가
프론트엔드, 이 디렉토리가 native 윈도우 셸.

## 첫 실행

```bash
# 부모 디렉토리에서 (vite 앱 루트)
pnpm install
pnpm tauri dev    # Rust 처음 빌드는 5~10분 — 캐시되면 이후 5~10초
```

Rust toolchain (`cargo`, `rustc`) 이 시스템에 설치되어 있어야 합니다. 없으면
https://rustup.rs/ 참고.

## 프로덕션 빌드 전 체크리스트

1. **Bundle identifier** — `tauri.conf.json` 의 `identifier: "app.{{tauri_crate_name}}.dev"` 를
   실제 도메인 기반 unique ID 로 교체 (예: `com.yourcompany.{{tauri_crate_name}}`).
   동일 ID 로 publish 된 다른 앱과 충돌 시 OS install 이 깨질 수 있음.
2. **Icons** — `tauri.conf.json` 의 `bundle.icon: []` 가 비어 있습니다. 프로덕션 빌드 시:
   - 1024x1024 PNG 준비 (square, 투명 배경 권장)
   - 부모 디렉토리에서 `pnpm tauri icon path/to/source.png` 실행 — `src-tauri/icons/` 에
     플랫폼별 variants 자동 emit + `bundle.icon` 자동 채워짐
3. **Capabilities** — `capabilities/default.json` 은 최소 권한. fs / dialog / shell 등
   확장 API 가 필요하면 https://v2.tauri.app/security/ 참고.
4. **Window 옵션** — `tauri.conf.json` 의 `app.windows[0]` 에 `decorations`, `transparent`,
   `alwaysOnTop` 등 추가 가능.

## Rust 코드 추가

`src/lib.rs` 의 `invoke_handler![]` 안에 새 command 등록:

```rust
#[tauri::command]
fn my_command(name: &str) -> String {
    format!("Hello, {}!", name)
}

// run() 안의 .invoke_handler 에:
.invoke_handler(tauri::generate_handler![my_command])
```

프론트엔드에서:
```ts
import { invoke } from '@tauri-apps/api/core';
const greeting = await invoke<string>('my_command', { name: 'World' });
```
