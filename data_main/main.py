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

from __future__ import annotations

import json
import re
import tkinter as tk
from dataclasses import dataclass
from pathlib import Path
from tkinter import filedialog, messagebox, ttk


QUESTION_PATTERN = re.compile(r"^\s*\d{1,3}\s*[.)]\s*(.*)$")
OPTION_PATTERN = re.compile(r"^\s*([A-H])\s*[.)]\s*(.*)$", re.IGNORECASE)
UNNUMBERED_QUESTION_PATTERN = re.compile(r"^\s*[.)]\s+(.+)$")


@dataclass
class Question:
    text: str
    options: list[str]
    answer: int | None
    explanation: str = ""


def _is_red(color: int) -> bool:
    red = (color >> 16) & 0xFF
    green = (color >> 8) & 0xFF
    blue = color & 0xFF
    return red >= 160 and green <= 100 and blue <= 100


def extract_questions(pdf_path: Path) -> list[Question]:
    try:
        import pymupdf as fitz
    except ImportError as error:
        raise RuntimeError(
            "Chưa cài thư viện đọc PDF. Mở Terminal trong thư mục data_main và chạy:\n"
            "python3 -m venv .venv\n"
            "source .venv/bin/activate\n"
            "python -m pip install -r requirements.txt"
        ) from error

    extracted: list[Question] = []
    current_question: str | None = None
    current_options: list[dict[str, object]] = []

    def finish_question() -> None:
        if current_question is None:
            return

        options = [str(option["text"]).strip() for option in current_options]
        red_answers = [
            index for index, option in enumerate(current_options) if option["red"]
        ]
        answer = red_answers[0] if len(red_answers) == 1 else None
        extracted.append(
            Question(text=current_question.strip(), options=options, answer=answer)
        )

    try:
        with fitz.open(pdf_path) as document:
            for page in document:
                page_data = page.get_text("dict")
                page_line_number = 0
                for block in page_data["blocks"]:
                    for line in block.get("lines", []):
                        spans = line.get("spans", [])
                        text = "".join(span["text"] for span in spans).strip()
                        if not text:
                            continue
                        page_line_number += 1
                        if re.fullmatch(r"\d{1,3}", text) and (
                            page_line_number <= 3
                            or line["bbox"][3] >= page.rect.height - 30
                        ):
                            continue
                        line_is_red = any(
                            _is_red(span["color"])
                            for span in spans
                            if span["text"].strip()
                        )

                        question_match = QUESTION_PATTERN.match(text)
                        if question_match:
                            finish_question()
                            current_question = question_match.group(1)
                            current_options = []
                            continue

                        unnumbered_match = UNNUMBERED_QUESTION_PATTERN.match(text)
                        if (
                            unnumbered_match
                            and current_question is not None
                            and current_options
                            and page_line_number <= 4
                        ):
                            finish_question()
                            current_question = unnumbered_match.group(1)
                            current_options = []
                            continue

                        if current_question is None:
                            continue

                        option_match = OPTION_PATTERN.match(text)
                        if option_match:
                            current_options.append(
                                {
                                    "text": option_match.group(2),
                                    "red": line_is_red,
                                }
                            )
                        elif current_options:
                            current_options[-1]["text"] = (
                                f"{current_options[-1]['text']} {text}".strip()
                            )
                            current_options[-1]["red"] = (
                                bool(current_options[-1]["red"]) or line_is_red
                            )
                        else:
                            current_question = f"{current_question} {text}".strip()
    except (OSError, RuntimeError, ValueError) as error:
        raise RuntimeError(f"Không thể đọc file PDF: {error}") from error

    finish_question()
    return extracted


def build_json_data(
    questions: list[Question], topic: str, sets: list[str]
) -> list[dict[str, object]]:
    return [
        {
            "id": index,
            "topic": topic,
            "sets": sets,
            "question": question.text.strip(),
            "options": question.options,
            "answer": question.answer,
            "explanation": question.explanation,
        }
        for index, question in enumerate(questions, start=1)
    ]


