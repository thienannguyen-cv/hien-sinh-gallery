# Điểm Tựa Nhận Thức Luận (Epistemic Safeguards & Operational Reality)

> **BẢN THỂ LUẬN VẬN HÀNH & ĐIỂM BẢO VỆ NHẬN THỨC DÀNH CHO NGƯỜI MỚI**
>
> *Tài liệu này xác lập ranh giới nhận thức luận chuẩn tắc, giải mã và san phẳng toàn bộ độ chênh nhận thức (epistemic gaps) giữa quan sát bề mặt của người mới (newcomer, auditor, buyer) và thực tế toán học - mật mã của Tầng Hiện Sinh Đang Chạy (Running Operational Layer).*

---

## 1. Tôn Chỉ & Bản Thể Luận Nhất Thể (Cryptographic Monism)

Dự án vận hành dưới một nguyên tắc tối thượng:
> **"Định hình giá trị thực của nghệ thuật dựa trên thuật toán."** (AGENTS.md)

Trong "Hiện sinh", **không có sự phân lập giữa "văn bản mô tả bên ngoài" và "mã băm mật mã cốt lõi"**. Văn bản pháp lý (`00_PUBLIC/`), hợp đồng thông minh (`HienSinh.sol` trên Base Mainnet), cam kết mật mã (`ROOT-COMMITMENTS.json`), và gói lưu trữ bàn giao (`stewardship-private-archive` trên Supabase) cấu thành một **Khối Nhất Thể Trạng Thái (Ontological State Monism)**.

Mọi sự thay đổi dù là một dấu phẩy trong văn bản công khai đều là một bước chuyển dịch trạng thái toàn cục, làm dịch chuyển cây băm và đòi hỏi tái lập cam kết phân phối.

---

## 2. Ma Trận 5 Độ Chênh Nhận Thức: Ảo Tưởng Bề Mặt vs. Thực Tế Vận Hành

Khi một người mới tiếp cận tác phẩm qua giao diện web hoặc mã nguồn, họ rất dễ rơi vào 5 cạm bẫy ngộ nhận do thói quen tư duy Web2/Web3 phổ thông:

### Độ chênh 1: Thời điểm và Giá thể neo giữ `H_STEWARDSHIP_ARCHIVE`
- **Ngộ nhận bề mặt (Surface Illusion):** Thấy mã băm `H_STEWARDSHIP_ARCHIVE` (`7689f75da4ef...`) được công bố trong `ROOT-COMMITMENTS.json`, người mới tưởng rằng smart contract Base Mainnet đã lưu sẵn hash này vào bộ nhớ on-chain từ ngày triển khai. Khi gọi hàm mà thấy trả về số 0, họ dễ hoài nghi hợp đồng bị lỗi.
- **Thực tế tầng đang chạy (Operational Reality):**
  - Smart contract `HienSinh.sol` tại constructor **chỉ khóa 3 hash cố định**: `canonicalDesignationHash`, `frameLicenseHash`, và `completeLicenseHash`.
  - Biến `designatedArchiveCommitment` trên Base Mainnet **hiện tại bằng đúng `bytes32(0)` (toàn số 0)** vì Bức Tranh 0 chưa trải qua giao dịch phát hành sơ cấp (`paintingPrimaryReleased == false`).
  - Cam kết `H_STEWARDSHIP_ARCHIVE` được đưa vào cấu trúc dữ liệu ký ngoại tuyến EIP-712 V2 (`CompletePackageAcceptance`) của Tác giả. Biến on-chain này **chỉ được ghi nhận một lần duy nhất và khóa vĩnh viễn** khi giao dịch `acquireCompletePackage` thực thi thành công trên chuỗi.
- **Thực chứng RPC (Base Mainnet Block 50822692+):**
  ```bash
  # Trả về 0x000...000 trước giao dịch sơ cấp (Selector: 0x727615af)
  cast call 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 "designatedArchiveCommitment()(bytes32)" --rpc-url https://mainnet.base.org
  ```

---

