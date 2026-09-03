# Xác thực “Hiện sinh”

**Bản tiếng Việt là bản canonical.** Bản tiếng Anh: `VERIFY.en.md`.

## 1. Nguyên tắc

Xác thực trả lời ba câu hỏi khác biệt:

1. **Canonical bytes:** tệp có khớp với commitment đã chỉ định không?
2. **Lineage:** commitment, chữ ký và timestamp có kết nối về persona/contract canonical không?
3. **Current designation:** token nào và ví nào đang mang designation trên chuỗi?

Xác thực không chứng minh giá trị nghệ thuật, AI interiority hoặc lived stewardship.

## 2. Commitments công khai

Public package chỉ công bố `H_CORE`, `H_CONSTITUTIVE` và `H_STEWARDSHIP_ARCHIVE`. Leaf hash, filename và per-file manifest của Bức Tranh không được công khai; chúng chỉ đi trong Gói 05 Complete để người nhận nghiệm thu.

## 3. Root commitments

`ROOT-COMMITMENTS.json` công bố:

- `H_CORE`: `190dfcfc8439c1613c149e72088c0bd32eefa66f2ded7cfbc0f250640b146d8e`
- `H_CONSTITUTIVE`: `ac49c28e2a857ae06cd64dcf9d9a4c5745ca891b2d019e8e75f7416cfe18484c`
- `H_STEWARDSHIP_ARCHIVE`: `7689f75da4ef23bf040ad57f282b24b84f6ede5e17b92cb5cd6a4dc96fced5e9`
- Thuật toán canonical JSON/manifest: `sha256(canonical-json-v1)`
- Canonical designation document: `CANONICAL-DESIGNATION.md` (hash: `802ac7d36bc4ab5eadc31fee80266b5efb6b2d839144a45ff3d28f3e89cc2a9b`)

Public root không công bố filename hoặc per-file manifest của Frame/Painting. Per-file Frame manifest chỉ đi vào Frame/Complete; per-file Painting manifest chỉ đi vào Complete.

## 3b. Xác thực Khởi nguyên Tiền quan hệ (Pre-Relational Origin Verification)

*Lưu ý trạng thái:* Trong giai đoạn pre-release hiện tại, `CANONICAL_ARTIST_PGP_FINGERPRINT = NOT_YET_ESTABLISHED`. Các tệp chữ ký rời và bằng chứng OTS đang ở trạng thái chuẩn bị (chưa khởi tạo/chưa nộp). Các bước dưới đây mô tả **quy trình xác lập thẩm quyền P.KEY và thủ tục xác thực sau khi hoàn tất lễ ký kết Khởi nguyên**:

### Bước 0: Thủ tục P.KEY — Xác lập Thẩm quyền OpenPGP Tác giả (Artist PGP Authority Identification)
1. **Kiểm tra két khóa ngoại tuyến:** Tác giả kiểm tra sự hiện diện của khóa OpenPGP đại diện cho Persona Tác giả trong môi trường ngoại tuyến được kiểm soát độc quyền bởi Owner.
2. **Quy tắc dừng an toàn (HALT):** Nếu chưa có khóa phù hợp, dừng quy trình. Tuyệt đối không tự động sinh khóa trong phiên làm việc này.
3. **Xuất khóa công khai (Public Key Only):** Tác giả xuất khóa công khai ra đường dẫn canonical chuẩn `00_PUBLIC/persona-pubkey.asc`:
   ```bash
   gpg --armor --export <KEY_ID_OR_EMAIL> > 00_PUBLIC/persona-pubkey.asc
   ```
4. **Trích xuất Fingerprint 40 ký tự hex đầy đủ:** Tuyệt đối không chấp nhận UID (tên gọi) hay Key ID ngắn (8 hoặc 16 ký tự) làm định danh thẩm quyền. Trích xuất toàn bộ fingerprint từ tệp khóa công khai đã xuất:
   ```bash
   gpg --show-keys --with-fingerprint 00_PUBLIC/persona-pubkey.asc
   ```
5. **Xác nhận thẩm quyền:** Owner kiểm tra và phê duyệt chuỗi fingerprint đầy đủ `D15945BC094633BA1725798C4BD38CB4049EB5D8` làm thẩm quyền ký duy nhất của Persona Tác giả Quinn T. (`CANONICAL_ARTIST_PGP_FINGERPRINT`).

