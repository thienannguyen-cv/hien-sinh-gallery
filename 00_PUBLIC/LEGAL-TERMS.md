# Điều khoản pháp lý — "Hiện sinh"

**Bản tiếng Việt là bản canonical.** Bản tiếng Anh: `LEGAL-TERMS.en.md`.
Ngày có hiệu lực: [ngày deploy contract canonical].

Tài liệu này được tác giả tự soạn dựa trên các thực hành mã nguồn mở, tiêu chuẩn quốc tế về quyền sở hữu trí tuệ số và nguyên tắc minh bạch triệt để của công nghệ blockchain. Tài liệu này chưa được luật sư chuyên ngành rà soát chính thức; Artist đã nỗ lực hợp lý để đảm bảo tính rõ ràng, trung thực và công bằng. Tài liệu không phải tư vấn pháp lý. Người tham gia giao dịch nên tự đánh giá rủi ro và tìm tư vấn độc lập nếu cần.

## 1. Cấu trúc tài liệu

Quan hệ nghệ thuật được mô tả tại `WORK-ONTOLOGY.md` và `STEWARDSHIP-CHARTER.md`. Các tài liệu ấy không thay thế điều khoản pháp lý này.

Quyền pháp lý phụ thuộc loại token/package:

- Frame: `SCHEDULE-FRAME.md`;
- Complete: `SCHEDULE-COMPLETE.md`.

Nếu ngôn ngữ nghệ thuật và điều khoản pháp lý mâu thuẫn về quyền, nghĩa vụ hoặc giao dịch, điều khoản pháp lý áp dụng cho câu hỏi pháp lý. Không ngôn ngữ nào về stewardship được dùng để che giá, phí, rủi ro hoặc phạm vi license.

## 2. Định nghĩa

- **Artist**: persona phát hành được liên kết bằng public PGP key, minting wallet và contract canonical trong release registry.
- **Work**: toàn bộ tác phẩm "Hiện sinh" theo designation canonical.
- **Frame Token**: một trong 8 ERC-721 token độc lập #01–04 hoặc #06–09 ở trạng thái `FRAME_ONLY`.
- **Complete Package Token**: token #05, đại diện Gói 05 chứa Frame 05 + Painting và được contract ghi trạng thái `DESIGNATED_STEWARD`.
- **Canonical Painting**: hiện thân canonical được nêu trong designation; không đồng nhất với token.
- **Archive**: package file được manifest và commitment của release xác thực.
- **Holder/Licensee**: người kiểm soát hợp pháp ví đang giữ token liên quan, trừ trường hợp pháp luật hoặc lệnh có thẩm quyền quy định khác.
- **Output**: kết quả mới do một người tạo khi thực hành Frame, không phải bản sao hoặc đóng gói lại Frame/Work.

## 3. Giao dịch và on-chain record

