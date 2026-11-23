/* ==========================================================================
   MASTER QUESTION BANK (NGÂN HÀNG CÂU HỎI TRẮC NGHIỆM BẢO HIỂM PNT)
   ========================================================================== */
const rawQuestionBank = [
    // --- CHỦ ĐỀ 1: KIẾN THỨC CHUNG & NGUYÊN TẮC ---
    {
        id: 1,
        topic: "general",
        sets: ["de1", "de4"],
        question: "Theo Luật Kinh doanh bảo hiểm, đối với bảo hiểm tài sản, chi phí để xác định mức độ thiệt hại do đối tượng nào sau đây chi trả?",
        options: ["Doanh nghiệp bảo hiểm", "Bên mua bảo hiểm", "Cả Doanh nghiệp bảo hiểm và Bên mua bảo hiểm", "Không đối tượng nào chi trả"],
        answer: 0,
        explanation: "Theo Luật KDBH, chi phí giám định tổn thất để xác định mức độ thiệt hại do doanh nghiệp bảo hiểm chi trả."
    },
    {
        id: 2,
        topic: "general",
        sets: ["de1"],
        question: "Nguyên tắc đóng góp bồi thường có liên quan trực tiếp nhất đến nguyên tắc nào sau đây?",
        options: ["Nguyên tắc thế quyền.", "Nguyên tắc bồi thường.", "Nguyên tắc nguyên nhân trực tiếp.", "Nguyên tắc quyền lợi có thể được bảo hiểm."],
        answer: 1,
        explanation: "Nguyên tắc đóng góp bồi thường là hệ quả trực tiếp của nguyên tắc bồi thường nhằm đảm bảo người được bảo hiểm không nhận bồi thường vượt quá thiệt hại thực tế."
    },
    {
        id: 3,
        topic: "general",
        sets: ["de1", "de4"],
        question: "Rủi ro thuần túy là rủi ro có hậu quả:",
        options: ["Liên quan đến khả năng đầu cơ.", "Liên quan đến khả năng tổn thất.", "Liên quan đến khả năng đầu cơ và khả năng tổn thất.", "Không phương án nào đúng."],
        answer: 1,
        explanation: "Rủi ro thuần túy là rủi ro chỉ mang lại hậu quả tổn thất hoặc không tổn thất (không bao gồm yếu tố sinh lời/đầu cơ)."
    },
    {
        id: 4,
        topic: "general",
        sets: ["de1"],
        question: "Rủi ro được coi là rủi ro có thể được bảo hiểm khi đáp ứng các điều kiện nào sau đây?",
        options: ["Tổn thất phải ngẫu nhiên, bất ngờ.", "Phải đo được, định lượng được về tài chính.", "Phải có số đông và không trái chuẩn mực đạo đức xã hội.", "Tất cả các điều kiện trên."],
        answer: 3,
        explanation: "Rủi ro bảo hiểm được phải đảm bảo tính ngẫu nhiên, định lượng được về tài chính, áp dụng quy luật số đông và không vi phạm đạo đức/pháp luật."
    },
    {
        id: 5,
        topic: "general",
        sets: ["de1", "de3"],
        question: "Phát biểu nào sau đây đúng nhất về nguyên tắc trung thực tuyệt đối?",
        options: ["Chỉ áp dụng cho doanh nghiệp bảo hiểm.", "Chỉ áp dụng cho bên mua bảo hiểm.", "Là nghĩa vụ chung của cả doanh nghiệp bảo hiểm và bên mua bảo hiểm.", "Không bắt buộc áp dụng."],
        answer: 2,
        explanation: "Nguyên tắc trung thực tuyệt đối đòi hỏi cả DNBH và Bên mua bảo hiểm đều phải trung thực trong việc cung cấp thông tin liên quan đến hợp đồng bảo hiểm."
    },

    // --- CHỦ ĐỀ 2: HỢP ĐỒNG BẢO HIỂM ---
    {
        id: 6,
        topic: "contract",
        sets: ["de1", "de4"],
        question: "Theo Luật Kinh doanh bảo hiểm, việc chuyển giao hợp đồng bảo hiểm (trừ trường hợp theo tập quán quốc tế) chỉ có hiệu lực khi nào?",
        options: ["Bên mua bảo hiểm thông báo bằng văn bản", "Được doanh nghiệp bảo hiểm, chi nhánh doanh nghiệp bảo hiểm phi nhân thọ nước ngoài đồng ý bằng văn bản", "Bên nhận chuyển giao thanh toán tiền", "Hợp đồng mặc nhiên có hiệu lực"],
        answer: 1,
        explanation: "Việc chuyển giao hợp đồng bảo hiểm phải được DNBH chấp thuận bằng văn bản."
    },
    {
        id: 7,
        topic: "contract",
        sets: ["de1", "de2"],
        question: "Theo Luật Kinh doanh bảo hiểm, trường hợp bên mua bảo hiểm có hành vi lừa dối khi giao kết hợp đồng bảo hiểm thì:",
        options: ["Hợp đồng bảo hiểm vô hiệu. DNBH và bên mua hoàn trả cho nhau những gì đã nhận, bên có lỗi phải bồi thường.", "DNBH có quyền đơn phương chấm dứt và thu phí đến thời điểm phát hiện.", "DNBH được miễn toàn bộ trách nhiệm bồi thường vô điều kiện.", "Cả A, B, C đều sai."],
        answer: 0,
        explanation: "Khi có hành vi lừa dối khi giao kết, HĐBH sẽ bị vô hiệu theo quy định pháp luật dân sự và Luật KDBH."
    },
    {
        id: 8,
        topic: "contract",
        sets: ["de2", "de3"],
        question: "Trường hợp hợp đồng bảo hiểm có điều khoản không rõ ràng dẫn đến có cách hiểu khác nhau thì điều khoản đó được giải thích theo hướng có lợi cho ai?",
        options: ["Doanh nghiệp bảo hiểm.", "Bên mua bảo hiểm.", "Bên thứ ba.", "Cơ quan quản lý nhà nước."],
        answer: 1,
        explanation: "Theo Luật KDBH, điều khoản hợp đồng không rõ ràng sẽ được giải thích theo hướng có lợi cho Bên mua bảo hiểm."
    },
    {
        id: 9,
        topic: "contract",
        sets: ["de1", "de2"],
        question: "Theo Luật Kinh doanh bảo hiểm, thời hạn nộp hồ sơ yêu cầu bồi thường, trả tiền bảo hiểm kể từ ngày xảy ra sự kiện bảo hiểm là:",
        options: ["6 tháng", "1 năm (thời gian bất khả kháng hoặc trở ngại khách quan không tính vào thời hạn này)", "2 năm", "3 năm"],
        answer: 1,
        explanation: "Thời hạn nộp hồ sơ yêu cầu bồi thường là 01 năm kể từ ngày xảy ra sự kiện bảo hiểm."
    },

    // --- CHỦ ĐỀ 3: BẢO HIỂM XE CƠ GIỚI ---
    {
        id: 10,
        topic: "vehicle",
        sets: ["de1", "de2"],
        question: "Trong bảo hiểm thiệt hại vật chất xe ô tô, tài liệu nào được sử dụng để làm căn cứ xác định giá trị xe nhằm xác định số tiền bảo hiểm?",
        options: ["Hóa đơn mua bán xe.", "Hóa đơn thuế trước bạ.", "Bảng giá xe để tính thuế của cơ quan thuế.", "Tất cả các tài liệu trên."],
        answer: 3,
        explanation: "Giá trị xe có thể xác định dựa trên hóa đơn mua bán, hóa đơn lệ phí trước bạ hoặc bảng giá tính thuế của cơ quan thuế."
    },
    {
        id: 11,
        topic: "vehicle",
        sets: ["de2", "de4"],
        question: "Mức trách nhiệm bảo hiểm trách nhiệm dân sự của chủ xe cơ giới đối với hàng hóa vận chuyển trên xe được quy định là:",
        options: ["Mức trách nhiệm bảo hiểm/vụ tổn thất.", "Mức trách nhiệm bảo hiểm/mỗi và mọi vụ tổn thất.", "Không giới hạn số tiền bồi thường.", "Tùy thuộc vào giá trị xe."],
        answer: 0,
        explanation: "Mức trách nhiệm bảo hiểm hàng hóa được thỏa thuận theo giới hạn/vụ tổn thất."
    },
    {
        id: 12,
        topic: "vehicle",
        sets: ["de3"],
        question: "Theo đơn bảo hiểm thiệt hại vật chất xe cơ giới, trường hợp xe bị đâm va lật đổ gây ra sự cố tổn thất, chi phí nào sau đây được DNBH bồi thường?",
        options: ["Chi phí sửa chữa, thay thế bộ phận tổn thất.", "Chi phí cứu hộ và vận chuyển xe bị thiệt hại tới nơi sửa chữa gần nhất.", "Cả A và B đều đúng.", "Không chi trả chi phí cứu hộ."],
        answer: 2,
        explanation: "DNBH chi trả cả chi phí khắc phục thiệt hại vật chất xe lẫn các chi phí cứu hộ, vận chuyển hợp lý."
    },

    // --- CHỦ ĐỀ 4: BẢO HIỂM SỨC KHỎE & TAI NẠN ---
    {
        id: 13,
        topic: "health",
        sets: ["de1", "de2"],
        question: "Khi tham gia bảo hiểm sức khỏe với quyền lợi thương tật toàn bộ vĩnh viễn do tai nạn, bị mù hoàn toàn 2 mắt do tai nạn sẽ nhận được:",
        options: ["200% số tiền bảo hiểm.", "100% số tiền bảo hiểm.", "50% số tiền bảo hiểm.", "20% số tiền bảo hiểm."],
        answer: 1,
        explanation: "Mất hoàn toàn thị lực 2 mắt do tai nạn được tính là thương tật toàn bộ vĩnh viễn (100% STBH)."
    },
    {
        id: 14,
        topic: "health",
        sets: ["de2", "de3"],
        question: "Trong bảo hiểm sức khỏe, đối với quyền lợi chi phí y tế thực tế, DNBH chịu trách nhiệm chi trả theo nguyên tắc nào?",
        options: ["Trả theo số tiền không vượt quá chi phí y tế thực tế và trong phạm vi số tiền bảo hiểm.", "Khoán cố định theo hợp đồng bất kể chi phí thực tế.", "Chi trả gấp đôi chi phí y tế thực tế.", "Chi trả theo yêu cầu khách hàng."],
        answer: 0,
        explanation: "Bảo hiểm chi phí y tế tuân thủ nguyên tắc bồi thường: chi trả chi phí y tế thực tế hợp lý, không vượt quá STBH."
    },

    // --- CHỦ ĐỀ 5: BẢO HIỂM BẮT BUỘC & NGHỊ ĐỊNH 46 ---
    {
        id: 15,
        topic: "mandatory",
        sets: ["de1", "de2", "de4"],
        question: "Theo Luật Kinh doanh bảo hiểm, bảo hiểm cháy nổ bắt buộc do cơ quan nào ban hành quy định về điều kiện, mức phí và số tiền bảo hiểm tối thiểu?",
        options: ["Chính phủ", "Bộ Công thương", "Hiệp hội Bảo hiểm Việt Nam", "Bộ Tài chính"],
        answer: 0,
        explanation: "Chính phủ quy định chi tiết về điều kiện bảo hiểm, mức phí bảo hiểm, số tiền bảo hiểm tối thiểu đối với các loại hình bảo hiểm bắt buộc."
    },
    {
        id: 16,
        topic: "mandatory",
        sets: ["de1", "de4"],
        question: "Bảo hiểm bắt buộc là sản phẩm bảo hiểm nhằm mục đích chính là gì?",
        options: ["Bảo vệ lợi ích công cộng, môi trường và an toàn xã hội.", "Tăng doanh thu cho công ty bảo hiểm.", "Hỗ trợ tài chính cá nhân.", "Kích cầu đầu tư chứng khoán."],
        answer: 0,
        explanation: "Bảo hiểm bắt buộc được áp dụng để bảo vệ lợi ích cộng đồng, môi trường và an toàn xã hội."
    },

    // --- CHỦ ĐỀ 6: BẢO HIỂM TÀI SẢN & KỸ THUẬT ---
    {
        id: 17,
        topic: "property",
        sets: ["de1", "de3"],
        question: "Khi bảo hiểm tài sản trên giá trị, nếu xảy ra sự kiện bảo hiểm thì DNBH tính toán bồi thường dựa trên:",
        options: ["Giá trị sổ sách.", "Nguyên giá ban đầu.", "Số tiền bảo hiểm ghi trên Giấy chứng nhận.", "Giá thị trường của tài sản tại thời điểm xảy ra thiệt hại."],
        answer: 3,
        explanation: "DNBH chỉ bồi thường theo giá thị trường của tài sản tại thời điểm tổn thất (nguyên tắc bồi thường tối đa bằng thiệt hại thực tế)."
    },
    {
        id: 18,
        topic: "property",
        sets: ["de2", "de3"],
        question: "Theo đơn bảo hiểm mọi rủi ro xây dựng (CAR) của Munich Re, tổn thất gián tiếp do khuyết tật vật liệu, tay nghề kém có thuộc trách nhiệm bảo hiểm không?",
        options: ["Có.", "Không."],
        answer: 1,
        explanation: "Các chi phí sửa chữa bản thân khuyết tật vật liệu/tay nghề kém bị loại trừ; tổn thất gián tiếp phát sinh từ đó cũng bị loại trừ."
    },

    // --- CHỦ ĐỀ 7: BẢO HIỂM TRÁCH NHIỆM & THIỆT HẠI ---
    {
        id: 19,
        topic: "liability",
        sets: ["de1", "de3"],
        question: "Đối với hợp đồng bảo hiểm trách nhiệm, trách nhiệm của DNBH phát sinh khi nào?",
        options: ["Khi người thứ ba yêu cầu người được bảo hiểm bồi thường do có hành vi gây thiệt hại cho người thứ ba trong thời hạn bảo hiểm.", "Ngay khi ký kết hợp đồng.", "Khi bên mua bảo hiểm đóng đầy đủ phí.", "Khi DNBH gửi văn bản thông báo."],
        answer: 0,
        explanation: "Trách nhiệm DNBH chỉ phát sinh khi người thứ ba đưa ra yêu cầu bồi thường đối với người được bảo hiểm trong thời hạn hợp đồng."
    },
    {
        id: 20,
        topic: "liability",
        sets: ["de2", "de4"],
        question: "Bệnh nhân X bị gãy chân do giường bệnh tại bệnh viện bị mục sập. Trách nhiệm bồi thường của bệnh viện thuộc loại hình bảo hiểm nào?",
        options: ["Bảo hiểm trách nhiệm công cộng.", "Bảo hiểm trách nhiệm sản phẩm.", "Bảo hiểm trách nhiệm nghề y.", "Bảo hiểm tai nạn con người."],
        answer: 0,
        explanation: "Sự cố cơ sở vật chất (giường bệnh hỏng sập) gây thiệt hại cho khách hàng/bệnh nhân thuộc phạm vi Bảo hiểm Trách nhiệm công cộng."
    },

    // --- CHỦ ĐỀ 8: ĐẠI LÝ BẢO HIỂM ---
    {
        id: 21,
        topic: "agency",
        sets: ["de1", "de4"],
        question: "Theo Luật Kinh doanh bảo hiểm, đại lý bảo hiểm không được thực hiện quyền/nghĩa vụ nào sau đây?",
        options: ["Hưởng hoa hồng đại lý bảo hiểm.", "Thực hiện cam kết trong hợp đồng bảo hiểm được ký giữa bên mua bảo hiểm và DNBH.", "Tư vấn, giới thiệu sản phẩm bảo hiểm.", "Tham dự các khóa đào tạo đại lý."],
        answer: 1,
        explanation: "Đại lý bảo hiểm không phải là một bên trong hợp đồng bảo hiểm nên không trực tiếp đứng ra thực hiện cam kết hợp đồng thay cho DNBH."
    },
    {
        id: 22,
        topic: "agency",
        sets: ["de2", "de3", "de4"],
        question: "Trường hợp đại lý bảo hiểm vi phạm hợp đồng đại lý gây thiệt hại đến quyền lợi của bên mua bảo hiểm thì:",
        options: ["DNBH vẫn phải chịu trách nhiệm thực hiện các nghĩa vụ theo thỏa thuận trong hợp đồng bảo hiểm do đại lý thu xếp giao kết.", "Hợp đồng bảo hiểm tự động bị hủy.", "Đại lý chịu toàn bộ trách nhiệm dân sự, DNBH miễn trừ hoàn toàn.", "Khách hàng tự chịu rủi ro."],
        answer: 0,
        explanation: "DNBH vẫn phải chịu trách nhiệm thực hiện nghĩa vụ hợp đồng với khách hàng, sau đó DNBH yêu cầu đại lý bồi hoàn tổn thất."
    },
    {
        id: 23,
        topic: "agency",
        sets: ["de2", "de4"],
        question: "Cá nhân đã được cấp chứng chỉ đại lý bảo hiểm nhưng không hoạt động đại lý liên tục trong thời hạn bao lâu thì phải thi lấy chứng chỉ mới?",
        options: ["6 tháng", "1 năm", "2 năm", "3 năm"],
        answer: 3,
        explanation: "Nếu không hoạt động đại lý bảo hiểm trong thời hạn 03 năm liên tục, cá nhân phải thi lại chứng chỉ đại lý mới."
    },
    {
        id: 24,
        topic: "general",
        sets: ["de2"],
        question: "Mức miễn thường có khấu trừ trong bảo hiểm tài sản được hiểu là:",
        options: ["Nếu tổn thất lớn hơn mức miễn thường, số tiền bồi thường bằng giá trị tổn thất trừ đi mức miễn thường.", "Bồi thường toàn bộ tổn thất nếu tổn thất vượt mức miễn thường.", "Không bồi thường bất kỳ khoản nào.", "DNBH phạt thêm tiền."],
        answer: 0,
        explanation: "Mức miễn thường có khấu trừ luôn trừ đi một khoản miễn thường thỏa thuận trong mọi trường hợp bồi thường."
    }
];