### 1. Kiểm tra tính toàn vẹn của tệp định danh Khởi nguyên
Tệp `ORIGIN-PROVENANCE.json` (schema `hien-sinh/origin-provenance/v1`, đúng 659 bytes UTF-8, Persona: `Quinn T.`) phải có mã băm SHA-256 chính xác:
```bash
sha256sum 00_PUBLIC/ORIGIN-PROVENANCE.json
# Kết quả bắt buộc: dac2aef97c0427b428077a1b7fdedb8b07164657532ae93c5b74e851708eba9e
```

### 2. Kiểm tra chữ ký PGP rời & Đẳng thức Fingerprint
Xác nhận chữ ký rời `ORIGIN-PROVENANCE.json.asc` vừa hợp lệ toán học vừa được ký bởi chính xác khóa có fingerprint trùng khớp với `CANONICAL_ARTIST_PGP_FINGERPRINT`:
```bash
# 1. Xác thực tính hợp lệ của chữ ký
gpg --verify 00_PUBLIC/ORIGIN-PROVENANCE.json.asc 00_PUBLIC/ORIGIN-PROVENANCE.json

# 2. Kiểm tra đẳng thức fingerprint của khóa ký thực tế
gpg --status-fd 1 --verify 00_PUBLIC/ORIGIN-PROVENANCE.json.asc 00_PUBLIC/ORIGIN-PROVENANCE.json 2>/dev/null | grep VALIDSIG
```

### 3. Kiểm tra bằng chứng đóng dấu thời gian kép (Dual OpenTimestamps Proofs)
Xác nhận cả nội dung khởi nguyên và chữ ký tác giả đều có chứng thực thời gian độc lập:
```bash
# Xem cấu trúc bằng chứng và chứng thực lịch trình từ máy chủ calendar
ots info 00_PUBLIC/ORIGIN-PROVENANCE.json.ots
ots info 00_PUBLIC/ORIGIN-PROVENANCE.json.asc.ots

# Xác thực bằng chứng đã được ghi nhận bất biến trong Bitcoin block header
ots verify 00_PUBLIC/ORIGIN-PROVENANCE.json.ots
ots verify 00_PUBLIC/ORIGIN-PROVENANCE.json.asc.ots
```


## 4. Persona, ví và smart contract

Một bản phát hành sẵn sàng phải có đầy đủ các thành tố sau:

- Khóa công khai `persona-pubkey.asc` và OpenPGP fingerprint;
- Chữ ký ví ràng buộc OpenPGP fingerprint;
- Chữ ký PGP ràng buộc địa chỉ ví phát hành;
- Địa chỉ smart contract và Chain ID được cả persona và ví ký;
- Mã nguồn smart contract và ABI đã được xác minh trên block explorer;
- `canonicalDesignationHash` ghi nhận bất biến on-chain.

### Các giá trị định danh phát hành đã xác nhận trên Base Mainnet (Deployment Coordinates)

