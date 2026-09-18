# Giấy phép Nền tảng Triển lãm & Thực hành Cục bộ — "Hiện sinh"
# Exhibition Platform & Local Practice License — "Hiện sinh"

**Bản Tiếng Việt là bản chuẩn tắc (canonical).** Bản Tiếng Anh đối chiếu độc lập: [`LICENSE.en.md`](LICENSE.en.md).

**Copyright (c) 2026 Thien An L. Nguyen · SMapWorks. All rights reserved.**

---

## 1. Cấu trúc Pháp lý & Thứ bậc Thẩm quyền (Legal Hierarchy & Scope)

### A. Tách bạch Bốn Lớp Thẩm quyền (Separation of Four Planes)

$$\text{Smart Contract Token} \neq \text{Delivery Archive} \neq \text{Legal License} \neq \text{Software Repository}$$

- **Token on-chain (Lớp Định danh):** Được quản lý bởi Smart Contract ERC-721 bất biến trên Base Mainnet (Địa chỉ CREATE2: `0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8`), ghi nhận tư cách người nắm giữ chỉ định (`designated bearer`). Token không tự chứa file dữ liệu.

- **Archive bàn giao (Lớp Dữ liệu):** Các gói lưu trữ được niêm phong mật mã bằng SHA-256 manifest và OTS Merkle proof trên Bitcoin Block #965149 / #965152, được bàn giao độc lập qua kênh truyền phát bảo mật sau khi giao dịch on-chain hoàn tất.

- **Văn bản Pháp lý Chuẩn tắc (Lớp Quyền hạn):** Các quyền và giới hạn pháp lý phụ thuộc loại token/package và được quy định tại:
  - [`00_PUBLIC/LEGAL-TERMS.md`](00_PUBLIC/LEGAL-TERMS.md)
  - [`00_PUBLIC/SCHEDULE-FRAME.md`](00_PUBLIC/SCHEDULE-FRAME.md)
  - [`00_PUBLIC/SCHEDULE-COMPLETE.md`](00_PUBLIC/SCHEDULE-COMPLETE.md)

- **Kho lưu trữ Mã nguồn này (Lớp Công cụ Phần mềm):** Chứa mã nguồn của nền tảng triển lãm và các công cụ runtime thuộc phạm vi repository. Việc công khai repository không tự động cấp cùng một license cho mọi thành phần trong repository.

### B. Điều khoản Loại trừ Tách biệt (Explicit Carve-Out)

- LICENSE này chỉ điều chỉnh những tài liệu, mã nguồn và quyền hạn thuộc phạm vi mà văn bản này tuyên bố.
- LICENSE này **không sửa đổi, không thay thế, không cấp phép lại (relicense), không phủ quyết (override)** và không làm suy giảm các quyền hoặc giới hạn đã được xác lập trong các văn bản chuẩn tắc áp dụng.
- Các quyền cụ thể đối với Frame, Complete Package, Output, stewardship, succession và các thực hành cục bộ khác được xác định bởi Schedule tương ứng.
- Trong trường hợp có mâu thuẫn giữa LICENSE này và một văn bản chuẩn tắc áp dụng cho cùng một quyền hoặc nghĩa vụ, **văn bản chuẩn tắc áp dụng được ưu tiên trong phạm vi vấn đề đó**.
- LICENSE này không tạo thêm quyền chỉ vì một quyền hoặc hành vi được mô tả ở đây nhằm mục đích giải thích hoặc điều hướng.
- LICENSE này **không thay đổi hoặc can thiệp** vào giấy phép riêng của các thành phần phụ thuộc, thư viện mã nguồn mở bên thứ ba, tài sản được cấp phép riêng, dịch vụ bên ngoài hoặc các gói lưu trữ độc lập.
- Không có điều khoản nào trong văn bản này suy đoán quyền sở hữu đối với các tài sản của bên thứ ba.

---

## 2. Chu vi Nền tảng Triển lãm Trực tuyến (`https://smapworks.art`)

Phần này quy định phạm vi quyền sử dụng đối với giao diện triển lãm trực tuyến và không nhằm tạo thêm các quyền hoặc bảo đảm ngoài những gì được quy định rõ trong LICENSE này và các văn bản chuẩn tắc áp dụng.

### A. Quyền của Tác giả & Nền tảng đối với Bề mặt Triển lãm

