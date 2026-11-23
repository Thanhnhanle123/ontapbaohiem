# Tạo app python
# Chức năng: tạo câu hỏi trắc nghiệm từ file pdf
# Quy tắc mỗi câu sẽ có 1, 1 đáp án đúng và đáp án đúng đó được tô màu đỏ
# câu trúc sẽ lưu lại file json như sau
# [{
#         "id": 1,
#         "topic": "general",
#         "sets": [
#             "de1",
#             "de4"
#         ],
#         "question": "Theo Luật Kinh doanh bảo hiểm, đối với bảo hiểm tài sản, chi phí để xác định mức độ thiệt hại do đối tượng nào sau đây chi trả?",
#         "options": [
#             "Doanh nghiệp bảo hiểm",
#             "Bên mua bảo hiểm",
#             "Cả Doanh nghiệp bảo hiểm và Bên mua bảo hiểm",
#             "Không đối tượng nào chi trả"
#         ],
#         "answer": 0,
#         "explanation": "Theo Luật KDBH, chi phí giám định tổn thất để xác định mức độ thiệt hại do doanh nghiệp bảo hiểm chi trả."
#  },]

# về mặt UI hãy tạo 1 UI chạy trên MACOS
# khi tải 1 file pdf lên chọn chủ đề tự nhập vào
# sets: tự nhập vào vd sẽ nhập de1, de2, de3, de4, de5
# còn nhiệm vụ của code sẽ lưu những question, options, answer, explanation vào file json như trên
