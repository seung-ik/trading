// =========================
// 0. RAW 입력 (여기에 그대로 붙여넣기)
// =========================
const raw = `
20하방 17 중
20하방 23 상
20상방 21 하
20상방 22 상
20상방 26 상
20상방 54 상
20상방 48 상
20상방 31 하
20상방 18 상
20상방 62 중
20상방 38 상
20하방 12 상
20상방 28 중
20하방 33 상
20상방 23 중
20상방 15 상
20상방 19 중
20상방 19 하
20상방 29 하
20상방 29 하
20상방 27 하
20상방 23 상
20상방 19 중
20상방 22 하
20상방 17 중
20상방 35 하
20상방 31 중
20하방 47 하
20상방 32 상
20하방 20 하
20하방 24 상
20상방 11 상
20하방 12 하
20상방 18 하
20하방 18 상
20하방 17 중
20상방 36 상
20하방 52 하
20상방 43 하
20하방 23 상
20상방 25 상
20하방 18 하
20상방 27 하
20상방 26 하
20상방 13 하
20하방 29 상
20상방 31 중
20상방 16 상
20하방 11 상
20상방 8 상
20하방 11 하
20상방 21 중
20하방 27 상
20하방 16 상
20상방 25 상
20하방 23 중
20상방 29 중
20하방 18 중
20상방 9 하
20하방 12 중
20상방 17 하
20상방 25 중
20상방 27 하
20하방 27 중
20상방 26 하
20상방 12 중
20상방 21 중
20하방 29 상
`;

// =========================
// 1. RAW → DATA 변환 (핵심 추가)
// =========================
function parseRaw(raw) {
  return raw
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [dir, adx, res] = line.split(" ");
      return [dir, Number(adx), res];
    });
}

// =========================
// 2. ADX 구간 함수 (핵심)
// =========================
function getAdxBucket(adx) {
  if (adx < 10) return "<10";
  if (adx < 20) return "10~19";
  if (adx < 30) return "20~29";
  return "30+";
}

// =========================
// 3. 입력 검증
// =========================
function validate(data) {
  const validDir = new Set(["20상방", "20하방"]);
  const validRes = new Set(["상", "중", "하"]);

  data.forEach((row, i) => {
    const [dir, adx, res] = row;

    if (!validDir.has(dir)) {
      throw new Error(`Direction 오류 at index ${i}`);
    }

    if (typeof adx !== "number") {
      throw new Error(`ADX 숫자 오류 at index ${i}`);
    }

    if (!validRes.has(res)) {
      throw new Error(`Result 오류 at index ${i}`);
    }
  });
}

// =========================
// 4. 구조 생성
// =========================
function createStructure() {
  const buckets = ["<10", "10~19", "20~29", "30+"];

  const template = {};
  for (const b of buckets) {
    template[b] = { 상: 0, 중: 0, 하: 0 };
  }

  return {
    "20상방": JSON.parse(JSON.stringify(template)),
    "20하방": JSON.parse(JSON.stringify(template)),
  };
}

// =========================
// 5. 데이터 처리
// =========================
function process(data) {
  const result = createStructure();

  data.forEach(([dir, adx, res]) => {
    const bucket = getAdxBucket(adx);
    result[dir][bucket][res]++;
  });

  return result;
}

// =========================
// 6. Score
// =========================
function calcScore(stat) {
  const total = stat.상 + stat.중 + stat.하;
  if (total === 0) return 0;

  return (stat.상 * 1 + stat.중 * 0.7) / total;
}

// =========================
// 7. 확률
// =========================
function calcProb(stat) {
  const total = stat.상 + stat.중 + stat.하;
  if (total === 0) return { midToWin: 0, highReturn: 0 };

  return {
    midToWin: (stat.상 + stat.중) / total,
    highReturn: stat.상 / total,
  };
}

// =========================
// 8. 검산
// =========================
function check(data, result) {
  const inputCount = data.length;

  let sum = 0;

  for (const dir of ["20상방", "20하방"]) {
    for (const b of ["<10", "10~19", "20~29", "30+"]) {
      const stat = result[dir][b];
      sum += stat.상 + stat.중 + stat.하;
    }
  }

  if (sum !== inputCount) {
    throw new Error(`검산 실패: ${sum} ≠ ${inputCount}`);
  }
}

// =========================
// 9. 출력
// =========================
function print(result) {
  const buckets = ["<10", "10~19", "20~29", "30+"];

  const format = (v) => String(v).padStart(4);

  for (const dir of ["20상방", "20하방"]) {
    console.log("\n==============================================");
    console.log(`                 ${dir}`);
    console.log("==============================================");

    console.log("ADX 구간 |  상 |  중 |  하 |  중→상 |  중→하 | Score");
    console.log("----------------------------------------------");

    for (const b of buckets) {
      const stat = result[dir][b];
      const total = stat.상 + stat.중 + stat.하;

      const score = total === 0 ? 0 : (stat.상 * 1 + stat.중 * 0.7) / total;

      const midToWin = total === 0 ? 0 : (stat.상 + stat.중) / total;

      const highReturn = total === 0 ? 0 : stat.상 / total;

      console.log(
        `${b.padEnd(7)} |` +
          `${format(stat.상)} |` +
          `${format(stat.중)} |` +
          `${format(stat.하)} |` +
          `${String((midToWin * 100).toFixed(1) + "%").padStart(7)} |` +
          `${String((highReturn * 100).toFixed(1) + "%").padStart(7)} |` +
          `${score.toFixed(2)}`
      );
    }
  }
}

// =========================
// 10. 실행
// =========================
function run(raw) {
  const data = parseRaw(raw); // 🔥 자동 변환
  validate(data);
  const result = process(data);
  check(data, result);
  print(result);
}

// 실행
run(raw);
