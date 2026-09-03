# Công bố giao dịch

**Bản tiếng Việt là bản canonical.** Bản tiếng Anh: `TRANSACTION-DISCLOSURE.en.md`.

## Collection

- Chain: Base.
- Chuẩn: ERC-721.
- Không gian định danh Token: 10 token — 1 Bức Tranh (Token 0) và 9 Chiếc Khung (Tokens 1..9).
- Genesis: Token 0 (Bức Tranh) và Token 6 (Frame 06) được đúc cho Tác giả tại constructor.
- Frame mint price: 0.081 ETH/token, áp dụng cho các Frame độc lập (#01–04 và #07–09). Frame 05 và Frame 06 bị loại khỏi mintFrame độc lập.
- Primary accession của Gói 05 Complete: 4.29 ETH, chuyển giao nguyên tử Frame 05 + Bức Tranh Token 0; không có khoản 0.081 ETH bổ sung và không có upgrade.
- Complete public label: `Complete Package 05/09 — Frame 05 + Painting`.
- **Kinh tế học Kế thừa Bất đối xứng:**
  - **Bức Tranh 0:** Chuyển nhượng bắt buộc qua hàm Kế thừa Chuẩn tắc (`Canonical Succession`) với mức xem xét tối thiểu `4.29 ETH` và phí bản quyền Tác giả ERC-2981 `1.49%` (149 BPS) chuyển về Treasury (tối thiểu `0.063921 ETH`).
  - **Các Chiếc Khung 01..09:** Chuyển nhượng ERC-721 thông thường tự do, `0%` creator fee (`0 BPS`), không có mức sàn thứ cấp.
- Không giới hạn một token mỗi ví; tổng supply mới là giới hạn on-chain.
- Contract khóa một `mintStart` bất biến, tối thiểu 24 giờ sau deployment; thời
  điểm thật phải được công bố từ verified deployment record trước listing.

## Người mua không nhận

- cổ phần hoặc quyền với doanh thu Artist;
- cam kết lợi nhuận, thanh khoản hoặc tăng giá;
- copyright/authorship nếu không có thỏa thuận riêng;
- quyền buộc Artist/Curator đồng ý với cách đọc;
- bằng chứng rằng AI có nội tâm;
- quyền với reserved material ngoài archive đã manifest.

## Rủi ro

- ETH và NFT có thể mất phần lớn hoặc toàn bộ giá trị thị trường.
- Smart contract, ví, bridge, marketplace, IPFS gateway và key management có rủi ro kỹ thuật.
- ERC-2981 là tín hiệu, không phải cơ chế cưỡng chế royalty.
- Luật về crypto, thuế, consumer protection và AI-assisted copyright có thể thay đổi.
- Bytes số có thể bị copy; scarcity được xác thực bằng token + provenance, không phải DRM tuyệt đối.
- Giao dịch blockchain là không thể đảo ngược. Smart contract không có hàm hoàn tiền, tạm dừng hoặc thu hồi.

## Minh bạch triệt để

Trước khi giao dịch, người mua có quyền truy cập đầy đủ và miễn phí vào:

- toàn bộ source code smart contract, đã verify trên block explorer;
- toàn bộ bộ tài liệu pháp lý: `LEGAL-TERMS.md`, `SCHEDULE-FRAME.md`, `SCHEDULE-COMPLETE.md`, `WORK-ONTOLOGY.md`, `STEWARDSHIP-CHARTER.md`, `VERIFY.md`, `PROVENANCE.md`;
- quy trình xác thực token và archive tại `VERIFY.md`, có thể được bên thứ ba kiểm tra;
- Public Encounter Representation (512×512, có chỉnh sửa chống đảo ngược) cho phép đánh giá thị giác tác phẩm.

Bằng việc gửi giao dịch, người mua xác nhận rằng họ đã có cơ hội truy cập vào toàn bộ các tài liệu trên, hiểu các rủi ro được liệt kê, và đưa ra quyết định dựa trên thông tin đầy đủ. Không bên nào có thể viện dẫn độ chênh nhận thức để yêu cầu bồi thường vượt phạm vi giao dịch.

## Tiếp cận Curator trước giao dịch (Package 05)

Đối với Gói 05, hệ thống cung cấp một cơ chế đánh giá sơ bộ được gọi là "Three Brushstrokes". Nếu người quan tâm gửi 3 diễn giải này cho Tác giả và được xác nhận qua email, địa chỉ ví của họ sẽ được thêm vào danh sách cho phép (allowlist) trên server để trải nghiệm tính năng Archive Curator.
- **Tính độc lập:** Quyền tiếp cận Curator này chỉ mang ý nghĩa khám phá nội tâm của tác phẩm trước khi mua, và hoàn toàn không cấu thành, không thay thế, cũng không đảm bảo bất kỳ quyền sở hữu (ownership) nào trên chuỗi.
- **Giao dịch không bị bỏ qua:** Bất kể ví có được cấp quyền tiếp cận Curator hay không, người mua bắt buộc phải hoàn thành giao dịch on-chain (4.29 ETH kèm chữ ký EIP-712 hợp lệ) thông qua hàm `acquireCompletePackage` của Smart Contract để nhận Provenance Token, tài sản thực sự và các quyền lợi đi kèm trong Schedule Complete.

## Điều kiện mở listing

Listing chỉ được mở khi:

- contract source/ABI được công khai và verify;
- verified contract loại token #05 khỏi `mintFrame` và chỉ `acquireCompletePackage` mới có thể mint Gói 05;
- constructor và `mintStart` được đối chiếu với signed deployment record;
- Base Sepolia tests/security review hoàn tất;
- persona PGP, wallet và contract cross-bind;
- designation/roots được ký và timestamp;
- Public, Frame và Complete dry-run đều hash-verify;
- `RELEASE-STATUS.json` chuyển `listing_ready` sang `true`.
