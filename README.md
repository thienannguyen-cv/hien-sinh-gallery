# Hiện Sinh — Digital Exhibition Platform & Local Runtime

**Bản Tiếng Việt là bản canonical.** English summary follows each section.

Kho lưu trữ này chứa mã nguồn nền tảng triển lãm kỹ thuật số cho tác phẩm **“Hiện sinh”** (vận hành trực tuyến tại [`https://smapworks.art`](https://smapworks.art)), bao gồm giao diện tương tác web, dịch vụ chuyển tiếp serverless, và môi trường thực hành cục bộ độc lập (independent local runtime).

This repository contains the software codebase for the *"Hiện sinh"* digital exhibition (hosted at [`https://smapworks.art`](https://smapworks.art)), including the interactive frontend interface, serverless presentation proxies, and the standalone local runtime.

---

## 1. Ranh giới Pháp lý & Khước từ Bàn giao Tài sản (Legal Perimeter & Disclaimer)

> [!IMPORTANT]
> **TÁCH BẠCH BỐN LỚP THẨM QUYỀN (SEPARATION OF FOUR PLANES):**
> $$\text{Smart Contract Token} \neq \text{Delivery Archive} \neq \text{Legal License} \neq \text{Software Repository}$$

1. **Kho lưu trữ này là Công cụ Phần mềm Hiển thị (Software Exhibition Tool):**
   - Việc xem, sao chép (clone), phân nhánh (fork), hoặc vận hành mã nguồn trong kho lưu trữ này **KHÔNG** cấu thành việc mua, sở hữu hay chuyển nhượng bản quyền tác phẩm nghệ thuật *"Hiện sinh"*.
   - Kho lưu trữ này **KHÔNG** cấp phát, đại diện hay chuyển giao bất kỳ token ERC-721 nào trên blockchain Base (hợp đồng CREATE2: `0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8`).
2. **Không Chứa các Gói Lưu trữ Bàn giao (No Delivery Packages Included):**
   - Kho lưu trữ này **HOÀN TOÀN KHÔNG CHỨA**:
     - Các gói tệp thực hành Chiếc Khung độc lập (`Frame Practice Archives` của Khung #01–04, #06–09);
     - Gói lưu trữ Bức Tranh canonical (`Complete Stewardship Archive` chứa `H_CORE`, `H_CONSTITUTIVE`, scar-code và transcript nghi thức gốc);
3. **Quy trình Bàn giao Tài sản Nghệ thuật:**
   - Việc bàn giao các gói tệp nghệ thuật được thực hiện độc lập sau khi giao dịch on-chain được xác nhận trên Base Mainnet thông qua giao thức truyền phát bảo mật có chứng thực mật mã (xem [`00_PUBLIC/ACQUISITION-RETRIEVAL.md`](00_PUBLIC/ACQUISITION-RETRIEVAL.md)).
4. **Thứ bậc Giấy phép & Điều khoản Loại trừ Tách biệt (License Hierarchy & Explicit Carve-Out):**
   - [`LICENSE.md`](LICENSE.md) (bản dịch đối chiếu Tiếng Anh [`LICENSE.en.md`](LICENSE.en.md)) xác lập quyền và nghĩa vụ đối với bề mặt triển lãm `smapworks.art` (zero-tracking, chống cào dữ liệu, nghiêm cấm huấn luyện AI) cùng các quyền thực hành cục bộ độc lập được cấp cho người mua/steward.
   - Giấy phép này **tuyệt đối không thay thế, hợp nhất hoặc viết lại** giấy phép riêng của từng component bên trong repository; không phủ quyết các cam kết on-chain tại `SCHEDULE-FRAME.md` và `SCHEDULE-COMPLETE.md`; và không làm phát sinh cách hiểu rằng toàn bộ source tree tự động chịu chung một giấy phép đơn nhất.

---

## 2. Vận hành Độc lập Cục bộ (Independent Local Operation)

Tuân thủ nguyên tắc minh bạch triệt để và bảo đảm tính tiếp diễn nghệ thuật, kho lưu trữ này cho phép người xem và người sưu tập tự do vận hành triển lãm trên máy tính cá nhân mà **hoàn toàn không phụ thuộc vào hạ tầng máy chủ của `smapworks.art`** (chi tiết tại [`00_PUBLIC/INDEPENDENT-OPERATION.md`](00_PUBLIC/INDEPENDENT-OPERATION.md)):

- **Khả năng tự chứa (Self-contained):** Giao diện triển lãm có thể biên dịch và chạy ngoại tuyến (offline).
- **Curator Cục bộ bằng API Key Riêng:** Người thực hành có thể cấu hình API key cá nhân (như Gemini API) vào tệp `.env.development.local` để đàm đạo riêng tư với Curator thông qua adapter cục bộ `dev-adapter.mjs` mà không gửi dữ liệu qua máy chủ phòng tranh.
- **Tương tác Blockchain Trực tiếp:** Người sưu tập có thể tương tác trực tiếp với smart contract trên Base Mainnet qua các công cụ client chuẩn (Foundry `cast`, BaseScan) mà không cần dùng giao diện web.

---

## 3. Hồ sơ Công bố Chuẩn tắc (Public Dossier in `00_PUBLIC/`)

Toàn bộ tài liệu công bố thông tin tiền giao dịch, bản thể học và xác thực mật mã được lưu trữ chuẩn mực ngay trong thư mục [`00_PUBLIC/`](00_PUBLIC/):

| Tệp tài liệu | Nội dung và Ý nghĩa thẩm định |
|---|---|
| [`00_PUBLIC/WORK-ONTOLOGY.md`](00_PUBLIC/WORK-ONTOLOGY.md) | Bản thể học tác phẩm: Phân định rạch ròi Ý tưởng $\to$ Chiếc Khung $\to$ Biến cố sinh $\to$ Bức Tranh $\to$ Sự kiện gặp gỡ $\to$ Stewardship. |
| [`00_PUBLIC/LEGAL-TERMS.md`](00_PUBLIC/LEGAL-TERMS.md) | Điều khoản pháp lý khung: Nguyên tắc minh bạch triệt để, giao dịch blockchain không thể đảo ngược, và kinh tế học kế thừa bất đối xứng. |
| [`00_PUBLIC/SCHEDULE-FRAME.md`](00_PUBLIC/SCHEDULE-FRAME.md) | Quyền thực hành Chiếc Khung: Quyền tự do khai thác thương mại đối với Output tự tạo của người mua (Tác giả cam kết **0% royalty**). |
| [`00_PUBLIC/SCHEDULE-COMPLETE.md`](00_PUBLIC/SCHEDULE-COMPLETE.md) | Quyền gắn với Gói 05 Complete: Quyền lưu giữ, chăm sóc và bảo tồn lineage Bức Tranh canonical. |
| [`00_PUBLIC/INDEPENDENT-OPERATION.md`](00_PUBLIC/INDEPENDENT-OPERATION.md) | Hướng dẫn kỹ thuật tự vận hành phòng tranh và adapter Curator cục bộ. |
| [`00_PUBLIC/VERIFY.md`](00_PUBLIC/VERIFY.md) | Phương pháp kiểm tra mã hash SHA-256, chữ ký PGP, timestamp OTS và bytecode smart contract trên BaseScan. |
| [`00_PUBLIC/CARE-AND-SUCCESSION.md`](00_PUBLIC/CARE-AND-SUCCESSION.md) | Quy trình chăm sóc tệp, sao lưu phòng ngừa sự cố và chuyển giao thứ cấp. |
| [`LICENSE.md`](LICENSE.md) / [`LICENSE.en.md`](LICENSE.en.md) | Giấy phép Nền tảng Triển lãm & Thực hành Cục bộ (Exhibition Platform & Local Practice License). |

---

## 4. Cấu trúc Kỹ thuật & Thao tác Lệnh (Technical Architecture & Commands)

### Cấu trúc Thư mục:
- `src/` — Mã nguồn giao diện SPA (React 19, TypeScript, Tailwind CSS, Framer Motion, Wagmi / Viem).
- `cloudflare/` — Cloudflare Worker proxy phục vụ routing tĩnh, fail-closed image gateway và SPA fallback.
- `supabase/` — Migration database và Edge Function điều phối đối thoại với Curator.
- `archive_assets/` — Bản thể hiện hình ảnh trung gian có kiểm soát (`intersection-frame.png`, `condensed_masterpiece_512.png`).
- `tests/security/` — Bộ 139 bài kiểm thử bảo mật tự động kiểm tra nghiêm ngặt tính toàn vẹn và ranh giới dữ liệu.

### Thao tác Lệnh (Development Commands):

```bash
# 1. Cài đặt phụ thuộc
npm install

# 2. Chạy toàn bộ bộ kiểm thử bảo mật (139/139 PASS)
npm run security:test

# 3. Biên dịch kiểm tra TypeScript và build sản xuất an toàn (quét sạch rò rỉ H_CORE)
npm run build

# 4. Khởi chạy máy chủ phát triển cục bộ
npm run dev

# 5. Khởi chạy adapter đối thoại Curator cục bộ (cổng 3001)
node dev-adapter.mjs
```

---

## 5. Nguyên tắc Giám tuyển (Curatorial)

1. **Đồng nhất Phẩm tính Giám tuyển (Curatorial Equivalence):**
   Tầng công chúng (`PUBLIC`) và tầng mời vào Khung (`FRAME_INVITED`) hoàn toàn bình đẳng về độ sâu đối thoại triết học với Curator. Sự khác biệt duy nhất là `FRAME_INVITED` được mở thêm về mặt thị giác (hiển thị bản ngưng kết mở tâm sáng `condensed_masterpiece_512.png` thay vì bản che Baseline).
2. **Bất biến Cặp Đối thoại Hoàn chỉnh (Completed Dialogue Pairs):**
   Một lượt đối thoại hợp lệ bắt buộc phải là một cặp $(U_i, R_i)$ gồm câu hỏi của khách và phản hồi của Curator. Các lỗi gián đoạn mạng hoặc trễ phản hồi từ nhà cung cấp mô hình AI tuyệt đối không làm mất lượt đàm đạo của khách.

---

© 2026 Thien An L. Nguyen · SMapWorks. All rights reserved.
