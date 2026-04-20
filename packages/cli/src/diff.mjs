// 의존성 없는 라인 단위 unified-diff 생성기.
// 컴포넌트 파일(~1000줄 이하)에 충분한 성능의 LCS-DP.

/** LCS DP로 (=, -, +) 시퀀스를 만든다. */
function lcsOps(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const ops = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      ops.unshift({ op: "=", line: a[i - 1] });
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      ops.unshift({ op: "-", line: a[i - 1] });
      i--;
    } else {
      ops.unshift({ op: "+", line: b[j - 1] });
      j--;
    }
  }
  while (i > 0) {
    ops.unshift({ op: "-", line: a[i - 1] });
    i--;
  }
  while (j > 0) {
    ops.unshift({ op: "+", line: b[j - 1] });
    j--;
  }
  return ops;
}

/** 터미널 컬러가 지원되면 ANSI 이스케이프, 아니면 평문. */
function paint(useColor) {
  if (!useColor) {
    return {
      red: (s) => s,
      green: (s) => s,
      dim: (s) => s,
    };
  }
  return {
    red: (s) => `\x1b[31m${s}\x1b[0m`,
    green: (s) => `\x1b[32m${s}\x1b[0m`,
    dim: (s) => `\x1b[2m${s}\x1b[0m`,
  };
}

/**
 * 두 텍스트를 비교해 unified diff 문자열을 반환한다.
 * context 줄은 `===`(동일 블록) 3개를 넘어가면 축약.
 */
export function formatUnifiedDiff(oldText, newText, { useColor = false, context = 3 } = {}) {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const ops = lcsOps(oldLines, newLines);

  const c = paint(useColor);
  const out = [];
  let addCount = 0;
  let delCount = 0;

  // 변경이 있는 구간만 context 라인과 함께 출력
  const changeIdx = [];
  ops.forEach((o, idx) => {
    if (o.op !== "=") changeIdx.push(idx);
  });
  if (changeIdx.length === 0) {
    return { text: "", addCount: 0, delCount: 0 };
  }

  // 인접한 변경들을 그룹으로 묶어 context 범위 표시
  const groups = [];
  let cur = { start: Math.max(0, changeIdx[0] - context), end: changeIdx[0] + context };
  for (let k = 1; k < changeIdx.length; k++) {
    const idx = changeIdx[k];
    if (idx - context <= cur.end) {
      cur.end = Math.max(cur.end, idx + context);
    } else {
      groups.push(cur);
      cur = { start: idx - context, end: idx + context };
    }
  }
  groups.push(cur);

  for (const g of groups) {
    out.push(c.dim(`  @@ …`));
    const from = Math.max(0, g.start);
    const to = Math.min(ops.length - 1, g.end);
    for (let idx = from; idx <= to; idx++) {
      const o = ops[idx];
      if (o.op === "=") out.push(`  ${o.line}`);
      else if (o.op === "-") {
        out.push(c.red(`- ${o.line}`));
        delCount++;
      } else {
        out.push(c.green(`+ ${o.line}`));
        addCount++;
      }
    }
  }

  // groups를 만들 때 delCount/addCount가 context에 걸친 실제 + / - 라인만 세도록 보정:
  // 위 반복에서 동일한 인덱스의 - / +만 센 것이므로 일치한다. (중복 카운트 우려 없음)

  return { text: out.join("\n"), addCount, delCount };
}
