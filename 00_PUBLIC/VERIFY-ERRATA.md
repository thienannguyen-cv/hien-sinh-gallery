# Đính chính Công khai — Tài liệu Xác thực
## (Verification Document Errata)

**Tài liệu gốc được đính chính:** `VERIFY.md` / `VERIFY.en.md` (Mục 3, Mục 3b và Mục 7).

**Ghi chú quản trị:** Tài liệu tiếng Việt này là bản canonical. Bản `.en.md` đi kèm chỉ mang tính tiếp cận, không có giá trị quản trị nếu có sai khác.

**Tính chất tài liệu:** Đây là nhật ký đính chính cộng dồn (additive-only). Mỗi lần phát hiện sai sót mới trong tài liệu xác thực sẽ bổ sung một mục có ngày tháng vào cuối tài liệu này; không mục nào bị xoá hoặc ghi đè. Nội dung gốc của `VERIFY.md` / `VERIFY.en.md` được giữ nguyên; khi có sai khác ở các điểm nêu dưới đây, tài liệu này có hiệu lực. Tác động của từng mục đính chính đối với các dấu mốc nguồn gốc được nêu riêng ở đầu mục đó.

---

## Mục đính chính — 2026-10-20

**Phương pháp tạo ra đính chính này:** Tính lại SHA-256 từ các tệp trong kho công khai và đối chiếu với `ROOT-COMMITMENTS.json`, bảng giá trị on-chain ở Mục 4 của VERIFY, chữ ký OpenPGP và các bằng chứng OpenTimestamps; đối chiếu chéo văn bản giữa các tài liệu; và quét toàn bộ tệp được theo dõi cùng lịch sử commit của hai nhánh `main` và `for-safe-buy-only`. Việc rà soát được thực hiện trong một phiên làm việc có hỗ trợ AI (Claude). Số dòng nêu dưới đây theo nhánh `main` tại commit `983c740` (2026-10-18).

**Tác động đến nguồn gốc:** Không có. Các dấu mốc nguồn gốc vẫn giữ vững và có thể kiểm lại bằng các bước ở Mục 3b của VERIFY (riêng dấu thời gian của chữ ký rời, xem đính chính 3): `ORIGIN-PROVENANCE.json` (659 byte, SHA-256 `dac2aef97c0427b428077a1b7fdedb8b07164657532ae93c5b74e851708eba9e`) khớp bằng chứng OpenTimestamps của nó; chữ ký OpenPGP hợp lệ với khoá `D15945BC094633BA1725798C4BD38CB4049EB5D8`; cả hai tệp `.ots` chứa chứng thực Bitcoin tại khối 965149 và 965152. Ba đính chính dưới đây chỉ sửa văn bản mô tả và hướng dẫn kiểm tra trong VERIFY, vốn không phải một trong hai đối tượng được niêm phong (`ORIGIN-PROVENANCE.json` và chữ ký rời của nó). Hai giá trị sai (đính chính 1 và 2) chỉ được đưa vào kho công khai sau thời điểm niêm phong: commit `68e02dd` ngày 2026-09-03 và commit `44a16bf` ngày 2026-09-21, trong khi việc niêm phong diễn ra ngày 2026-09-02. Vì vậy errata này không thay đổi, không thay thế và không làm yếu nguồn gốc đã niêm phong.

### 1. Hash của `CANONICAL-DESIGNATION.md` (Mục 3)

**Đã công bố:** `VERIFY.md:27` và `VERIFY.en.md:27` — trong danh sách các giá trị mà `ROOT-COMMITMENTS.json` công bố — ghi hash của `CANONICAL-DESIGNATION.md` là `802ac7d36bc4ab5eadc31fee80266b5efb6b2d839144a45ff3d28f3e89cc2a9b`.

**Đính chính:** SHA-256 của `CANONICAL-DESIGNATION.md` là `ed740b4339af1e965723519c7807b5a6184da0f4963f4866d42661ef85cf083f`. Đây là giá trị mà (a) `ROOT-COMMITMENTS.json` công bố tại `canonical_designation.sha256`, (b) bảng ở Mục 4 của chính VERIFY ghi là `canonicalDesignationHash` trên chuỗi (`0xed740b43…083f`), và (c) cho ra khi tính trực tiếp trên tệp. Giá trị `802ac7d3…` là một nhầm lẫn: nó không ứng với bất kỳ phiên bản nào của tệp (kể cả khi đổi ký tự xuống dòng) và được rút lại.

**Không bị ảnh hưởng:** `CANONICAL-DESIGNATION.md`, `ROOT-COMMITMENTS.json` và giá trị đã ghi on-chain.

**Phạm vi:** Trong kho công khai, `802ac7d3…` chỉ xuất hiện ở hai dòng nêu trên. Giá trị được thêm vào ở commit `68e02dd` (2026-09-03) và giữ nguyên từ đó; nó có mặt trong commit `c08a9f24e3d17bd93007bb45dd332b72b46043f0` (commit mà Mục 4 của VERIFY ghi là Release Git Commit Hash) và ở cả hai nhánh `main`, `for-safe-buy-only`. Không có tệp nào khác được theo dõi chứa giá trị này.

