# Quy trình Nhận và Truy xuất Lưu trữ — Hiện sinh (Acquisition & Retrieval)

**Bản tiếng Việt là bản canonical.**

## 1. Nguyên tắc Cốt lõi và Ranh giới Lưu giữ

1. **Quyền sở hữu Token hiện tại → Quyền truy xuất kênh Hosted (`CURRENT_TOKEN_OWNERSHIP → CURRENT_HOSTED_RETRIEVAL_ELIGIBILITY`):**
   - Đối với **Gói Complete (Bức Tranh 0 / Khung 05)**: Địa chỉ ví hiện sở hữu Token 0 (Painting) hoặc Token 5 (Frame 05) trên blockchain Base tại block finalized và thỏa mãn điều kiện sở hữu/lịch sử ủy quyền có quyền yêu cầu nhận Signed URL truyền phát tài liệu lưu trữ Complete (`H_PAINTING_PACKAGE`, tệp `Hien-Sinh-Painting.zip`).
   - Đối với **Khung Độc lập (Tokens 1, 2, 3, 4, 6, 7, 8, 9)**: Địa chỉ ví hiện sở hữu Token ID tương ứng (`ownerOf(frameId) == requester`) có quyền yêu cầu nhận Signed URL truyền phát gói tư liệu thực hành Frame (`H_FRAME_PACKAGE`, tệp `Hien-Sinh-Frame-XX.zip`).
   - Khi token được chuyển nhượng sang người sở hữu mới, quyền truy xuất hosted tự động chuyển sang successor. Người nắm giữ cũ mất quyền truy xuất ngay khi quyền sở hữu on-chain thay đổi.
2. **Quyền truy xuất Hosted ≠ Bảo đảm dịch vụ vĩnh viễn (`RETRIEVAL_ELIGIBILITY ≠ PERPETUAL_HOSTING_GUARANTEE`):**
   Dịch vụ cấp Signed URL qua Supabase Edge Function là tiện ích hỗ trợ vận hành thuộc hạ tầng của phòng trưng bày. Phòng trưng bày không cam kết duy trì API máy chủ vĩnh viễn.
3. **Bản lưu trữ do Người mua tải về = Hình thức lưu giữ bền vững (`DOWNLOADED_PURCHASER_COPY = DURABLE_CUSTODY_FORM`):**
   Sau khi nhận và nghiệm thu tệp, việc lưu giữ trên thiết bị cá nhân và tạo tối thiểu 2 bản sao lưu độc lập ngoại tuyến (cold backup) là trách nhiệm và quyền lưu giữ chuẩn mực của Bearer/Steward.
4. **Khả năng lặp lại truy xuất Hosted (`REPEATABLE_HOSTED_RETRIEVAL = YES`):**
   Người nắm giữ token hợp lệ có thể yêu cầu tạo Signed URL mới bất kỳ lúc nào để tải lại tệp, miễn là hạ tầng hosted còn hoạt động và người đó vẫn là chủ sở hữu on-chain của Token ID tương ứng.

---

## 2. Phân định Thành phần Gói Tệp Bàn giao

### A. Gói Standalone Frame (Tokens 1, 2, 3, 4, 6, 7, 8, 9)
Dịch vụ truyền phát lưu trữ cung cấp thành phần:
- `H_FRAME_PACKAGE` (`Hien-Sinh-Frame-XX.zip`): Gói tư liệu thực hành Khung (Frame practice template `frame-template.md`, Frame dossier/metadata, Frame visual asset, local Curator mediation substrate, trajectory template, legal schedules, per-file Frame manifest). Chứa ngữ pháp thực hành Khung tổng quát (`GENERALIZED_FRAME_TEMPLATE_P1_TO_P4`), tuyệt đối không chứa văn bản khởi sinh của nghệ sĩ (`ARTIST_L_INSTANCE_P1_TO_P4`).

### B. Gói Complete Stewardship (Token 0 / Khung 05)
Dịch vụ truyền phát lưu trữ cung cấp thành phần:
- `H_PAINTING_PACKAGE` (`Hien-Sinh-Painting.zip`): Gói lưu trữ toàn vẹn của Bức Tranh canonical, bao gồm:
  - `H_CORE`: Hiện thân thị giác nén chuẩn mực (`condensed_masterpiece.png`);
  - `H_CONSTITUTIVE_SCAR`: Vết khắc cấu thành & script (`The_Ritual_Prompts.md`, `condense_masterpiece.py`, các vector seed SVG);
  - `H_CONSTITUTIVE_RITUAL`: Tư liệu thực hành, bản đồ lưu trữ `ARCHIVE-MAP.md`, hồ sơ care và manifest hoàn chỉnh.

---

## 3. Quy trình Truy xuất Trực tiếp (Authoritative Transmission Protocol)

Người giữ token gửi yêu cầu truyền phát tới endpoint `transmit-artwork` với hành động `transmit` (được thực thi tự động qua giao diện trang `/materials` khi bấm nút tải).

**Endpoint:** `POST https://smapworks.art/api/transmit-artwork` (hoặc Supabase Edge Function URL)

**Payload JSON (Ví dụ Standalone Frame 06):**
```json
{
  "action": "transmit",
  "tokenId": 6,
  "assetType": "H_FRAME_PACKAGE",
  "address": "<YOUR_WALLET_ADDRESS>"
}
```

**Payload JSON (Ví dụ Gói Bức Tranh 0):**
```json
{
  "action": "transmit",
  "tokenId": 0,
  "assetType": "H_PAINTING_PACKAGE",
  "address": "<YOUR_WALLET_ADDRESS>"
}
```

**Xác thực & Bàn giao phía máy chủ:**
- Kiểm tra mã hash bytecode hợp đồng (`EXPECTED_CODE_HASH`) và `canonicalDesignationHash` qua đồng thuận RPC kép ở finalized block trên mạng Base;
- Xác thực quyền sở hữu hiện thời `ownerOf(tokenId) == address`;
- Đối với Bức Tranh 0: Đối soát lịch sử ủy quyền mua sơ cấp (`acquisition_authorizations`) và đối chiếu mã băm cam kết `publishedArchiveCommitment`;
- Tạo **Signed URL** từ bucket riêng tư `stewardship-private-archive` với thời hạn **60 giây** (`SIGNED_URL_LIFETIME_SECONDS = 60`);
- Ghi log kiểm toán bất biến vào `transmission_audit_logs`.

---

## 4. Nghiệm thu và Lưu giữ Bền vững

Sau khi tải tệp về máy cục bộ:
1. Tiến hành kiểm tra mã băm SHA-256 đối chiếu với manifest của gói (xem `VERIFY.md §7`).
2. Đối với Complete 05: Ghi nhận biên bản nghiệm thu vào `STEWARDSHIP-ACCESSION.json`.
3. Tạo 2 bản backup ngoại tuyến độc lập trước khi xóa tệp trung gian trong thư mục download.
