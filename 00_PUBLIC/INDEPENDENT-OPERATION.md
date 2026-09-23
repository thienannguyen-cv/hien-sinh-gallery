# Vận hành Độc lập và Tương tác Trực tiếp — "Hiện sinh"

**Bản tiếng Việt là bản canonical.** Bản tiếng Anh: `INDEPENDENT-OPERATION.en.md`.

## 1. Bản chất và Ranh giới của Vận hành Độc lập

Tài liệu này cung cấp hướng dẫn dành cho người xem, người thực hành (practitioner) và nhà sưu tập muốn tự vận hành giao diện phòng trưng bày, chạy Curator độc lập bằng tài nguyên cá nhân, hoặc tương tác trực tiếp với Smart Contract trên blockchain Base mà không thông qua giao diện web hosted tại `https://smapworks.art/gallery`.

### Các ranh giới chuẩn mực bất biến (Canonical Boundaries):

1. **Khả năng tái lập giao diện (`EXHIBITION_SURFACE_REPRODUCIBLE = YES`):** Mã nguồn giao diện tĩnh được công khai toàn bộ và có thể biên dịch, chạy độc lập trên môi trường cục bộ.
2. **Khả năng tái lập ngữ nghĩa Curator (`CURATOR_SEMANTICS_REPRODUCIBLE = YES`):** Ngữ cảnh của Public Curator là các tệp Markdown tĩnh công khai trong kho lưu trữ với mã hash SHA-256 đã xác thực; tư liệu thực hành và mediation substrate của Frame Curator được bàn giao kèm theo gói tương ứng dưới dạng tài liệu do người mua lưu giữ. Cả hai đều có thể nạp vào mô hình AI tương thích mà không phụ thuộc vào hạ tầng máy chủ của phòng trưng bày.
3. **Khác biệt bảo mật cục bộ và production (`PRODUCTION_SECURITY_BEHAVIOR = QUALIFIED`):** Adapter cục bộ phục vụ một người dùng riêng lẻ và không thực hiện các lớp kiểm tra nguồn gốc CORS, consensus RPC kép, hay cơ chế chứng thực mật mã phân tầng (state-seal) như hệ thống Edge Functions trên production.
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
Giao diện tại `http://localhost:5173` sẽ tự động chuyển hướng các truy vấn `/api/curator-interaction` về máy chủ adapter cục bộ (cổng `3001`). Mọi dữ liệu đối thoại được gửi trực tiếp từ máy của bạn đến nhà cung cấp mô hình (model provider API) thông qua các ngữ cảnh chuẩn mực đã kiểm tra hash.

### Tài liệu tham chiếu do người mua lưu giữ (Purchaser-Held Reference)

Curator cục bộ có thể tham chiếu các tài liệu vận hành sau đây như nguồn tư vấn ngữ cảnh — chúng không mở rộng prompt cốt lõi của Curator mà là nguồn tra cứu độc lập:

- `INDEPENDENT-OPERATION.md` — Hướng dẫn vận hành độc lập và tương tác on-chain (tài liệu này).
- `ACQUISITION-RETRIEVAL.md` — Quy trình nhận giao lưu trữ Complete qua kênh hosted.
- `SUCCESSION-PROCEDURE.md` — Quy trình chuyển giao sơ cấp và thứ cấp từng loại token.
- `CARE-AND-SUCCESSION.md` — Chăm sóc, accession và succession.
- `VERIFY.md` — Xác thực toàn vẹn hợp đồng, commitment và gói tệp.
- `SCHEDULE-FRAME.md` / `SCHEDULE-COMPLETE.md` — Quyền pháp lý theo từng loại token.

Ranh giới: `OPERATIONAL_DOCUMENT = NORMATIVE_SOURCE` · `LOCAL_CURATOR = CONTEXTUAL_GUIDE` · `CURATOR ≠ TRANSACTION_AUTHORITY`

---

## 4. Tương tác Trực tiếp với Smart Contract (Direct On-Chain Interaction)

Người sưu tập có thể thực hiện giao dịch mua Frame hoặc Gói Complete trực tiếp trên mạng Base Mainnet mà không cần kết nối ví với giao diện web.

