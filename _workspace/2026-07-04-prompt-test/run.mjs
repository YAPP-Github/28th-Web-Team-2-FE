// 1차 LLM(조하리 quadrants) 프롬프트 테스트 하네스
// 사용: node run.mjs            (기본 gpt-5.4-mini)
//       MODEL=gpt-5.4 node run.mjs
// env : scratchpad/.env 의 OPENAI_API_KEY 를 읽음 (레포 밖)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV_PATH =
  "/private/tmp/claude-501/-Users-sonhomin-Documents-28th-Web-Team-2-FE/e92cd084-33fa-427e-818b-653c48487992/scratchpad/.env";

function loadEnv(path) {
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) process.env[m[1]] ??= m[2];
  }
}
loadEnv(ENV_PATH);

const MODEL = process.env.MODEL || "gpt-5.4-mini";
const SYSTEM = readFileSync(join(__dirname, "prompt-1st-system.txt"), "utf8");
const fixtures = JSON.parse(readFileSync(join(__dirname, "fixtures.json"), "utf8"));
const answers = fixtures.answers;
const expectedIds = answers.map((a) => a.submissionAnswerId);

// --- 유저 입력 구성 (문서 1-B composeNarrativeInput 골격) ---
const answerBlocks = answers
  .map(
    (a) =>
      `submissionAnswerId: ${a.submissionAnswerId}\n` +
      `respondentLabel: ${a.respondentLabel}\n` +
      `submitterType: ${a.submitterType}\n` +
      `traitCode: ${a.traitCode}\n` +
      `question: ${a.question}\n` +
      `answer: ${a.answer}`
  )
  .join("\n\n");

const userInput =
  `expectedSubmissionAnswerIds:\n${expectedIds.join(", ")}\n\n` +
  `completed survey answers:\n` +
  `- 각 입력 행은 서로 독립이다.\n` +
  `- \`submissionAnswerId\`가 다른 행은 답변 내용이 비슷해도 절대 합치지 않는다.\n` +
  `- \`answerAdjectives\`는 \`expectedSubmissionAnswerIds\`와 같은 개수, 같은 순서로 1:1 대응해야 한다.\n` +
  answerBlocks;

// --- JSON Schema (strict) ---
const quadrant = {
  type: "object",
  additionalProperties: false,
  required: ["definitionKeyword", "oneLineDefinition", "adjectiveKeywords", "interpretation", "image"],
  properties: {
    definitionKeyword: { type: "string" },
    oneLineDefinition: { type: "string" },
    adjectiveKeywords: { type: "array", items: { type: "string" } },
    interpretation: { type: "string" },
    image: {
      type: "object",
      additionalProperties: false,
      required: ["situationEmotion", "gaze", "pose", "props", "background", "lightingTone"],
      properties: {
        situationEmotion: { type: "string" },
        gaze: { type: "string" },
        pose: { type: "string" },
        props: { type: "string" },
        background: { type: "string" },
        lightingTone: { type: "string" },
      },
    },
  },
};

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["answerAdjectives", "quadrants"],
  properties: {
    answerAdjectives: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["submissionAnswerId", "adjectives"],
        properties: {
          submissionAnswerId: { type: "integer" },
          adjectives: { type: "array", items: { type: "string" } },
        },
      },
    },
    quadrants: {
      type: "object",
      additionalProperties: false,
      required: ["OPEN", "BLIND", "HIDDEN", "UNKNOWN"],
      properties: { OPEN: quadrant, BLIND: quadrant, HIDDEN: quadrant, UNKNOWN: quadrant },
    },
  },
};

// --- 호출 ---
const t0 = Date.now();
const res = await fetch("https://api.openai.com/v1/responses", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  },
  body: JSON.stringify({
    model: MODEL,
    instructions: SYSTEM,
    input: userInput,
    reasoning: { effort: "low" },
    text: { format: { type: "json_schema", name: "looky_quadrants", strict: true, schema } },
  }),
});
const raw = await res.json();
const ms = Date.now() - t0;

if (!res.ok) {
  console.error("HTTP", res.status, JSON.stringify(raw.error ?? raw, null, 2));
  process.exit(1);
}