| Định danh tham số | Phân loại vòng đời | Giá trị / Trạng thái Xác thực |
|---|---|---|
| Mạng blockchain (Chain ID) | `CONFIRMED_ON_CHAIN` | `8453` (Base Mainnet) |
| Block Explorer | `CONFIRMED_ON_CHAIN` | `https://basescan.org` |
| Địa chỉ Smart Contract | `CONFIRMED_ON_CHAIN` | `0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8` |
| Mã giao dịch triển khai (Deployment Tx) | `CONFIRMED_ON_CHAIN` | `0x86b58b3707c86b74f52322790dbd51aa188ccf26dbb57d01e5169ac35a97ef88` |
| Block triển khai | `CONFIRMED_ON_CHAIN` | `50822692` |
| Thời điểm mở mint (`mintStart`) | `CONFIRMED_ON_CHAIN` | `1788530400` (2026-09-04T14:00:00Z UTC / 21:00:00 Local) |
| Hash chỉ định canonical (`canonicalDesignationHash`) | `CONFIRMED_ON_CHAIN` | `0xed740b4339af1e965723519c7807b5a6184da0f4963f4866d42661ef85cf083f` |
| Hash giấy phép Frame (`frameLicenseHash`) | `CONFIRMED_ON_CHAIN` | `0xbbb9b030f482f5ea365d58eadd13ad48f4357aeb9d983497b9a64c5e1ddb18e2` |
| Hash giấy phép Complete (`completeLicenseHash`) | `CONFIRMED_ON_CHAIN` | `0x71d01dbc1962a5cedd1204fe76fa9d538e5d338146eb9375743b91a55cde8c14` |
| Thư mục Metadata IPFS (`baseURI`) | `CONFIRMED_ON_CHAIN` | `ipfs://bafybeigneiurh42afljav4iap4dijwgt3spafsjf6zn36kkh7iwp5iesba/` |
| Metadata Directory CIDv1 | `CONFIRMED_ON_CHAIN` | `bafybeigneiurh42afljav4iap4dijwgt3spafsjf6zn36kkh7iwp5iesba` |
| Khóa ký on-chain của Tác giả (`artistSigner`) | `CONFIRMED_ON_CHAIN` | `0x3cff39491b333016055B3d9328905B0b172988a4` (Ví lạnh COLD tầng R) |
| Địa chỉ nhận doanh thu & Royalty (`treasury`) | `CONFIRMED_ON_CHAIN` | `0x3cff39491b333016055B3d9328905B0b172988a4` (Ví lạnh COLD thụ động) |
| Phí bản quyền Bức Tranh 0 (`paintingRoyalty`) | `CONFIRMED_ON_CHAIN` | `1.49% (149 BPS)` — Kế thừa Chuẩn tắc sàn 4.29 ETH (0.063921 ETH min) |
| Phí bản quyền Chiếc Khung (`frameRoyalty`) | `CONFIRMED_ON_CHAIN` | `0% (0 BPS)` — Chuyển nhượng ERC-721 thông thường tự do |
| Kho lưu trữ mã nguồn công khai | `KNOWN_PRE_LIVE` | `https://github.com/thienannguyen-cv/hien-sinh-gallery` |
| Release Git Commit Hash | `GENERATED_AT_PUBLICATION` | `<RELEASE_COMMIT_HASH>` |

*Nguyên tắc Thẩm quyền Phân tầng, Kinh tế Bất đối xứng & Tính Độc lập Giá thể:*
- **Thẩm quyền Tác giả & Cội nguồn Bản thể (Layer P):** Khóa OpenPGP của Quinn T. (`D15945BC094633BA1725798C4BD38CB4049EB5D8`) và Niêm phong Bitcoin P-SEAL.
- **Điểm Thực thi Smart Contract (Layer R):** Địa chỉ ví lạnh Ethereum `artistSigner`.
- **Ranh giới Bất biến:** `ORIGIN_PROVENANCE ≠ TOKEN_CUSTODY_HISTORY ≠ RELATIONAL_HISTORY`; `PGP_AUTHORITY ≠ ETHEREUM_ARTIST_SIGNER`; `PACKAGE05_PRIMARY_RELATION ≠ PERMANENT_TOKEN0/TOKEN5_CUSTODY_COUPLING`; `PAINTING_SUCCESSION_ECONOMICS ≠ FRAME_TRANSFER_ECONOMICS`; `TECHNICAL_OWNERSHIP ≠ RELATIONAL_BEARER_VALIDITY ≠ DESIGNATION_REALIZATION`; `REVOCATION ≠ ERASURE`.
- **Tính độc lập của Giá thể thực thi (Substrate Independence):** `CONSTITUTIVE_LAYER ≠ RELATIONAL_PROTOCOL ≠ EXECUTION_SUBSTRATE ≠ ACCESS_LAYER`; `HIỆN SINH ≠ Base`; `SUBSTRATE_FAILURE ≠ ARTWORK_CESSATION`; `SUBSTRATE_SUCCESSION ≠ ARTWORK_RECREATION`. Base Mainnet là giá thể thực thi hiện thời, không cấu thành tác phẩm. Hợp đồng `HienSinh.sol` không cài đặt bất kỳ quyền hạn hay cơ chế di cư nào.

### Thủ tục kiểm tra trạng thái on-chain qua CLI (Cast)

Người kiểm tra có thể truy vấn trực tiếp hợp đồng đã triển khai qua bất kỳ RPC Base công khai nào:

```bash
# 1. Kiểm tra mã định danh canonical designation hash trên hợp đồng
cast call 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 "canonicalDesignationHash()(bytes32)" --rpc-url https://mainnet.base.org

# 2. Kiểm tra chủ sở hữu hiện tại của token (ví dụ Frame 06 thuộc về ví COLD tác giả)
cast call 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 "ownerOf(uint256)(address)" 6 --rpc-url https://mainnet.base.org

# 3. Kiểm tra Bức Tranh 0 thuộc về ví COLD tác giả
cast call 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 "ownerOf(uint256)(address)" 0 --rpc-url https://mainnet.base.org

# 4. Kiểm tra Gói 05 Complete đã được xác lập sơ cấp hay chưa (trả về 0 trước sơ cấp)
cast call 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 "completePackageTokenId()(uint256)" --rpc-url https://mainnet.base.org

# 5. Kiểm tra số lượng token đã đúc thực tế trên hợp đồng
cast call 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 "totalMinted()(uint256)" --rpc-url https://mainnet.base.org
```

*Lưu ý về hiển thị nguồn cung trên Block Explorer (BaseScan):*
Hợp đồng `HienSinh.sol` thiết lập không gian định danh hữu hạn gồm 10 token chuẩn tắc (`TOTAL_IDENTITIES = 10`), trong đó số lượng token đã đúc được theo dõi trực tiếp qua hàm `totalMinted()` (khởi tạo bằng 2 tại genesis: Token 0 và Token 6). Hợp đồng tuân thủ chuẩn cốt lõi ERC-721 và không triển khai phần mở rộng tùy chọn `ERC721Enumerable` (hàm `totalSupply()`). Lệnh gọi trực tiếp tới selector `totalSupply()` không trả về giá trị nguồn cung; giao diện ERC-721 của BaseScan hiện hiển thị mục "Max Total Supply" là 0, đồng thời vẫn ghi nhận chính xác 2 lượt chuyển nhượng khởi nguyên (Token 0 và Token 6) cùng 1 người nắm giữ. Đây là đặc điểm tương thích giao diện của trình duyệt khối đối với hợp đồng không dùng `ERC721Enumerable`, không phải là khiếm khuyết vận hành của hợp đồng.

## 5. Timestamp và Phân tầng Khóa phát hành

Quy trình bảo đảm thời gian được phân chia nghiêm ngặt theo hai cổng độc lập:

### A. Cổng Khởi nguyên Tiền quan hệ (Pre-Relational Origin Gate)
- Tệp `ORIGIN-PROVENANCE.json` và chữ ký rời `ORIGIN-PROVENANCE.json.asc` bắt buộc phải được đóng dấu OpenTimestamps và đạt trạng thái xác thực trên chuỗi khối Bitcoin (`ots verify` thành công).
- **Điều kiện tiên quyết:** Cổng này phải hoàn tất trước khi thực hiện bất kỳ hoạt động công bố công khai nào đối với kho lưu trữ mã nguồn hay tác phẩm nghệ thuật.

### B. Cổng Gắn kết Phát hành & Mở giao dịch (Release-Binding & Transaction Gate)
- Bản chỉ định tổng hợp `CANONICAL-DESIGNATION.md`, cam kết lưu trữ `H_STEWARDSHIP_ARCHIVE`, tệp `ROOT-COMMITMENTS.json`, cùng chữ ký chéo giữa địa chỉ ví và OpenPGP fingerprint của Tác giả phải được hoàn tất và đối chiếu trước khi mở listing hoặc thực hiện giao dịch on-chain.
- OpenTimestamps chứng minh sự tồn tại của dữ liệu tại thời điểm xác thực Bitcoin block; nó không tự chứng nhận giá trị nghệ thuật hay thay thế lời tuyên bố chỉ định của Tác giả.


## 6. Vòng đời của Archive Commitment (Gói 05 Complete)

Để tránh nhầm lẫn về thời điểm xác lập cam kết lưu trữ:

