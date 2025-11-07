// ==================================================
// Chatbot JS - Versi Diperbaiki
// ==================================================

// State untuk melacak apakah sedang memproses pesan, agar user tidak spam klik
let isProcessing = false;

/**
 * Menangani event penekanan tombol pada input field.
 * @param {KeyboardEvent} event - Event keyboard yang terjadi.
 */
function handleKey(event) {
    // Kirim pesan hanya jika tombol "Enter" ditekan dan tidak sedang memproses
    if (event.key === "Enter" && !isProcessing) {
        sendMessage();
    }
}

/**
 * Mengubah teks dengan format markdown sederhana (bold dan list) menjadi HTML.
 * @param {string} text - Teks yang akan dikonversi.
 * @returns {string} - Teks dalam format HTML.
 */
function markdownToHTML(text) {
    // Ganti **text** dengan <b>text</b>
    let html = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

    // Proses numbered list
    const lines = html.split('\n');
    let inList = false;
    const newLines = [];

    for (const line of lines) {
        if (/^\d+\.\s/.test(line)) {
            if (!inList) {
                newLines.push('<ol>');
                inList = true;
            }
            const liText = line.replace(/^\d+\.\s*/, '');
            newLines.push(`<li>${liText}</li>`);
        } else {
            if (inList) {
                newLines.push('</ol>');
                inList = false;
            }
            // Tambahkan baris kosong sebagai <br> agar spasi tetap terjaga
            if (line.trim() !== '') {
                newLines.push(line);
            } else {
                newLines.push('<br>');
            }
        }
    }

    if (inList) {
        newLines.push('</ol>');
    }

    return newLines.join('<br>');
}

/**
 * Fungsi utama untuk mengirim pesan user ke server dan menampilkan responsnya.
 */
async function sendMessage() {
    const input = document.getElementById("userInput");
    const message = input.value.trim();
    if (!message || isProcessing) return;

    // --- Mulai proses, nonaktifkan UI ---
    isProcessing = true;
    input.disabled = true;

    const chatBody = document.getElementById("chatBody");

    // Tambahkan pesan user ke chat
    const userMsg = document.createElement("div");
    userMsg.className = "message user-message";
    userMsg.textContent = message;
    chatBody.appendChild(userMsg);

    input.value = ""; // Kosongkan input
    chatBody.scrollTop = chatBody.scrollHeight;

    // Tampilkan indikator "Mengetik..."
    const typingMsg = document.createElement("div");
    typingMsg.className = "message typing-message";
    typingMsg.textContent = "Mengetik...";
    chatBody.appendChild(typingMsg);
    chatBody.scrollTop = chatBody.scrollHeight;

    try {
        // Kirim permintaan ke API
        const res = await fetch("/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        // Cek jika respons dari server tidak OK (misalnya error 404 atau 500)
        if (!res.ok) {
            throw new Error(`Server error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        // Hapus indikator "Mengetik..."
        typingMsg.remove();

        // Tampilkan respons dari bot
        const botMsg = document.createElement("div");
        botMsg.className = "message bot-message";
        // Gunakan innerHTML untuk merender hasil dari markdownToHTML
        botMsg.innerHTML = markdownToHTML(data.reply);
        chatBody.appendChild(botMsg);

    } catch (error) {
        console.error("Error saat mengirim pesan:", error); // Tampilkan error di console untuk debugging
        typingMsg.remove();
        const botMsg = document.createElement("div");
        botMsg.className = "message bot-message";
        botMsg.textContent = "Maaf, terjadi kesalahan. Coba lagi nanti.";
        chatBody.appendChild(botMsg);
    } finally {
        // --- Selesai proses, aktifkan kembali UI ---
        isProcessing = false;
        input.disabled = false;
        chatBody.scrollTop = chatBody.scrollHeight;
        input.focus(); // Kembalikan fokus ke input field
    }
}

/**
 * Membersihkan seluruh isi chat dan menampilkan pesan pembuka.
 */
function clearChat() {
    const chatBody = document.getElementById("chatBody");
    chatBody.innerHTML = "";

    const botMsg = document.createElement("div");
    botMsg.className = "message bot-message";
    botMsg.innerHTML = "Hai DIPS, ada yang bisa saya bantu?";
    chatBody.appendChild(botMsg);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Jalankan fungsi saat halaman selesai dimuat
window.onload = () => {
    clearChat();
    document.getElementById("userInput").focus(); // Fokus ke input saat halaman dimuat
};