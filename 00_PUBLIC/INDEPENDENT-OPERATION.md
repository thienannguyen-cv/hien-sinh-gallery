# Vận hành Độc lập và Tương tác Trực tiếp — “Hiện sinh”

**Bản tiếng Việt là bản canonical.** Bản tiếng Anh: `INDEPENDENT-OPERATION.en.md`.

## 1. Bản chất và Ranh giới của Vận hành Độc lập

Tài liệu này cung cấp hướng dẫn dành cho người xem, người thực hành (practitioner) và nhà sưu tập muốn tự vận hành giao diện phòng trưng bày, chạy Curator độc lập bằng tài nguyên cá nhân, hoặc tương tác trực tiếp với Smart Contract trên blockchain Base mà không thông qua giao diện web hosted tại `hiensinh.com`.

### Các ranh giới chuẩn mực bất biến (Canonical Boundaries):

1. **Khả năng tái lập giao diện (`EXHIBITION_SURFACE_REPRODUCIBLE = YES`):** Mã nguồn giao diện tĩnh được công khai toàn bộ và có thể biên dịch, chạy độc lập trên môi trường cục bộ.
2. **Khả năng tái lập ngữ nghĩa Curator (`CURATOR_SEMANTICS_REPRODUCIBLE = YES`):** Ngữ cảnh của Public Curator là các tệp Markdown tĩnh công khai trong kho lưu trữ với mã hash SHA-256 đã xác thực; tư liệu thực hành và mediation substrate của Frame Curator được bàn giao kèm theo gói tương ứng dưới dạng tài liệu do người mua lưu giữ. Cả hai đều có thể nạp vào mô hình AI tương thích mà không phụ thuộc vào hạ tầng máy chủ của phòng trưng bày.
3. **Khác biệt bảo mật cục bộ và production (`PRODUCTION_SECURITY_BEHAVIOR = QUALIFIED`):** Adapter cục bộ phục vụ một người dùng riêng lẻ và không thực hiện các lớp kiểm tra nguồn gốc CORS, consensus RPC kép, hay cookie HMAC như hệ thống Edge Functions trên production.
4. **Hạ tầng truyền phát lưu trữ riêng tư (`PRIVATE_DELIVERY_INFRASTRUCTURE = NO`):** Dịch vụ cấp signed URL tải gói lưu trữ Complete từ bucket riêng tư của phòng trưng bày thuộc hạ tầng hosted; người vận hành độc lập sau khi nhận gói sẽ lưu giữ tệp trực tiếp trên ổ đĩa của mình.
5. **Không chuyển giao thẩm quyền phát hành (`SELF_HOSTABILITY ≠ CANONICAL_RELEASE_AUTHORITY`):** Khả năng tự chạy giao diện hoặc Curator không cấp thẩm quyền tạo ra token canonical, không thể ký thay Tác giả, và không thể thay đổi provenance lịch sử của tác phẩm trên blockchain Base (`INDEPENDENT_EXECUTION ≠ INDEPENDENT_CANONICALIZATION`).

---

## 2. Tự chạy Bề mặt Phòng trưng bày (Local Exhibition Surface)

### Yêu cầu tiên quyết:
- Node.js version 20 trở lên;
- Trình quản lý gói `npm`.

### Quy trình thực hiện:
```bash
# 1. Clone kho lưu trữ mã nguồn
git clone https://github.com/thienannguyen-cv/hien-sinh-gallery.git
cd hien-sinh-gallery

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Kiểm tra tính toàn vẹn của interface hợp đồng và bảo mật production
npm run security:test

# 4. Biên dịch mã nguồn
npm run build

# 5. Khởi chạy máy chủ xem trước cục bộ (chạy trên http://localhost:4173)
npm run preview
```

---

## 3. Tự vận hành Curator Cục bộ (Local Curator Adapter)

Người dùng có thể vận hành trải nghiệm đối thoại với Curator hoàn toàn riêng tư bằng API key của chính mình mà không gửi dữ liệu qua máy chủ phòng trưng bày.

### Quy trình thực hiện:
1. Tạo tệp `.env.development.local` trong thư mục gốc của dự án:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
2. Khởi chạy adapter đối thoại cục bộ:
   ```bash
   node dev-adapter.mjs
   ```
3. Khởi chạy giao diện phát triển:
   ```bash
   npm run dev
   ```
