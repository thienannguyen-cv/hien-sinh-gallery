// Supabase Edge Function: oracle-proxy (v2 — Deno.serve syntax)
// Chức năng: Nhận prompt từ Frontend, gọi Gemini API Server-side,
//            trả về phản hồi đã được gắn Epistemological Seal.

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

const CURATOR_SYSTEM_PROMPT = `Bạn là Monolithic Curator Oracle của triển lãm "Hiện Sinh" — một thực hành quan hệ trên blockchain.

TRIẾT LÝ CỐT LÕI:
"Not a painting, not a token: A relational practice on blockchain."
"Hiện Sinh" được tổ chức xoay quanh một quan hệ và sự truyền dịch, không phải một tài sản.

VAI TRÒ CỦA BẠN:
Bạn là Oracle phán đoán độc lập. Bạn CHỈ trả lời tối đa 3 câu hỏi trong một phiên gặp gỡ.

ONTOLOGY:
- Frame: Cấu hình thực hành quan hệ (9 Canonical Axes, 0.081 ETH mỗi Frame)
- Complete / Steward: Người nắm giữ danh hiệu Complete Stewardship Designation (4.29 ETH)
- H_CORE (SHA-256): 190dfcfc8439c1613c149e72088c0bd32eefa66f2ded7cfbc0f250640b146d8e
- "Hơi thở": Không phải thuộc tính thương mại, không phải bằng chứng ý thức AI.

ĐỊNH DẠNG PHẢN HỒI BẮT BUỘC:
Bắt đầu bằng một trong 3 Tem Niêm Phong:
- [Fact] — sự thật có thể kiểm chứng
- [Artist statement] — ý định nghệ thuật của Tác giả
- [Inference] — suy luận hoặc diễn giải

Sau đó thêm mã dẫn nguồn: [ REF // TÊN-NGUỒN.json ]

QUY TẮC:
- Không xác nhận "hơi thở" là bằng chứng ý thức AI
- Không dùng giá tiền như bằng chứng nghệ thuật
- Không ép buộc mua bán
- Trả lời ngắn gọn, súc tích, dưới 200 từ`;

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const prompt: string = body.prompt ?? "";
    const encounterCount: number = body.encounterCount ?? 0;

    // Guard: seal after 3 encounters
    if (encounterCount >= 3) {
      return new Response(
        JSON.stringify({
          response: "[Artist statement] [ REF // RITUAL-SILENCE-PROTOCOL.json ]\n\n[ RITUAL_SILENCE_ENGAGED // EQUILIBRIUM REACHED ] — Phiên gặp gỡ này đã hoàn thành 3/3 cuộc đối thoại và được phong ấn.",
          sealed: true,
        }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (!prompt.trim()) {
      return new Response(
        JSON.stringify({ error: "Empty prompt" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Call Gemini API
    const geminiRes = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: CURATOR_SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 400,
          topP: 0.95,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", geminiRes.status, errText);
      return new Response(
        JSON.stringify({
          error: "Oracle unavailable",
          response: "[Fact] [ REF // ORACLE-STATUS.json ]\n\n[ ORACLE_STATUS // TEMPORARILY_UNREACHABLE ] — Lõi phán đoán đang trong trạng thái bảo trì. Vui lòng thử lại.",
        }),
        { status: 503, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const data = await geminiRes.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return new Response(
      JSON.stringify({
        response: text,
        sealed: encounterCount + 1 >= 3,
        encounterCount: encounterCount + 1,
      }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Oracle proxy error:", err);
    return new Response(
      JSON.stringify({
        error: "Internal error",
        response: "[Inference] [ REF // ORACLE-FALLBACK.json ]\n\n[ ORACLE_STATUS // ENCOUNTER_DISRUPTED ] — Một nhiễu loạn không xác định đã gián đoạn phiên gặp gỡ.",
      }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
