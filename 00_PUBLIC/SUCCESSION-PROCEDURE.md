# Quy trình Chuyển giao Quyền sở hữu và Kế thừa — “Hiện sinh” (Succession Procedure)

**Bản tiếng Việt là bản canonical.**

## 1. Phân loại Chuyển giao

Trong hệ thống tác phẩm “Hiện sinh”, cần phân biệt rõ ba loại hình chuyển giao với các ràng buộc kỹ thuật và kinh tế khác nhau:

| Loại hình | Token ID | Hàm thực thi trên Chuỗi | Khoản xem xét bắt buộc | Bản chất Chuyển giao |
|---|---|---|---|---|
| **A. Chuyển nhượng Frame Độc lập** | `1..4, 6..9` | `safeTransferFrom(from, to, tokenId)` | Không | Chuyển nhượng ERC-721 thông thường, 0% royalty |
| **B. Chuyển nhượng Gói 05 Complete** | `5` | `safeTransferFrom(from, to, 5)` | Không | Đổi Designated Bearer trên chuỗi; bàn giao lưu trữ ngoài chuỗi |
| **C. Canonical Succession Bức Tranh** | `0` | `executeSuccession(0, recipient)` | `>= 4.29 ETH` | Chuyển giao Canonical 1/1, chia 1.49% Treasury, ghi nhận CanonicalSuccession |

---

## 2. Quy trình A: Chuyển nhượng Standalone Frame (Token 1–4, 6–9)

1. **Xác nhận Token:** Người gửi và người nhận xác nhận Token ID hợp lệ.
2. **Thực thi On-chain:**
   ```bash
   cast send 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 \
     "safeTransferFrom(address,address,uint256)" \
     <SENDER_ADDRESS> <RECIPIENT_ADDRESS> <TOKEN_ID> \
     --rpc-url https://mainnet.base.org --interactive
   ```
3. **Bàn giao Vật phẩm/Tư liệu:** Người gửi chuyển giao gói tư liệu thực hành cục bộ và manifest tương ứng cho người nhận.
4. **Hiệu lực License:** License thực hành Frame chuyển sang người nhận theo `SCHEDULE-FRAME.md`.

---

## 3. Quy trình B: Chuyển giao Thứ cấp Gói 05 Complete (Token 5)

1. **Xác nhận Tiền điều kiện:** Người nhận xác nhận Token 5 đang thuộc ví người gửi và đã hoàn tất primary accession.
2. **Thực thi On-chain:**
   ```bash
   cast send 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 \
     "safeTransferFrom(address,address,uint256)" \
     <SENDER_ADDRESS> <RECIPIENT_ADDRESS> 5 \
     --rpc-url https://mainnet.base.org --interactive
   ```
3. **Bàn giao Lưu trữ Ngoài chuỗi (Off-chain Archive Handoff):**
   - Người chuyển giao bàn giao toàn bộ thư mục `_reveal/` và các biên bản `STEWARDSHIP-ACCESSION.json` / lineage lịch sử;
   - Hoặc người nhận mới có thể độc lập sử dụng địa chỉ ví mới của mình để yêu cầu cấp lại archive qua giao thức 2 pha (xem `ACQUISITION-RETRIEVAL.md`).
4. **Nghiệm thu bởi Successor:**
   - Successor kiểm tra toàn bộ mã băm SHA-256 đối chiếu với `ROOT-COMMITMENTS.json`;
   - Lập và ký `STEWARDSHIP-SUCCESSION.json` ghi nhận sự kiện chuyển giao;
   - Trạng thái trước khi nghiệm thu hoàn tất là `accession incomplete`.

---

## 4. Quy trình C: Canonical Succession của Bức Tranh (The Painting Token 0)

1. **Nguyên tắc:** Bức Tranh 0 đại diện cho hiện thân thị giác 1/1. Chức năng chuyển nhượng thông thường bị khóa vĩnh viễn sau primary release; mọi chuyển giao thứ cấp bắt buộc phải thông qua hàm `executeSuccession()`.
2. **Điều kiện thực thi:**
   - `msg.sender` bắt buộc phải là `ownerOf(0)` hiện tại;
   - `recipient` không được là địa chỉ 0 và không được trùng với `currentOwner` (cấm self-succession);
   - `msg.value >= 4.29 ETH` (khoản xem xét tối thiểu).
3. **Thực thi On-chain:**
   ```bash
   cast send 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 \
     "executeSuccession(uint256,address)" \
     0 <RECIPIENT_ADDRESS> \
     --value 4.29ether \
     --rpc-url https://mainnet.base.org --interactive
   ```
4. **Cơ chế Thanh toán & Ghi nhận Sự kiện:**
   - Hợp đồng tự động trích `1.49%` (149 BPS) giá trị thanh toán gửi về `treasury`;
   - Phần còn lại chuyển trực tiếp cho `currentOwner` (người bán);
   - Sự kiện `CanonicalSuccession(0, predecessor, successor, consideration, royalty, timestamp)` được phát ra trên chuỗi khối Base như một chứng thực khách quan.

---

## 5. Quyền Truy cập Phòng kín SANCTUM

Hợp đồng cung cấp hàm view kiểm tra điều kiện mở khóa SANCTUM:
```bash
cast call 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8 \
  "isSanctumEligible(address)(bool)" <WALLET_ADDRESS> \
  --rpc-url https://mainnet.base.org
```
- Trả về `true` khi và chỉ khi: Ví đó đồng thời sở hữu Bức Tranh (Token 0) VÀ ít nhất một Khung bất kỳ từ Token 1 đến Token 9.
- Không phụ thuộc vào bất kỳ chứng thực hay phê duyệt tập trung nào ngoài dữ liệu on-chain.