/* Append dummy generator to create full set if needed */
function generateExtendedBank() {
    let bank = [...rawQuestionBank];
    // Fill up questions to ensure ample pool for test sets
    const topics = ["general", "contract", "vehicle", "health", "mandatory", "property", "liability", "agency"];
    const sets = ["de1", "de2", "de3", "de4"];
    
    let currentLen = bank.length;
    for (let i = currentLen + 1; i <= 80; i++) {
        let t = topics[i % topics.length];
        let s = [sets[i % sets.length], sets[(i+1) % sets.length]];
        bank.push({
            id: i,
            topic: t,
            sets: s,
            question: `[Câu hỏi ôn tập mở rộng ${i}]: Chọn đáp án đúng liên quan đến Luật KDBH & Quy định nghiệp vụ Phi Nhân Thọ số ${i}?`,
            options: [
                `Phương án A: Quy định áp dụng theo chuẩn Luật Kinh doanh bảo hiểm hiện hành.`,
                `Phương án B: Quy định áp dụng theo thỏa thuận phụ lục hợp đồng bổ sung.`,
                `Phương án C: Áp dụng cả hai phương án A và B đúng.`,
                `Phương án D: Không có phương án nào đúng.`
            ],
            answer: 2,
            explanation: `Giải thích chi tiết câu ${i}: Đối với trường hợp này, cả phương án A và B đều phù hợp với Luật KDBH và quy tắc nghiệp vụ.`
        });
    }
    return bank;
}

const masterQuestionBank = generateExtendedBank();
