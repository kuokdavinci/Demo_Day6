## 🛠 Bước 0: Thiết lập từ đầu (Setup from Scratch)

Nếu bạn chưa có gì, hãy làm theo các bước này trong 5 phút:

1.  **Lấy Public URL trước (Quan trọng):**
    - Mở Terminal, chạy lệnh: `npx -y pinggy http:localhost:3000`
    - Copy URL https mà nó cấp (ví dụ: `https://abcd.pinggy.link`). **Đừng tắt Terminal này.**

2.  **Tạo GitHub App:**
    - Truy cập **GitHub Settings > Developer Settings > GitHub Apps > New GitHub App**.
    - **Homepage URL:** Dán Public URL vừa lấy ở trên.
    - **Webhook:** Chọn **Active**.
    - **Webhook URL:** Dán Public URL + `/api/webhooks/github`.
    - **Webhook Secret:** Nhập một chuỗi tùy ý (ví dụ: `my-secret-123`) và copy vào `.env` biến `GITHUB_WEBHOOK_SECRET`.
    - **Permissions (Quyền hạn):**
        - `Pull Requests`: Read & Write.
        - `Contents`: Read-only.
        - `Checks`: Read & Write.
        - `Metadata`: Read-only.
    - **Events:** Tích chọn `Pull request`.
    - Bấm **Create**, sau đó cuộn xuống chọn **Generate a private key**.

2.  **Cấu hình file `.env`:**
    - Tạo file `.env` từ `.env.example`.
    - `GITHUB_APP_ID`: Lấy từ trang App vừa tạo.
    - `GITHUB_APP_PRIVATE_KEY`: Mở file `.pem` vừa tải, copy toàn bộ nội dung dán vào (thay xuống dòng bằng `\n` nếu cần).
    - `GROQ_API_KEY`: Lấy từ [Groq Console](https://console.groq.com/keys).
    - `AI_PROVIDER_MODE=groq`.

3.  **Cài đặt App vào Repo:**
    - Ở menu bên trái của GitHub App, chọn **Install App**.
    - Chọn Repo bạn muốn dùng để Demo và bấm **Install**.

---

## 🛠 Bước 1: Chuẩn bị môi trường (Trước giờ G)

1.  **Môi trường:**
    - Đảm bảo file `.env` đã có đầy đủ các thông số từ Bước 0.
2.  **Khởi động App:**
    - Chạy: `npm run dev`.
    - Mở trình duyệt tại **Public URL** của bạn hoặc `http://localhost:3000`.

---

## 🚀 Bước 2: Kịch kịch bản "Golden Path" (Khoảnh khắc Wow!)

1.  **Hành động:** Bạn hãy mở một Pull Request (PR) mới trên GitHub với nội dung code có sự thay đổi rõ rệt (ví dụ: thêm một hàm xử lý logic).
    - **Lưu ý:** Để phần **Description (mô tả) trống**.
2.  **Kết quả:** 
    - Chờ khoảng 5-10 giây để AI xử lý.
    - Refresh lại trang PR trên GitHub.
    - **Wow!** Description đã được AI tự động điền đầy đủ: **Tóm tắt ngắn gọn cho Quản lý**, **Phân tích kỹ thuật cho Dev**, và đặc biệt là **Mức độ rủi ro (Attention Level)** kèm Emoji.
3.  **Thông báo:** Show màn hình **Slack/Discord** để thấy các thẻ thông báo Premium được gửi về ngay lập tức với các nút bấm tương tác.

---

## 🧠 Bước 3: Human-in-the-loop (AI tự học hỏi)

1.  **Hành động:** Bạn đóng vai một Tech Lead, vào GitHub sửa lại Description mà AI vừa viết (ví dụ: "Cần lưu ý thêm về phần bảo mật ở module này"). Bấm **Save**.
2.  **Kết quả:** 
    - Quay lại Dashboard ứng dụng (phần Overview).
    - Cuộn xuống mục **System Learning / Correction Log**.
    - Show bản ghi vừa xuất hiện. Giải thích: "Hệ thống đã nhận ra sự can thiệp của con người, ghi lại sự khác biệt để cải thiện mô hình và cập nhật bộ nhớ (Repo Memory) cho các lần sau".

---

## 🛠 Bước 4: Live Run Console (Tính minh bạch)

1.  Truy cập trang **[Live Demo](http://localhost:3000/live-demo)**.
2.  Nhập thông số PR bất kỳ và bấm **"Trigger Analysis"**.
3.  Show cho khán giả thanh tiến trình đang chạy qua các bước: *Đang ẩn danh dữ liệu nhạy cảm... Đang phân tích rủi ro... Đang tổng hợp báo cáo...* 
    - Điều này ghi điểm ở việc AI không phải là "hộp đen", mà là một quy trình minh bạch.

---

## 📊 Bước 5: Tổng kết (Analytics)

1.  Quay lại Overview, chỉ vào các thẻ:
    - **Acceptance Rate:** "92% PR do AI viết được giữ nguyên mà không cần sửa đổi".
    - **Time Saved:** "Chúng tôi đã tiết kiệm được hàng chục giờ Review code cho đội ngũ kỹ thuật".

---

> [!TIP]
> **Mẹo nhỏ:** Nếu AI lỡ phân tích "hơi sai" một chút, đừng lo! Hãy dùng chính việc đó để Edit PR và khoe tính năng **Correction Log**. Đó chính là điểm nhấn cho thấy Agent có khả năng học hỏi.
