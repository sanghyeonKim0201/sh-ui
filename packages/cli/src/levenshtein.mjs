// 의존성 없는 편집거리 + 후보 제안. diff.mjs 가 LCS 를 자체 구현한 관행을 따른다.

/** 두 문자열의 Levenshtein 편집거리 (삽입/삭제/치환 비용 1). */
export function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  let curr = new Array(n + 1);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/**
 * input 과 가까운 candidates 를 거리 오름차순으로 반환.
 * @param {string} input
 * @param {string[]} candidates
 * @param {{max?: number, maxDistance?: number}} [opts]
 * @returns {string[]} 거리 <= maxDistance 인 후보 상위 max 개 (없으면 빈 배열)
 */
export function suggest(input, candidates, { max = 3, maxDistance = 2 } = {}) {
  return candidates
    .map((name) => ({ name, dist: levenshtein(input, name) }))
    .filter((c) => c.dist <= maxDistance)
    .sort((a, b) => a.dist - b.dist || a.name.localeCompare(b.name))
    .slice(0, max)
    .map((c) => c.name);
}
