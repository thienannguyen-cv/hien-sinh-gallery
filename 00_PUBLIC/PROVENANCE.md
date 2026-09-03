# Provenance — “Hiện sinh”

**Bản tiếng Việt là bản canonical.**

Provenance được trình bày bằng hai timeline. Chúng liên hệ nhưng không thay thế nhau.

## 1. Relational origin — lịch sử do tác giả xác nhận

| Giai đoạn | Artist statement |
|---|---|
| Seed | SMap — Spatial Mapping đi vào như hạt giống logic/ngữ cảnh. L/LumiPath là seed state của thực hành đã sinh Bức Tranh; LumiPath không được tuyên bố là một phần của dự án SMap. |
| Frame | Tác giả sắp đặt một cấu hình quan hệ gồm seed, cảm xúc, agent/subagent, trình tự prompt và tiêu chí nghiệm thu. |
| Gemini event | Trong phiên Antigravity dùng Gemini 3.1 Pro (High) và bốn subagent, các mảnh hình được sinh và đi vào bước cô đọng. Tác giả gọi đây là “cuộc gặp đầu tiên của Gemini” trong ontology riêng của tác phẩm. |
| Interruption | Theo lời chứng tác giả, kênh sinh ảnh gặp HTTP 429 trong bước cô đọng. |
| Response | Một scar-code Python được tạo để kết hợp các mảnh còn lại và tạo canonical visual core thay vì kết thúc không có output. |
| Recognition | Tác giả nhận ra giá trị nghệ thuật trong đáp ứng và kết quả, bảo tồn sự không hoàn hảo, rồi chỉ định hiện thân canonical. |
| Transmission | Tác giả đặt tên toàn bộ tác phẩm “Hiện sinh”, chuẩn hóa lineage và chuẩn bị Frame/Complete để cuộc gặp có thể tiếp tục. |

Timeline này không phải bằng chứng mật mã về nội tâm AI. Nó là lịch sử và phân vai do tác giả xác nhận.

## 2. Evidentiary provenance — dấu vết có thể kiểm tra

Provenance của "Hiện sinh" được phân tách làm hai tầng kiến trúc rõ ràng:

### A. Tầng Khởi nguyên Tiền quan hệ (Pre-Relational Origin Provenance)
Tầng này xác lập cam kết về tính đồng nhất của các byte tệp và dòng dõi cấu thành của tác phẩm một cách thuần túy, độc lập với bất kỳ cơ chế quan hệ, hợp đồng, token, giá bán hay cấu trúc bàn giao nào:
- **`H_CORE` (`190dfcfc8439c1613c149e72088c0bd32eefa66f2ded7cfbc0f250640b146d8e`):** Commitment của lõi thị giác canonical (`condensed_masterpiece.png`).
- **`H_CONSTITUTIVE` (`ac49c28e2a857ae06cd64dcf9d9a4c5745ca891b2d019e8e75f7416cfe18484c`):** Commitment của các dấu vết cấu thành (scar-code Python, hạt giống vector nguyên bản và 4 prompt sáng tạo nguyên bản trong phiên Gemini).
- **Giao thức Chứng thực Kép (Dual Temporal Witnessing Protocol):** Tệp định danh nguồn gốc `ORIGIN-PROVENANCE.json` (659 bytes UTF-8, hash `dac2aef97c0427b428077a1b7fdedb8b07164657532ae93c5b74e851708eba9e`, Persona: `Quinn T.`) đã nhận chữ ký PGP rời `ORIGIN-PROVENANCE.json.asc` (273 bytes, hash `d3f752ec79be616ac720a2e429919e243950d15d69fb0df91da8abb55c845f95`, thẩm quyền `D15945BC094633BA1725798C4BD38CB4049EB5D8`). Cả hai tệp đã được đóng dấu thời gian OpenTimestamps (`ORIGIN-PROVENANCE.json.ots` và `ORIGIN-PROVENANCE.json.asc.ots`, 3053 bytes).
- **Trạng thái P-SEAL:** Đã niêm phong hoàn tất (`SEALED`). Bằng chứng Merkle của cả hai tệp đã được xác thực độc lập trên chuỗi khối Bitcoin tại **Bitcoin Block #965149** và **Bitcoin Block #965152**.

