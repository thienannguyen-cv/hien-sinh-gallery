# Giấy phép Nền tảng Triển lãm & Thực hành Cục bộ — "Hiện sinh"
# Exhibition Platform & Local Practice License — "Hiện sinh"

**Bản Tiếng Việt là bản chuẩn tắc (canonical).** English translation follows each section for international reference.

**Copyright (c) 2026 Thien An L. Nguyen · SMapWorks. All rights reserved.**

---

## 1. Cấu trúc Pháp lý & Thứ bậc Thẩm quyền (Legal Hierarchy & Scope)

### A. Tách bạch Bốn Lớp Thẩm quyền (Separation of Four Planes)
$$\text{Smart Contract Token} \neq \text{Delivery Archive} \neq \text{Legal License} \neq \text{Software Repository}$$

- **Token on-chain (Lớp Định danh):** Được quản lý bởi Smart Contract ERC-721 bất biến trên Base Mainnet (Địa chỉ CREATE2: `0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8`), ghi nhận tư cách người nắm giữ chỉ định (`designated bearer`). Token không tự chứa file dữ liệu.
- **Archive bàn giao (Lớp Dữ liệu):** Các gói lưu trữ được niêm phong mật mã bằng SHA-256 manifest và OTS Merkle proof trên Bitcoin Block #965149 / #965152, được bàn giao độc lập qua kênh truyền phát bảo mật sau khi giao dịch on-chain hoàn tất.
- **Văn bản Pháp lý Chuẩn tắc (Lớp Quyền hạn):** Được quy định tại `00_PUBLIC/LEGAL-TERMS.md` cùng hai Schedule chuyên biệt:
  - `00_PUBLIC/SCHEDULE-FRAME.md` (Mã băm SHA-256 on-chain: `bbb9b030f482f5ea365d58eadd13ad48f4357aeb9d983497b9a64c5e1ddb18e2`);
  - `00_PUBLIC/SCHEDULE-COMPLETE.md` (Mã băm SHA-256 on-chain: `71d01dbc1962a5cedd1204fe76fa9d538e5d338146eb9375743b91a55cde8c14`).
- **Kho lưu trữ Mã nguồn này (Lớp Công cụ Phần mềm):** Thuần túy là công cụ phần mềm hiển thị phòng trưng bày kỹ thuật số và môi trường runtime thực hành cục bộ.

### B. Điều khoản Loại trừ Tách biệt (Explicit Carve-Out)
- Giấy phép này chỉ điều chỉnh những tài liệu, mã nguồn và quyền hạn thuộc phạm vi mà văn bản này tuyên bố.
- Giấy phép này **tuyệt đối không sửa đổi, không thay thế, không cấp phép lại (relicense) hoặc phủ quyết (override)** bất kỳ nội dung hoặc mã băm nào của hai Schedule đã được ghim on-chain (`SCHEDULE-FRAME.md`, `SCHEDULE-COMPLETE.md`) hay điều khoản chung `LEGAL-TERMS.md`.
- Giấy phép này **không thay đổi hoặc can thiệp** vào giấy phép riêng của các thành phần phụ thuộc, thư viện mã nguồn mở bên thứ ba (third-party dependencies trong `node_modules`), tài sản được cấp phép riêng, hoặc các gói lưu trữ độc lập.
- Không có điều khoản nào trong văn bản này suy đoán quyền sở hữu đối với các tài sản của bên thứ ba.

---

## 2. Chu vi Nền tảng Triển lãm Trực tuyến (`https://smapworks.art`)

Phần này quy định quyền và nghĩa vụ đối với công chúng, người xem và các tác nhân mạng truy cập trang triển lãm trực tuyến:

### A. Quyền của Tác giả & Nền tảng đối với Bề mặt Triển lãm
- Toàn bộ giao diện người dùng, mã nguồn front-end, cấu trúc không gian triển lãm (Threshold, Atelier, Frame Interior, Sanctum), các hiệu ứng thẩm mỹ (dẫn sóng quang học, mở dần góc che, typography), và nhận diện thương hiệu `SMapWorks` thuộc quyền sở hữu trí tuệ của Tác giả (Thien An L. Nguyen).
- Tác giả giữ mọi quyền tác giả (copyright) và quyền liên quan mà pháp luật công nhận, trừ các quyền được cấp phép rõ ràng dưới đây.

