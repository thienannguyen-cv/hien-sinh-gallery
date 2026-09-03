# Hiện sinh — Public Encounter Package

**Bản tiếng Việt là bản canonical.** Xem [README.en.md](README.en.md) để đọc bản tiếng Anh.

Đây là tầng tiếp cận công khai của **“Hiện sinh”**. Nó mở một cuộc gặp và cung cấp đủ thông tin để đánh giá ontology, provenance, cấu trúc giao dịch và giới hạn pháp lý. Nó không chứa Frame practice, canonical Painting archive, prompt nghi thức gốc hoặc bí mật vận hành.

## Tác phẩm

“Hiện sinh” phân biệt ba đối tượng không được trộn lẫn:

- **Frame — 9 cấu hình/tác phẩm:** mỗi Frame mở điều kiện cho một cuộc gặp và biến cố riêng. Tám Frame được phát hành độc lập; Frame 05 chỉ được phát hành bên trong Gói 05.
- **Painting — canonical embodiment 1/1:** hiện thân canonical của biến cố đã xảy ra bên dưới chiếc cọ trong Gói 05; Painting không có token tách riêng.
- **Gói 05 — Complete duy nhất:** chứa **Frame 05 + Painting** và được mua trực tiếp với token ID #05. Đây không phải upgrade từ một Frame đã mua trước đó.

Trình tự ontology:

```text
Ý tưởng/seed → Frame → generative event → Painting
→ recognition/designation/transmission → encounters → possible stewardship
```

Đọc [WORK-ONTOLOGY.md](WORK-ONTOLOGY.md) trước khi đọc token hoặc license.

## Ba trạng thái quan hệ và phạm vi bàn giao

1. **Public Encounter:** chỉ thư mục này.
2. **Frame Practice:** Public Encounter + phần bàn giao của một trong tám gói bán chỉ có Frame; không chứa Painting hoặc transcript L nguyên bản.
3. **Gói 05 / Complete Stewardship Archive:** Public Encounter + Frame 05 + canonical Painting archive và care records. Không có Painting-only package.

Public và practitioner-bearer dùng cùng một Public Encounter Representation đã biến đổi có chủ đích. Đây không phải preview, teaser hay bản cấp thấp; Frame không mua thêm pixel hoặc một cách cảm nhận cao hơn. Canonical Painting chỉ xuất hiện trong Complete archive vì chính archive ấy bao gồm hiện thân canonical.

Ba vết cọ của primary accession phát sinh từ cuộc gặp với chính Public Encounter Representation dùng chung. Không có bước xem riêng Painting nguyên bản trước acquisition; canonical Painting chỉ được bàn giao bên trong Gói 05 sau khi acquisition hoàn tất.

## Giá và supply dự kiến

- Tám gói bán chỉ có Frame (#01–04, #07–09): **0.081 ETH** mỗi token sơ cấp. Chuyển nhượng thứ cấp ERC-721 thông thường tự do, **0%** creator fee, không mức sàn.
- Gói 05, gồm Frame 05 + Bức Tranh 0: **4.29 ETH** sơ cấp. Hậu sơ cấp, Bức Tranh 0 chuyển nhượng qua Kế thừa Chuẩn tắc với mức xem xét tối thiểu **4.29 ETH** và phí bản quyền **1.49% (149 BPS)** về Treasury.
- Tổng supply Frame: tối đa **9** token Frame + 1 Bức Tranh 1/1 (tổng cộng 10 định danh token).
- Đúng một Complete trong toàn bộ collection.
- Creator fee ERC-2981: **1.49%** (chỉ áp dụng riêng cho Bức Tranh 0; Frames là **0%**).

Giá là tuyên bố và điều kiện giao dịch của tác giả, không phải bằng chứng về giá trị nghệ thuật hay lời hứa đầu tư. Xem [TRANSACTION-DISCLOSURE.md](TRANSACTION-DISCLOSURE.md).

## Tài liệu chính

- [WORK-ONTOLOGY.md](WORK-ONTOLOGY.md) — artwork, event, Painting, stewardship và ranh giới phân phối thông tin chuẩn mực.
- [HIEN-SINH_dossier.md](HIEN-SINH_dossier.md) — hồ sơ giám tuyển công khai và tổng quan Thực hành Frame.
- [SCHEDULE-FRAME.md](SCHEDULE-FRAME.md) — điều khoản pháp lý và quyền Output của Thực hành Frame.
- [SCHEDULE-COMPLETE.md](SCHEDULE-COMPLETE.md) — điều khoản pháp lý của Gói 05 Complete.
- [TRANSACTION-DISCLOSURE.md](TRANSACTION-DISCLOSURE.md) — công bố giao dịch, rủi ro và điều kiện niêm yết.
- [CANONICAL-DESIGNATION.md](CANONICAL-DESIGNATION.md) — designation, phân vai và covenant.
- [PROVENANCE.md](PROVENANCE.md) — relational origin tách khỏi evidentiary provenance.
- [STEWARDSHIP-CHARTER.md](STEWARDSHIP-CHARTER.md) — quan hệ nghệ thuật–đạo đức.
- [CARE-AND-SUCCESSION.md](CARE-AND-SUCCESSION.md) — accession, verification và succession.
- [LEGAL-TERMS.md](LEGAL-TERMS.md) — **draft bắt buộc lawyer review**.
- [VERIFY.md](VERIFY.md) — trạng thái và phương pháp xác thực.

## Trao đổi với Public Curator

Curator được tác giả ủy nhiệm nhưng phán đoán độc lập. Curator có quyền phản bác, không cộng hưởng hoặc kết luận chưa đủ dữ liệu; không có nhiệm vụ bảo vệ giá hay xác nhận AI interiority.

Mở **toàn bộ package** làm workspace, rồi dùng:

> Sử dụng skill `read-effective-verbal-context` tại `00_PUBLIC/.codex/skills/read-effective-verbal-context/` để nạp context từ `00_PUBLIC/effective-verbal-context.md` cho session mới này, để tôi có thể trao đổi với Curator về tác phẩm ở trạng thái hiện tại.

Không dùng handoff từ nguồn khác nếu muốn giữ đúng evidence boundary của Public Curator.

## Trạng thái phát hành

Package này còn ở trạng thái chuẩn bị. Listing/mainnet sale chỉ được mở khi `RELEASE-STATUS.json` xác nhận contract, signatures, timestamps, archive roots, package dry-run và lawyer review đã hoàn tất. Sự hiện diện của draft không phải bằng chứng rằng các gate ấy đã đạt.