class QuizQuestionApp:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.root.title("Tạo câu hỏi trắc nghiệm từ PDF")
        self.root.geometry("1040x760")
        self.root.minsize(820, 620)

        self.pdf_path = tk.StringVar()
        self.topic = tk.StringVar(value="general")
        self.sets = tk.StringVar()
        self.output_path = tk.StringVar()
        self.answer_value = tk.StringVar()
        self.status = tk.StringVar(value="Chọn PDF để bắt đầu.")
        self.questions: list[Question] = []
        self.selected_index: int | None = None
        self.answer_choices: list[str] = []

        self._build_ui()

    def _build_ui(self) -> None:
        outer = ttk.Frame(self.root, padding=14)
        outer.pack(fill="both", expand=True)
        outer.columnconfigure(1, weight=1)
        outer.rowconfigure(4, weight=1)

        ttk.Label(outer, text="File PDF:").grid(row=0, column=0, sticky="w", pady=4)
        ttk.Entry(outer, textvariable=self.pdf_path).grid(
            row=0, column=1, sticky="ew", padx=8
        )
        ttk.Button(outer, text="Chọn PDF...", command=self._browse_pdf).grid(
            row=0, column=2, sticky="ew"
        )

        ttk.Label(outer, text="Chủ đề:").grid(row=1, column=0, sticky="w", pady=4)
        ttk.Entry(outer, textvariable=self.topic).grid(
            row=1, column=1, sticky="ew", padx=8
        )

        ttk.Label(outer, text="Sets (phân cách bằng dấu phẩy):").grid(
            row=2, column=0, sticky="w", pady=4
        )
        ttk.Entry(outer, textvariable=self.sets).grid(
            row=2, column=1, sticky="ew", padx=8
        )
        ttk.Button(outer, text="Đọc câu hỏi", command=self._load_pdf).grid(
            row=1, column=2, rowspan=2, sticky="nsew"
        )

        ttk.Label(outer, text="Lưu JSON tại:").grid(row=3, column=0, sticky="w", pady=4)
        ttk.Entry(outer, textvariable=self.output_path).grid(
            row=3, column=1, sticky="ew", padx=8
        )
        ttk.Button(outer, text="Chọn nơi lưu...", command=self._browse_output).grid(
            row=3, column=2, sticky="ew"
        )

        content = ttk.Panedwindow(outer, orient="horizontal")
        content.grid(row=4, column=0, columnspan=3, sticky="nsew", pady=(12, 8))

        question_frame = ttk.Frame(content, padding=(0, 0, 8, 0))
        question_frame.rowconfigure(1, weight=1)
        question_frame.columnconfigure(0, weight=1)
        ttk.Label(question_frame, text="Danh sách câu hỏi").grid(
            row=0, column=0, sticky="w", pady=(0, 5)
        )
        list_frame = ttk.Frame(question_frame)
        list_frame.grid(row=1, column=0, sticky="nsew")
        list_frame.rowconfigure(0, weight=1)
        list_frame.columnconfigure(0, weight=1)
        self.question_list = tk.Listbox(list_frame, width=38, exportselection=False)
        self.question_list.grid(row=0, column=0, sticky="nsew")
        question_scroll = ttk.Scrollbar(
            list_frame, orient="vertical", command=self.question_list.yview
        )
        question_scroll.grid(row=0, column=1, sticky="ns")
        self.question_list.configure(yscrollcommand=question_scroll.set)
        self.question_list.bind("<<ListboxSelect>>", self._select_question)
        content.add(question_frame, weight=1)

        detail = ttk.Frame(content)
        detail.columnconfigure(0, weight=1)
        detail.rowconfigure(1, weight=1)
        detail.rowconfigure(3, weight=1)
        ttk.Label(detail, text="Nội dung câu hỏi (có thể sửa)").grid(
            row=0, column=0, sticky="w", pady=(0, 5)
        )
        self.question_text = tk.Text(detail, height=5, wrap="word")
        self.question_text.grid(row=1, column=0, sticky="nsew")
        self.question_text.configure(state="normal")

        ttk.Label(
            detail,
            text="Các phương án (theo thứ tự A, B, C...; mỗi dòng một đáp án)",
        ).grid(
            row=2, column=0, sticky="w", pady=(10, 5)
        )
        self.options_text = tk.Text(detail, height=9, wrap="word")
        self.options_text.grid(row=3, column=0, sticky="nsew")
        self.options_text.bind("<FocusOut>", self._options_changed)
        self.options_text.tag_configure("correct", foreground="#d00000")
        self.options_text.configure(state="normal")

        ttk.Label(detail, text="Đáp án đúng (màu đỏ được nhận diện tự động):").grid(
            row=4, column=0, sticky="w", pady=(10, 4)
        )
        self.answer_combo = ttk.Combobox(
            detail, textvariable=self.answer_value, state="readonly"
        )
        self.answer_combo.grid(row=5, column=0, sticky="ew")
        self.answer_combo.bind("<<ComboboxSelected>>", self._answer_changed)

        ttk.Label(detail, text="Giải thích (có thể nhập thêm):").grid(
            row=6, column=0, sticky="w", pady=(10, 4)
        )
        self.explanation_text = tk.Text(detail, height=5, wrap="word")
        self.explanation_text.grid(row=7, column=0, sticky="ew")
        content.add(detail, weight=2)

        footer = ttk.Frame(outer)
        footer.grid(row=5, column=0, columnspan=3, sticky="ew", pady=(4, 0))
        footer.columnconfigure(0, weight=1)
        ttk.Label(footer, textvariable=self.status).grid(row=0, column=0, sticky="w")
        ttk.Button(footer, text="Lưu JSON", command=self._save_json).grid(
            row=0, column=1, sticky="e"
        )

    def _browse_pdf(self) -> None:
        path = filedialog.askopenfilename(
            title="Chọn file PDF",
            filetypes=[("PDF", "*.pdf"), ("Tất cả file", "*.*")],
        )
        if path:
            self.pdf_path.set(path)
            self.output_path.set(str(Path(path).with_suffix(".json")))

    def _browse_output(self) -> None:
        current_path = Path(self.output_path.get()) if self.output_path.get() else None
        path = filedialog.asksaveasfilename(
            title="Lưu câu hỏi JSON",
            defaultextension=".json",
            initialdir=str(current_path.parent) if current_path else None,
            initialfile=current_path.name if current_path else "questions.json",
            filetypes=[("JSON", "*.json")],
        )
        if path:
            self.output_path.set(path)

    def _load_pdf(self) -> None:
        path = Path(self.pdf_path.get()).expanduser()
        if not path.is_file():
            messagebox.showerror("Không tìm thấy file", "Hãy chọn một file PDF hợp lệ.")
            return

        try:
            questions = extract_questions(path)
        except RuntimeError as error:
            messagebox.showerror("Không đọc được PDF", str(error))
            return

        self._store_current_edits()
        self.questions = questions
        self.selected_index = None
        self.question_list.delete(0, tk.END)
        self._clear_details()
        for index, question in enumerate(self.questions, start=1):
            self.question_list.insert(tk.END, self._question_label(index, question))

        if self.questions:
            self.question_list.selection_set(0)
            self._show_question(0)
            self.status.set(
                f"Đã đọc {len(self.questions)} câu; "
                f"{sum(question.answer is not None for question in self.questions)} "
                "đáp án nhận diện được từ màu đỏ."
            )
        else:
            self.status.set("Không tìm thấy câu hỏi nào trong PDF.")
            messagebox.showwarning(
                "Không tìm thấy câu hỏi",
                "Không nhận diện được câu hỏi. Hãy kiểm tra PDF có văn bản chọn được "
                "và mỗi câu bắt đầu bằng số thứ tự (ví dụ: 1.).",
            )

    def _question_label(self, index: int, question: Question) -> str:
        answer_status = "✓" if question.answer is not None else "?"
        preview = " ".join(question.text.split())
        if len(preview) > 48:
            preview = f"{preview[:45]}..."
        return f"{index:03d} [{answer_status}] {preview}"

    def _select_question(self, _event: tk.Event) -> None:
        selected = self.question_list.curselection()
        if selected:
            self._store_current_edits()
            self._show_question(selected[0])

    def _show_question(self, index: int) -> None:
        self.selected_index = index
        question = self.questions[index]
        self._set_text(self.question_text, question.text, editable=True)

        self._render_options(question)

        self.answer_choices = [
            chr(ord("A") + option_index) for option_index in range(len(question.options))
        ]
        self.answer_combo.configure(values=self.answer_choices)
        self.answer_value.set(
            self.answer_choices[question.answer]
            if question.answer is not None and question.answer < len(question.options)
            else ""
        )
        self._set_text(self.explanation_text, question.explanation, editable=True)

    def _render_options(self, question: Question) -> None:
        self.options_text.configure(state="normal")
        self.options_text.delete("1.0", tk.END)
        for option_index, option in enumerate(question.options):
            start = self.options_text.index(tk.END)
            self.options_text.insert(tk.END, f"{option}\n")
            if option_index == question.answer:
                self.options_text.tag_add("correct", start, tk.END)
        self.options_text.configure(state="normal")

    def _answer_changed(self, _event: tk.Event) -> None:
        if self.selected_index is None:
            return
        self._store_current_edits()
        self._render_options(self.questions[self.selected_index])
        self.question_list.delete(self.selected_index)
        self.question_list.insert(
            self.selected_index,
            self._question_label(self.selected_index + 1, self.questions[self.selected_index]),
        )
        self.question_list.selection_set(self.selected_index)

    def _options_changed(self, _event: tk.Event) -> None:
        if self.selected_index is None:
            return
        self._store_current_edits()
        question = self.questions[self.selected_index]
        self.answer_choices = [
            chr(ord("A") + option_index)
            for option_index in range(len(question.options))
        ]
        self.answer_combo.configure(values=self.answer_choices)
        self.answer_value.set(
            self.answer_choices[question.answer]
            if question.answer is not None
            else ""
        )

    def _store_current_edits(self) -> None:
        if self.selected_index is not None and self.questions:
            question = self.questions[self.selected_index]
            question.text = self.question_text.get("1.0", "end-1c").strip()
            question.options = [
                line.strip()
                for line in self.options_text.get("1.0", "end-1c").splitlines()
                if line.strip()
            ]
            question.answer = (
                self.answer_choices.index(self.answer_value.get())
                if self.answer_value.get() in self.answer_choices
                else None
            )
            if question.answer is not None and question.answer >= len(question.options):
                question.answer = None
            question.explanation = self.explanation_text.get("1.0", "end-1c").strip()

    def _clear_details(self) -> None:
        self.selected_index = None
        self.answer_choices = []
        self.answer_value.set("")
        self.answer_combo.configure(values=())
        self._set_text(self.question_text, "", editable=True)
        self._set_text(self.options_text, "", editable=True)
        self._set_text(self.explanation_text, "", editable=True)

    @staticmethod
    def _set_text(widget: tk.Text, value: str, editable: bool = False) -> None:
        widget.configure(state="normal")
        widget.delete("1.0", tk.END)
        widget.insert("1.0", value)
        widget.configure(state="normal" if editable else "disabled")

    def _save_json(self) -> None:
        self._store_current_edits()
        topic = self.topic.get().strip()
        sets = [value.strip() for value in self.sets.get().split(",") if value.strip()]
        output = Path(self.output_path.get()).expanduser()

        if not topic:
            messagebox.showerror("Thiếu chủ đề", "Hãy nhập chủ đề cho bộ câu hỏi.")
            return
        if not sets:
            messagebox.showerror(
                "Thiếu sets", "Hãy nhập ít nhất một set, ví dụ: de1, de2."
            )
            return
        if not self.questions:
            messagebox.showerror("Chưa có câu hỏi", "Hãy đọc một file PDF trước.")
            return
        if not self.output_path.get().strip():
            messagebox.showerror("Thiếu nơi lưu", "Hãy chọn nơi lưu file JSON.")
            return

        invalid_questions = [
            index
            for index, question in enumerate(self.questions, start=1)
            if not question.text.strip()
            or len(question.options) < 2
            or question.answer is None
            or question.answer >= len(question.options)
        ]
        if invalid_questions:
            listed = ", ".join(str(index) for index in invalid_questions[:20])
            messagebox.showerror(
                "Cần kiểm tra đáp án",
                "Mỗi câu cần có nội dung, ít nhất 2 lựa chọn và đúng 1 đáp án. "
                f"Hãy chọn đáp án cho câu: {listed}.",
            )
            return

        if output.exists() and not messagebox.askyesno(
            "Xác nhận ghi đè", f"File đã tồn tại:\n{output}\n\nBạn có muốn ghi đè không?"
        ):
            return

        data = build_json_data(self.questions, topic, sets)
        try:
            output.write_text(
                json.dumps(data, ensure_ascii=False, indent=4) + "\n",
                encoding="utf-8",
            )
        except OSError as error:
            messagebox.showerror("Không lưu được JSON", str(error))
            return

        self.status.set(f"Đã lưu {len(data)} câu hỏi vào {output}.")
        messagebox.showinfo("Lưu thành công", f"Đã lưu {len(data)} câu hỏi:\n{output}")


def main() -> None:
    root = tk.Tk()
    QuizQuestionApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