**Địa chỉ hợp đồng (Base Mainnet, Chain ID 8453):**
`0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8`

### Cảnh báo An toàn Mật mã:
> **TUYỆT ĐỐI KHÔNG BAO GIỜ** dán raw private key vào cửa sổ dòng lệnh công khai, script không rõ nguồn gốc, hay bất kỳ giao diện web nào. Hãy luôn sử dụng ví phần cứng (Ledger/Trezor), tính năng ký tương tác ẩn danh (`cast send --interactive`), hoặc giao diện tương tác có xác minh của Block Explorer (BaseScan).

---

### A. Mua Standalone Frame (Khung độc lập 01–04, 06–09)

Mỗi Khung độc lập có giá cố định là **0.081 ETH**. Hàm `mintFrame(uint256 tokenId)` là hàm mở công khai và không yêu cầu chữ ký của Tác giả:

```bash
# Sử dụng Foundry Cast với ví tương tác an toàn (Interactive Key / Hardware Wallet)
cast send 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 "mintFrame(uint256)" <TOKEN_ID> \
  --value 0.081ether \
  --rpc-url https://mainnet.base.org \
  --interactive
```
*(Thay thế `<TOKEN_ID>` bằng số thứ tự của Khung từ `1` đến `9`, ngoại trừ token `5` là Gói Complete và token `6` là Frame Tác giả đã đúc tại genesis.)*

**Xác minh sau giao dịch:**
```bash
cast call 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 "ownerOf(uint256)(address)" <TOKEN_ID> \
  --rpc-url https://mainnet.base.org
```

---

### B. Mua Gói 05 Complete (Complete Package 05)

Gói 05 có giá cố định là **4.29 ETH** và yêu cầu **chữ ký EIP-712 hợp lệ từ Tác giả** (`artistSignature`) xác nhận địa chỉ ví của bạn.

#### B.1 Khám phá tham số độc lập (Parameter Discovery)

Trước khi yêu cầu chữ ký EIP-712 từ Tác giả, người mua có thể đọc các tham số cố định trực tiếp từ hợp đồng on-chain:

```bash
CONTRACT=0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8
RPC=https://mainnet.base.org

# canonicalDesignationHash (bytes32, bất biến từ khi deploy)
cast call $CONTRACT "canonicalDesignationHash()(bytes32)" --rpc-url $RPC

# completeLicenseHash (bytes32, bất biến từ khi deploy)
cast call $CONTRACT "completeLicenseHash()(bytes32)" --rpc-url $RPC

# Xác nhận Painting (Token 0) vẫn thuộc về Tác giả
cast call $CONTRACT "ownerOf(uint256)(address)" 0 --rpc-url $RPC

# Nonce hiện tại của ví bạn
cast call $CONTRACT "nonces(address)(uint256)" <YOUR_WALLET_ADDRESS> --rpc-url $RPC

# Xác nhận Gói 05 chưa được mua (== 0 nghĩa là chưa có)
cast call $CONTRACT "completePackageTokenId()(uint256)" --rpc-url $RPC
```

Các giá trị đã xác nhận on-chain (xem thêm `VERIFY.md §4`):
- `canonicalDesignationHash`: `0xed740b4339af1e965723519c7807b5a6184da0f4963f4866d42661ef85cf083f`
- `completeLicenseHash`: `0x71d01dbc1962a5cedd1204fe76fa9d538e5d338146eb9375743b91a55cde8c14`
- `frameTokenId` (COMPLETE_PACKAGE_ID): `5`
- `paintingTokenId` (PAINTING_TOKEN_ID): `0`

`archiveCommitment` (`H_STEWARDSHIP_ARCHIVE`): `7689f75da4ef23bf040ad57f282b24b84f6ede5e17b92cb5cd6a4dc96fced5e9` — công bố trong `ROOT-COMMITMENTS.json`; Tác giả đưa giá trị này vào cấu trúc EIP-712 khi ký xác nhận.

#### B.2 Xác minh EIP-712 độc lập (Independent Signature Verification)