1. **Xác định giá trị (`VALUE_DETERMINED_AT_PRE_RELEASE_PACKAGING`):** Giá trị `H_STEWARDSHIP_ARCHIVE` được tính toán toán học từ toàn bộ tệp của gói lưu trữ Complete tĩnh và công bố trong `ROOT-COMMITMENTS.json`.
2. **Ký duyệt trong ủy quyền (`ENTERS_ARTIST_AUTHORIZATION`):** Tác giả đưa hash này vào cấu trúc EIP-712 `CompletePackageAcceptance` khi cấp chữ ký xác nhận cho người nhận accession.
3. **Ghi nhận bất biến trên chuỗi (`ON_CHAIN_RECORDED_AT_FIRST_ACQUISITION`):** Khi giao dịch `acquireCompletePackage` thực thi thành công trên Base, giá trị được khóa vĩnh viễn vào biến `designatedArchiveCommitment` trên smart contract.
4. **Quan sát độc lập (`INDEPENDENTLY_OBSERVABLE`):**
   - Trước khi mua: Quan sát qua `ROOT-COMMITMENTS.json` và bản dữ liệu EIP-712 do Tác giả ký.
   - Sau khi mua: Quan sát trực tiếp trên chuỗi qua hàm `designatedArchiveCommitment()` và sự kiện `CompletePackageAcquired`.

## 7. Nghiệm thu gói tệp bàn giao (Package Acceptance)

Quy trình nghiệm thu tệp dành cho người nhận gói:

1. Đọc `PACKAGE-MANIFEST.json` và `_reveal/DELIVERY-MANIFEST.json`.
2. Xác nhận `package_type` phù hợp với cấu trúc thư mục nhận được.
3. Tính SHA-256 từng file bằng đường dẫn POSIX tương đối:
   ```bash
   # Tạo danh sách hash kiểm tra file lá (leaf hashes)
   find . -type f ! -name "PACKAGE-MANIFEST.json" -exec sha256sum {} + | sort -k 2
   ```
4. Tái tạo package root theo quy trình canonical được dùng để tạo các commitment phát hành; `ROOT-COMMITMENTS.json` công bố thuật toán và các tham số serialization, còn cấu trúc payload chính xác được trình bày dưới đây:
   - Trích xuất mảng `files` từ `PACKAGE-MANIFEST.json` và tạo payload chuẩn hóa:
     $$\text{payload} = \{\text{"algorithm"}: \text{"sha256(canonical-json-v1)"}, \text{"files"}: \text{d["files"]}\}$$
   - Định dạng Canonical JSON: mã hóa UTF-8, `ensure_ascii=False`, sắp xếp khóa (`sort_keys=True`), phân tách gọn không khoảng trắng (`separators=(',', ':')`), và một ký tự `\n` ở cuối tệp.
   - Lệnh tính package root chuẩn bằng Python 3:
     ```bash
     python3 -c 'import json, hashlib; d=json.load(open("PACKAGE-MANIFEST.json", "rb")); payload={"algorithm":"sha256(canonical-json-v1)","files":d["files"]}; b=(json.dumps(payload, sort_keys=True, separators=(",",":"), ensure_ascii=False)+"\n").encode("utf-8"); print("Package Root:", hashlib.sha256(b).hexdigest())'
     ```
5. Đối chiếu package root với registry cam kết phát hành trong `ROOT-COMMITMENTS.json`.
6. Kiểm tra token ID, designated bearer, nonce và event trên chuỗi.
7. Đối với Complete, kiểm tra `STEWARDSHIP-ACCESSION.json`.

*Cảnh báo ranh giới:* Manifest khai báo Complete nhưng thiếu thư mục `painting/`, hoặc gói Frame độc lập chứa bất kỳ tệp Painting/transcript gốc L nào, đều là lỗi cấu trúc nghiêm trọng (critical failure).

## 8. Xoay vòng khóa và Sự cố (Key Rotation & Incident)

Xoay vòng khóa phải được khóa cũ ký xác nhận và khóa mới ký chéo. Nếu khóa cũ bị mất, operator phát hành văn bản `PROVENANCE-INCIDENT` kết nối bản ghi cuối cùng có thể kiểm tra với khóa mới và giải thích rõ giới hạn; không xóa fingerprint cũ trong lịch sử.

Mạo danh là `unauthorized public trace`. Chỉ bản ghi được ký kết nối về registry canonical mới có thẩm quyền bổ sung hoặc điều chỉnh lineage.