### B. Quyền Tiếp cận của Khách tham quan Công chúng (Public Visitor License)
- Khách tham quan công chúng được cấp quyền cá nhân, phi thương mại, không độc quyền, có thể thu hồi để chiêm ngưỡng tác phẩm công khai và đối thoại với Public Curator cũng như Frame Curator trên giao diện web.
- Trải nghiệm được cung cấp công bằng, không thu phí và không yêu cầu kết nối ví chỉ để xem tranh.

### C. Định mức Điện toán & Dịch vụ Đồng hành (Hosted Compute Bounds)
- Dịch vụ Curator trên máy chủ phòng trưng bày là một hạ tầng đồng hành hữu hạn:
  - Giới hạn tối đa ba (03) lượt đối thoại hoàn chỉnh $(U_i, R_i)$ cho mỗi phiên gặp gỡ;
  - Giới hạn tải trọng tối đa 16 KiB mỗi yêu cầu và áp dụng cơ chế điều tiết tần suất chống quá tải.
- Một lượt đối thoại chuẩn tắc bắt buộc phải là một cặp hoàn chỉnh $(U_i, R_i)$. Trường hợp lỗi mạng, quá thời gian chờ, hoặc gián đoạn dịch vụ nhà cung cấp (`HOSTED_CURATOR_CAPACITY_UNAVAILABLE`) **tuyệt đối không bị tính trừ vào hạn ngạch đối thoại của khách và không niêm phong phiên đàm đạo**.

### D. Chống Mạo danh & Đúc lại (Anti-Counterfeiting & Reminting)
- Nghiêm cấm tạo các bản sao (mirror) giao diện phòng trưng bày nhằm mục đích cạnh tranh hoặc gây nhầm lẫn về tính chuẩn tắc.
- Nghiêm cấm đúc (mint) lại các hình ảnh đại diện công chúng (`intersection-public.png`, `intersection-frame.png`, `condensed_masterpiece_512.png`) thành các token NFT trên bất kỳ chuỗi khối nào.

### E. Điều khoản Miễn trừ Trách nhiệm (As-Is Disclaimer)
- Bề mặt web và hạ tầng hosted được cung cấp "nguyên trạng" (as-is), không có bất kỳ bảo đảm nào về tính sẵn sàng liên tục, tính không gián đoạn của nhà cung cấp mạng, cổng lưu trữ IPFS, hay nhà cung cấp mô hình trí tuệ nhân tạo bên thứ ba.

---

## 3. Chu vi Thực hành Cục bộ của Người Mua (Purchaser / Practitioner / Steward Local Practice)

Phần này phản ánh trung thực và bảo hộ toàn vẹn các quyền thực hành cục bộ đã được xác lập trong các tài liệu chuẩn tắc (`LEGAL-TERMS.md`, `SCHEDULE-FRAME.md`, `SCHEDULE-COMPLETE.md`, `INDEPENDENT-OPERATION.md`):

