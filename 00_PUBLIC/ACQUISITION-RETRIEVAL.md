# Quy trình Nhận và Truy xuất Lưu trữ — Hiện sinh (Acquisition & Retrieval)

**Bản tiếng Việt là bản canonical.**

## 1. Nguyên tắc Cốt lõi và Ranh giới Lưu giữ

1. **Quyền sở hữu Token hiện tại → Quyền truy xuất kênh Hosted (`CURRENT_TOKEN_OWNERSHIP → CURRENT_HOSTED_RETRIEVAL_ELIGIBILITY`):**
   - Đối với **Gói 05 Complete (Token 05)**: Địa chỉ ví hiện sở hữu Token 05 trên blockchain Base tại block finalized và thỏa mãn `completePackageTokenId == 5` có quyền yêu cầu tạo challenge và nhận URL truyền phát tài liệu lưu trữ Complete.
   - Đối với **Khung Độc lập (Tokens 1, 2, 3, 4, 6, 7, 8, 9)**: Địa chỉ ví hiện sở hữu Token ID tương ứng (`ownerOf(frameId) == requester`) có quyền yêu cầu tạo challenge và nhận URL truyền phát gói tư liệu thực hành Frame (`H_FRAME_PACKAGE`).
   - Khi token được chuyển nhượng sang người sở hữu mới, quyền truy xuất hosted tự động chuyển sang successor. Người nắm giữ cũ mất quyền truy xuất ngay khi quyền sở hữu on-chain thay đổi.
2. **Quyền truy xuất Hosted ≠ Bảo đảm dịch vụ vĩnh viễn (`RETRIEVAL_ELIGIBILITY ≠ PERPETUAL_HOSTING_GUARANTEE`):**
   Dịch vụ cấp Signed URL qua Supabase Edge Function là tiện ích hỗ trợ vận hành thuộc hạ tầng của phòng trưng bày. Phòng trưng bày không cam kết duy trì API máy chủ vĩnh viễn.
3. **Bản lưu trữ do Người mua tải về = Hình thức lưu giữ bền vững (`DOWNLOADED_PURCHASER_COPY = DURABLE_CUSTODY_FORM`):**
   Sau khi nhận và nghiệm thu tệp, việc lưu giữ trên thiết bị cá nhân và tạo tối thiểu 2 bản sao lưu độc lập ngoại tuyến (cold backup) là trách nhiệm và quyền lưu giữ chuẩn mực của Bearer/Steward.
4. **Tính chất của Challenge Nonce (`EACH_CHALLENGE_NONCE = ONE_SHOT`):**
   Mỗi mã nonce do máy chủ cấp chỉ được ký và sử dụng một lần duy nhất để sinh Signed URL trong thời hạn 5 phút. Khi đã sử dụng (`used_at`), nonce lập tức bị vô hiệu hóa.
5. **Khả năng lặp lại truy xuất Hosted (`REPEATABLE_HOSTED_RETRIEVAL = YES`):**
   Người nắm giữ token hợp lệ có thể yêu cầu phát hành nonce mới bất kỳ lúc nào để tạo Signed URL mới khi cần tải lại, miễn là hạ tầng hosted còn hoạt động và người đó vẫn là chủ sở hữu on-chain của Token ID tương ứng.

---

## 2. Phân định Thành phần Gói Tệp Bàn giao

### A. Gói Standalone Frame (Tokens 1, 2, 3, 4, 6, 7, 8, 9)
Dịch vụ truyền phát lưu trữ cung cấp thành phần:
- `H_FRAME_PACKAGE`: Gói tư liệu thực hành Khung (Frame practice template `frame-template.md`, Frame dossier/metadata, Frame visual asset, local Curator mediation substrate, trajectory template, legal schedules, per-file Frame manifest). Chứa ngữ pháp thực hành Khung tổng quát (`GENERALIZED_FRAME_TEMPLATE_P1_TO_P4`), tuyệt đối không chứa văn bản khởi sinh của nghệ sĩ (`ARTIST_L_INSTANCE_P1_TO_P4`).

