import { writeFile, access } from "node:fs/promises";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const CHOICES = {
  platform: ["react", "flutter"],
  base: ["neutral", "zinc", "slate"],
  radius: ["none", "sm", "md", "lg", "xl", "full"],
  mode: ["light-dark", "light", "dark"],
};

const DEFAULTS = {
  platform: "react",
  base: "neutral",
  radius: "md",
  mode: "light-dark",
};

const PATHS = {
  react: {
    tokens: "src/styles/tokens.css",
    components: "src/components/ui",
    utils: "src/lib/utils.ts",
  },
  flutter: {
    tokens: "lib/hyeon/foundation/hyeon_tokens.dart",
    components: "lib/hyeon/widgets",
    foundation: "lib/hyeon/foundation",
    widgets: "lib/hyeon/widgets",
  },
};

const ALIASES = {
  react: {
    components: "@/components",
    utils: "@/lib/utils",
    ui: "@/components/ui",
  },
};

/** --key=value / --key value / -y / --yes / --force 파싱 */
function parseFlags(args) {
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "-y" || a === "--yes") flags.yes = true;
    else if (a === "--force") flags.force = true;
    else if (a.startsWith("--")) {
      const eq = a.indexOf("=");
      if (eq > -1) flags[a.slice(2, eq)] = a.slice(eq + 1);
      else flags[a.slice(2)] = args[++i];
    }
  }
  return flags;
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/** TTY 대화형 프롬프트. 잘못된 값이면 재질문. 빈 입력은 기본값. */
async function prompt(rl, label, choices, def) {
  while (true) {
    const raw = (await rl.question(`${label} [${choices.join("/")}] (${def}): `))
      .trim()
      .toLowerCase();
    const value = raw || def;
    if (choices.includes(value)) return value;
    console.log(`  ! '${raw}'는 허용되지 않습니다. 다시 입력하세요.`);
  }
}

function validateOrThrow(key, value) {
  if (!CHOICES[key].includes(value)) {
    throw new Error(
      `--${key}에 '${value}'는 허용되지 않습니다. 허용: ${CHOICES[key].join(", ")}`,
    );
  }
}

/** 플래그/TTY 상태에 따라 4개 축 값을 결정. 필요한 경우에만 프롬프트. */
async function resolveAnswers(flags) {
  const answers = { ...DEFAULTS };
  for (const key of Object.keys(CHOICES)) {
    if (flags[key] != null) {
      validateOrThrow(key, flags[key]);
      answers[key] = flags[key];
    }
  }

  const missingKeys = Object.keys(CHOICES).filter((k) => flags[k] == null);
  if (flags.yes || missingKeys.length === 0) return answers;

  if (!stdin.isTTY) {
    throw new Error(
      `비-TTY 환경에서는 프롬프트를 쓸 수 없습니다. --yes 또는 플래그로 값을 지정하세요.\n` +
        `예: hyeon init --platform react --base neutral --radius md --mode light-dark`,
    );
  }

  const rl = createInterface({ input: stdin, output: stdout });
  try {
    console.log("Hyeon Design System 설정을 시작합니다. (Enter = 기본값)\n");
    for (const key of missingKeys) {
      answers[key] = await prompt(rl, labelFor(key), CHOICES[key], answers[key]);
    }
  } finally {
    rl.close();
  }
  return answers;
}

function labelFor(key) {
  return {
    platform: "플랫폼",
    base: "기본 색 스케일",
    radius: "radius",
    mode: "모드",
  }[key];
}

function buildConfig({ platform, base, radius, mode }) {
  return {
    $schema: "https://your-ds.dev/hyeon.schema.json",
    platform,
    style: "default",
    theme: { base, radius, mode },
    paths: PATHS[platform],
    ...(ALIASES[platform] ? { aliases: ALIASES[platform] } : {}),
  };
}

export async function init({ cwd, args }) {
  const flags = parseFlags(args);
  const configPath = resolve(cwd, "hyeon.config.json");

  if ((await exists(configPath)) && !flags.force) {
    throw new Error("hyeon.config.json이 이미 존재합니다. --force로 덮어쓰기 가능.");
  }

  const answers = await resolveAnswers(flags);
  const config = buildConfig(answers);

  await writeFile(configPath, JSON.stringify(config, null, 2) + "\n", "utf8");

  console.log(`\n✓ hyeon.config.json 생성 완료`);
  console.log(`  platform: ${answers.platform}`);
  console.log(`  theme:    base=${answers.base}, radius=${answers.radius}, mode=${answers.mode}`);
  console.log(`\n다음 단계:  hyeon add tokens button`);
}
