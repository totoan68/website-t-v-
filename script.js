document.addEventListener("DOMContentLoaded", () => {
  const el = (id) => document.getElementById(id);

  const sampleTrips = [
    { id: "T1", type: "xe", from: "Hà Nội", to: "Đà Nẵng", depart: "06:30", price: 450000 },
    { id: "T2", type: "tau", from: "Hà Nội", to: "Đà Nẵng", depart: "08:20", price: 350000 },
    { id: "T3", type: "maybay", from: "Hà Nội", to: "Đà Nẵng", depart: "12:00", price: 950000 },
  ];

  const currency = (v) => v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";

  // Hiển thị kết quả
  function renderResults(list) {
    const results = el("results");
    results.innerHTML = "";

    if (!list.length) {
      results.innerHTML = `<div class="muted">Không tìm thấy chuyến.</div>`;
      return;
    }

    list.forEach((t) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div class="meta">
          <div>${t.from} → ${t.to}</div>
          <div class="price">${currency(t.price)}</div>
        </div>
        <div class="muted">${t.type.toUpperCase()} • ${t.depart}</div>
        <button class="btn book-btn" data-id="${t.id}">Đặt ngay</button>
      `;
      results.appendChild(card);
    });
  }

  // Tìm kiếm
  el("searchBtn").addEventListener("click", () => {
    const vehicle = el("vehicle").value;
    const from = el("from").value.trim();
    const to = el("to").value.trim();

    const found = sampleTrips.filter(
      (t) =>
        t.type === vehicle &&
        (!from || t.from.toLowerCase().includes(from.toLowerCase())) &&
        (!to || t.to.toLowerCase().includes(to.toLowerCase()))
    );

    renderResults(found);
  });

  renderResults(sampleTrips);

  // Booking
  let currentTrip = null;
  let selectedSeats = new Set();

  function startBooking(id) {
    currentTrip = sampleTrips.find((t) => t.id === id);
    selectedSeats.clear();

    el("selected-trip").textContent =
      `${currentTrip.from} → ${currentTrip.to} • ${currentTrip.type} • ${currentTrip.depart} • giá từ ${currency(currentTrip.price)}`;

    const seatMap = el("seatMap");
    seatMap.innerHTML = "";

    for (let i = 1; i <= 16; i++) {
      const seat = document.createElement("div");
      const taken = Math.random() < 0.2;

      seat.className = "seat " + (taken ? "taken" : "free");
      seat.textContent = "S" + i;
      seat.dataset.seat = "S" + i;

      if (!taken) {
        seat.addEventListener("click", () => toggleSeat(seat));
      }

      seatMap.appendChild(seat);
    }

    updateSummary();
  }

  function toggleSeat(seat) {
    const id = seat.dataset.seat;

    if (seat.classList.contains("selected")) {
      seat.classList.remove("selected");
      selectedSeats.delete(id);
    } else {
      seat.classList.add("selected");
      selectedSeats.add(id);
    }
    updateSummary();
  }

  function updateSummary() {
    const summary = el("orderSummary");

    if (!currentTrip) {
      summary.textContent = "Chưa có chuyến.";
      el("totalPrice").textContent = currency(0);
      return;
    }

    if (selectedSeats.size === 0) {
      summary.textContent = "Chưa chọn ghế.";
      el("totalPrice").textContent = currency(0);
      return;
    }

    const seats = [...selectedSeats].join(", ");
    const total = currentTrip.price * selectedSeats.size;

    summary.innerHTML = `
      <div>Ghế đã chọn: <strong>${seats}</strong></div>
      <div>Đơn giá: ${currency(currentTrip.price)}</div>
    `;
    el("totalPrice").textContent = currency(total);
  }

  // Click Đặt ngay
  el("results").addEventListener("click", (e) => {
    const btn = e.target.closest(".book-btn");
    if (!btn) return;

    startBooking(btn.dataset.id);
    location.hash = "#booking";
  });

  // Thanh toán
  el("confirmBooking").addEventListener("click", () => {
    if (!currentTrip || selectedSeats.size === 0) {
      return alert("Vui lòng chọn ghế.");
    }

    const name = el("name").value.trim();
    const phone = el("phone").value.trim();
    const email = el("email").value.trim();

    if (!name || !phone || !email) {
      return alert("Nhập đầy đủ thông tin.");
    }

    const code = "VE" + Math.floor(Math.random() * 900000 + 100000);
    const seats = [...selectedSeats];
    const total = currentTrip.price * seats.length;

    const booking = {
      code,
      seats,
      from: currentTrip.from,
      to: currentTrip.to,
      total,
      status: "Đã thanh toán",
    };

    const db = JSON.parse(localStorage.getItem("bookings") || "[]");
    db.push(booking);
    localStorage.setItem("bookings", JSON.stringify(db));

    alert("Đặt vé thành công! Mã vé: " + code);

    renderHistory();
  });

  // Kiểm tra vé
  el("checkTicket").addEventListener("click", () => {
    const code = el("trackingCode").value.trim();
    const db = JSON.parse(localStorage.getItem("bookings") || "[]");

    const f = db.find((b) => b.code === code);

    el("trackingResult").textContent = f
      ? `Vé ${code}: ${f.from} → ${f.to}, Ghế: ${f.seats.join(", ")}, Trạng thái: ${f.status}`
      : "Không tìm thấy vé.";
  });

  // Lịch sử
  function renderHistory() {
    const db = JSON.parse(localStorage.getItem("bookings") || "[]");
    const box = el("historyList");

    if (!db.length) {
      box.textContent = "Chưa có giao dịch.";
      return;
    }

    box.innerHTML = db
      .map((b) => `${b.code}: ${b.from} → ${b.to}, Tổng: ${currency(b.total)}`)
      .join("<br>");
  }

  renderHistory();
});