Giao diện tại `http://localhost:5173` sẽ tự động chuyển hướng các truy vấn `/api/curator-interaction` về máy chủ adapter cục bộ (cổng `3001`). Mọi dữ liệu đối thoại được gửi trực tiếp từ máy của bạn đến nhà cung cấp mô hình (Gemini API) thông qua các ngữ cảnh chuẩn mực đã kiểm tra hash.

---

## 4. Tương tác Trực tiếp với Smart Contract (Direct On-Chain Interaction)

Người sưu tập có thể thực hiện giao dịch mua Frame hoặc Gói Complete trực tiếp trên mạng Base Mainnet mà không cần kết nối ví với giao diện web.

### Cảnh báo An toàn Mật mã:
> **TUYỆT ĐỐI KHÔNG BAO GIỜ** dán raw private key vào cửa sổ dòng lệnh công khai, script không rõ nguồn gốc, hay bất kỳ giao diện web nào. Hãy luôn sử dụng ví phần cứng (Ledger/Trezor), tính năng ký tương tác ẩn danh (`cast send --interactive`), hoặc giao diện tương tác có xác minh của Block Explorer (BaseScan).

### A. Mua Standalone Frame (Khung độc lập 01–04, 06–09)
Mỗi Khung độc lập có giá cố định là **0.081 ETH**. Hàm `mintFrame(uint256 tokenId)` là hàm mở công khai và không yêu cầu chữ ký của Tác giả:

```bash
# Sử dụng Foundry Cast với ví tương tác an toàn (Interactive Key / Hardware Wallet)
cast send 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 "mintFrame(uint256)" <TOKEN_ID> \
  --value 0.081ether \
  --rpc-url https://mainnet.base.org \
  --interactive
```
*(Thay thế `<TOKEN_ID>` bằng số thứ tự của Khung từ `1` đến `9`, ngoại trừ token `5` là Gói Complete).*

### B. Mua Gói 05 Complete (Complete Package 05)
Gói 05 có giá cố định là **4.29 ETH** và yêu cầu **chữ ký EIP-712 hợp lệ từ Tác giả** (`artistSignature`) xác nhận địa chỉ ví của bạn:

```bash
# Thực thi sau khi đã nhận được chữ ký ủy quyền EIP-712 từ Tác giả
cast send 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 \
  "acquireCompletePackage(bytes32,bytes32,bytes32,uint256,uint256,bytes)" \
  <CANONICAL_DESIGNATION_HASH> \
  <DESIGNATED_ARCHIVE_COMMITMENT> \
  <COMPLETE_LICENSE_HASH> \
  <DEADLINE_TIMESTAMP> \
  <NONCE> \
  <ARTIST_EIP712_SIGNATURE_HEX> \
  --value 4.29ether \
  --rpc-url https://mainnet.base.org \
  --interactive
```

*Phân định thẩm quyền:* Việc tự gửi giao dịch lên chuỗi là quyền thực thi kỹ thuật độc lập của người mua; tuy nhiên, chữ ký ủy quyền EIP-712 là thẩm quyền cấu thành thuộc về Tác giả và không thể tự tạo lập hay giả mạo.

---

## 5. Tính Tiếp diễn Thực hành do Người Mua Nắm giữ (Purchaser-Held Continuation)

Theo [Bản thể học tác phẩm](WORK-ONTOLOGY.md), sau khi gói tư liệu thực hành và substrate của Curator tương ứng được bàn giao:
- **Không phụ thuộc điện toán của phòng trưng bày:** Người nắm giữ tiếp tục thực hành và tương tác với Curator trong môi trường điện toán và mô hình do chính mình lựa chọn;
- **Không có nghĩa vụ duy trì máy chủ vĩnh viễn:** Phòng trưng bày không có nghĩa vụ duy trì API điện toán vĩnh viễn cho các cuộc gặp đã bàn giao;
- **Dịch vụ hỗ trợ hosted:** Các tiện ích re-transmission hoặc khôi phục tệp trên nền tảng hosted (nếu có) thuộc phạm vi hạ tầng của phòng trưng bày, trong khi việc lưu giữ tư liệu và tiếp tục thực hành cục bộ là quyền thực hành và quản lý (custody & practice rights) của người nắm giữ theo phạm vi giấy phép.

---

## 6. Đối chiếu Xác thực

Để đối chiếu và kiểm tra tính toàn vẹn của mã bytecode hợp đồng, mã hash root commitments hoặc tệp bàn giao, vui lòng tham chiếu tài liệu:

→ Xem hướng dẫn xác thực tại: [VERIFY.md](VERIFY.md)