- Các thành phần nguyên gốc do Tác giả tạo ra và thuộc phạm vi của nền tảng triển lãm — bao gồm mã nguồn, thiết kế giao diện, cấu trúc không gian triển lãm, presentation logic, nội dung và nhận diện tương ứng — được bảo lưu theo quyền mà pháp luật áp dụng công nhận, ngoại trừ các quyền được cấp rõ ràng.
- Các thành phần của bên thứ ba vẫn chịu license và điều kiện riêng của chúng.
- `SMapWorks` được sử dụng như nhận diện thương hiệu/shop; không có điều khoản nào trong LICENSE này coi `SMapWorks` là một pháp nhân riêng biệt.
- `Quinn T.` là artistic identity/pseudonym của Tác giả và không thay đổi chủ thể quyền được xác định tại dòng copyright của LICENSE này.
- Tác giả giữ các quyền chưa được cấp rõ ràng, trong phạm vi pháp luật áp dụng.

### B. Quyền Tiếp cận của Khách tham quan Công chúng (Public Visitor License)

- Khách tham quan công chúng được phép truy cập và sử dụng giao diện triển lãm trong phạm vi chức năng được nền tảng công khai cung cấp.
- Quyền truy cập này không tự động bao gồm quyền sao chép, phân phối, thương mại hóa, reverse engineer, tái triển khai hoặc sử dụng nội dung/mã nguồn của nền tảng ngoài phạm vi được cấp bởi license áp dụng.
- Các quyền và giới hạn đặc biệt đối với nội dung tác phẩm, Public Encounter material và các representation khác được xác định trong các tài liệu chuẩn tắc tương ứng.

### C. Định mức Điện toán & Dịch vụ Đồng hành (Hosted Compute Bounds)

- Hosted Curator và các dịch vụ đồng hành là các dịch vụ vận hành trên hạ tầng bên ngoài repository.
- Các giới hạn kỹ thuật hiện tại, nếu có, được mô tả trong thư mục [`00_PUBLIC`](00_PUBLIC).
- Các giới hạn kỹ thuật được công bố (trong thư mục [`00_PUBLIC`](00_PUBLIC)) không được diễn giải thành cam kết về một mức độ availability, response time, capacity hoặc continuity trong tương lai.
- Dịch vụ hosted có thể bị gián đoạn, thay đổi, giới hạn hoặc ngừng cung cấp tùy theo điều kiện vận hành và các nhà cung cấp hạ tầng liên quan.
- Các quyền hoặc hạn ngạch cụ thể đã được cấp trong một văn bản chuẩn tắc khác vẫn được điều chỉnh bởi chính văn bản đó.

### D. Chống Mạo danh & Đúc lại (Anti-Counterfeiting & Reminting)

