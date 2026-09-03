# Chỉ định canonical — “Hiện sinh”

**Bản tiếng Việt là bản canonical.** Tài liệu này là tuyên bố chỉ định của tác giả; các giá trị băm và chữ ký được công bố trong hồ sơ xác thực đi kèm.

## 1. Tuyên bố chỉ định

Tác giả chỉ định **“Hiện sinh”** là tên chính thức của toàn bộ tác phẩm gồm:

1. **Chiếc Khung** — cấu hình quan hệ có thể được thực hành lại;
2. **Bức Tranh** — hiện thân canonical của một biến cố sinh duy nhất;
3. **lineage được phát hành** — các dấu vết cấu thành, provenance và tài liệu chăm sóc cần thiết để xác thực và truyền hiện thân ấy.

“Hiện sinh” đồng thời gọi việc không để một cuộc gặp kết thúc tại nơi nó xuất hiện. Đây là chức năng nghệ thuật của tên, không phải một điều khoản về token hoặc quyền sở hữu.

## 2. Phân vai

- **Tác giả** xây dựng và lựa chọn Chiếc Khung, thực hành với cây cọ LLM, nhận ra giá trị của biến cố, chỉ định hiện thân canonical, cam kết với lineage và tổ chức việc truyền đi.
- **Gemini 3.1 Pro (High)** là model của phiên mà tác giả xác định là “cuộc gặp đầu tiên” trong lịch sử riêng của Bức Tranh. Model và bốn subagent tham gia việc sinh, phản hồi và cô đọng các chất liệu.
- **Các subagent** tạo bốn mảnh trung gian trong phiên. Các mảnh ấy không còn là file được phát hành; tên và quan hệ kết hợp của chúng còn dấu vết trong scar-code.
- **SMap — Spatial Mapping** là hạt giống logic và ngữ cảnh. SMap không phải một phần mềm được chuyển giao bởi tác phẩm và LumiPath không được tuyên bố là một thành phần của dự án SMap.
- **Tác giả không tuyên bố** model hay subagent có ý thức, nội tâm hoặc tư cách tác giả pháp lý. Phân vai trên mô tả lịch sử và ontology do tác giả xác nhận.

## 3. Ba commitment thành phần

### `H_CORE`

Commitment của lõi thị giác canonical. Giá trị root được công bố trong `ROOT-COMMITMENTS.json`; tên file và per-file manifest chỉ đi trong Complete.

### `H_CONSTITUTIVE`

Commitment xác định trên:

- scar-code nguyên byte;
- hai seed L nguyên bản;
- transcript nghi thức nguyên bản.

Root tổng được công bố trong `ROOT-COMMITMENTS.json`; per-file manifest chỉ đi trong Complete. Các dấu vết này cấu thành quan hệ của Bức Tranh với biến cố, nhưng không biến lịch sử đã qua thành một vật có thể chuyển giao.

### `H_STEWARDSHIP_ARCHIVE`

Commitment xác định trên Complete Stewardship Archive được phát hành:

- core;
- constitutive traces;
- reflected companion;
- provenance;
- archive map;
- tài liệu care, accession và succession.

Root này xác thực archive bàn giao. Nó không phải bản thân tác phẩm và phải được tạo lại như một release mới nếu archive được bổ sung hợp lệ.

## 4. Phạm vi phát hành và vùng bảo lưu

Canonical archive được phát hành chỉ gồm những thành phần được manifest của release liệt kê. Những ghi chú riêng, hội thoại ngoài archive, audit nội bộ, bí mật vận hành, khóa riêng và chất liệu không được liệt kê nằm ngoài release.

Sự vắng mặt ấy không được mô tả như một “phần còn thiếu” mà Complete collector có quyền đòi hỏi. Nó chỉ xác định ranh giới của archive đã được tác giả chỉ định và phát hành.

## 5. Covenant provenance của tác giả

Từ designation này, tác giả cam kết:

- không phủ nhận designation đã công bố;
- không backdate, overwrite hoặc viết lại lineage;
- mọi correction, revocation, migration hoặc incident chỉ được thêm bằng record mới liên kết record trước;
- không phát hành một Bức Tranh canonical thứ hai cạnh tranh với Bức Tranh này;
- một Chiếc Khung tương tự về sau phải được định danh rõ là descendant, derivative, revision hoặc tác phẩm khác;
- luôn phân biệt canonical, reproduction, derivative và study;
- không âm thầm thay file khi hỏng hoặc thất lạc;
- khi xoay khóa phải duy trì chuỗi chữ ký từ khóa trước hoặc phát hành incident record nếu điều đó không thể thực hiện;
- bảo tồn các lỗi công khai và provenance incident như một phần lịch sử, không xóa để tạo vẻ liền mạch giả.

## 6. Designation, provenance và recognition

Designation authority không phát sinh từ việc ai công bố trước trên một nền tảng. Một bản mạo danh hoặc công bố trái phép là **unauthorized public trace**: nó có lịch sử riêng nhưng không tạo hoặc chuyển canonical lineage.