- Frame mint price: **0.081 ETH** cho mỗi Frame Token độc lập (#01–04, #07–09).
- Primary acquisition consideration của Gói 05: **4.29 ETH**, chuyển giao nguyên tử Frame 05 + Bức Tranh 0; không cộng thêm 0.081 ETH.
- Gas, thuế, phí nền tảng và biến động ETH do người giao dịch tự chịu, trừ khi pháp luật bắt buộc khác.
- **Kinh tế học Kế thừa Bất đối xứng:**
  - **Bức Tranh 0 (Token 0):** Bắt buộc chuyển giao qua cơ chế Kế thừa Chuẩn tắc (`Canonical Succession`) với mức xem xét tối thiểu **4.29 ETH** và trích nộp tín hiệu creator fee ERC-2981 ở mức **1.49% (149 BPS)** về Treasury (tối thiểu **0.063921 ETH**). Mức 4.29 ETH thuần túy là điều kiện kế thừa chuẩn tắc, không cấu thành định giá hay thẩm định giá thị trường.
  - **Các Chiếc Khung 01..09 (Tokens 1..9):** Chuyển nhượng ERC-721 thông thường tự do, **0%** creator fee (`0 BPS`), không áp dụng mức sàn thứ cấp.
- Token không phải cổ phần, khoản nợ, cam kết lợi nhuận hay sản phẩm đầu tư.
- Không có lời hứa về thanh khoản, tăng giá, listing trên sàn hoặc khả năng bán lại.

## 4. Token, archive và license là các lớp riêng

Token ghi designated bearer trong hệ thống. Archive là dữ liệu được bàn giao. License quy định quyền pháp lý. Ba lớp không tự động thay thế nhau:

- token không tự chứa file;
- bản copy archive không tự chứng minh holder status;
- custody không tự chuyển copyright;
- stewardship không mở rộng license;
- license không chứng nhận giá trị nghệ thuật hoặc trải nghiệm nội tâm.

Khi token và archive chưa cùng được nghiệm thu, record phải mô tả trạng thái chưa hoàn tất thay vì suy diễn quyền hoặc lineage.

### 4b. Giá trị nằm ở provenance và sự kiện, không phải file

Giá trị pháp lý và nghệ thuật của "Hiện sinh" gắn liền với **provenance được xác thực** — tức sự kiện sinh biểu tượng đã xảy ra, ontology do tác giả xác nhận, và chuỗi designation không thể làm giả — chứ không phải file dữ liệu cấu thành archive.

File PNG, transcript, seed và mọi dữ liệu số khác là **carrier** (vật mang) của hiện thân canonical. Bản sao file không mang theo provenance; file bị lộ, bị sao chép hoặc bị mint lại bởi bên thứ ba không liên kết với sự kiện đã được lưu vết bằng provenance token thì không tạo ra canonical lineage và không có giá trị designation.

Điều này có nghĩa: scarcity của "Hiện sinh" không dựa vào việc giấu file, mà dựa vào **tính không thể mạo danh** của sự kiện, ontology và chuỗi ký xác thực đã gắn vào blockchain.

## 5. Copyright, authorship và AI-assisted material

Artist giữ mọi copyright và quyền liên quan mà pháp luật công nhận và Artist có quyền kiểm soát, trừ quyền được cấp rõ trong Schedule áp dụng.

Không điều khoản nào bảo đảm rằng mọi thành phần do AI hỗ trợ đều được bảo hộ copyright ở mọi quốc gia. Quyền đối với AI-assisted output phụ thuộc pháp luật, mức đóng góp của con người, điều khoản model/platform và quyền bên thứ ba. License chỉ cấp những quyền Artist thực sự có thể cấp.

Token sale không chuyển authorship, moral rights hoặc copyright nếu không có văn bản chuyển nhượng riêng đáp ứng luật áp dụng.

## 6. Quyền Artist giữ lại

Trong giới hạn không mâu thuẫn với covenant không phát hành competing canonical, Artist giữ quyền:

- ghi chép, nghiên cứu và viết về Work;
- dùng hình ảnh hợp lý để xác thực, giám tuyển, triển lãm, báo chí và quảng bá;
- xuất bản catalogue, sách và tài liệu học thuật;
- trưng bày hoặc cho triển lãm bằng display copy;
- tạo study, derivative và reproduction được ghi nhãn rõ;
- bán **materially transformed derivatives** theo chính sách Etsy dưới đây;
- bảo vệ provenance, designation và quyền pháp lý.

## 7. Chính sách Etsy và reproduction

Artist không bán full-fidelity copy của Canonical Painting như một sản phẩm thay thế. Sản phẩm Etsy, nếu phát hành, phải:

- được biến đổi đáng kể về hình thức, chức năng hoặc ngữ cảnh;
- được ghi rõ là derivative/reproduction, không phải canonical;
- công bố việc dùng AI theo quy định hiện hành của nền tảng;
- công bố production partner khi có;
- không tạo edition có thể bị hiểu là một canonical Painting thứ hai.

Một reproduction program mới phải được công bố bằng supplement có hiệu lực về sau. Nó không sửa ngược license hoặc lời hứa đã gắn với một release trước.

## 8. Bàn giao, bảo quản và rủi ro kỹ thuật

Package được cung cấp "as is" sau khi người nhận có cơ hội kiểm tra hash, signature và manifest. Artist không bảo đảm:

- blockchain, marketplace, gateway, IPFS pin hoặc phần mềm bên thứ ba hoạt động vĩnh viễn;
- mọi file format luôn mở được trên hệ thống tương lai;
- Public Encounter Representation không thể bị chụp, sao chép hoặc tái phân phối;
- ETH hoặc token giữ giá trị.

Không điều khoản nào loại trừ trách nhiệm mà pháp luật bắt buộc không được loại trừ. Quy trình backup, migration và incident nằm trong `CARE-AND-SUCCESSION.md`.

### 8b. Minh bạch triệt để thay thế bảo mật bằng che giấu

"Hiện sinh" áp dụng nguyên tắc minh bạch triệt để (*radical transparency*) nhất quán với tinh thần công nghệ blockchain:

- **Smart Contract:** Toàn bộ source code được verify và công khai trên block explorer. Bất kỳ ai có thể đọc, kiểm tra và hiểu logic giao dịch trước khi tham gia.
- **Điều khoản pháp lý:** Toàn bộ bộ tài liệu — `LEGAL-TERMS.md`, `SCHEDULE-FRAME.md`, `SCHEDULE-COMPLETE.md`, `WORK-ONTOLOGY.md`, `STEWARDSHIP-CHARTER.md`, `TRANSACTION-DISCLOSURE.md`, `VERIFY.md`, `PROVENANCE.md` — được công bố mở, có hash xác thực, trước khi bất kỳ giao dịch nào được mở.
- **Cơ chế xác thực:** Quy trình xác thực token, archive và lineage được mô tả đầy đủ tại `VERIFY.md` và có thể được bên thứ ba độc lập kiểm tra.
- **Hình ảnh đại diện:** Một bản thu nhỏ 512×512 có chỉnh sửa chống đảo ngược (`Public Encounter Representation`) được công khai để hỗ trợ đánh giá tác phẩm trước giao dịch. Bản này không phải canonical Painting bytes.

Mục đích của sự minh bạch này là đảm bảo rằng **mọi thông tin cần thiết để đánh giá rủi ro, hiểu quyền và đưa ra quyết định có thông tin đều có sẵn trước khi giao dịch xảy ra**. Không có thông tin ẩn nào ảnh hưởng đến quyền hoặc nghĩa vụ pháp lý của người tham gia mà không được công bố trong bộ tài liệu này.

### 8c. Giao dịch blockchain là không thể đảo ngược

Giao dịch trên blockchain Base Network là không thể đảo ngược sau khi được xác nhận (*finalized*). Smart contract không có hàm hoàn tiền (*refund*), tạm dừng (*pause*) hoặc thu hồi token (*revoke*). Artist không có khả năng kỹ thuật để đảo ngược giao dịch đã hoàn tất.

Nếu archive delivery gặp sự cố kỹ thuật sau khi giao dịch on-chain hoàn tất, Artist cam kết nỗ lực hợp lý để hoàn tất việc bàn giao trong 30 ngày. Nếu việc bàn giao không thể thực hiện được, hai bên sẽ thương lượng thiện chí về giải pháp thay thế.

Người tham gia giao dịch xác nhận rằng họ hiểu tính chất không thể đảo ngược này trước khi gửi giao dịch.

### 8d. Giới hạn trách nhiệm dựa trên đồng thuận có thông tin

Bằng việc gửi giao dịch mua token, người tham gia xác nhận rằng:

1. họ đã có quyền truy cập vào toàn bộ bộ tài liệu công khai;
2. họ đã có cơ hội đọc và kiểm tra source code của smart contract;
3. họ hiểu các rủi ro được nêu tại `TRANSACTION-DISCLOSURE.md`;
4. họ đưa ra quyết định dựa trên thông tin đầy đủ và tự chịu trách nhiệm.

Trong mọi trường hợp và trong phạm vi pháp luật cho phép, tổng trách nhiệm của Artist đối với bất kỳ Holder nào liên quan đến token, archive hoặc license không vượt quá **số ETH mà Holder đã thực sự thanh toán cho Artist cho token liên quan, tính theo giá trị ETH tại thời điểm giao dịch gốc**.

Giới hạn này phản ánh nguyên tắc: khi mọi thông tin đã được công khai minh bạch và người tham gia đã có đầy đủ cơ hội đánh giá, **không bên nào có thể viện dẫn độ chênh nhận thức** để yêu cầu bồi thường vượt quá phạm vi giao dịch.

## 9. Chuyển token

License gắn với holder status theo Schedule. Người chuyển phải cung cấp archive và lineage khi Package 05 Token được chuyển. Secondary successor không cần Artist phê duyệt và không phải lặp nghi thức ba vết cọ.

Người chuyển không được tiếp tục tự xưng là holder hiện tại. Việc giữ bản backup riêng vì yêu cầu pháp lý hoặc chứng cứ không tạo designated status và không cho phép khai thác ngoài quyền đã tồn tại.

### 9b. Bộ khung pháp lý là giao thức, không phải hợp đồng song phương

Bộ tài liệu pháp lý này được thiết kế như một **giao thức tự vận hành** (*self-executing protocol*) đi cùng token:

- Khi token được chuyển, bộ khung pháp lý chuyển nguyên vẹn sang Holder mới mà không cần sửa đổi, ký lại hoặc phê duyệt từ Artist.
- Holder mới kế thừa đúng các quyền và giới hạn đã được quy định trong Schedule áp dụng, không hơn và không kém.
- Không có điều khoản nào trong bộ khung này tạo ra sự phụ thuộc vào Artist cho việc chuyển giao thứ cấp. Artist không phải bên ký kết trong mỗi giao dịch chuyển nhượng.
- Bộ khung này, cùng với smart contract source code và bộ tài liệu công khai, cung cấp đủ thông tin để bất kỳ Holder nào có thể chuyển nhượng token với cùng mức độ minh bạch và bảo đảm pháp lý mà họ đã nhận được khi tiếp nhận.

Mục tiêu: Holder không cần phải "reinvent" bộ khung pháp lý hoặc liên hệ Artist để bán lại. Bộ khung hoạt động giống một blockchain protocol — một khi đã được thiết lập, nó tự vận hành qua mỗi chuyển giao.

## 10. Luật áp dụng và giải quyết tranh chấp

Bộ tài liệu này được soạn dựa trên các nguyên tắc quốc tế về quyền sở hữu trí tuệ, thực hành mã nguồn mở và quy ước hợp đồng số, không ràng buộc riêng vào hệ thống pháp luật của một quốc gia cụ thể.

Nếu tranh chấp phát sinh, các bên sẽ ưu tiên:

1. **Thương lượng thiện chí** trong 60 ngày kể từ khi tranh chấp được thông báo bằng văn bản;
2. **Hòa giải trực tuyến** qua một bên thứ ba được cả hai bên đồng ý, nếu thương lượng không đạt kết quả;
3. **Trọng tài quốc tế** theo Quy tắc Trọng tài UNCITRAL hoặc quy tắc tương đương được cả hai bên chấp thuận, là phương án cuối cùng.

Ngôn ngữ trọng tài là tiếng Anh hoặc tiếng Việt theo lựa chọn của bên khiếu nại. Địa điểm trọng tài do các bên thỏa thuận; nếu không thỏa thuận được, áp dụng trọng tài trực tuyến.

Mọi thay đổi pháp lý sau phát hành phải là release mới có hash và signature riêng, liên kết release trước theo nguyên tắc additive-only tại `PROVENANCE.md`.
