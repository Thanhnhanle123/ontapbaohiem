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
        console.log(`Đã tải thành công ${masterQuestionBank.length} câu hỏi!`);
        return await response.json();
        
        // Khởi chạy ứng dụng hoặc hiển thị câu hỏi tại đây
    } catch (error) {
        console.error("Không thể đọc file data.json:", error);
    }
}

const masterQuestionBank = loadQuestionBank();
