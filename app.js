const state = {
  step: 'greeting',
  reserva: { nombre: '', fecha: '', hora: '', personas: '' },
};

const chat = document.getElementById('chat');
const form = document.getElementById('form');
const input = document.getElementById('text');

const time = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const scrollBottom = () => { chat.scrollTop = chat.scrollHeight; };

function bubble(text, who = 'bot'){
  const div = document.createElement('div');
  div.className = `msg ${who}`;
  div.innerHTML = `${text}<span class="time">${time()}</span>`;
  chat.appendChild(div);
  scrollBottom();
}

function chips(options){
  const wrap = document.createElement('div');
  wrap.className = 'chips';
  options.forEach(opt => {
    const c = document.createElement('button');
    c.type = 'button';
    c.className = 'chip';
    c.textContent = opt.label;
    c.addEventListener('click', () => opt.onClick());
    wrap.appendChild(c);
  });
  chat.appendChild(wrap);
  scrollBottom();
}

// Validaciones simples
// Validaciones simples
const isFecha = (s) => /^(\d{2})\/(\d{2})$/.test(s.trim());  // formato dd/mm
const isHora  = (s) => /^(\d{2}):(\d{2})$/.test(s.trim());   // formato hh:mm
const isNum   = (s) => /^\d{1,2}$/.test(s.trim());           // número 1 o 2 cifras

function greet(){
  bubble('¡Hola! 👋 Soy el asistente de <b>Restaurante Demo</b>. ¿En qué te ayudo?');
  chips([
    { label: 'Reservar mesa', onClick(){ choose('reservar'); } },
    { label: 'Ver menú',      onClick(){ choose('menu'); } },
    { label: 'Horario',       onClick(){ choose('horario'); } },
  ]);
}

function choose(key){
  bubble(key, 'user');
  if(key === 'reservar'){
    state.step = 'reserva_nombre';
    bubble('Perfecto, ¿a nombre de quién hacemos la reserva?');
  } else if(key === 'menu') {
    bubble('Hoy tenemos menú del día: 🍝 Pasta casera / 🐟 Merluza / 🥗 Ensalada. ¿Quieres reservar?');
    chips([
      { label: 'Sí, reservar', onClick(){ choose('reservar'); } },
      { label: 'No, gracias', onClick(){ bubble('¡Genial! Si necesitas algo más, aquí estoy ✌️'); } },
    ]);
  } else if(key === 'horario'){
    bubble('Abrimos de 13:00 a 16:00 y de 20:00 a 23:30. ¿Te hago una reserva?');
    chips([
      { label: 'Reservar mesa', onClick(){ choose('reservar'); } },
      { label: 'Otra consulta', onClick(){ bubble('Cuéntame 🙂'); } },
    ]);
  }
}

function handleUser(text){
  const clean = text.trim();
  if(!clean) return;
  bubble(clean, 'user');

  switch(state.step){
    case 'greeting':
      if(/reserv/i.test(clean)) return choose('reservar');
      if(/men[uú]/i.test(clean)) return choose('menu');
      if(/horar|abre/i.test(clean)) return choose('horario');
      bubble('Puedo ayudarte con reservas, menú u horario 🙂');
      break;

    case 'reserva_nombre':
      state.reserva.nombre = clean;
      state.step = 'reserva_fecha';
      bubble('¡Encantado! 📆 Dime la fecha (formato <b>dd/mm</b>).');
      break;

    case 'reserva_fecha':
      if(!isFecha(clean)) return bubble('Formato de fecha no válido. Usa <b>dd/mm</b> (ej. 25/12).');
      state.reserva.fecha = clean;
      state.step = 'reserva_hora';
      bubble('⏰ ¿A qué hora? (formato <b>hh:mm</b>, ej. 21:00)');
      break;

    case 'reserva_hora':
      if(!isHora(clean)) return bubble('Formato de hora no válido. Usa <b>hh:mm</b> (ej. 21:00).');
      state.reserva.hora = clean;
      state.step = 'reserva_personas';
      bubble('👥 ¿Para cuántas personas? (número)');
      break;

    case 'reserva_personas':
      if(!isNum(clean)) return bubble('Indica un número (ej. 2, 4, 6…).');
      state.reserva.personas = clean;
      state.step = 'reserva_confirmar';
      const r = state.reserva;
      bubble(`Resumen: <b>${r.nombre}</b>, ${r.personas} personas, el <b>${r.fecha}</b> a las <b>${r.hora}</b>.<br>¿Confirmo la reserva?`);
      chips([
        { label: 'Confirmar ✅', onClick(){ confirmReserva(); } },
        { label: 'Cambiar hora', onClick(){ state.step='reserva_hora'; bubble('Dime la nueva hora (hh:mm)'); } },
      ]);
      break;

    default:
      bubble('Te escucho 👂 ¿Reserva, menú u horario?');
  }
}

function confirmReserva(){
  const r = state.reserva;
  bubble(`¡Listo! 🎉 Tu reserva para <b>${r.personas}</b> el <b>${r.fecha}</b> a las <b>${r.hora}</b> a nombre de <b>${r.nombre}</b> ha quedado registrada (DEMO).`);
  bubble('¿Quieres recibir el resumen por email o WhatsApp? (DEMO)');
  state.step = 'greeting';

  // --- Envío por EmailJS (opcional) ---
  // import('https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js').then(() => {
  //   emailjs.init('YOUR_PUBLIC_KEY');
  //   emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
  //     nombre: r.nombre,
  //     fecha: r.fecha,
  //     hora: r.hora,
  //     personas: r.personas,
  //   });
  // });
}

setTimeout(greet, 400);
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const val = input.value;
  input.value = '';
  handleUser(val);
});
