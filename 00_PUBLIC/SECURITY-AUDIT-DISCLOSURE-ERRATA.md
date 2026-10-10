# Đính chính Công khai — Báo cáo Kiểm toán Bảo mật
## (Security Audit Disclosure Errata)

**Tài liệu gốc được đính chính:** `SECURITY-AUDIT-DISCLOSURE.md` / `SECURITY-AUDIT-DISCLOSURE.en.md`, và Mục 8.3.2 của *Hiện Sinh — Whitepaper / Protocol Dossier*.

**Ghi chú quản trị:** Tài liệu tiếng Việt này là bản canonical. Bản `.en.md` đi kèm chỉ mang tính tiếp cận, không có giá trị quản trị nếu có sai khác.

**Tính chất tài liệu:** Đây là nhật ký đính chính cộng dồn (additive-only). Mỗi đợt kiểm toán định kỳ trong tương lai sẽ bổ sung một mục mới có ngày tháng vào cuối tài liệu này; không mục nào bị xoá hoặc ghi đè. Kết luận "Threat Score 98.5/100 — LOW RISK" và các phân loại False Positive / Architectural Intent / Security Pinning gốc trong tài liệu được đính chính **không bị đảo ngược** bởi bất kỳ mục nào dưới đây — các đính chính này bổ sung độ đầy đủ và độ chính xác, không phủ định kết luận cốt lõi.

---

## Mục đính chính — 2026-10-08

**Phương pháp tạo ra đính chính này:** Zero-Priming Protocol (một đợt rà soát độc lập bổ sung), sử dụng một phiên AI đánh giá với ngữ cảnh cô lập hoàn toàn, đối chiếu với các phát hiện gốc từ SolidityScan và các kết luận đã công bố tại Mục 8.3.2 nêu trên.

**Bản ghi đầy đủ của phiên (nguyên văn chỉ thị và phản hồi):** [ĐIỀN LINK SHARE SESSION TẠI ĐÂY]

### 1. C001 — "CONTROLLED LOW-LEVEL CALL" (bổ sung, không phủ định)

**Giữ nguyên:** Kết luận False Positive chính xác đối với rủi ro đã được đánh giá — không có khả năng điều hướng thanh toán đến một địa chỉ tuỳ ý, vì `treasury` là immutable và nhánh còn lại luôn trả về đúng `currentOwner` (`msg.sender`).

**Bổ sung:** Kết luận trên chưa đề cập một rủi ro khác, độc lập, tại cùng vị trí code (`withdraw()`, và hai nhánh `.call{value: ...}("")` trong `executeSuccession()`): nếu `treasury` hoặc ví của người kế nhiệm không nhận được ETH thuần (không có `receive()`/`fallback()` hợp lệ), lệnh gọi tương ứng sẽ revert và **không có cơ chế thay thế hay cứu hộ nào**. Vì mọi chuyển nhượng thông thường của Token 0 (Painting) bị khoá sau khi `paintingPrimaryReleased = true`, hệ quả với `executeSuccession()` có thể là **vĩnh viễn không thể chuyển nhượng Painting được nữa**, chừng nào địa chỉ liên quan còn trong tình trạng đó.

**Thực hành chuẩn tắc kéo theo:** Buyer Operational Safety Checklist cần bổ sung bước xác minh — trước khi gọi `executeSuccession()`, chủ sở hữu hiện tại nên xác nhận ví người nhận có thể nhận ETH thuần thành công; trước khi giữ Token 0 trong một smart-contract wallet, cần xác minh ví đó có `receive()`/`fallback()` hoạt động đúng. Đây nên trở thành điều kiện tiên quyết chuẩn cho mọi lượt succession trong tương lai, không chỉ là một ghi chú một lần.

### 2. C002 — "ERC721 SAFEMINT REENTRANCY" (hiệu chỉnh lý do, giữ nguyên kết luận)

**Giữ nguyên:** Kết luận an toàn đúng cho 2 trong 4 vị trí `_safeMint` — tại `mintFrame()` và `acquireCompletePackage()` — với đúng lý do đã nêu (CEI, `nonReentrant`, `FrameAlreadyMinted`).