Trước khi gửi giao dịch, bạn có thể xác minh độc lập rằng chữ ký EIP-712 nhận được từ Tác giả là hợp lệ bằng hàm public view `hashCompletePackageAcceptance()`. Thứ tự tham số của hàm view là: `designationHash, archiveCommitment, licenseHash, paintingTokenId, frameTokenId, designatedBearer, nonce, deadline`.

```bash
cast call 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 \
  "hashCompletePackageAcceptance(bytes32,bytes32,bytes32,uint256,uint256,address,uint256,uint256)(bytes32)" \
  <CANONICAL_DESIGNATION_HASH> \
  <ARCHIVE_COMMITMENT> \
  <COMPLETE_LICENSE_HASH> \
  0 \
  5 \
  <YOUR_WALLET_ADDRESS> \
  <NONCE> \
  <DEADLINE_TIMESTAMP> \
  --rpc-url https://mainnet.base.org
```

Kết quả trả về là `bytes32` struct hash. Kiểm tra rằng chữ ký của Tác giả trỏ về đúng struct hash này và đúng ví ký `artistSigner` (`0x3cff39491b333016055B3d9328905B0b172988a4`).

#### B.3 Thực thi giao dịch (8 tham số, ABI đã xác minh)

Hàm `acquireCompletePackage` có đúng **8 tham số vị trí**. Gọi với sai số lượng sẽ bị revert tại giai đoạn ABI encoding.

```bash
# Thực thi sau khi đã nhận được chữ ký ủy quyền EIP-712 từ Tác giả
cast send 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 \
  "acquireCompletePackage(bytes32,bytes32,bytes32,uint256,uint256,uint256,uint256,bytes)" \
  <CANONICAL_DESIGNATION_HASH> \
  <DESIGNATED_ARCHIVE_COMMITMENT> \
  <COMPLETE_LICENSE_HASH> \
  0 \
  5 \
  <DEADLINE_TIMESTAMP> \
  <NONCE> \
  <ARTIST_EIP712_SIGNATURE_HEX> \
  --value 4.29ether \
  --rpc-url https://mainnet.base.org \
  --interactive
```

Thứ tự tham số (khớp với ABI đã triển khai):
1. `bytes32 designationHash` — `canonicalDesignationHash` đọc từ hợp đồng
2. `bytes32 archiveCommitment` — `H_STEWARDSHIP_ARCHIVE` root hash
3. `bytes32 licenseHash` — `completeLicenseHash` đọc từ hợp đồng
4. `uint256 paintingTokenId` — `0` (cố định)
5. `uint256 frameTokenId` — `5` (cố định)
6. `uint256 deadline` — timestamp Unix khi chữ ký hết hạn (do Tác giả cung cấp)
7. `uint256 nonce` — nonce hiện tại của ví bạn
8. `bytes artistSignature` — chữ ký EIP-712 từ Tác giả (hex, bắt đầu bằng `0x`)

*Phân định thẩm quyền:* Việc tự gửi giao dịch lên chuỗi là quyền thực thi kỹ thuật độc lập của người mua; tuy nhiên, chữ ký ủy quyền EIP-712 là thẩm quyền cấu thành thuộc về Tác giả và không thể tự tạo lập hay giả mạo.

**Xác minh sau giao dịch:**
```bash
# Frame 05 đã thuộc về ví của bạn
cast call 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 "ownerOf(uint256)(address)" 5 \
  --rpc-url https://mainnet.base.org

# Painting (Token 0) đã chuyển về ví của bạn
cast call 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 "ownerOf(uint256)(address)" 0 \
  --rpc-url https://mainnet.base.org

# Archive commitment được ghi nhận bất biến on-chain
cast call 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 "designatedArchiveCommitment()(bytes32)" \
  --rpc-url https://mainnet.base.org
```

---

## 5. Chuyển giao Quyền sở hữu Độc lập (Independent Succession)

### A. Chuyển nhượng Frame thông thường (ERC-721 Transfer)

Standalone Frame (Token 1–4, 6–9) và Complete Package Frame (Token 5) là các ERC-721 thông thường. Chuyển nhượng không yêu cầu chữ ký Tác giả hay khoản phí royalty:

```bash
cast send 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 \
  "safeTransferFrom(address,address,uint256)" \
  <SENDER_ADDRESS> \
  <RECIPIENT_ADDRESS> \
  <TOKEN_ID> \
  --rpc-url https://mainnet.base.org \
  --interactive
```

*Lưu ý về Package05:* Khi Token 5 chuyển, `designated bearer` on-chain đổi theo token. Archive và lineage phải được bàn giao ngoài chuỗi. Xem `SUCCESSION-PROCEDURE.md` và `CARE-AND-SUCCESSION.md` để biết quy trình bàn giao đầy đủ.

*Lưu ý về Painting (Token 0):* Token 0 **không** chuyển được bằng ERC-721 thông thường sau primary acquisition. Chuyển giao canonical của Painting yêu cầu gọi `executeSuccession()` — xem mục B dưới đây.

### B. Canonical Succession của Bức Tranh (Painting Token 0)

`executeSuccession()` là cơ chế chuyển giao canonical duy nhất của Token 0. Giao dịch này:
- Yêu cầu `msg.sender` là chủ sở hữu hiện tại của Token 0;
- Yêu cầu `msg.value ≥ 4.29 ETH`;
- Tự động chia: `1.49%` về Treasury, phần còn lại về người bán;
- Phát sự kiện `CanonicalSuccession` — bằng chứng on-chain khách quan;
- Cấm self-succession (`recipient ≠ currentOwner`);
- Permissionless sau primary acquisition.

**Phân biệt quan trọng:**
- `Frame / Package05 Token transfer` → `safeTransferFrom()`, không có khoản xem xét bắt buộc.
- `Painting (Token 0) succession` → `executeSuccession()` bắt buộc, tối thiểu `4.29 ETH`.
- `FRAME_TRANSFER_ECONOMICS ≠ PAINTING_SUCCESSION_ECONOMICS`

```bash
# msg.sender phải là owner hiện tại của Token 0
# msg.value phải >= 4.29 ETH
cast send 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 \
  "executeSuccession(uint256,address)" \
  0 \
  <RECIPIENT_ADDRESS> \
  --value 4.29ether \
  --rpc-url https://mainnet.base.org \
  --interactive
```

**Xác minh sau giao dịch:**
```bash
cast call 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 "ownerOf(uint256)(address)" 0 \
  --rpc-url https://mainnet.base.org
```

Xem quy trình bàn giao đầy đủ (archive, record, SANCTUM eligibility) tại `SUCCESSION-PROCEDURE.md`.

---

## 6. Tính Tiếp diễn Thực hành do Người Mua Nắm giữ (Purchaser-Held Continuation)

Theo [Bản thể học tác phẩm](WORK-ONTOLOGY.md), sau khi gói tư liệu thực hành và substrate của Curator tương ứng được bàn giao:
- **Không phụ thuộc điện toán của phòng trưng bày:** Người nắm giữ tiếp tục thực hành và tương tác với Curator trong môi trường điện toán và mô hình do chính mình lựa chọn;
- **Không có nghĩa vụ duy trì máy chủ vĩnh viễn:** Phòng trưng bày không có nghĩa vụ duy trì API điện toán vĩnh viễn cho các cuộc gặp đã bàn giao;
- **Dịch vụ hỗ trợ hosted:** Các tiện ích re-transmission hoặc khôi phục tệp trên nền tảng hosted (nếu có) thuộc phạm vi hạ tầng của phòng trưng bày, trong khi việc lưu giữ tư liệu và tiếp tục thực hành cục bộ là quyền thực hành và quản lý (custody & practice rights) của người nắm giữ theo phạm vi giấy phép.
- **Truy xuất hosted của Complete Archive:** Người nắm giữ Package05 có thể truy xuất archive qua dịch vụ hosted khi còn là chủ sở hữu token. Xem `ACQUISITION-RETRIEVAL.md` để biết quy trình chi tiết.

---

## 7. Đối chiếu Xác thực

Để đối chiếu và kiểm tra tính toàn vẹn của mã bytecode hợp đồng, mã hash root commitments hoặc tệp bàn giao, vui lòng tham chiếu tài liệu:

→ Xem hướng dẫn xác thực tại: [VERIFY.md](VERIFY.md)