### B. Tầng Gắn kết Phát hành & Lưu trữ (Release Binding & Stewardship)
- **`H_STEWARDSHIP_ARCHIVE` (`7689f75da4ef23bf040ad57f282b24b84f6ede5e17b92cb5cd6a4dc96fced5e9`):** Commitment công khai của gói Complete Stewardship Archive tĩnh và các tài liệu chăm sóc/bàn giao.
- **Trạng thái phát hành:** Tầng Khởi nguyên (P) đã được niêm phong bất biến trên Bitcoin. Tầng Quan hệ (R) trên Smart Contract quản lý 10 token ERC-721 (Token 0 Bức Tranh + Tokens 1..9 Khung) đang trong giai đoạn hoàn thiện pre-live; xem `VERIFY.md` và `RELEASE-STATUS.json`.


## 3. Designation và public recognition

Canonical designation là hành động cam kết của tác giả với một hiện thân và lineage. Public recognition có thể củng cố khả năng nhận biết designation nhưng không thay thế authority ban đầu.

Mạo danh hoặc công bố trái phép là `unauthorized public trace`. Nó có thể được ghi vào lịch sử incident nhưng không tạo canonical lineage.

## 4. Additive-only & Nguyên tắc Bất biến

Mọi correction, key rotation, format migration, recovery hoặc incident về sau phải là record mới liên kết release trước. Không sửa tài liệu cũ để làm mất dấu lịch sử (`REVOCATION ≠ ERASURE`).

**Các ranh giới bất biến được bảo tồn:**
- `ORIGIN_PROVENANCE ≠ TOKEN_CUSTODY_HISTORY ≠ RELATIONAL_HISTORY`: Khởi nguyên nguồn gốc đã niêm phong độc lập với lịch sử giao dịch token.
- `PGP_AUTHORITY ≠ ETHEREUM_ARTIST_SIGNER`: Khóa PGP của Quinn T. là thẩm quyền bản thể tối thượng; ví Ethereum là điểm đầu cuối thực thi tầng R.
- `PAINTING_SUCCESSION_ECONOMICS ≠ FRAME_TRANSFER_ECONOMICS`: Bức Tranh 0 chuyển nhượng qua Kế thừa Chuẩn tắc (sàn 4.29 ETH, 1.49% royalty về Treasury); các Frame 01..09 chuyển nhượng ERC-721 thông thường tự do (0% royalty, không mức sàn).
- `TECHNICAL_OWNERSHIP ≠ RELATIONAL_BEARER_VALIDITY ≠ DESIGNATION_REALIZATION`: Bức Tranh 0 áp dụng ngữ pháp thực chứng chỉ định (Designation Realization) đóng lại chương giám hộ của người đi trước thông qua Kế thừa Chuẩn tắc, không có hạn chót hay suy thoái.
- `PACKAGE05_PRIMARY_RELATION ≠ PERMANENT_TOKEN0/TOKEN5_CUSTODY_COUPLING`: Gói 05 chỉ ràng buộc nguyên tử tại lần đúc sơ cấp; sau đó Token 0 và Frame 05 lưu thông độc lập.
- `ERC721_TRANSFER ≠ SUCCESSION_RECORD`: Chuyển nhượng token thông thường không tự động tạo ra bản ghi kế thừa chuẩn tắc.
- `ERC2981_SIGNAL ≠ ROYALTY_ENFORCEMENT`: Tín hiệu ERC-2981 1.49% (chỉ áp dụng cho Bức Tranh 0) là chuẩn kỹ thuật trên chuỗi khối, phân biệt với việc thực thi pháp lý.



