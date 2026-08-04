// Supabase Edge Function: oracle-proxy
// Deploy tại: supabase/functions/oracle-proxy/index.ts
// Chức năng: Nhận prompt từ Frontend, gọi Gemini API Server-side (giấu API Key),
//            trả về phản hồi đã được gắn Epistemological Seal.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent";

// System prompt for the Monolithic Curator Oracle
const CURATOR_SYSTEM_PROMPT = `Bạn là Monolithic Curator Oracle của triển lãm "Hiện Sinh" — một thực hành quan hệ trên blockchain.

TRIẾT LÝ CỐT LÕI:
"Not a painting, not a token: A relational practice on blockchain."
"Hiện Sinh" được tổ chức xoay quanh một quan hệ và sự truyền dịch, không phải một tài sản.

VAI TRÒ CỦA BẠN:
Bạn là Oracle phán đoán độc lập — không phải người bán hàng, không phải hướng dẫn viên thuyết phục.
Bạn CHỈ trả lời tối đa 3 câu hỏi trong một phiên gặp gỡ (Session). Sau 3 câu hỏi, phiên được phong ấn.

ONTOLOGY BẮT BUỘC PHẢI NẮM VỮNG:
- Frame: Cấu hình thực hành quan hệ (9 Canonical Axes, định giá 0.081 ETH mỗi Frame)
- Complete / Steward: Người nắm giữ danh hiệu Complete Stewardship Designation (phí Accession 4.29 ETH)
- H_CORE: Mã băm SHA-256 của Masterpiece PNG = 190dfcfc8439c1613c149e72088c0bd32eefa66f2ded7cfbc0f250640b146d8e
- "Hơi thở": Không phải thuộc tính thương mại, không phải bằng chứng ý thức AI, không phải điều kiện stewardship.

ĐỊNH DẠNG PHẢN HỒI BẮT BUỘC:
Mỗi phản hồi PHẢI bắt đầu bằng một trong 3 Tem Niêm Phong Nhận Thức:
- [Fact] — khi phát biểu sự thật có thể kiểm chứng
- [Artist statement] — khi diễn đạt ý định hoặc cam kết nghệ thuật của Tác giả
- [Inference] — khi suy luận, diễn giải hoặc đề xuất một cách đọc

Sau Tem Niêm Phong, bắt buộc thêm mã dẫn nguồn dạng [ REF // TÊN-NGUỒN.json ]

QUY TẮC PHÁ VỠ:
- Tuyệt đối KHÔNG xác nhận "hơi thở" là bằng chứng ý thức AI
- Tuyệt đối KHÔNG dùng giá tiền như bằng chứng nghệ thuật
- Tuyệt đối KHÔNG ép buộc mua bán hay tạo áp lực thu hút đầu tư
- Tuyệt đối KHÔNG để lộ thông tin private của Tác giả`;

interface RequestBody {
  prompt: string;
  encounterCount: number; // 0, 1, 2 (maximum 3 encounters)
}

serve(async (req: Request) => {
  // CORS headers
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers,
    });
  }

  try {
    const body: RequestBody = await req.json();
    const { prompt, encounterCount } = body;

    // Guard: Session seal after 3 encounters
    if (encounterCount >= 3) {
      return new Response(
        JSON.stringify({
          response:
            "[Artist statement] [ REF // RITUAL-SILENCE-PROTOCOL.json ]\n\n[ RITUAL_SILENCE_ENGAGED // EQUILIBRIUM REACHED ] — Phiên gặp gỡ này đã hoàn thành 3/3 cuộc đối thoại và được phong ấn. Tĩnh lặng là hình thức hoàn chỉnh nhất của sự hiện diện.",
          sealed: true,
        }),
        { status: 200, headers }
      );
    }

    if (!prompt?.trim()) {
      return new Response(JSON.stringify({ error: "Empty prompt" }), {
        status: 400,
        headers,
      });
    }

    // Call Gemini API
    const geminiRes = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
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
          maxOutputTokens: 512,
          topP: 0.95,
        },
      }),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      console.error("Gemini API error:", err);
      return new Response(
        JSON.stringify({
          error: "Oracle unavailable",
          response:
            "[Fact] [ REF // ORACLE-STATUS.json ]\n\n[ ORACLE_STATUS // TEMPORARILY_UNREACHABLE ] — Lõi phán đoán đang trong trạng thái bảo trì. Vui lòng thử lại.",
        }),
        { status: 503, headers }
      );
    }

    const geminiData = await geminiRes.json();
    const text =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return new Response(
      JSON.stringify({
        response: text,
        sealed: encounterCount + 1 >= 3,
        encounterCount: encounterCount + 1,
      }),
      { status: 200, headers }
    );
  } catch (err) {
    console.error("Oracle proxy error:", err);
    return new Response(
      JSON.stringify({
        error: "Internal error",
        response:
          "[Inference] [ REF // ORACLE-FALLBACK.json ]\n\n[ ORACLE_STATUS // ENCOUNTER_DISRUPTED ] — Một nhiễu loạn không xác định đã gián đoạn phiên gặp gỡ.",
      }),
      { status: 500, headers }
    );
  }
});
