<script>
const el=id=>document.getElementById(id);
const sampleTrips=[
{id:'T1', type:'xe', from:'Hà Nội', to:'Đà Nẵng', depart:'06:30', price:450000},
{id:'T2', type:'tau', from:'Hà Nội', to:'Đà Nẵng', depart:'08:20', price:350000},
{id:'T3', type:'maybay', from:'Hà Nội', to:'Đà Nẵng', depart:'12:00', price:950000},
];
const currency=v=>v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')+' đ';


function renderResults(list){
  const results=el('results'); results.innerHTML='';
  if(!list.length){ results.innerHTML='<div style="color:#6b7280">Không tìm thấy chuyến.</div>'; return }
  list.forEach(t=>{
    const card=document.createElement('div'); card.className='card';
    card.innerHTML=`
      <div class="meta"><div>${t.from} → ${t.to}</div><div class="price">${currency(t.price)}</div></div>
      <div style="color:#6b7280;margin-bottom:8px">${t.type.toUpperCase()} • ${t.depart}</div>
      <div style="display:flex;gap:4px">
        <button class="btn" data-id="${t.id}">Đặt ngay</button>
      </div>
    `;
    results.appendChild(card);
  });
}


el('searchBtn').addEventListener('click', ()=>{
  const vehicle=el('vehicle').value;
  const from=el('from').value.trim();
  const to=el('to').value.trim();
  const found=sampleTrips.filter(t=>t.type===vehicle &&
    (!from || t.from.toLowerCase().includes(from.toLowerCase())) &&
    (!to || t.to.toLowerCase().includes(to.toLowerCase()))
  );
  renderResults(found);
});


let currentTrip=null, selectedSeats=new Set();
function startBooking(id){
  currentTrip=sampleTrips.find(t=>t.id===id);
  el('selected-trip').textContent=currentTrip?`${currentTrip.from} → ${currentTrip.to} • ${currentTrip.type.toUpperCase()} • ${currentTrip.depart} • Giá từ ${currency(currentTrip.price)}`:'Chưa chọn chuyến';
  const seatMap=el('seatMap'); seatMap.innerHTML=''; selectedSeats.clear();
  for(let i=1;i<=16;i++){
    const seat=document.createElement('div');
    const taken=Math.random()<0.2;
    seat.className='seat '+(taken?'taken':'free');
    seat.textContent='S'+i;
    seat.dataset.seat='S'+i;
    if(!taken){ seat.addEventListener('click',()=>toggleSeat(seat)); }
    seatMap.appendChild(seat);
  }
  updateSummary();
}

function toggleSeat(seat){
  const id=seat.dataset.seat;
  if(seat.classList.contains('selected')){ seat.classList.remove('selected'); selectedSeats.delete(id); }
  else{ seat.classList.add('selected'); selectedSeats.add(id); }
  updateSummary();
}

function updateSummary(){
  const summary=el('orderSummary');
  if(!currentTrip){ summary.textContent='Chưa có chuyến.'; el('totalPrice').textContent=currency(0); return }
  if(selectedSeats.size===0){ summary.textContent='Chưa có ghế được chọn.'; el('totalPrice').textContent=currency(0); return }
  const seats=Array.from(selectedSeats).join(', ');
  const price=currentTrip.price*selectedSeats.size;
  summary.innerHTML=`<div>Chuyến: <strong>${currentTrip.from} → ${currentTrip.to}</strong></div>
    <div>Ghế: <strong>${seats}</strong></div>
    <div>Đơn giá: ${currency(currentTrip.price)}</div>
  `;
  el('totalPrice').textContent=currency(price);
}

el('results').addEventListener('click', e=>{
  if(e.target.tagName==='BUTTON'){ startBooking(e.target.dataset.id); location.hash='#booking'; window.scrollTo({top:0,behavior:'smooth'}); }
});
el('confirmBooking').addEventListener('click',()=>{
  const name=el('name').value.trim();
  const phone=el('phone').value.trim();
  const email=el('email').value.trim();
  if(!currentTrip || selectedSeats.size===0 || !name || !phone || !email){ alert('Vui lòng chọn chuyến, ghế và điền thông tin đầy đủ.'); return }
  const seats=Array.from(selectedSeats);
  const total=currentTrip.price*seats.length;
const code='VE001';

  const booking={code, tripId:currentTrip.id, from:currentTrip.from, to:currentTrip.to, seats, name, phone, email, total, status:'Đã thanh toán'};
  const db=JSON.parse(localStorage.getItem('bookings')||'[]'); db.push(booking); localStorage.setItem('bookings',JSON.stringify(db));
  alert('Thanh toán thành công! Mã vé: '+code);
  selectedSeats.clear(); el('orderSummary').textContent='Chưa có ghế được chọn.'; el('totalPrice').textContent=currency(0);
  el('name').value=''; el('phone').value=''; el('email').value='';
  renderHistory();
});


el('checkTicket').addEventListener('click',()=>{
  const code=el('trackingCode').value.trim(); if(!code){ alert('Nhập mã vé'); return }
  const db=JSON.parse(localStorage.getItem('bookings')||'[]');
  const ticket=db.find(b=>b.code===code);
  el('trackingResult').textContent=ticket?`Vé ${ticket.code}: ${ticket.from} → ${ticket.to}, Ghế: ${ticket.seats.join(', ')}, Trạng thái: ${ticket.status}`:'Không tìm thấy vé.';
});


function renderHistory(){
  const db=JSON.parse(localStorage.getItem('bookings')||'[]');
  const elh=el('historyList');
  if(!db.length){ elh.textContent='Chưa có giao dịch.'; return }
  elh.innerHTML=db.map(b=>`<div>${b.code}: ${b.from} → ${b.to}, Ghế: ${b.seats.join(', ')}, Tổng: ${currency(b.total)}</div>`).join('');
}
renderResults(sampleTrips); renderHistory();
</script>