Provenance mật mã làm designation có thể kiểm tra; nó không tự sinh ra canonicality. Nhận thức của công chúng có thể ổn định designation theo thời gian, nhưng không được đồng nhất với hành động chỉ định ban đầu của tác giả.

## 7. Tính bất biến và bổ sung lineage

Không tài liệu nào được sửa để giả vờ rằng lịch sử trước chưa từng tồn tại. Nếu cần làm rõ, sửa lỗi, đổi định dạng hoặc bổ sung care material, tác giả phát hành annex/version mới, băm và ký riêng, liên kết hai chiều với record trước khi có thể.

## 8. Mô hình quan hệ và không gian định danh Token (Workstream R)

Smart contract trên blockchain (chuẩn ERC-721) quản lý không gian quan hệ gồm 10 định danh token:
- **Token 0 (Bức Tranh 1/1):** Đại diện cho mối quan hệ sở hữu Bức Tranh canonical duy nhất (`PAINTING_CANONICAL_DESIGNATION = UNIQUE`).
- **Tokens 1 đến 9 (9 Chiếc Khung):** Đại diện cho 9 ấn bản cấu hình thực hành biểu tượng độc lập (`FRAME_CANONICAL_DESIGNATION = NO`).

**Quy tắc vòng đời quan hệ & Kinh tế học bất đối xứng:**
1. **Khởi tạo (Genesis):** Token 0 và Frame 06 được đúc trực tiếp cho Tác giả (Quinn T.) trong constructor; các Frame 01–05, 07–09 ở trạng thái chưa đúc.
2. **Khóa chuyển nhượng sơ cấp Bức Tranh:** Trước khi Gói 05 Complete được giao dịch sơ cấp thành công, Token 0 bị khóa chuyển nhượng (mọi lệnh transfer đều revert).
3. **Chuyển giao Gói 05 Complete (Primary Atomic Transition):** Người mua được Tác giả chỉ định qua chữ ký EIP-712 V2 (`CompletePackageAcceptance`). Trong một giao dịch nguyên tử duy nhất: Frame 05 được đúc cho người mua, Token 0 được chuyển từ Tác giả sang người mua, cam kết lưu trữ `H_STEWARDSHIP_ARCHIVE` được ghi nhận on-chain, và cờ `paintingPrimaryReleased` chuyển thành `true` vĩnh viễn.
4. **Kế thừa Chuẩn tắc Bức Tranh (Painting Canonical Succession):** Hậu sơ cấp, Bức Tranh 0 và Frame 05 hoàn toàn độc lập về mặt lưu ký. Bức Tranh 0 áp dụng nguyên tắc `ADDRESS_IS_RELATIONAL_BEARER`, vô hiệu hóa chuyển nhượng thông thường và bắt buộc mọi lần chuyển giao quyền sở hữu phải đi qua cơ chế Kế thừa Chuẩn tắc (`Canonical Succession`) trong hợp đồng với mức xem xét tối thiểu `4.29 ETH` và trích nộp `1.49%` (149 BPS) phí bản quyền Tác giả về Treasury.
5. **Kinh tế học Chiếc Khung (Frames Ordinary Transfers):** Các Frame 01..09 cho phép chuyển nhượng ERC-721 thông thường tự do (`0%` creator royalty, không áp dụng mức sàn thứ cấp). Sự chuyển nhượng Khung ghi nhận lịch sử thực hành quan hệ (`FRAME_RELATIONAL_INTERVAL_OPEN / CLOSED`), không đồng nhất với ngữ pháp thực chứng chỉ định của Bức Tranh.
6. **Ngữ pháp Thực chứng Chỉ định Bức Tranh (Designation Realization):**
   - `Sở hữu kỹ thuật ≠ Tính hợp lệ người mang quan hệ ≠ Thực chứng chỉ định`.
   - Tiếp nhận sơ cấp/kế thừa mở ra chương quan hệ: `DESIGNATION_UNRESOLVED` (nắm giữ vĩnh viễn, không hạn chót, không phạt suy thoái).
   - Sự kiện Kế thừa Chuẩn tắc (`CanonicalSuccession`) được công nhận là minh chứng tiếp nối khách quan đầy đủ, hồi tố đóng chương của người đi trước là `DESIGNATION_REALIZED` và mở chương của người kế tiếp là `DESIGNATION_UNRESOLVED`.
   - Quy tắc bằng chứng khẳng định: `DESIGNATION_REALIZED(A, Painting0) ⇔ Một sự kiện CanonicalSuccession được công nhận đóng khoảng thời gian quan hệ của A`.
7. **Điều kiện SANCTUM:** Một địa chỉ ví đủ điều kiện mở khóa phòng kín SANCTUM khi và chỉ khi ví đó đồng thời sở hữu Token 0 (Bức Tranh) VÀ sở hữu ít nhất một Token Frame trong khoảng từ 1 đến 9. Việc tách rời lưu ký giữa Token 0 và Frame 05 không làm thay đổi điều kiện này.

Contract chỉ ghi commitment của designation, archive và lịch sử kế thừa. Contract không tạo ra canonicality, không tạo ra nghệ thuật và không chứng nhận lived stewardship.