### B. Gói 05 Complete (Token ID 5)
Dịch vụ truyền phát lưu trữ cung cấp 3 thành phần tệp được bảo vệ:
- `H_CORE`: Hiện thân thị giác nén chuẩn mực (`condensed_masterpiece.png`)
- `H_CONSTITUTIVE_SCAR`: Vết khắc cấu thành & script (`The_Ritual_Prompts.md`, `condense_masterpiece.py`, các vector seed SVG) — lưu giữ độc quyền lai lịch khởi sinh Bức Tranh canonical (`ARTIST_L_INSTANCE_P1_TO_P4`).
- `H_CONSTITUTIVE_RITUAL`: Tư liệu thực hành & manifest hoàn chỉnh (bao gồm ngữ pháp thực hành Khung `GENERALIZED_FRAME_TEMPLATE_P1_TO_P4` và cơ chế giám sát).

---

## 3. Quy trình Truy xuất 2 Pha (Two-Phase Challenge-Transmit Protocol)

### Pha 1: Yêu cầu Thử thách (Challenge Request)
Người giữ token gửi yêu cầu challenge tới endpoint `transmit-artwork` với hành động `challenge`.

**Endpoint:** `POST https://smapworks.art/api/transmit-artwork` (hoặc Supabase Edge Function URL)

**Payload JSON (Ví dụ Standalone Frame 01):**
```json
{
  "action": "challenge",
  "tokenId": 1,
  "assetType": "H_FRAME_PACKAGE",
  "walletAddress": "<YOUR_WALLET_ADDRESS>"
}
```

**Payload JSON (Ví dụ Gói 05 Complete):**
```json
{
  "action": "challenge",
  "tokenId": 5,
  "assetType": "H_CORE",
  "walletAddress": "<YOUR_WALLET_ADDRESS>"
}
```

**Xác thực phía máy chủ:**
- Kiểm tra mã hash bytecode hợp đồng (`EXPECTED_CODE_HASH`) và `canonicalDesignationHash` qua đồng thuận RPC kép ở finalized block;
- Kiểm tra `ownerOf(tokenId) == walletAddress`;
- Đối với Token 5: Kiểm tra thêm `completePackageTokenId == 5`;
- Ghi nhận nonce vào bảng `transmission_challenges` với thời hạn hiệu lực 5 phút (`CHALLENGE_LIFETIME_MS = 300000`);
- Trả về cấu trúc thông điệp chuẩn mực cần ký.

### Pha 2: Ký thông điệp và Nhận Signed URL (Transmission Request)
Người giữ token dùng ví của mình ký thông điệp plain-text do máy chủ trả về, sau đó gửi yêu cầu hoàn tất truyền phát:

**Payload JSON:**
```json
{
  "action": "transmit",
  "tokenId": 1,
  "assetType": "H_FRAME_PACKAGE",
  "walletAddress": "<YOUR_WALLET_ADDRESS>",
  "signature": "<WALLET_SIGNATURE_HEX>"
}
```

**Xác thực & Bàn giao:**
- Máy chủ xác thực lại quyền sở hữu on-chain ở finalized block;
- Xác thực chữ ký khớp với thông điệp challenge và ví người gửi;
- Đối chiếu commitment của tệp với cam kết on-chain;
- Đánh dấu `used_at = now()` (tiêu thụ nonce, chống replay);
- Tạo **Signed URL** từ bucket riêng tư `stewardship-private-archive` với thời hạn **60 giây** (`SIGNED_URL_LIFETIME_SECONDS = 60`);
- Ghi log kiểm toán bất biến vào `transmission_audit_logs`.

---

## 4. Nghiệm thu và Lưu giữ Bền vững

Sau khi tải tệp về máy cục bộ:
1. Tiến hành kiểm tra mã băm SHA-256 đối chiếu với manifest của gói (xem `VERIFY.md §7`).
2. Đối với Complete 05: Ghi nhận biên bản nghiệm thu vào `STEWARDSHIP-ACCESSION.json`.
3. Tạo 2 bản backup ngoại tuyến độc lập trước khi xóa tệp trung gian trong thư mục download.