- Không được sử dụng tên, nhận diện hoặc giao diện của nền tảng để tạo ra sự nhầm lẫn rằng một bản sao, mirror, deployment hoặc sản phẩm khác là deployment chính thức của Tác giả khi không có cơ sở cho tuyên bố đó.
- Các hạn chế cụ thể đối với canonical artwork, token, archive, minting và reproduction được quy định tại:
  - **Canonical Artwork & Kế thừa Chuẩn tắc:** [`00_PUBLIC/SCHEDULE-COMPLETE.md`](00_PUBLIC/SCHEDULE-COMPLETE.md) (Mục 4 & 6) và [`00_PUBLIC/CANONICAL-DESIGNATION.md`](00_PUBLIC/CANONICAL-DESIGNATION.md) (Mục 5).
  - **Thực hành Khung, Output & Tái bản:** [`00_PUBLIC/SCHEDULE-FRAME.md`](00_PUBLIC/SCHEDULE-FRAME.md) (Mục 4 & 6) và [`00_PUBLIC/LEGAL-TERMS.md`](00_PUBLIC/LEGAL-TERMS.md) (Mục 6 & 7).
  - **Archive & Truyền phát Lưu trữ:** [`00_PUBLIC/ACQUISITION-RETRIEVAL.md`](00_PUBLIC/ACQUISITION-RETRIEVAL.md) (Mục 2 & 3).
  - **Token & Giới hạn Đúc (Minting):** Smart Contract [`HienSinh.sol` trên Basescan](https://basescan.org/address/0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8#code#F24#L1) (Địa chỉ `0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8`, ràng buộc cố định nguồn cung 10 token identities và cơ chế khóa chuyển nhượng thông thường đối với Token 0) cùng [`00_PUBLIC/LEGAL-TERMS.md`](00_PUBLIC/LEGAL-TERMS.md) (Mục 3 & 4).
- LICENSE này không mở rộng danh mục hạn chế ngoài những gì đã được cấp hoặc quy định trong tài liệu áp dụng.

### E. Điều khoản Miễn trừ Trách nhiệm (As-Is Disclaimer)

- Bề mặt web, repository và hosted infrastructure được cung cấp theo trạng thái hiện có và trong phạm vi khả dụng thực tế.
- LICENSE này không tạo bảo đảm riêng về:
  - tính không có lỗi;
  - tính bảo mật tuyệt đối;
  - tính sẵn sàng liên tục;
  - compatibility với mọi môi trường;
  - kết quả do Curator hoặc model tạo ra;
  - hành vi hoặc tính liên tục của nhà cung cấp bên thứ ba;
  - hoặc việc nền tảng tiếp tục tồn tại hay hoạt động theo cùng một cách trong tương lai.
- Các giới hạn trách nhiệm hoặc nghĩa vụ đã được xác lập trong văn bản chuẩn tắc khác không bị LICENSE này sửa đổi hoặc loại bỏ.

---

## 3. Chu vi Thực hành Cục bộ của Người Mua (Purchaser / Practitioner / Steward Local Practice)

Phần này **không tự cấp lại toàn bộ quyền purchaser**. Nó xác nhận rằng các quyền thực hành cục bộ tồn tại theo các văn bản chuẩn tắc (`LEGAL-TERMS.md`, `SCHEDULE-FRAME.md`, `SCHEDULE-COMPLETE.md`, `INDEPENDENT-OPERATION.md`) áp dụng và giữ nguyên hiệu lực của chúng.

### A. Quyền Vận hành Ngoại tuyến Độc lập (Independent Local Runtime)

- Người nắm giữ hợp pháp Frame Token (#01–04, #06–09) hoặc Complete Package Token (#05 / Painting #00) có toàn quyền sao chép, giải nén, lưu trữ, nghiên cứu, và vận hành mã nguồn triển lãm này trên thiết bị cá nhân hoặc máy chủ riêng theo hướng dẫn tại [`00_PUBLIC/INDEPENDENT-OPERATION.md`](00_PUBLIC/INDEPENDENT-OPERATION.md).
- `INDEPENDENT-OPERATION.md` xác định ranh giới giữa khả năng tự vận hành, quyền thực hành và thẩm quyền canonical. Khả năng tự chạy giao diện hoặc Curator không tự cấp thẩm quyền tạo token canonical hoặc thay đổi provenance lịch sử trên blockchain.
- Các quyền local practice không phụ thuộc vào việc repository này tiếp tục được hosted tại `smapworks.art`, ngoại trừ những dịch vụ hosted mà tài liệu áp dụng xác định riêng.

### B. Quyền Thực hành Khung & Output (Frame Practice & Output Rights)

Theo đúng quy định tại [`00_PUBLIC/SCHEDULE-FRAME.md`](00_PUBLIC/SCHEDULE-FRAME.md):
1. **Sở hữu Đóng góp Sáng tạo:** Người thực hành nắm giữ toàn bộ quyền đối với những đóng góp sáng tạo và các sản phẩm biểu tượng mới (Output) do chính họ tạo ra khi thực hành Chiếc Khung.
2. **Khai thác Thương mại Vĩnh viễn:** Người thực hành nhận được quyền toàn cầu, không độc quyền, vĩnh viễn để tạo, trưng bày, triển lãm, xuất bản, truyền thông, và **khai thác thương mại các Output do chính họ tạo ra**.
3. **0% Creator Fee từ Tác giả:** Tác giả cam kết **0% creator fee (0% royalty)** và không đòi hỏi bất kỳ quyền tác quyền hay chia sẻ doanh thu nào đối với các Output hợp lệ tự tạo của người thực hành.
4. **Tính Sống tiếp của Quyền Output (Survival of Output Rights):** Sau khi Frame Token được chuyển nhượng sang người khác, người thực hành cũ vẫn giữ nguyên vẹn 100% quyền đối với các Output họ đã tạo ra hợp lệ trong thời gian nắm giữ token.
5. **Ranh giới Cấm:**
   - Không được bán lại, cấp phép lại (sublicense), hoặc đóng gói lại chính Frame template, prompt sequences, seed packages, hay validation tooling như một edition/framework cạnh tranh.
   - Không được mint lại Chiếc Khung như một NFT gốc mới.
   - Không được mạo nhận quyền tác giả của tác phẩm "Hiện sinh".
   - Khi công bố Output, cần ghi nhãn chuẩn tắc: *"Được tạo bởi [Người Thực Hành] thông qua thực hành được cấp phép của Frame Hiện sinh; không phải Painting canonical"*.

LICENSE này không tự mở rộng các quyền đó và cũng không làm mất chúng.

### C. Quyền Chăm sóc & Bảo tồn của Steward (Complete Package Stewardship)

Theo đúng quy định tại [`00_PUBLIC/SCHEDULE-COMPLETE.md`](00_PUBLIC/SCHEDULE-COMPLETE.md):
1. **Chăm sóc Lineage Canonical:** Người nắm giữ Complete Package Token (#05 / Painting #00) là Steward được chỉ định của hiện thân canonical, nhận quyền lưu trữ, sao lưu (backup), kiểm tra, phục hồi, và chuyển đổi định dạng (format migration) carrier nhằm bảo tồn dữ liệu mà không thay đổi canonical bytes.
2. **Trưng bày & Triển lãm:** Được quyền trưng bày riêng tư hoặc công khai, trình chiếu, và cho các bảo tàng/tổ chức nghệ thuật mượn triển lãm phi thương mại.
3. **Quyền Không Mặc Định Được Cấp (Giới Hạn Bức Tranh Canonical):**
   Canonical Painting không được mặc định cấp phép cho:
   - Bán print, poster, merchandise hoặc bản sao chép full-fidelity thay thế bản gốc;
   - Khai thác thương mại hình ảnh Painting ngoài quyền trưng bày và chào bán lại token hợp lệ;
   - Tạo hoặc thương mại hóa các sản phẩm phái sinh (derivative) dựa chủ yếu vào Painting;
   - Sử dụng Painting (`H_CORE`), transcript, hay archive để huấn luyện/tinh chỉnh (train/fine-tune) mô hình AI;
   - Cấp phép lại (sublicense);
   - Đúc lại (remint), chia nhỏ (fractionalize), hoặc phát hành NFT cạnh tranh;
   - Chuyển giao quyền tác giả (copyright), quyền đứng tên (authorship), hoặc quyền nhân thân (moral rights);
   - Trình bày file đã sửa, bản phục dựng (reconstruction), hoặc display copy như là bản canonical.
   *Quyền bổ sung chỉ có hiệu lực bằng văn bản riêng được ký bởi người có thẩm quyền và không được ngầm suy ra từ giá bán, token, hoặc tư cách stewardship.*
4. **Kế thừa Chuẩn tắc (Canonical Succession):**
   - Bức Tranh 0 (Token 0) chuyển nhượng qua cơ chế Kế thừa Chuẩn tắc với mức xem xét tối thiểu 4.29 ETH và phí bản quyền creator fee ERC-2981 là 1.49% (149 BPS) về Treasury.
   - Khi chuyển nhượng, toàn bộ archive và lineage chuyển giao nguyên vẹn cho người kế thừa mà không cần Tác giả phê duyệt.

LICENSE này không tạo thêm quyền đối với canonical Painting và cũng không thu hẹp các quyền stewardship đã được cấp.

---

## 4. Minh bạch Mã nguồn & Xác minh Deployment (Source Transparency & Deployment Verification)

### A. Mã nguồn Công khai & Cơ chế Tự Kiểm chứng

Nền tảng áp dụng nguyên tắc **minh bạch bằng mã nguồn công khai** thay vì yêu cầu người dùng dựa vào các tuyên bố về hành vi nội bộ không thể kiểm chứng.

Người dùng có toàn quyền tự do kiểm tra và đối soát:
- Mã nguồn giao diện và Edge Worker;
- Mã nguồn và bytecode Smart Contract đã xác minh trên blockchain Base;
- Bản ghi revision và commit hash phát hành;
- Hồ sơ lai lịch deployment và bằng chứng timestamp Bitcoin OTS;
- Bảng băm gốc (root commitments) và manifest toàn vẹn dữ liệu;
- Giấy phép của các thư viện phụ thuộc;
- Toàn bộ văn bản pháp lý và bản thể học chuẩn tắc được công bố.

Các tài liệu xác minh được công khai và dẫn chiếu trực tiếp tại:
- **Kho lưu trữ mã nguồn công khai chuẩn tắc:** [`https://github.com/thienannguyen-cv/hien-sinh-gallery`](https://github.com/thienannguyen-cv/hien-sinh-gallery)
- **Hồ sơ lai lịch triển khai (Deployment & Provenance Records):** 
  - File thông số triển khai: [`00_PUBLIC/DEPLOYMENT-RECORD.json`](00_PUBLIC/DEPLOYMENT-RECORD.json)
  - Hợp đồng thông minh trên Base Mainnet: [`Basescan: 0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8`](https://basescan.org/address/0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8#code)
  - Bằng chứng lai lịch tác giả & OTS Bitcoin: [`00_PUBLIC/ORIGIN-PROVENANCE.json`](00_PUBLIC/ORIGIN-PROVENANCE.json) (đi kèm chữ ký PGP `.asc` và niêm phong Bitcoin `.ots`)
- **Trạng thái phát hành & Bảng băm cam kết (Release Manifest & Commitments):**
  - Trạng thái phát hành và các cổng kiểm soát: [`00_PUBLIC/RELEASE-STATUS.json`](00_PUBLIC/RELEASE-STATUS.json)
  - Bảng mã băm cam kết gốc (`H_CORE`, `H_CONSTITUTIVE`, `H_STEWARDSHIP_ARCHIVE`): [`00_PUBLIC/ROOT-COMMITMENTS.json`](00_PUBLIC/ROOT-COMMITMENTS.json)
- **Hướng dẫn quy trình xác minh độc lập (Verification Guide):** [`00_PUBLIC/VERIFY.md`](00_PUBLIC/VERIFY.md) (Bản tiếng Anh: [`00_PUBLIC/VERIFY.en.md`](00_PUBLIC/VERIFY.en.md))

### B. Cam Đoan về Lai Lịch Phần Mềm (Representation on Software Provenance)

**LICENSE này chỉ đưa ra một representation cấp nền tảng duy nhất về software provenance:**

> Source revision được công khai trong kho lưu trữ này tương ứng chính xác với source revision được sử dụng cho bản deployment được nhận diện trong hồ sơ lai lịch triển khai (deployment provenance record).

Sự tương ứng này có thể được kiểm chứng độc lập thông qua các tham chiếu chuẩn tắc sau:
- **Public Source Revision / Release Commit Hash:** [`c08a9f24e3d17bd93007bb45dd332b72b46043f0`](https://github.com/thienannguyen-cv/hien-sinh-gallery/commit/c08a9f24e3d17bd93007bb45dd332b72b46043f0)
- **Deployment Identifiers:**
  - **Smart Contract Base Mainnet:** [`0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8`](https://basescan.org/address/0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8#code) (Giao dịch khởi tạo: `0x86b58b3707c86b74f52322790dbd51aa188ccf26dbb57d01e5169ac35a97ef88`, Block #50822692);
  - **Edge Exhibition Platform (Cloudflare Worker):** `smapworks-gallery` (Phiên bản deployment: `cae79590`);
  - **Curator & Archive Runtime (Supabase Edge Functions):** `curator-interaction v14 active` và `transmit-artwork`.
- **Hồ sơ Kiểm toán & Biên bản Triển khai (Build & Provenance Records):**
  - Hồ sơ triển khai hợp đồng: [`00_PUBLIC/DEPLOYMENT-RECORD.json`](00_PUBLIC/DEPLOYMENT-RECORD.json)
  - Trạng thái phát hành & cổng kiểm soát: [`00_PUBLIC/RELEASE-STATUS.json`](00_PUBLIC/RELEASE-STATUS.json)
  - Bằng chứng lai lịch bản thể Tác giả: [`00_PUBLIC/ORIGIN-PROVENANCE.json`](00_PUBLIC/ORIGIN-PROVENANCE.json) (đính kèm chữ ký PGP `.asc` và dấu thời gian Bitcoin OTS `.ots`)

Representation này **không phải bảo đảm rằng software không có lỗi**, không phải bảo đảm rằng software phù hợp với một mục đích cụ thể, và không phải bảo đảm rằng các dependency bên thứ ba, nhà cung cấp mô hình trí tuệ nhân tạo, nhà cung cấp RPC, hay hạ tầng mạng bên ngoài sẽ hoạt động liên tục hoặc theo một cách nhất định.

### C. Trách nhiệm Kiểm chứng của Người sử dụng

Người sử dụng giao diện hoặc local runtime có trách nhiệm tự đánh giá sự phù hợp của source code, dependencies, thiết bị, credentials, API keys, dữ liệu đầu vào và môi trường vận hành của mình.

Việc repository được công khai cho phép người dùng thực hiện việc đánh giá đó; nó không chuyển trách nhiệm đánh giá tính phù hợp của môi trường riêng của người dùng sang Tác giả.

Đối với local operation, người dùng cũng chịu trách nhiệm tuân thủ các license, điều khoản dịch vụ, pháp luật và quyền của bên thứ ba áp dụng cho hoạt động của mình.

Không điều khoản nào tại đây nhằm loại trừ hoặc hạn chế trách nhiệm mà pháp luật áp dụng không cho phép loại trừ hoặc hạn chế.

---

## 5. Nguyên tắc Bảo lưu Quyền & Không Suy diễn (Reservation of Rights & No Implied Expansion)

- Mọi quyền không được cấp rõ ràng vẫn được bảo lưu cho chủ thể quyền tương ứng, trong phạm vi pháp luật áp dụng.
- Việc truy cập giao diện không tự tạo quyền đối với source code hoặc artwork.
- Việc source code được công khai không tự tạo một blanket open-source license cho toàn bộ repository.
- Việc một API, endpoint hoặc file có thể truy cập về mặt kỹ thuật không tự tạo một license hoặc quyền sử dụng ngoài quyền đã được cấp.
- Việc một tính năng hiện đang hoạt động không tự tạo cam kết rằng tính năng đó sẽ tồn tại hoặc hoạt động theo cùng một cách trong tương lai.
- Các thành phần có license riêng tiếp tục chịu license riêng của chúng.
- Các quyền Frame, Complete, Output và stewardship đã được cấp trong Schedule không bị mất chỉ vì LICENSE này không lặp lại toàn văn các quyền đó.
- Ngược lại, việc một quyền được mô tả trong Schedule không tự mở rộng thành quyền đối với những tài sản mà Schedule không cấp.
- Không có điều khoản nào trong LICENSE này chuyển copyright, authorship hoặc moral rights nếu không có văn bản chuyển nhượng riêng phù hợp với pháp luật áp dụng.

---

## 6. Chuyển giao, Token và Thực hành Cục bộ (Transfer, Token and Local Practice)

- **Tư cách người nắm giữ (Holder status):** Được xác định hoàn toàn khách quan theo cơ chế của Smart Contract trên chuỗi khối Base và các tài liệu pháp lý áp dụng đi kèm.
- **Tách bạch sự kiện:** Việc chuyển nhượng token trên chuỗi khối và việc bàn giao gói lưu trữ (archive handoff) ngoài đời thực là hai sự kiện độc lập có thể và cần được đối soát riêng biệt.
- **Quy tắc chuyển nhượng Frame và Complete Package:** Được quy định chi tiết tại:
  - Thủ tục kế thừa và chuyển nhượng kỹ thuật: [`00_PUBLIC/SUCCESSION-PROCEDURE.md`](00_PUBLIC/SUCCESSION-PROCEDURE.md)
  - Hướng dẫn chăm sóc và bàn giao dữ liệu: [`00_PUBLIC/CARE-AND-SUCCESSION.md`](00_PUBLIC/CARE-AND-SUCCESSION.md)
  - Schedule chuyên biệt áp dụng:
    * Đối với Frame Tokens (#01–04, #06–09): [`00_PUBLIC/SCHEDULE-FRAME.md`](00_PUBLIC/SCHEDULE-FRAME.md) (Mục 5 — Chuyển nhượng);
    * Đối với Complete Package Token (#05 / Painting #00): [`00_PUBLIC/SCHEDULE-COMPLETE.md`](00_PUBLIC/SCHEDULE-COMPLETE.md) (Mục 6 — Chuyển nhượng và succession).
- **Không tự động chuyển giao bản quyền:** Việc chuyển nhượng token không cấu thành và không tự động chuyển giao quyền tác giả (copyright) hoặc quyền đứng tên (authorship) đối với tác phẩm gốc hay các sản phẩm phái sinh (Output).
- **Tính sống tiếp của quyền đối với Output (Survival of Output Rights):** Các quyền sống tiếp với Output được điều chỉnh bởi Schedule áp dụng. Cụ thể, theo [`00_PUBLIC/SCHEDULE-FRAME.md`](00_PUBLIC/SCHEDULE-FRAME.md) (Mục 3 & 5), người thực hành cũ vẫn giữ nguyên vẹn 100% quyền sở hữu và quyền khai thác thương mại đối với các Output họ đã tạo ra hợp lệ trong thời gian nắm giữ Frame Token, ngay cả sau khi token đã được chuyển nhượng cho người khác.
- **Không chuyển giao thẩm quyền phát hành (`SELF_HOSTABILITY ≠ CANONICAL_RELEASE_AUTHORITY`):** Theo quy định tại [`00_PUBLIC/INDEPENDENT-OPERATION.md`](00_PUBLIC/INDEPENDENT-OPERATION.md) (Mục 1.5), khả năng tự vận hành giao diện phòng trưng bày hoặc adapter Curator cục bộ không cấp thẩm quyền tạo ra token canonical, không cho phép người vận hành ký thay Tác giả, và tuyệt đối không thể thay đổi provenance lịch sử của tác phẩm trên blockchain Base (`INDEPENDENT_EXECUTION ≠ INDEPENDENT_CANONICALIZATION`).

---

## 7. Đối chiếu Xác thực & Quản lý Phiên bản (Verification & Versioning)

Để đối chiếu và kiểm tra tính toàn vẹn độc lập của:
- Mã bytecode hợp đồng thông minh;
- Source revision và commit hash phát hành;
- Thông số deployment trên Base Mainnet và Cloudflare;
- Bảng mã băm cam kết gốc (root commitments);
- Gói lưu trữ (archive), manifest và các tệp bàn giao,

tham chiếu trực tiếp tại các tài liệu chuẩn tắc:
- **Hướng dẫn Quy trình Xác minh Độc lập:** [`00_PUBLIC/VERIFY.md`](00_PUBLIC/VERIFY.md) (Bản tiếng Anh: [`00_PUBLIC/VERIFY.en.md`](00_PUBLIC/VERIFY.en.md))
- **Bản thể học & Lai lịch Tác phẩm:** [`00_PUBLIC/PROVENANCE.md`](00_PUBLIC/PROVENANCE.md) (Bản tiếng Anh: [`00_PUBLIC/PROVENANCE.en.md`](00_PUBLIC/PROVENANCE.en.md))
- **Hồ sơ Lai lịch Triển khai:** [`00_PUBLIC/DEPLOYMENT-RECORD.json`](00_PUBLIC/DEPLOYMENT-RECORD.json) và [`00_PUBLIC/ORIGIN-PROVENANCE.json`](00_PUBLIC/ORIGIN-PROVENANCE.json) (kèm hợp đồng Base Mainnet [`0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8`](https://basescan.org/address/0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8#code))

LICENSE này được nhận diện bằng phiên bản và ngày có hiệu lực:
- **Phiên bản Giấy phép (License Version):** `v2.0 (Dual-Perimeter)`
- **Ngày có hiệu lực (Effective Date):** `2026-09-04` *(Khởi tạo Hợp đồng on-chain)* / Cập nhật đồng bộ: `2026-09-18`

Việc sửa đổi LICENSE trong tương lai **không tự động sửa đổi hoặc hồi tố thay đổi các quyền đã được cấp** trong hai Schedule đã neo mã băm on-chain (`SCHEDULE-FRAME.md`, `SCHEDULE-COMPLETE.md`) hoặc các thỏa thuận pháp lý khác, trừ khi văn bản đó được sửa đổi theo đúng cơ chế áp dụng của chính nó.

Mọi thay đổi cần làm rõ phạm vi của một release mới được ghi nhận bằng revision/version mới và có tham chiếu tới release trước qua:
- **Lịch sử Thay đổi & Phiên bản (Version History):** [`00_PUBLIC/RELEASE-STATUS.json`](00_PUBLIC/RELEASE-STATUS.json) và [Lịch sử Commit Git](https://github.com/thienannguyen-cv/hien-sinh-gallery/commits/main)

---

**End of License**