**Thực hành chuẩn tắc kéo theo:** Người xác thực dùng `ed740b43…` làm hash của `CANONICAL-DESIGNATION.md`:

```bash
sha256sum 00_PUBLIC/CANONICAL-DESIGNATION.md
# ed740b4339af1e965723519c7807b5a6184da0f4963f4866d42661ef85cf083f
```

và đối chiếu với `canonicalDesignationHash()` trên chuỗi theo lệnh `cast call` ở Mục 4 của VERIFY. Mọi tham chiếu tới `802ac7d3…` được coi là không còn hiệu lực.

### 2. `H_STEWARDSHIP_ARCHIVE` ở bước 5 của Mục 7

**Đã công bố:** `VERIFY.md:185` và `VERIFY.en.md:185` (Mục 7, bước 5) ghi `H_STEWARDSHIP_ARCHIVE` là `7689f75005b45a230ca30e14db8cb580e0c0349a6566d5bf8284534fce1ec77d`.

**Đính chính:** Giá trị của `H_STEWARDSHIP_ARCHIVE` là `7689f75da4ef23bf040ad57f282b24b84f6ede5e17b92cb5cd6a4dc96fced5e9`, đúng như `ROOT-COMMITMENTS.json`, Mục 3 của VERIFY, `PROVENANCE` và `INDEPENDENT-OPERATION` cùng ghi. Giá trị ở Mục 7 được rút lại. Tài liệu tham chiếu có hiệu lực vẫn là `ROOT-COMMITMENTS.json`, như câu đầu của bước 5 đã nêu.

**Phạm vi:** Giá trị sai được thêm vào ở commit `44a16bf` (2026-09-21), sau commit phát hành `c08a9f24` nêu ở đính chính 1; nó có ở nhánh `main`, không có ở nhánh `for-safe-buy-only`. Không có tệp nào khác được theo dõi chứa giá trị này.

**Thực hành chuẩn tắc kéo theo:** Khi nghiệm thu Gói 05 Complete, so package root dựng lại với `H_STEWARDSHIP_ARCHIVE` trong `ROOT-COMMITMENTS.json` (và, sau khi mua sơ cấp, với `designatedArchiveCommitment()` trên chuỗi), không so với giá trị trong ngoặc ở bước 5.

### 3. Đóng dấu thời gian của chữ ký rời `ORIGIN-PROVENANCE.json.asc` (Mục 3b, bước 3)

**Giữ nguyên:** Các chứng thực Bitcoin tại khối 965149 và 965152 trong cả hai tệp `.ots`, chữ ký OpenPGP (khoá `D15945BC094633BA1725798C4BD38CB4049EB5D8`) và `ORIGIN-PROVENANCE.json` (659 byte, SHA-256 `dac2aef97c0427b428077a1b7fdedb8b07164657532ae93c5b74e851708eba9e`) đều đúng như đã công bố.

**Bổ sung:** Bước 3 của Mục 3b hướng dẫn chạy `ots verify 00_PUBLIC/ORIGIN-PROVENANCE.json.asc.ots` mà không nêu rằng bằng chứng này đóng dấu bản chữ ký rời với ký tự xuống dòng CRLF (273 byte, SHA-256 `d3f752ec79be616ac720a2e429919e243950d15d69fb0df91da8abb55c845f95`). Bản lưu trong kho Git dùng ký tự xuống dòng LF (265 byte, SHA-256 `183dcba8b80e17030b4f228425a239fe2b0a16634bd6b2d9946549ca3da28b85`), nên một bản checkout giữ nguyên LF (như trên Linux) sẽ không khớp digest đã đóng dấu khi chạy `ots verify`. Chữ ký OpenPGP hợp lệ ở cả hai dạng; chỉ digest mà bằng chứng OpenTimestamps đã đóng dấu là khác nhau.

**Thực hành chuẩn tắc kéo theo:** Để kiểm tra dấu thời gian của chữ ký rời, dựng lại bản CRLF trong một thư mục tạm rồi chạy `ots verify`:

```bash
mkdir ots-check
cp 00_PUBLIC/ORIGIN-PROVENANCE.json.asc.ots ots-check/
perl -pe 's/\n/\r\n/' 00_PUBLIC/ORIGIN-PROVENANCE.json.asc > ots-check/ORIGIN-PROVENANCE.json.asc
sha256sum ots-check/ORIGIN-PROVENANCE.json.asc
# d3f752ec79be616ac720a2e429919e243950d15d69fb0df91da8abb55c845f95
ots verify ots-check/ORIGIN-PROVENANCE.json.asc.ots
```

---

*Các mục đính chính tiếp theo sẽ được bổ sung bên dưới, theo thứ tự thời gian, không ghi đè các mục đã có ở trên.*