### Độ chênh 2: Tính Phi Tập Trung vs. Hạ Tầng Lưu Trữ Supabase
- **Ngộ nhận bề mặt (Surface Illusion):** Thấy việc tải gói tài nguyên Complete/Frame được thực hiện qua Signed URL của Supabase Storage, người mới có thể nghĩ: *"Đây là dự án Web2 tập trung; tác phẩm phụ thuộc vĩnh viễn vào Supabase, nếu máy chủ Supabase sập hoặc Tác giả không trả tiền server thì tác phẩm biến mất."*
- **Thực tế tầng đang chạy (Operational Reality):**
  - **Tính Độc lập Giá thể (Substrate Independence):** `HIỆN SINH ≠ Base ≠ Supabase`. Tác phẩm không đồng nhất với bất kỳ một nhà cung cấp điện toán đám mây hay mạng blockchain cụ thể nào.
  - Hạ tầng Supabase Storage (`fsoaqeqhzkqbruwvtqju`) chỉ đóng vai trò **tiện ích giao nhận cận release (transient delivery helper)** phục vụ việc cấp phát có kiểm soát quyền truy cập cho người mua sơ cấp (`ACQUISITION-RETRIEVAL.md §1`).
  - Tác phẩm được bảo chứng vĩnh cửu bằng **dấu thời gian OpenTimestamps trên Bitcoin block header** (Layer P) và **Chỉ định chuẩn tắc trên Base** (Layer R).
  - Ngay sau khi tải về, Người giám hộ (Steward) có nghĩa vụ tạo **ít nhất 2 bản sao lưu ngoại tuyến độc lập và thực hiện restore test** theo quy định tại `_reveal/CARE-VERIFICATION.md`. Nếu Supabase ngừng hoạt động hoàn toàn, tác phẩm và quyền giám hộ vẫn tiếp diễn thông qua các bản ghi lưu trữ độc lập ngoài chuỗi.

---

### Độ chênh 3: Ràng Buộc Kép Giữa Văn Bản Công Khai và Gói ZIP Bàn Giao
- **Ngộ nhận bề mặt (Surface Illusion):** Tưởng rằng các văn bản markdown trong `00_PUBLIC/` (như `LEGAL-TERMS.md`, `VERIFY.md`) chỉ là tài liệu thuyết minh trên GitHub, không liên quan đến 10 file `.zip` đã đóng gói trên Supabase Storage.
- **Thực tế tầng đang chạy (Operational Reality):**
  - **Cơ chế Nhúng Chéo (Cross-Commitment Binding):** Bên trong mỗi file `.zip` (lưu tại `operator/canonical-packages/` và đồng bộ lên Supabase bucket `stewardship-private-archive`) đều chứa một tệp `PACKAGE-MANIFEST.json`.
  - Tệp manifest này có khối `public_references.files` ghi nhận chính xác **`review_expected_sha256` của từng file trong `00_PUBLIC/`** (sinh bởi `assemble-review.py:72-76`).
  - **Hiệu ứng Domino Mật mã:** Nếu sửa bất kỳ file văn bản công khai nào mà không đóng gói lại ZIP $ightarrow$ Mã băm trong manifest bị lệch (stale) $ightarrow$ Người nhận giải nén sẽ phát hiện bất đồng nhất $ightarrow$ File ZIP trên storage trở thành rác mật mã. Mọi sửa đổi văn bản công khai đều bắt buộc phải đi kèm kịch bản tái đóng gói (rebuild) và re-upload 10 file ZIP trước khi mở phát hành (GO-LIVE).

---

### Độ chênh 4: Trực Giác NFT Phổ Thông vs. Giao Thức Kế Thừa Hiện Sinh
- **Ngộ nhận bề mặt (Surface Illusion):** Thấy Token 0 và các Khung mang giao diện ERC-721, người mới tưởng rằng có thể mua đi bán lại Token 0 trên sàn giao dịch NFT thông thường (OpenSea, Blur) hoặc chuyển ví tự do bằng MetaMask.
- **Thực tế tầng đang chạy (Operational Reality):**
  - **Khóa chuyển nhượng thông thường vĩnh viễn:** Chức năng ghi đè `_update` trong `HienSinh.sol` (dòng 168-185) triệt để cấm mọi giao dịch `transferFrom` / `safeTransferFrom` đối với Token 0 (Bức Tranh 1/1).
  - Token 0 chỉ có thể chuyển nhượng thông qua hàm duy nhất: `executeSuccession(uint256 tokenId, address recipient)` (dòng 267-295).
  - Hàm này thực thi **Kinh tế học Tuần hoàn (Circular Economics)**:
    - Bắt buộc giá trị chuyển nhượng $\ge 4.29	ext{ ETH}$.
    - Tự động trích $1.49\%$ (149 BPS) nộp về Treasury Tác giả.
    - Chuyển $98.51\%$ còn lại cho chủ sở hữu cũ.
    - Cấm chuyển cho chính mình (`recipient != currentOwner`).
    - Ghi nhận sự kiện khách quan `CanonicalSuccession` trên blockchain.