**Hiệu chỉnh:** Lý do đã công bố **không áp dụng được** cho 2 vị trí còn lại — hai lệnh `_safeMint` trong constructor (Token 0 và Token 6, tại thời điểm deploy). Constructor không mang `nonReentrant`, và `totalMinted` chỉ được gán sau khi cả hai lệnh mint hoàn tất, nên `FrameAlreadyMinted` cũng không bảo vệ ở đây. Hai vị trí này vẫn an toàn, nhưng vì một lý do khác: trong lúc constructor đang chạy, chính contract chưa có runtime code, nên bất kỳ callback tái nhập nào (qua `onERC721Received`) đều chạm vào một địa chỉ không có mã — không thể thực thi được.

**Thực hành chuẩn tắc kéo theo:** Khi một phát hiện bao phủ nhiều vị trí code có đặc tính bảo vệ khác nhau, báo cáo kiểm toán định kỳ sau này nên nêu lý do an toàn riêng cho từng vị trí, thay vì áp một lý do chung cho toàn bộ.

### 3. C003 — "INCORRECT ACCESS CONTROL" (hiệu chỉnh mô tả, giữ nguyên kết luận)

**Giữ nguyên:** Kết luận "Architectural Intent" — không có vai trò admin/owner cấp hợp đồng — chính xác và vẫn là mô tả đúng cho thiết kế tổng thể.

**Hiệu chỉnh:** Mô tả "permissionless" trong bảng công bố áp dụng chính xác cho `mintFrame()` (bất kỳ địa chỉ nào trả đúng giá đều gọi được), nhưng **không chính xác** cho `executeSuccession()` — hàm này yêu cầu `msg.sender == currentOwner` và revert với `UnauthorizedSuccessorCaller()` cho mọi người gọi khác. `executeSuccession()` có gate ở cấp độ caller; điều không tồn tại là một vai trò *admin của hợp đồng* có thể ghi đè gate đó — đây là hai khẳng định khác nhau.

**Thực hành chuẩn tắc kéo theo:** Các bảng công bố kiểm toán sau này nên phân biệt rõ "không có vai trò admin/owner đặc quyền" và "không có kiểm soát truy cập ở cấp độ người gọi", để tránh gộp nhầm hai khái niệm.

### 4. H001 — "REENTRANCY" (hiệu chỉnh mô tả, giữ nguyên kết luận chính)

**Giữ nguyên:** `nonReentrant` ngăn chặn chính xác việc `executeSuccession()`/`acquireCompletePackage()` tái nhập lẫn nhau hoặc tái nhập chính nó; không tìm thấy đường dẫn nào dẫn đến việc rút tiền trái phép qua hướng này.

**Hiệu chỉnh:** Mô tả "strictly locked" phóng đại phạm vi bảo vệ — `withdraw()` và `mintFrame()` không mang `nonReentrant`. Có một đường dẫn xuyên hàm đã được truy vết: một callback được kích hoạt trong nhánh thanh toán đầu tiên của `executeSuccession()` (tới `treasury`) có thể gọi `withdraw()`, quét sạch số dư hợp đồng — bao gồm cả phần proceeds của seller chưa được thanh toán — trước khi nhánh thứ hai thực thi; nhánh thứ hai sau đó thất bại (không đủ số dư), khiến toàn bộ giao dịch revert (bao gồm cả lượt rút tái nhập). Không có giá trị nào thực sự bị trích xuất qua đường này, nhưng nó có thể bị lặp lại để chặn đứng mọi nỗ lực `executeSuccession()` — một hình thức từ chối dịch vụ (DoS) đối với việc chuyển nhượng Painting, phụ thuộc vào hành vi callback của chính `treasury`.

**Thực hành chuẩn tắc kéo theo:** `treasury` nên được duy trì như một địa chỉ nhận thuần tuý, không mang logic tuỳ chỉnh có thể kích hoạt các lệnh gọi hợp đồng không liên quan khi nhận ETH — đây là một ràng buộc vận hành khuyến nghị cho bên kiểm soát địa chỉ đó, không phải một thay đổi mã nguồn.

---

*Các mục đính chính tiếp theo (từ các đợt kiểm toán định kỳ sau) sẽ được bổ sung bên dưới, theo thứ tự thời gian, không ghi đè các mục đã có ở trên.*
