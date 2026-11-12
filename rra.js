// =========================
// 0. RAW 입력
// =========================

const raw = `

1.38 / 0.4
1.68 / 0
4 / 2.5
8.3 / 4.6
2.75 / 1.7
3.5 / 2.1
4.4 / 2.3
5.2 / 3.5
5.2 / 3.8
2.7 / 1.6
5.2 / 3.45
1.3 / 0.4
6.2 / 4.2
2.3 / 1.7
1.8 / 1.2
1.8 / 1.1
2.2 / 1.5
1.3 / 0.8
4 / 2.3
2.5 / 1.1
5 / 2.2
18.2 / 15
4.8 / 3.2
3.1 / 0.7
3.9 / 1.9
0.8 / 0
2.7 / 2
5.5 / 2.6
5.6 / 4.5
2 / 1
2.2 / 0.4
4.4 / 3.2
25 / 14.8
3.57 / 1.96
3.6 / 1.8
1.7 / 1.2
5.9 / 4.9
7.6 / 4.9
3.98 / 2.2
`;


// =========================
// 1. RAW → DATA 변환
// =========================

function parseRaw(raw) {

  return raw
    .trim()
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map((line, i) => {

      const parts = line.split("/");

      if (parts.length !== 2) {
        throw new Error(
          `입력 형식 오류 at index ${i}: "${line}"\n` +
          `예: 3.4 / 2`
        );
      }

      const maxR = Number(parts[0].trim());
      const finalR = Number(parts[1].trim());

      return [maxR, finalR];
    });
}


// =========================
// 2. 입력 검증
// =========================

function validate(data) {

  if (data.length === 0) {
    throw new Error("입력 데이터가 없습니다.");
  }

  data.forEach(([maxR, finalR], i) => {

    if (!Number.isFinite(maxR)) {
      throw new Error(
        `MaxR 숫자 오류 at index ${i}`
      );
    }

    if (!Number.isFinite(finalR)) {
      throw new Error(
        `FinalR 숫자 오류 at index ${i}`
      );
    }

    if (maxR < 0) {
      throw new Error(
        `MaxR 음수 오류 at index ${i}: ${maxR}`
      );
    }

    if (finalR < 0) {
      throw new Error(
        `FinalR 음수 오류 at index ${i}: ${finalR}`
      );
    }

    if (finalR > maxR) {
      throw new Error(
        `FinalR > MaxR 오류 at index ${i}: ` +
        `${finalR} > ${maxR}`
      );
    }
  });
}


// =========================
// 3. 중앙값
// =========================

function calcMedian(values) {

  const sorted =
    [...values].sort((a, b) => a - b);

  const n = sorted.length;

  if (n === 0) {
    return 0;
  }

  if (n % 2 === 1) {
    return sorted[Math.floor(n / 2)];
  }

  return (
    sorted[n / 2 - 1] +
    sorted[n / 2]
  ) / 2;
}


// =========================
// 4. 기본 통계
// =========================

function calcBasicStats(data) {

  const n = data.length;

  const maxRs =
    data.map(([maxR]) => maxR);

  const finalRs =
    data.map(([, finalR]) => finalR);

  const avgMaxR =
    maxRs.reduce((a, b) => a + b, 0) / n;

  const avgFinalR =
    finalRs.reduce((a, b) => a + b, 0) / n;

  const medianMaxR =
    calcMedian(maxRs);

  const medianFinalR =
    calcMedian(finalRs);

  // 전체 Retention
  // = 전체 FinalR 합계 / 전체 MaxR 합계
  const totalMaxR =
    maxRs.reduce((a, b) => a + b, 0);

  const totalFinalR =
    finalRs.reduce((a, b) => a + b, 0);

  const retention =
    totalMaxR === 0
      ? 0
      : totalFinalR / totalMaxR;

  return {
    n,
    avgMaxR,
    medianMaxR,
    avgFinalR,
    medianFinalR,
    retention
  };
}


// =========================
// 5. MaxR 도달률
// =========================

function calcReachRate(data, threshold) {

  const count =
    data.filter(
      ([maxR]) => maxR >= threshold
    ).length;

  return {
    threshold,
    count,
    total: data.length,
    rate:
      data.length === 0
        ? 0
        : count / data.length
  };
}


// =========================
// 6. MaxR 도달 특성
//
// 패턴의 추세 확장력이
// 어느 정도까지 얼마나 자주 나오는지 확인
// =========================

function calcMaxRReach(data) {

  const thresholds = [
    1.5,
    2,
    3,
    4,
    5,
    7
  ];

  return thresholds.map(threshold => {

    return calcReachRate(
      data,
      threshold
    );
  });
}


// =========================
// 7. 전체 분석
// =========================

function analyze(data) {

  const basic =
    calcBasicStats(data);

  const maxRReach =
    calcMaxRReach(data);

  return {
    basic,
    maxRReach
  };
}


// =========================
// 8. 출력
// =========================