// output_text 추출
let text = raw.output_text;
if (!text) {
  const msg = (raw.output ?? []).find((o) => o.type === "message");
  text = msg?.content?.find((c) => c.type === "output_text")?.text;
}
if (!text) {
  console.error("no output_text. raw:", JSON.stringify(raw, null, 2).slice(0, 2000));
  process.exit(1);
}

const data = JSON.parse(text);
const u = raw.usage ?? {};
console.log(
  `\n=== MODEL ${MODEL} · ${ms}ms ===\n` +
    `usage: input ${u.input_tokens ?? "?"} (cached ${u.input_tokens_details?.cached_tokens ?? 0}) · ` +
    `output ${u.output_tokens ?? "?"} (reasoning ${u.output_tokens_details?.reasoning_tokens ?? 0}) · ` +
    `total ${u.total_tokens ?? "?"}\n`
);
console.log(JSON.stringify(data, null, 2));

// --- 규칙 검증 ---
const clen = (s) => [...(s ?? "")].length; // 공백 포함 글자수(코드포인트)
const warn = [];
const ok = [];

// answerAdjectives
const gotIds = (data.answerAdjectives ?? []).map((a) => a.submissionAnswerId);
if (gotIds.length !== expectedIds.length) warn.push(`answerAdjectives 개수 ${gotIds.length} ≠ 기대 ${expectedIds.length}`);
const missing = expectedIds.filter((id) => !gotIds.includes(id));
const extra = gotIds.filter((id) => !expectedIds.includes(id));
if (missing.length) warn.push(`answerAdjectives 누락 ID: ${missing.join(", ")}`);
if (extra.length) warn.push(`answerAdjectives 신규/오류 ID: ${extra.join(", ")}`);
if (!missing.length && !extra.length && gotIds.length === expectedIds.length) ok.push("answerAdjectives ID 1:1 대응 OK");

const MODIFIER_END = /(하는|되는|나는|치는|피는|리는|기는|이는|우는|주는|드는|찾는|는|은|한|운|던|린)$/;
const NON_YO = /(다|음|임|네|군|죠|랍니다|습니다)[.!?]?$/;

for (const key of ["OPEN", "BLIND", "HIDDEN", "UNKNOWN"]) {
  const q = data.quadrants?.[key];
  if (!q) { warn.push(`${key} 사분면 없음`); continue; }

  if (!q.definitionKeyword?.trim()) warn.push(`${key}.definitionKeyword 비어있음`);

  const one = q.oneLineDefinition ?? "";
  if (!MODIFIER_END.test(one.trim())) warn.push(`${key}.oneLineDefinition 관형형(~하는/한/는) 아님: "${one}"`);

  if ((q.adjectiveKeywords ?? []).length !== 2) warn.push(`${key}.adjectiveKeywords 2개 아님(${(q.adjectiveKeywords ?? []).length}개)`);

  const body = q.interpretation ?? "";
  const n = clen(body);
  if (n < 70 || n > 90) warn.push(`${key}.interpretation 글자수 ${n} (70~90 벗어남): "${body}"`);
  // 문장별 ~요 체 점검
  const sents = body.split(/(?<=[.!?])\s*/).filter((s) => s.trim());
  for (const s of sents) {
    const tail = s.replace(/[.!?]\s*$/, "");
    if (NON_YO.test(tail) || !/요$/.test(tail)) { warn.push(`${key}.interpretation 비-요체 문장: "${s.trim()}"`); break; }
  }

  const img = q.image ?? {};
  for (const f of ["situationEmotion", "gaze", "pose", "props", "background", "lightingTone"]) {
    if (!img[f]?.trim()) warn.push(`${key}.image.${f} 비어있음`);
    else if (/[A-Za-z]{3,}/.test(img[f])) warn.push(`${key}.image.${f} 영어 섞임: "${img[f]}"`);
  }
}

console.log("\n=== 검증 리포트 ===");
if (ok.length) console.log("OK:\n- " + ok.join("\n- "));
if (warn.length) console.log("\n⚠ 위반/주의:\n- " + warn.join("\n- "));
else console.log("\n✅ 규칙 위반 없음");
