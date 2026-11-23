/* ==========================================================================
   MASTER QUESTION BANK (NGÂN HÀNG CÂU HỎI TRẮC NGHIỆM BẢO HIỂM PNT)
   ========================================================================== */
var rawQuestionBank = [];

// Hàm lấy dữ liệu câu hỏi từ file data.json
async function loadQuestionBank() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`Lỗi kết nối HTTP! Trang trạng thái: ${response.status}`);
        }
        masterQuestionBank = await response.json();
        console.log(`Đã tải thành công ${masterQuestionBank.length} câu hỏi!`);
        
        // Khởi chạy ứng dụng hoặc hiển thị câu hỏi tại đây
        initQuizApp();
    } catch (error) {
        console.error("Không thể đọc file data.json:", error);
    }
}
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
