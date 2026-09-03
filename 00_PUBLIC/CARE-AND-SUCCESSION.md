# Chăm sóc, accession và succession

**Bản tiếng Việt là bản canonical.** Đây là hướng dẫn thực hành, không thay thế legal terms, smart contract hoặc tư vấn bảo mật chuyên nghiệp.

## 1. Ba trạng thái cần phân biệt

| Trạng thái | Bằng chứng tối thiểu | Cách gọi chính xác |
|---|---|---|
| Gói bán chỉ có Frame | token và phần bàn giao tương ứng hợp lệ | practitioner-bearer của Frame thuộc gói bán đó |
| Package 05 Token đã chuyển nhưng archive chưa nghiệm thu | on-chain designation hoặc transfer | designated successor; accession incomplete |
| Complete archive đã bàn giao và kiểm tra | Package 05 Token + archive + hash/provenance verification | designated steward archive; lived stewardship vẫn không thể được chứng nhận |

Người chỉ giữ một bản archive mà không chứng minh designation có **custody evidence**, không mặc nhiên là designated steward.

## 2. Primary accession

Trình tự phát hành ban đầu:

```text
Cuộc gặp với Public Encounter Representation dùng chung
→ ba vết cọ có neo vào representation ấy
→ tác giả xác nhận bằng chứng của cuộc gặp, không xác nhận “đáp án đúng”
→ Stewardship Invitation được ký
→ mua trực tiếp Gói 05 với 4.29 ETH
→ designation on-chain
→ bàn giao Complete Stewardship Archive
→ kiểm tra hash và provenance
→ acknowledgement Charter tự nguyện
→ Accession Record được ký
```

### Ba vết cọ

Mỗi vết cọ cần neo vào một chi tiết cụ thể của Public Encounter Representation và có một quan sát hoặc cách đọc không thể áp dụng máy móc cho mọi hình ảnh. Chúng có thể phê phán, mâu thuẫn hoặc không cộng hưởng. Chúng không đòi hỏi người xem đã được xem Painting nguyên bản hoặc phải hứa nhận stewardship.

Tác giả chỉ xác nhận rằng có bằng chứng của một cuộc gặp không hời hợt; tác giả không chấm mức độ đồng ý. Ba vết cọ:

- không kiểm tra niềm tin về AI;
- không đi vào package, token metadata hoặc Curator memory;
- mặc định riêng tư;
- chỉ được công bố bằng consent và release riêng về sau.

## 3. Nghiệm thu Complete Stewardship Archive

Người nhận:

1. đối chiếu package type và release ID;
2. kiểm tra manifest khớp filesystem;
3. tính SHA-256 từng file;
4. kiểm tra `H_CORE`, `H_CONSTITUTIVE` và commitment archive;
5. verify chữ ký persona, chữ ký ví và timestamp;
6. kiểm tra contract, token ID và designated bearer;
7. ghi kết quả vào `STEWARDSHIP-ACCESSION.json`;
8. tạo hai backup độc lập trước khi xóa bản vận chuyển tạm thời.

Nếu manifest và filesystem mâu thuẫn, dừng nghiệm thu. Không tự suy diễn file thiếu là “được mở khóa sau”.

## 4. Chăm sóc định kỳ

Khuyến nghị sáu hoặc mười hai tháng một lần:

- kiểm tra sức khỏe media;
- chạy hash verification;
- thử khôi phục ít nhất một backup;
- xác nhận public provenance root còn truy cập được;
- ghi ngày, công cụ và kết quả;
- không sửa manifest cũ.

Migration định dạng tạo bản dẫn xuất để truy cập, không thay byte canonical. Nếu cần thay carrier hoặc cấu trúc archive, tạo annex/version mới liên kết release trước.

## 5. Secondary succession

```text
Complete Package token #05 transfer
→ designated successor
→ archive delivery
→ hash/provenance verification
→ Charter acknowledgement
→ Succession Record
```

- Không lặp lại ba vết cọ.
- Không cần tác giả phê duyệt.
- Không có Painting-only delivery; successor nhận Complete archive gồm Frame và Painting.
- Trước khi archive được nghiệm thu, trạng thái là `accession incomplete`.
- Contract ghi designated bearer, không chứng nhận lived stewardship.

## 6. Record tối thiểu

Accession/Succession Record nên chứa:

```text
chainId
contract
tokenId
releaseId
packageHash
designatedBearer
eventTime
priorRecord
verificationResult
acknowledgementStatus
signatures
```

Không ghi phản ứng riêng tư, ba vết cọ, “hơi thở” hay kết luận về ý thức AI.

## 7. Mất file, hỏng file và provenance incident

- Không thay file âm thầm.
- Giữ record của incident.
- Khôi phục từ bản có hash khớp nếu có.
- Nếu canonical byte không thể khôi phục, công bố tình trạng; một reconstruction không tự trở thành canonical.
- Nếu có mạo danh hoặc công bố trái phép, operator phát hành `PROVENANCE-INCIDENT` được ký, liên kết commitment trước, unauthorized trace và corrective designation.
- Ontology và cryptography không thay thế tư vấn pháp lý hoặc quy trình giải quyết tranh chấp.