function print(analysis) {

  const {
    basic,
    maxRReach
  } = analysis;


  // ============================================
  // ① 패턴 전체 요약
  // ============================================

  console.log("\n==============================================");
  console.log("             ① 패턴 전체 요약");
  console.log("==============================================");

  console.log(
    "항목                    | 값"
  );

  console.log(
    "----------------------------------------------"
  );

  console.log(
    `표본 수                 | ${basic.n}`
  );

  console.log(
    `평균 MaxR               | ${basic.avgMaxR.toFixed(3)}R`
  );

  console.log(
    `중앙 MaxR               | ${basic.medianMaxR.toFixed(3)}R`
  );

  console.log(
    `평균 FinalR             | ${basic.avgFinalR.toFixed(3)}R`
  );

  console.log(
    `중앙 FinalR             | ${basic.medianFinalR.toFixed(3)}R`
  );

  console.log(
    `Retention               | ${(basic.retention * 100).toFixed(1)}%`
  );


  // ============================================
  // ② MaxR 도달 특성
  // ============================================

  console.log("\n==============================================");
  console.log("             ② MaxR 도달 특성");
  console.log("==============================================");

  console.log(
    "MaxR 기준 | 도달 거래수 | 도달 확률"
  );

  console.log(
    "----------------------------------------------"
  );

  maxRReach.forEach(row => {

    console.log(
      `${String("≥ " + row.threshold + "R").padEnd(9)} |` +
      `${String(row.count).padStart(10)} |` +
      `${String(
        (row.rate * 100).toFixed(1) + "%"
      ).padStart(9)}`
    );
  });
}


// =========================
// 9. 검산
// =========================

function check(data, analysis) {

  const inputCount =
    data.length;

  // --------------------------------------------
  // 기본 통계 검산
  // --------------------------------------------

  if (analysis.basic.n !== inputCount) {

    throw new Error(
      `기본 통계 검산 실패: ` +
      `${analysis.basic.n} ≠ ${inputCount}`
    );
  }


  // --------------------------------------------
  // MaxR 도달률 검산
  // --------------------------------------------

  analysis.maxRReach.forEach(row => {

    if (row.count < 0 || row.count > inputCount) {

      throw new Error(
        `MaxR 도달률 검산 실패: ` +
        `${row.threshold}R`
      );
    }

    if (row.total !== inputCount) {

      throw new Error(
        `MaxR 전체 거래수 검산 실패: ` +
        `${row.threshold}R`
      );
    }

    const expectedRate =
      row.count / inputCount;

    if (
      Math.abs(
        row.rate - expectedRate
      ) > 1e-12
    ) {

      throw new Error(
        `MaxR 도달률 계산 검산 실패: ` +
        `${row.threshold}R`
      );
    }
  });


  // --------------------------------------------
  // 중앙값 기본 검산
  // --------------------------------------------

  const maxRs =
    data.map(([maxR]) => maxR);

  const finalRs =
    data.map(([, finalR]) => finalR);

  const expectedMedianMaxR =
    calcMedian(maxRs);

  const expectedMedianFinalR =
    calcMedian(finalRs);

  if (
    Math.abs(
      analysis.basic.medianMaxR -
      expectedMedianMaxR
    ) > 1e-12
  ) {

    throw new Error(
      "중앙 MaxR 검산 실패"
    );
  }

  if (
    Math.abs(
      analysis.basic.medianFinalR -
      expectedMedianFinalR
    ) > 1e-12
  ) {

    throw new Error(
      "중앙 FinalR 검산 실패"
    );
  }


  // --------------------------------------------
  // Retention 검산
  // --------------------------------------------

  const totalMaxR =
    maxRs.reduce(
      (a, b) => a + b,
      0
    );

  const totalFinalR =
    finalRs.reduce(
      (a, b) => a + b,
      0
    );

  const expectedRetention =
    totalMaxR === 0
      ? 0
      : totalFinalR / totalMaxR;

  if (
    Math.abs(
      analysis.basic.retention -
      expectedRetention
    ) > 1e-12
  ) {

    throw new Error(
      "Retention 검산 실패"
    );
  }


  // --------------------------------------------
  // 검산 출력
  // --------------------------------------------

  console.log("\n==============================================");
  console.log("                    검산");
  console.log("==============================================");

  console.log(
    `입력 데이터 수         : ${inputCount}`
  );

  console.log(
    `MaxR 도달 기준 수      : ${analysis.maxRReach.length}`
  );

  console.log(
    `중앙값 계산             : 정상`
  );

  console.log(
    `Retention 계산          : 정상`
  );

  console.log("----------------------------------------------");
  console.log("✓ 전체 검산 정상");
}


// =========================
// 10. 실행
// =========================

function run(raw) {

  // RAW → DATA
  const data =
    parseRaw(raw);

  // 입력 검증
  validate(data);

  // 분석
  const analysis =
    analyze(data);

  // 출력
  print(analysis);

  // 검산은 맨 아래
  check(data, analysis);
}


// 실행
run(raw);