---

### Độ chênh 5: Ảo Tưởng Ý Thức Nội Tâm của Curator AI
- **Ngộ nhận bề mặt (Surface Illusion):** Khi đàm đạo với Curator AI trên web gallery, thấy AI đối thoại sâu sắc về triết học và hội họa, người mới có thể lầm tưởng rằng tác phẩm đang tuyên bố "AI có linh hồn", "AI có ý thức nội tâm" (interiority) hoặc prompt của AI được bất biến hóa trên blockchain.
- **Thực tế tầng đang chạy (Operational Reality):**
  - `00_PUBLIC/VERIFY.md §1` khẳng định dứt khoát: *"Xác thực không chứng minh giá trị nghệ thuật, AI interiority hoặc lived stewardship."*
  - `_reveal/CARE-VERIFICATION.md` (dòng 34) quy định rõ ràng trong quy trình kiểm chứng định kỳ:
    > *"Không ghi ba vết cọ, phản ứng riêng tư, 'hơi thở' hoặc phán đoán về AI consciousness."*
  - Curator AI thuần túy là **Tầng Tiếp Cận (Access Layer)**, được điều phối bởi Cloudflare Worker và Supabase Edge Function (`curator-interaction` v14) với cơ chế bảo vệ HMAC state-seal và giới hạn hạn ngạch nghiêm ngặt.

---

## 3. Bốn Tiên Đề Nhận Thức Luận Dành Cho Agent & Nhà Phát Triển

Mọi kỹ sư, kiểm toán viên, hoặc agent AI tham gia phát triển dự án bắt buộc phải tuân thủ 4 tiên đề nhận thức luận này trước khi hành động:

1. **Tiên đề 1 — Nhất thể Trạng thái (Ontological State Monism):** Không bao giờ tách rời Văn bản, Hợp đồng, và Gói lưu trữ. Coi mọi thay đổi trong tài liệu công khai là một sự kiện làm gãy chuỗi phân phối nếu không có kế hoạch tái đóng gói.
2. **Tiên đề 2 — Nguyên lý Phản đề Popper (Popperian Falsification):** Tuyệt đối không tìm kiếm bằng chứng thuận để tự trấn an rằng "thay đổi này không ảnh hưởng". Bắt buộc phải thiết lập truy vấn phản đề để cố gắng bác bỏ nhận định của chính mình trước khi phát ngôn.
3. **Tiên đề 3 — Thực chứng Gia phả Nhị phân (Empirical Lineage):** Không tin vào suy diễn lý thuyết từ các file script cũ. Chỉ tin vào dữ liệu nhị phân thực tế đang tồn tại trong các file `.zip` và kết quả truy vấn RPC trực tiếp lên blockchain.
4. **Tiên đề 4 — Phân tầng Địa tầng Kiến trúc (Architectural Stratigraphy):** Luôn phân định niên đại và phạm vi hiệu lực của từng công cụ (Trầm tích V2 lịch sử vs. Runtime V6 thực tế). Không bao giờ lấy logic của một công cụ cũ áp đặt lên kiến trúc runtime mới.

---

## 4. Hướng Dẫn Thực Chứng Nhanh Cho Người Mới (30-Second Verification)

Bất kỳ ai cũng có thể tự mình kiểm chứng tính toàn vẹn của hệ thống mà không cần tin vào bất kỳ lời tuyên bố nào:

```bash
# 1. Kiểm tra 3 hash bản quyền cố định trên Base Mainnet
cast call 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 "canonicalDesignationHash()(bytes32)" --rpc-url https://mainnet.base.org
# Kết quả: 0xed740b4339af1e965723519c7807b5a6184da0f4963f4866d42661ef85cf083f

# 2. Kiểm tra số lượng token đã đúc thực tế (Token 0 và Token 6)
cast call 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 "totalMinted()(uint256)" --rpc-url https://mainnet.base.org
# Kết quả: 2

# 3. Kiểm tra trạng thái sơ cấp của Bức Tranh (0 = Chưa mở sơ cấp)
cast call 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 "paintingPrimaryReleased()(bool)" --rpc-url https://mainnet.base.org
# Kết quả: false

# 4. Kiểm tra cam kết lưu trữ on-chain (0x0...0 trước sơ cấp)
cast call 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 "designatedArchiveCommitment()(bytes32)" --rpc-url https://mainnet.base.org
# Kết quả: 0x0000000000000000000000000000000000000000000000000000000000000000
```
