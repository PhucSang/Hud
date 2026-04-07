import { extension_settings } from "../../../extensions.js";

const extensionName = "Hud";
const extensionFolderPath = `extensions/${extensionName}`;

async function init() {
    console.log("Bubble Menu: Đang nạp...");

    // 1. Chèn file CSS vào giao diện
    $("head").append(`<link rel="stylesheet" href="${extensionFolderPath}/style.css">`);

    // 2. Tải mã HTML và gắn thẳng vào thẻ <body> để nó nổi toàn màn hình
    const htmlContent = await $.get(`${extensionFolderPath}/bubble.html`);
    $("body").append(htmlContent);

    // 3. Thiết lập các biến điều khiển
    const wrapper = document.getElementById('st-bubble-wrapper');
    const btn = document.getElementById('st-bubble-btn');
    const menu = document.getElementById('st-bubble-menu');

    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    // --- LOGIC MỞ/ĐÓNG MENU ---
    btn.addEventListener('click', () => {
        // Nếu người dùng đang kéo thả thì không tính là click mở menu
        if (!isDragging) {
            menu.classList.toggle('active');
        }
    });

    // --- LOGIC KÉO THẢ DÀNH CHO CẢM ỨNG (ANDROID/IOS) VÀ CHUỘT ---
    
    // Bắt đầu chạm
    const dragStart = (e) => {
        if (e.type === "touchstart") {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        } else {
            startX = e.clientX;
            startY = e.clientY;
        }

        const rect = wrapper.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;

        // Chuyển đổi vị trí từ right/bottom (trong CSS) sang left/top để dễ tính toán khi kéo
        wrapper.style.left = initialLeft + 'px';
        wrapper.style.top = initialTop + 'px';
        wrapper.style.right = 'auto';
        wrapper.style.bottom = 'auto';

        isDragging = false;
    };

    // Khi đang di chuyển ngón tay
    const drag = (e) => {
        if (startX === undefined) return;

        let currentX, currentY;
        if (e.type === "touchmove") {
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
        } else {
            currentX = e.clientX;
            currentY = e.clientY;
        }

        let diffX = currentX - startX;
        let diffY = currentY - startY;

        // Nếu vuốt đi một đoạn > 5px thì mới tính là đang kéo đi, tránh nhầm với click
        if (Math.abs(diffX) > 5 || Math.abs(diffY) > 5) {
            isDragging = true;
            menu.classList.remove('active'); // Tự động đóng menu khi đang kéo nút
            e.preventDefault(); // Chặn cuộn trang web
        }

        if (isDragging) {
            wrapper.style.left = (initialLeft + diffX) + 'px';
            wrapper.style.top = (initialTop + diffY) + 'px';
        }
    };

    // Khi buông tay
    const dragEnd = () => {
        startX = undefined;
        startY = undefined;
    };

    // Lắng nghe sự kiện cảm ứng (Touch)
    btn.addEventListener('touchstart', dragStart, { passive: false });
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', dragEnd);

    // Lắng nghe sự kiện chuột (chuột máy tính - để bạn test trên PC nếu cần)
    btn.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
}

$(document).ready(function () {
    init();
});