### A. Quyền Vận hành Ngoại tuyến Độc lập (Independent Local Runtime)
- Người nắm giữ hợp pháp Frame Token (#01–04, #06–09) hoặc Complete Package Token (#05 / Painting #00) có toàn quyền sao chép, giải nén, lưu trữ, nghiên cứu, và vận hành mã nguồn triển lãm này trên thiết bị cá nhân hoặc máy chủ riêng theo hướng dẫn tại [`00_PUBLIC/INDEPENDENT-OPERATION.md`](00_PUBLIC/INDEPENDENT-OPERATION.md).
- **Tính Tự chủ Tuyệt đối:** Quyền thực hành của người mua hoàn toàn độc lập với sự tồn tại của trang `smapworks.art`. Người thực hành có quyền sử dụng API key cá nhân để vận hành adapter Curator cục bộ (`dev-adapter.mjs`) mà không phụ thuộc vào hạ tầng máy chủ của phòng trưng bày.

### B. Quyền Thực hành Khung & Khai thác Thương mại Output (Frame Practice & Output Rights)
Theo đúng quy định tại `SCHEDULE-FRAME.md`:
1. **Sở hữu Đóng góp Sáng tạo:** Người thực hành nắm giữ toàn bộ quyền đối với những đóng góp sáng tạo và các sản phẩm biểu tượng mới (Output) do chính họ tạo ra khi thực hành Chiếc Khung.
2. **Khai thác Thương mại Vĩnh viễn:** Người thực hành nhận được quyền toàn cầu, không độc quyền, vĩnh viễn để tạo, trưng bày, triển lãm, xuất bản, truyền thông, và **khai thác thương mại các Output do chính họ tạo ra**.
3. **0% Creator Fee từ Tác giả:** Tác giả cam kết **0% creator fee (0% royalty)** và không đòi hỏi bất kỳ quyền tác quyền hay chia sẻ doanh thu nào đối với các Output hợp lệ tự tạo của người thực hành.
4. **Tính Sống tiếp của Quyền Output (Survival of Output Rights):** Sau khi Frame Token được chuyển nhượng sang người khác, người thực hành cũ vẫn giữ nguyên vẹn 100% quyền đối với các Output họ đã tạo ra hợp lệ trong thời gian nắm giữ token.
5. **Ranh giới Cấm:**
   - Không được bán lại, cấp phép lại (sublicense), hoặc đóng gói lại chính Frame template, prompt sequences, seed packages, hay validation tooling như một edition/framework cạnh tranh.
   - Không được mint lại Chiếc Khung như một NFT gốc mới.
   - Không được mạo nhận quyền tác giả của tác phẩm "Hiện sinh".
   - Khi công bố Output, cần ghi nhãn chuẩn tắc: *"Được tạo bởi [Người Thực Hành] thông qua thực hành được cấp phép của Frame Hiện sinh; không phải Painting canonical"*.

### C. Quyền Chăm sóc & Bảo tồn của Steward (Complete Package Stewardship)
Theo đúng quy định tại `SCHEDULE-COMPLETE.md`:
1. **Chăm sóc Lineage Canonical:** Người nắm giữ Complete Package Token (#05 / Painting #00) là Steward được chỉ định của hiện thân canonical, nhận quyền lưu trữ, sao lưu (backup), kiểm tra, phục hồi, và chuyển đổi định dạng (format migration) carrier nhằm bảo tồn dữ liệu mà không thay đổi canonical bytes.
2. **Trưng bày & Triển lãm:** Được quyền trưng bày riêng tư hoặc công khai, trình chiếu, và cho các bảo tàng/tổ chức nghệ thuật mượn triển lãm phi thương mại.
3. **Giới hạn Bức Tranh Canonical:**
   - Canonical Painting (`H_CORE`) không được cấp phép in ấn thương mại đại trà, sản xuất poster, merchandise hoặc bản sao chép full-fidelity thay thế bản gốc.
   - Không được dùng `H_CORE`, transcript, hay archive để huấn luyện/tinh chỉnh mô hình AI.
   - Không chuyển nhượng quyền đứng tên tác giả (authorship) hoặc quyền nhân thân (moral rights).
4. **Kế thừa Chuẩn tắc (Canonical Succession):**
   - Bức Tranh 0 (Token 0) chuyển nhượng qua cơ chế Kế thừa Chuẩn tắc với mức xem xét tối thiểu 4.29 ETH và phí bản quyền creator fee ERC-2981 là 1.49% (149 BPS) về Treasury.
   - Khi chuyển nhượng, toàn bộ archive và lineage chuyển giao nguyên vẹn cho người kế thừa mà không cần Tác giả phê duyệt.

---

## 4. Giao thức Tự Vận hành (Self-Executing Protocol)

Bộ khung pháp lý này được thiết kế theo nguyên tắc giao thức tự vận hành đi kèm token trên chuỗi khối Base:
- Khi token được chuyển nhượng, toàn bộ quyền thực hành cục bộ và các giới hạn tương ứng tự động chuyển giao nguyên vẹn sang chủ sở hữu mới mà không cần sửa đổi, ký lại hoặc có sự phê duyệt từ Tác giả.
- Chủ sở hữu mới kế thừa đúng các quyền và giới hạn theo Schedule áp dụng, không hơn và không kém.

---

## 5. Luật Áp dụng & Giải quyết Tranh chấp

- Bộ khung này được xây dựng dựa trên các nguyên tắc quốc tế về quyền sở hữu trí tuệ, thực hành mã nguồn mở và giao thức hợp đồng số.
- Mọi tranh chấp phát sinh sẽ được ưu tiên giải quyết thông qua:
  1. Thương lượng thiện chí trong vòng 60 ngày;
  2. Hòa giải trực tuyến qua bên thứ ba độc lập;
  3. Trọng tài quốc tế theo Quy tắc Trọng tài UNCITRAL (tiến hành trực tuyến) nếu không hòa giải được.
- Ngôn ngữ áp dụng là Tiếng Việt (bản canonical) hoặc Tiếng Anh theo lựa chọn của bên khiếu nại.
