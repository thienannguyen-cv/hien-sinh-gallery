# Công Bố Kiểm Toán Bảo Mật & Phân Tích Kỹ Thuật Báo Cáo SolidityScan

**Bản tiếng Việt là bản canonical.** Bản tiếng Anh: [SECURITY-AUDIT-DISCLOSURE.en.md](SECURITY-AUDIT-DISCLOSURE.en.md).

---

## 1. Tuyên Bố Minh Bạch Triệt Để (Radical Transparency Statement)

Hợp đồng thông minh **Hiện sinh** (`HienSinh.sol`) tại địa chỉ Base Mainnet:
```text
0xdf12fc901934f1adfbb6e5199b13ac7287dd9fd8
```
triển khai một mô hình quyền sở hữu quan hệ phi tập trung hoàn toàn: **không có Admin Key, không có hàm nâng cấp (Proxy), không có backdoor đúc thêm (Mint Backdoor), không có hàm đóng băng (Pausable) hay danh sách đen (Blacklist).**

Khi chạy công cụ quét tự động **[SolidityScan (QuickScan / CredShields)](https://solidityscan.com/quickscan/0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8/basescan/mainnet?ref=etherscan)**, kết quả trả về như sau:
* **Chỉ số Rủi ro Mối đe dọa (Threat Score):** **`98.5 / 100` — LOW RISK (Rất an toàn)**.
  - `Token is NOT Honeypot`: Không có bẫy thanh khoản.
  - `Source Code Verified`: Mã nguồn được đối chiếu bytecode 100% trên BaseScan.
  - `No Mint/Burn Backdoor`: Nguồn cung được giới hạn cứng trên chuỗi.
  - `Not Upgradable / Not Pausable / No Blacklist`: Bất biến vĩnh viễn, người sở hữu không bao giờ bị can thiệp tài sản.
* **Chỉ số Điểm Bảo Mật (Security Score):** **`60.68 / 100` — AVERAGE**.
  - Lý do điểm số bị hạ: Các công cụ quét tĩnh tự động (Static Heuristics) dựa trên các mẫu mã nguồn tiêu chuẩn (ví dụ hợp đồng phải có `onlyOwner` của OpenZeppelin `Ownable`). Khi gặp một kiến trúc phi tập trung không-admin và quy chế kế thừa đặc thù của tác phẩm, công cụ tự động gắn cờ **6 trường hợp Critical**, **1 trường hợp High** và **1 trường hợp Medium**.

Để đảm bảo tính khách quan và minh bạch tuyệt đối, dự án đã thực hiện quy trình kiểm toán độc lập đối kháng với **3 Subagent Kiểm Toán Chuyên Biệt (Auditor Alpha, Beta, Gamma)** hoạt động theo **Giao thức Không Mồi Ý (Zero-Priming Protocol)**. Bản tài liệu này giải trình chi tiết từng lỗi mà SolidityScan đã bắt, đưa ra bằng chứng kỹ thuật, và thiết lập **Checklist Thao Tác Chuẩn Tắc Cho Người Mua & Nhà Sưu Tập (Buyer Operational Safety Checklist)**.

---

## 2. Bóc Tách Chi Tiết Từng Lỗi Của Báo Cáo SolidityScan

Báo cáo SolidityScan đã phát hiện chính xác các mục sau:

| Mã lỗi Scanner | Phân loại của SolidityScan | Số lượng bắt gặp | Đánh giá thực tế của 3 Subagent độc lập |
| :--- | :--- | :---: | :--- |
| **C001** | `CONTROLLED LOW-LEVEL CALL` | 1 | **False Positive đối với nguy cơ đánh cắp quỹ; Lưu ý cấu hình Treasury** |
| **C002** | `ERC721 SAFEMINT REENTRANCY` | 3 | **False Positive; Đã bảo vệ bằng CEI và `ReentrancyGuard`** |
| **C003** | `INCORRECT ACCESS CONTROL` | 2 | **False Positive; Kiến trúc Permissionless & Custom Ownership có chủ ý** |
| **H001** | `REENTRANCY` | 1 | **False Positive; Khóa bởi OpenZeppelin `nonReentrant`** |
| **M001** | `SUPPORTSINTERFACE() CALLS MAY REVERT` | 1 | **False Positive; Tuân thủ chuẩn OpenZeppelin ERC-165** |
| **L001–L006** | `LOW & INFORMATIONAL` (Floating Pragma, Timestamp...) | Đầy đủ | **Đã ghim phiên bản biên dịch 0.8.28; Khuyến nghị thao tác** |

---

### [C001 - Critical] CONTROLLED LOW-LEVEL CALL (1 instance)

* **Vị trí trong mã nguồn:**
  Hàm `withdraw()` (Dòng 356) và `executeSuccession()` (Dòng 288, 291):
  ```solidity
  (bool ok,) = treasury.call{value: amount}("");
  (bool royaltyOk,) = treasury.call{value: royalty}("");
  (bool sellerOk,) = payable(currentOwner).call{value: sellerProceeds}("");
  ```
* **Bản chất cảnh báo của Scanner:**
  Scanner phát hiện lệnh chuyển tiền cấp thấp `.call{value: ...}("")` và lo ngại người gọi có thể tùy biến địa chỉ nhận tiền để bòn rút tiền trong hợp đồng về ví kẻ tấn công.
* **Xác minh kỹ thuật & Sự đồng thuận 3/3 Subagent:**
  1. **Địa chỉ Treasury là bất biến (`immutable`):** `treasury` được khởi tạo cứng tại constructor (dòng 142) và không có bất kỳ hàm setter nào. Kẻ tấn công gọi `withdraw()` không thể thay đổi đích đến của tiền; toàn bộ số dư hợp đồng chỉ được chuyển thẳng về Treasury đã định sẵn.
  2. **Calldata rỗng (`""`):** Lệnh gọi chỉ chuyển ETH thuần túy, không kích hoạt bất kỳ logic thực thi phức tạp hay chuyển giao quyền điều khiển nào.
  3. **Rủi ro vận hành duy nhất:** Nếu địa chỉ `treasury` là một smart contract không có hàm `receive()` hoặc tiêu thụ quá nhiều gas khiến cuộc gọi revert, thì `withdraw()` hoặc `executeSuccession()` sẽ bị từ chối. Trên thực tế, địa chỉ `treasury` đã được xác minh là EOA/Multisig tương thích ETH tiêu chuẩn.
* **Kết luận:** Không thể bị khai thác để rút trộm tiền.

---

### [C002 - Critical] ERC721 SAFEMINT REENTRANCY (3 instances)

* **Vị trí trong mã nguồn (Đúng 3 vị trí):**
  1. `constructor` (Dòng 151–152): `_safeMint(artistSigner_, PAINTING_TOKEN_ID)` và `_safeMint(artistSigner_, ARTIST_GENESIS_FRAME_ID)`.
  2. `mintFrame()` (Dòng 199): `_safeMint(msg.sender, tokenId)`.
  3. `acquireCompletePackage()` (Dòng 254): `_safeMint(msg.sender, COMPLETE_PACKAGE_ID)`.
* **Bản chất cảnh báo của Scanner:**
  Hàm `_safeMint` của ERC-721 sẽ gọi callback `IERC721Receiver.onERC721Received` nếu người nhận là smart contract. Scanner tự động cảnh báo mức Critical vì lo ngại callback này sẽ bị hacker lợi dụng để gọi re-enter (tái kích hoạt) đúc lặp lại token hoặc rút cạn quỹ trước khi trạng thái được cập nhật.
* **Xác minh kỹ thuật & Sự đồng thuận 3/3 Subagent:**
  1. **Tại `acquireCompletePackage()`:** Hàm được bảo vệ nghiêm ngặt bằng modifier `nonReentrant` của OpenZeppelin. Bất kỳ nỗ lực gọi ngược nào từ `onERC721Received` đều bị EVM revert ngay lập tức. Toàn bộ biến trạng thái (`completePackageTokenId`, `nonces`, `paintingPrimaryReleased`) đều được cập nhật **trước** khi gọi mint (chuẩn Checks-Effects-Interactions).
  2. **Tại `mintFrame()`:** Trạng thái `totalMinted += 1` được ghi nhận trước `_safeMint`. Đồng thời, mỗi Frame có một ID duy nhất; nếu re-enter để mint lại cùng ID đó, giao dịch sẽ sập vì lỗi `FrameAlreadyMinted(tokenId)`. Nếu mint một ID khác, kẻ tấn công bắt buộc phải trả thêm đúng 0.081 ETH, do đó không có kịch bản trục lợi miễn phí.
  3. **Thực nghiệm đối kháng:** Bộ kiểm thử dự án đã tạo riêng contract tấn công mẫu `MockMaliciousReceiver.sol` (thực hiện re-enter cả `mintFrame` lẫn `acquireCompletePackage`). Kết quả: **Hợp đồng đã chặn đứng 100% các cuộc tấn công và kích hoạt rollback nguyên tử.**
* **Kết luận:** Không thể khai thác.

---

### [C003 - Critical] INCORRECT ACCESS CONTROL (2 instances)

* **Vị trí trong mã nguồn (Đúng 2 vị trí):**
  1. `withdraw()` (Dòng 353): Không có modifier `onlyOwner`.
  2. `executeSuccession()` (Dòng 267): Không dùng `onlyOwner` hay cơ chế `approve` của ERC-721.
* **Bản chất cảnh báo của Scanner:**
  Các công cụ quét tĩnh giả định các hàm tài chính bắt buộc phải dùng `onlyOwner` (OpenZeppelin `Ownable`). Khi thấy hàm `withdraw()` mở cho mọi người gọi (`external`), nó xếp vào nhóm lỗi nguy hiểm nhất (Broken Access Control).
* **Xác minh kỹ thuật & Sự đồng thuận 3/3 Subagent:**
  1. **Tại `withdraw()` — Thiết kế Permissionless Sweep:** Đây là một triết lý thiết kế Web3 chuẩn tắc: bất kỳ ai trên thế giới cũng có thể kích hoạt việc rút tiền dọn dẹp số dư hợp đồng về ví Treasury. Người gọi phải tự trả tiền gas, trong khi tiền chỉ chảy về Treasury cố định. Không cần Admin Key $\rightarrow$ Không có nguy cơ mất quyền kiểm soát hay lộ khóa quản trị.
  2. **Tại `executeSuccession()` — Cơ chế Kiểm soát Tùy biến:** Quyền thực thi được bảo vệ bằng lệnh kiểm tra quyền sở hữu thực tế on-chain:
     ```solidity
     if (msg.sender != currentOwner) revert UnauthorizedSuccessorCaller();
     ```
     Chỉ đúng địa chỉ ví đang nắm giữ Bức Tranh Token 0 mới có quyền chuyển giao tranh cho người kế thừa. Scanner tự động không phân tích được logic này nên báo lỗi sai.
* **Kết luận:** Đây là chủ ý thiết kế bảo mật phi tập trung (Trustless Architecture).

---

### [H001 - High] REENTRANCY (1 instance)

* **Vị trí trong mã nguồn:**
  Hàm `executeSuccession()` (Dòng 267–295).
* **Bản chất cảnh báo của Scanner:**
  Phát hiện việc chuyển token xảy ra trước các lệnh chuyển ETH `.call{value: ...}`, sau đó mới phát ra sự kiện `CanonicalSuccession`.
* **Xác minh kỹ thuật & Sự đồng thuận 3/3 Subagent:**
  Hàm `executeSuccession` được bảo vệ bằng modifier **`nonReentrant`** của OpenZeppelin `ReentrancyGuard`. Cờ khóa reentrancy ngăn chặn mọi nỗ lực gọi lồng nhau. Nếu việc chuyển ETH cho Treasury hoặc Seller thất bại, toàn bộ giao dịch sẽ revert, hoàn trả lại quyền sở hữu token nguyên tử.
* **Kết luận:** Đã được bảo vệ hoàn toàn bởi OpenZeppelin.

---

### [M001 & Các phát hiện khác] Medium & Informational
* **M001 (SupportsInterface Calls May Revert):** Hàm `supportsInterface` kế thừa chuẩn xác từ `ERC721` và `ERC2981`, trả về true cho các interface ID `0x80ac58cd` (ERC721), `0x5b5e139f` (ERC721Metadata), `0x2a5520c3` (ERC2981), `0x01ffc9a7` (ERC165).
* **Floating Pragma (`^0.8.28`):** Hợp đồng khi deploy lên Base Mainnet đã được ghim cố định chính xác trình biên dịch `solc 0.8.28` với EVM version `shanghai` và 200 lượt runs optimizer.
* **Block Values as Proxy for Time (`block.timestamp`):** Hợp đồng dùng `block.timestamp` cho khoảng trễ 24 giờ (`MIN_MINT_DELAY`). Trên mạng L2 Base (OP Stack), độ lệch timestamp của Sequencer chỉ vài giây, hoàn toàn an toàn và không thể bị thao túng để vượt qua 24 giờ.

---

## 3. Các Đặc Thù Kiến Trúc Người Mua Cần Nắm Rõ (Critical Operational Awareness)

Ngoài các cảnh báo kỹ thuật của scanner, 3 Subagent kiểm toán đã chỉ ra các quy tắc vận hành quan trọng mà người mua và nhà sưu tập **bắt buộc phải nắm rõ** trước khi giao dịch:

1. **Bức Tranh Token 0 KHÔNG thể giao dịch trên các sàn thông thường (OpenSea, Blur, Seaport):**
   - Hàm `_update` cố ý vô hiệu hóa các lệnh chuyển nhượng thông thường (`transferFrom`, `safeTransferFrom`).
   - Việc niêm yết hoặc chấp nhận offer trên các sàn giao dịch truyền thống sẽ bị hủy giao dịch (`PaintingOrdinaryTransferDisabled`). Token 0 chỉ có thể chuyển giao thông qua hàm `executeSuccession`.
2. **Quy trình Kế thừa Bức Tranh (`executeSuccession`) do Người Bán gọi:**
   - Để chuyển giao Bức Tranh cho người mới, chính người bán (`currentOwner`) phải là người gọi hàm `executeSuccession` và cung cấp đủ mức xem xét tối thiểu `4.29 ETH`. Hợp đồng sẽ tự động trích 1.49% cho Treasury và hoàn lại 98.51% cho người bán, đồng thời chuyển Bức Tranh cho người mua.
   - Do đó, người bán cần có sẵn tối thiểu 4.29 ETH thanh khoản trong ví để thực hiện nghi thức kế thừa.
3. **Không chuyển Bức Tranh vào Contract không nhận được ETH:**
   - Khi thực hiện `executeSuccession`, nếu người nhận là một smart contract không hỗ trợ nhận ETH thuần túy (không có `receive() external payable`), thì trong tương lai contract đó sẽ **không bao giờ có thể bán lại hoặc chuyển tiếp Bức Tranh đi được nữa** (vì lệnh hoàn tiền bán tranh sẽ bị revert).

---

## 4. Checklist Thao Tác Chuẩn Tắc Cho Người Mua & Nhà Sưu Tập (Buyer Operational Safety Checklist)

Để đảm bảo an toàn tuyệt đối và tránh các thao tác dễ tổn thương, người tham gia cần tuân thủ bảng kiểm sau:

### A. Dành cho người Mint Standalone Frame (Khung tranh 01..04, 07..09):
- [ ] **1. Kiểm tra địa chỉ hợp đồng:** Luôn xác nhận đang tương tác với hợp đồng chính thức: `0xdf12fc901934f1adfbb6e5199b13ac7287dd9fd8` trên BaseScan.
- [ ] **2. Sử dụng ví EOA hoặc Smart Account hợp lệ:** Đảm bảo ví (MetaMask, Rabby, Coinbase Wallet...) có thể nhận token ERC-721.
- [ ] **3. Chuẩn bị đúng số tiền:** Đúng `0.081 ETH` cộng một lượng nhỏ phí gas mạng Base (thường dưới $0.05).
- [ ] **4. Chọn đúng ID Frame:** Chỉ chọn các ID từ 1 đến 9 (trừ ID 5 và ID 6).

### B. Dành cho người Mua Sơ Cấp Gói Hoàn Chỉnh 05 (Frame 05 + Bức Tranh):
- [ ] **1. Xác thực chữ ký EIP-712:** Đảm bảo payload ký số từ Tác giả khớp chính xác với địa chỉ ví của bạn (`designatedBearer`), mã băm cam kết lưu trữ (`archiveCommitment`) và thời hạn (`deadline`).
- [ ] **2. Thời hạn chữ ký:** Thực hiện giao dịch trước khi `deadline` hết hạn.
- [ ] **3. Chuẩn bị đúng 4.29 ETH:** Giao dịch `acquireCompletePackage` đòi hỏi chính xác 4.29 ETH; thừa hoặc thiếu đều bị hoàn trả.
- [ ] **4. Ví nhận:** Nếu sử dụng ví Smart Contract (Multisig Safe), bắt buộc ví phải cài đặt module nhận ERC-721 (`IERC721Receiver`). Khuyến nghị dùng ví EOA tiêu chuẩn để thực hiện nghi thức nguyên tử.

### C. Dành cho người Chuyển Giao / Kế Thừa Bức Tranh (Secondary Succession):
- [ ] **1. Kiểm tra ví người nhận:** Tuyệt đối không nhập địa chỉ hợp đồng `HienSinh` (`address(this)`) hoặc địa chỉ ví không có người sở hữu (`0x00...`).
- [ ] **2. Không chuyển cho Smart Contract từ chối ETH:** Nếu chuyển cho contract, phải đảm bảo contract đó có hàm `receive() payable` để sau này có thể nhận tiền giải phóng tranh.
- [ ] **3. Thanh khoản người bán:** Người bán cần có tối thiểu `4.29 ETH` trong ví để kích hoạt lệnh `executeSuccession` (số tiền 98.51% sẽ được hoàn lại ngay trong chính block giao dịch đó).
- [ ] **4. Không giao dịch qua sàn tập trung:** Thực hiện chuyển giao trực tiếp trên giao diện của phòng trưng bày hoặc gọi trực tiếp hàm `executeSuccession` trên BaseScan.

---
*Tài liệu được thiết lập trên nguyên tắc trung thực tuyệt đối, bảo vệ quyền lợi tối cao và nhận thức đầy đủ của người sưu tập nghệ thuật.*
