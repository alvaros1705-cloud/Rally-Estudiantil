/**
 * Rally Estudiantil 2.0 - Lógica para versión HTML estática
 * Temporizador, juegos (Memorama, Quiz, Pistas, Reto), calificación y redirección a resultados
 */
(function () {
  'use strict';

  var tiempoInicio = null;
  var intervalo = null;
  var segundos = 0;
  var params = new URLSearchParams(window.location.search);
  var tipo = params.get('tipo') || '';
  var categoriaId = params.get('categoria') || '';
  var equipo = '';
  try { equipo = localStorage.getItem('rally_equipo') || ''; } catch (e) {}

  var tiposValidos = ['memorama', 'quiz', 'pistas', 'reto'];
  if (!equipo || tiposValidos.indexOf(tipo) === -1) {
    window.location.href = 'seleccion-juego.html';
    return;
  }

  document.getElementById('nombre-equipo').textContent = equipo;

  function pad(n) { return n < 10 ? '0' + n : n; }
  var MEMORAMA_TIEMPO_MAX = 180; /* 3 minutos máximo; al cumplirse pierden */

  function actualizarTemporizador() {
    if (tiempoInicio === null) return;
    segundos = Math.floor((Date.now() - tiempoInicio) / 1000);
    var el = document.getElementById('temporizador');
    if (!el) return;
    if (tipo === 'memorama') {
      var restante = Math.max(0, MEMORAMA_TIEMPO_MAX - segundos);
      el.textContent = pad(Math.floor(restante/60)) + ':' + pad(restante%60);
      el.classList.toggle('urgente', restante <= 10 && restante > 0);
      if (restante <= 0 && typeof onMemoramaTiempoCumplido === 'function') onMemoramaTiempoCumplido();
    } else {
      el.textContent = pad(Math.floor(segundos/60)) + ':' + pad(segundos%60);
    }
  }
  function iniciarTemporizador() {
    if (tiempoInicio !== null) return;
    tiempoInicio = Date.now();
    intervalo = setInterval(actualizarTemporizador, 200);
    actualizarTemporizador();
  }
  function detenerTemporizador() { if (intervalo) clearInterval(intervalo); intervalo = null; actualizarTemporizador(); return segundos; }

  var tiempoMaxPorJuego = { memorama: MEMORAMA_TIEMPO_MAX, quiz: 180, pistas: 240, reto: 120 };
  function calcularCalificacion(tiempoSeg) {
    var max = tiempoMaxPorJuego[tipo] || 300;
    if (tiempoSeg <= 0) return 5.0;
    var ratio = Math.min(1, tiempoSeg / max);
    return Math.round(Math.max(1, Math.min(5, 5 - ratio * 4)) * 10) / 10;
  }
  function irAResultados() {
    var t = detenerTemporizador();
    var cal = calcularCalificacion(t);
    window.location.href = 'resultados.html?tiempo=' + t + '&calificacion=' + cal;
  }

  function escapeHtml(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  var datos = window.RALLY_DATOS || {};
  var cont = document.getElementById('contenedor-juego');
  var catNombre = document.getElementById('nombre-categoria');

  if (tipo === 'memorama') {
    var cat = null;
    if (datos.memorama) for (var i = 0; i < datos.memorama.length; i++) {
      if (datos.memorama[i].id === categoriaId) { cat = datos.memorama[i]; break; }
    }
    if (!cat) { window.location.href = 'seleccion-categoria.html?juego=memorama'; return; }
    catNombre.textContent = cat.nombre;
    var leyenda = document.getElementById('timer-leyenda');
    if (leyenda) leyenda.textContent = 'Límite: 3 minutos. Si se cumple el tiempo, se pierde.';
    var cartas = [];
    var parId = 0;
    cat.pares.forEach(function(p) {
      cartas.push({ parId: parId, texto: p[0], tipo: 'a' });
      cartas.push({ parId: parId, texto: p[1], tipo: 'b' });
      parId++;
    });
    for (var j = cartas.length - 1; j > 0; j--) {
      var r = Math.floor(Math.random() * (j + 1));
      var tmp = cartas[j]; cartas[j] = cartas[r]; cartas[r] = tmp;
    }
    var grid = document.createElement('div');
    grid.className = 'memorama-grid';
    grid.id = 'memorama-grid';
    var totalPares = parId;
    var volteadas = [];
    var emparejados = 0;
    var juegoTerminado = false;

    function onMemoramaTiempoCumplido() {
      if (juegoTerminado) return;
      juegoTerminado = true;
      detenerTemporizador();
      var msg = document.createElement('div');
      msg.className = 'memorama-mensaje-final';
      msg.innerHTML = '<p class="memorama-tiempo-cumplido">⏱ Tiempo cumplido (3 min). No alcanzaste a completar todas las parejas.</p><p><button type="button" class="btn-rally" id="btn-ver-resultado-perdido">Ver resultado</button></p>';
      cont.appendChild(msg);
      document.getElementById('btn-ver-resultado-perdido').addEventListener('click', function() {
        window.location.href = 'resultados.html?tiempo=180&calificacion=1.0&perdido=1';
      });
    }
    window.onMemoramaTiempoCumplido = onMemoramaTiempoCumplido;

    function onMemoramaCompletado() {
      if (juegoTerminado) return;
      juegoTerminado = true;
      detenerTemporizador();
      var msg = document.createElement('div');
      msg.className = 'memorama-mensaje-final memorama-completado';
      msg.innerHTML = '<p class="memorama-completado-texto">¡Completado! Todas las parejas encontradas.</p><p class="memorama-completado-btn"><button type="button" class="btn-rally" id="btn-terminado">Terminado — Ver resultado</button></p>';
      cont.insertBefore(msg, grid);
      document.getElementById('btn-terminado').addEventListener('click', irAResultados);
    }

    cartas.forEach(function(carta, idx) {
      var div = document.createElement('div');
      div.className = 'carta-memorama';
      div.dataset.parId = carta.parId;
      div.dataset.numero = (idx + 1);
      div.innerHTML = '<span class="cara reves">' + (idx + 1) + '</span><span class="cara frente" style="display:none;">' + escapeHtml(carta.texto) + '</span>';
      div.addEventListener('click', function() {
        if (div.classList.contains('volteada') || div.classList.contains('emparejado') || volteadas.length === 2 || juegoTerminado) return;
        div.classList.add('volteada');
        div.querySelector('.reves').style.display = 'none';
        div.querySelector('.frente').style.display = 'flex';
        volteadas.push({ el: div, parId: carta.parId });
        if (volteadas.length === 2) {
          if (volteadas[0].parId === volteadas[1].parId) {
            volteadas[0].el.classList.add('emparejado');
            volteadas[1].el.classList.add('emparejado');
            emparejados++;
            volteadas = [];
            if (emparejados >= totalPares) setTimeout(onMemoramaCompletado, 400);
          } else {
            setTimeout(function() {
              volteadas[0].el.classList.remove('volteada');
              volteadas[0].el.querySelector('.reves').style.display = 'flex';
              volteadas[0].el.querySelector('.frente').style.display = 'none';
              volteadas[1].el.classList.remove('volteada');
              volteadas[1].el.querySelector('.reves').style.display = 'flex';
              volteadas[1].el.querySelector('.frente').style.display = 'none';
              volteadas = [];
            }, 800);
          }
        }
      });
      grid.appendChild(div);
    });
    cont.appendChild(grid);
    iniciarTemporizador();
  }

  if (tipo === 'quiz') {
    catNombre.textContent = 'Quiz';
    var leyendaQuiz = document.getElementById('timer-leyenda');
    if (leyendaQuiz) leyendaQuiz.textContent = 'Límite: 3 minutos por pregunta. Si se cumple, esa pregunta obtiene 0.0 y se pasa a la siguiente.';
    var preguntas = (datos.quiz || []).slice();
    for (var p = preguntas.length - 1; p > 0; p--) { var rq = Math.floor(Math.random() * (p + 1)); var tq = preguntas[p]; preguntas[p] = preguntas[rq]; preguntas[rq] = tq; }
    preguntas = preguntas.slice(0, 10);
    var indice = 0;
    var puntajesQuiz = [];
    var tiempoTotalQuiz = 0;
    var tiempoInicioPreg = null;
    var intervaloQuiz = null;
    var TIEMPO_MAX = 180;
    var TIEMPO_REF = 60;
    function puntajePorTiempo(seg) {
      if (seg <= 0) return 5.0;
      var ratio = Math.min(1, seg / TIEMPO_REF);
      return Math.round(Math.max(1, Math.min(5, 5 - ratio * 4)) * 10) / 10;
    }
    var wrapper = document.createElement('div');
    wrapper.className = 'quiz-contenedor-flex';
    var panelIzq = document.createElement('div');
    panelIzq.className = 'reto-panel-izq';
    var panel = document.createElement('div');
    panel.className = 'panel-rally';
    panel.innerHTML = '<p class="quiz-pregunta" id="quiz-pregunta"></p><div class="quiz-opciones" id="quiz-opciones"></div>';
    panelIzq.appendChild(panel);
    var panelDer = document.createElement('div');
    panelDer.className = 'reto-panel-der';
    panelDer.innerHTML = '<div class="reto-puntajes-panel"><h3>Puntajes obtenidos</h3><ul class="reto-puntajes-lista" id="quiz-puntajes-lista"></ul><p class="reto-tiempo-restante" id="quiz-tiempo-restante"></p></div>';
    wrapper.appendChild(panelIzq);
    wrapper.appendChild(panelDer);
    cont.appendChild(wrapper);
    var preguntaEl = document.getElementById('quiz-pregunta');
    var opcionesEl = document.getElementById('quiz-opciones');
    var puntajesListaEl = document.getElementById('quiz-puntajes-lista');
    var tiempoRestanteEl = document.getElementById('quiz-tiempo-restante');
    var temporizadorEl = document.getElementById('temporizador');
    function agregarPuntajeALista(n, p, esTimeout, esIncorrecto) {
      var li = document.createElement('li');
      if (esTimeout) li.className = 'tiempo-cumplido';
      if (esIncorrecto) li.className = 'incorrecto';
      li.innerHTML = '<span class="numero">Pregunta ' + n + ':</span> <span class="puntaje">' + p.toFixed(1) + '</span>';
      if (esTimeout) li.title = 'Tiempo cumplido (3 min)';
      if (esIncorrecto) li.title = 'Respuesta incorrecta';
      puntajesListaEl.appendChild(li);
    }
    function pasarASiguienteConCero() {
      if (intervaloQuiz) { clearInterval(intervaloQuiz); intervaloQuiz = null; }
      tiempoTotalQuiz += TIEMPO_MAX;
      puntajesQuiz.push(0);
      agregarPuntajeALista(puntajesQuiz.length, 0, true, false);
      indice++;
      setTimeout(mostrarPregunta, 600);
    }
    function evaluarRespuesta(valorSeleccionado) {
      if (intervaloQuiz) { clearInterval(intervaloQuiz); intervaloQuiz = null; }
      var q = preguntas[indice];
      var seg = tiempoInicioPreg ? (Date.now() - tiempoInicioPreg) / 1000 : 0;
      tiempoTotalQuiz += seg;
      var correcta = (q.correcta !== undefined && parseInt(valorSeleccionado, 10) === q.correcta);
      if (correcta) {
        var puntaje = puntajePorTiempo(seg);
        puntajesQuiz.push(puntaje);
        agregarPuntajeALista(puntajesQuiz.length, puntaje, false, false);
      } else {
        puntajesQuiz.push(0);
        agregarPuntajeALista(puntajesQuiz.length, 0, false, true);
      }
      indice++;
      setTimeout(mostrarPregunta, 600);
    }
    function mostrarPregunta() {
      if (intervaloQuiz) { clearInterval(intervaloQuiz); intervaloQuiz = null; }
      if (temporizadorEl) temporizadorEl.classList.remove('urgente');
      if (indice >= preguntas.length) {
        var promedio = puntajesQuiz.length ? puntajesQuiz.reduce(function(a,b){return a+b;},0) / puntajesQuiz.length : 0;
        promedio = Math.round(Math.max(0, Math.min(5, promedio)) * 10) / 10;
        window.location.href = 'resultados.html?tiempo=' + Math.round(tiempoTotalQuiz) + '&calificacion=' + promedio;
        return;
      }
      tiempoInicioPreg = Date.now();
      intervaloQuiz = setInterval(function() {
        var seg = Math.floor((Date.now() - tiempoInicioPreg) / 1000);
        var restante = Math.max(0, TIEMPO_MAX - seg);
        if (temporizadorEl) {
          temporizadorEl.textContent = pad(Math.floor(restante/60)) + ':' + pad(restante%60);
          temporizadorEl.classList.toggle('urgente', restante <= 10 && restante > 0);
        }
        if (seg >= TIEMPO_MAX) pasarASiguienteConCero();
        else if (tiempoRestanteEl) tiempoRestanteEl.textContent = 'Tiempo: ' + pad(Math.floor(restante/60)) + ':' + pad(restante%60) + ' / 3:00';
      }, 200);
      if (temporizadorEl) temporizadorEl.textContent = '03:00';
      if (tiempoRestanteEl) tiempoRestanteEl.textContent = 'Tiempo: 3:00 / 3:00';
      var q = preguntas[indice];
      preguntaEl.textContent = (indice + 1) + '. ' + q.p;
      opcionesEl.innerHTML = '';
      q.opciones.forEach(function(op, i) {
        var label = document.createElement('label');
        var radio = document.createElement('input');
        radio.type = 'radio'; radio.name = 'quiz_opcion'; radio.value = i;
        label.appendChild(radio);
        label.appendChild(document.createElement('span')).textContent = op;
        opcionesEl.appendChild(label);
      });
    }
    opcionesEl.addEventListener('change', function(ev) {
      if (ev.target.type === 'radio' && ev.target.value !== undefined && ev.target.value !== '') evaluarRespuesta(ev.target.value);
    });
    mostrarPregunta();
  }

  if (tipo === 'pistas') {
    catNombre.textContent = 'Pistas';
    var leyendaPistas = document.getElementById('timer-leyenda');
    if (leyendaPistas) leyendaPistas.textContent = 'Límite: 5 minutos total para todo el juego. Pedir pista resta 40% del puntaje. Saltar = 0.0.';
    var pistas = (datos.pistas || []).slice();
    for (var sp = pistas.length - 1; sp > 0; sp--) {
      var rp = Math.floor(Math.random() * (sp + 1));
      var tp = pistas[sp]; pistas[sp] = pistas[rp]; pistas[rp] = tp;
    }
    pistas = pistas.slice(0, 10);
    var idx = 0;
    var usadoPista = false;
    var puntajesPistas = [];
    var tiempoTotalPistas = 0;
    var tiempoInicioPista = null;
    var tiempoRestanteTotal = 300;
    var intervaloPistas = null;
    var TIEMPO_TOTAL_JUEGO = 300;
    var TIEMPO_REF = 60;
    function puntajePorTiempo(seg) {
      if (seg <= 0) return 5.0;
      var ratio = Math.min(1, seg / TIEMPO_REF);
      return Math.round(Math.max(1, Math.min(5, 5 - ratio * 4)) * 10) / 10;
    }
    var wrapper = document.createElement('div');
    wrapper.className = 'pistas-contenedor-flex';
    var panelIzq = document.createElement('div');
    panelIzq.className = 'reto-panel-izq';
    var panel = document.createElement('div');
    panel.className = 'panel-rally';
    panel.innerHTML = '<p class="pista-texto" id="pista-texto"></p><p class="pista-indicio" id="pista-indicio" style="display:none;margin-top:12px;padding:12px;background:rgba(0,80,120,0.4);border-left:4px solid var(--secondary);border-radius:0 8px 8px 0;font-size:1rem;color:var(--secondary);"></p><div class="text-center"><input type="text" class="pista-input" id="pista-respuesta" placeholder="Escribe tu respuesta..." autocomplete="off"><p class="mt-2"><button type="button" class="btn-rally" id="pista-verificar">Verificar</button> <button type="button" class="btn-rally outline" id="pista-pedir-pista" style="margin-left:8px;">Pedir pista (-40%)</button> <button type="button" class="btn-rally outline" id="pista-saltar">Saltar (0.0)</button></p></div>';
    panelIzq.appendChild(panel);
    var panelDer = document.createElement('div');
    panelDer.className = 'reto-panel-der';
    panelDer.innerHTML = '<div class="reto-puntajes-panel"><h3>Puntajes obtenidos</h3><ul class="reto-puntajes-lista" id="pistas-puntajes-lista"></ul><p class="reto-tiempo-restante" id="pistas-tiempo-restante"></p></div>';
    wrapper.appendChild(panelIzq);
    wrapper.appendChild(panelDer);
    cont.appendChild(wrapper);
    var textoEl = document.getElementById('pista-texto');
    var indicioEl = document.getElementById('pista-indicio');
    var inputEl = document.getElementById('pista-respuesta');
    var btn = document.getElementById('pista-verificar');
    var btnPista = document.getElementById('pista-pedir-pista');
    var btnSaltar = document.getElementById('pista-saltar');
    var puntajesListaEl = document.getElementById('pistas-puntajes-lista');
    var tiempoRestanteEl = document.getElementById('pistas-tiempo-restante');
    var temporizadorEl = document.getElementById('temporizador');
    var juegoPistasTerminado = false;
    function normalizar(s) { return (s||'').toLowerCase().replace(/\s+/g,' ').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
    function agregarPuntajeALista(n, p, esTimeout) {
      var li = document.createElement('li');
      if (esTimeout) li.className = 'tiempo-cumplido';
      li.innerHTML = '<span class="numero">Acertijo ' + n + ':</span> <span class="puntaje">' + p.toFixed(1) + '</span>';
      if (esTimeout) li.title = 'Tiempo cumplido';
      puntajesListaEl.appendChild(li);
    }
    function actualizarPromedio() {
      if (puntajesPistas.length > 0 && tiempoRestanteEl) {
        var promSeg = Math.round((tiempoTotalPistas / puntajesPistas.length) * 10) / 10;
        tiempoRestanteEl.textContent = 'Promedio por pregunta: ' + promSeg + ' seg';
      } else if (tiempoRestanteEl) {
        tiempoRestanteEl.textContent = 'Promedio por pregunta: —';
      }
    }
    function terminarJuegoPistas() {
      if (juegoPistasTerminado) return;
      juegoPistasTerminado = true;
      if (intervaloPistas) { clearInterval(intervaloPistas); intervaloPistas = null; }
      while (idx < pistas.length) {
        puntajesPistas.push(0);
        agregarPuntajeALista(puntajesPistas.length, 0, true);
        idx++;
      }
      var promedio = puntajesPistas.length ? puntajesPistas.reduce(function(a,b){return a+b;},0) / puntajesPistas.length : 0;
      promedio = Math.round(Math.max(0, Math.min(5, promedio)) * 10) / 10;
      window.location.href = 'resultados.html?tiempo=' + Math.round(tiempoTotalPistas) + '&calificacion=' + promedio;
    }
    function mostrarPista() {
      if (btnPista) btnPista.disabled = false;
      if (idx >= pistas.length) {
        var promedio = puntajesPistas.length ? puntajesPistas.reduce(function(a,b){return a+b;},0) / puntajesPistas.length : 0;
        promedio = Math.round(Math.max(0, Math.min(5, promedio)) * 10) / 10;
        window.location.href = 'resultados.html?tiempo=' + Math.round(tiempoTotalPistas) + '&calificacion=' + promedio;
        return;
      }
      tiempoInicioPista = Date.now();
      usadoPista = false;
      indicioEl.style.display = 'none';
      indicioEl.textContent = '';
      if (!intervaloPistas) {
        window._pistasInicioJuego = Date.now();
        intervaloPistas = setInterval(function() {
          if (juegoPistasTerminado) return;
          tiempoRestanteTotal = Math.max(0, TIEMPO_TOTAL_JUEGO - Math.floor((Date.now() - window._pistasInicioJuego) / 1000));
          if (temporizadorEl) {
            temporizadorEl.textContent = pad(Math.floor(tiempoRestanteTotal/60)) + ':' + pad(tiempoRestanteTotal%60);
            temporizadorEl.classList.toggle('urgente', tiempoRestanteTotal <= 10 && tiempoRestanteTotal > 0);
          }
          actualizarPromedio();
          if (tiempoRestanteTotal <= 0) terminarJuegoPistas();
        }, 200);
      }
      tiempoRestanteTotal = Math.max(0, TIEMPO_TOTAL_JUEGO - Math.floor((Date.now() - window._pistasInicioJuego) / 1000));
      if (temporizadorEl) temporizadorEl.textContent = pad(Math.floor(tiempoRestanteTotal/60)) + ':' + pad(tiempoRestanteTotal%60);
      actualizarPromedio();
      textoEl.textContent = pistas[idx].pista;
      inputEl.value = '';
      inputEl.focus();
    }
    function saltarPregunta() {
      puntajesPistas.push(0);
      agregarPuntajeALista(puntajesPistas.length, 0, true);
      idx++;
      setTimeout(mostrarPista, 600);
    }
    btnSaltar.addEventListener('click', saltarPregunta);
    btnPista.addEventListener('click', function() {
      if (usadoPista) return;
      usadoPista = true;
      indicioEl.textContent = '💡 Indicio: ' + (pistas[idx].indicio || 'No hay indicio disponible.');
      indicioEl.style.display = 'block';
      btnPista.disabled = true;
    });
    btn.addEventListener('click', function() {
      if (normalizar(inputEl.value) === normalizar(pistas[idx].respuesta)) {
        var seg = tiempoInicioPista ? (Date.now() - tiempoInicioPista) / 1000 : 0;
        tiempoTotalPistas += seg;
        var puntaje = puntajePorTiempo(seg);
        if (usadoPista) puntaje = Math.round(puntaje * 0.6 * 10) / 10;
        puntajesPistas.push(puntaje);
        agregarPuntajeALista(puntajesPistas.length, puntaje, false);
        idx++;
        setTimeout(mostrarPista, 600);
      } else { inputEl.style.borderColor = '#ff6b6b'; setTimeout(function() { inputEl.style.borderColor = ''; }, 1000); }
    });
    inputEl.addEventListener('keydown', function(e) { if (e.key === 'Enter') btn.click(); });
    mostrarPista();
  }

  if (tipo === 'reto') {
    catNombre.textContent = 'Reto';
    var leyendaReto = document.getElementById('timer-leyenda');
    if (leyendaReto) leyendaReto.textContent = 'Límite: 3 minutos por prueba. Si se cumple, esa prueba obtiene 0.0 y se pasa a la siguiente.';
    var retos = (datos.reto || []).filter(function(r) { return r.items && r.orden_correcto; });
    for (var sr = retos.length - 1; sr > 0; sr--) {
      var rr = Math.floor(Math.random() * (sr + 1));
      var tr = retos[sr]; retos[sr] = retos[rr]; retos[rr] = tr;
    }
    var retoIdx = 0;
    var puntajesRetos = [];
    var tiempoTotalRetos = 0;
    var tiempoInicioReto = null;
    var intervaloReto = null;   /* intervalo del límite 3 min por prueba */
    var TIEMPO_MAX_PRUEBA = 180; /* 3 minutos por prueba */
    var TIEMPO_REF_RETO = 60;
    function puntajePorTiempo(segundos) {
      if (segundos <= 0) return 5.0;
      var ratio = Math.min(1, segundos / TIEMPO_REF_RETO);
      return Math.round(Math.max(1, Math.min(5, 5 - ratio * 4)) * 10) / 10;
    }
    var wrapper = document.createElement('div');
    wrapper.className = 'reto-contenedor-flex';
    var panelIzq = document.createElement('div');
    panelIzq.className = 'reto-panel-izq';
    var panel = document.createElement('div');
    panel.className = 'panel-rally';
    panel.innerHTML = '<h2 id="reto-titulo"></h2><ul class="reto-lista" id="reto-lista"></ul><p class="text-center mt-2"><button type="button" class="btn-rally" id="reto-verificar">Verificar orden</button></p>';
    panelIzq.appendChild(panel);
    var panelDer = document.createElement('div');
    panelDer.className = 'reto-panel-der';
    panelDer.innerHTML = '<div class="reto-puntajes-panel"><h3>Puntajes obtenidos</h3><ul class="reto-puntajes-lista" id="reto-puntajes-lista"></ul><p class="reto-tiempo-restante" id="reto-tiempo-restante"></p></div>';
    wrapper.appendChild(panelIzq);
    wrapper.appendChild(panelDer);
    cont.appendChild(wrapper);
    var tituloEl = document.getElementById('reto-titulo');
    var listaEl = document.getElementById('reto-lista');
    var btnReto = document.getElementById('reto-verificar');
    var puntajesListaEl = document.getElementById('reto-puntajes-lista');
    var tiempoRestanteEl = document.getElementById('reto-tiempo-restante');
    var temporizadorEl = document.getElementById('temporizador');
    function agregarPuntajeALista(numeroPrueba, puntaje, esTiempoCumplido) {
      var li = document.createElement('li');
      if (esTiempoCumplido) li.className = 'tiempo-cumplido';
      li.innerHTML = '<span class="numero">Prueba ' + numeroPrueba + ':</span> <span class="puntaje">' + puntaje.toFixed(1) + '</span>';
      if (esTiempoCumplido) li.title = 'Tiempo cumplido (3 min)';
      puntajesListaEl.appendChild(li);
    }
    function pasarASiguienteConCero() {
      if (intervaloReto) { clearInterval(intervaloReto); intervaloReto = null; }
      tiempoTotalRetos += TIEMPO_MAX_PRUEBA;
      puntajesRetos.push(0);
      agregarPuntajeALista(puntajesRetos.length, 0, true);
      retoIdx++;
      setTimeout(mostrarReto, 600);
    }
    function mostrarReto() {
      if (intervaloReto) { clearInterval(intervaloReto); intervaloReto = null; }
      if (temporizadorEl) temporizadorEl.classList.remove('urgente');
      if (retoIdx >= retos.length) {
        var promedio = puntajesRetos.length ? puntajesRetos.reduce(function(a, b) { return a + b; }, 0) / puntajesRetos.length : 0;
        promedio = Math.round(Math.max(0, Math.min(5, promedio)) * 10) / 10;
        window.location.href = 'resultados.html?tiempo=' + Math.round(tiempoTotalRetos) + '&calificacion=' + promedio;
        return;
      }
      tiempoInicioReto = Date.now();
      intervaloReto = setInterval(function() {
        var seg = Math.floor((Date.now() - tiempoInicioReto) / 1000);
        var restante = Math.max(0, TIEMPO_MAX_PRUEBA - seg);
        if (temporizadorEl) {
          temporizadorEl.textContent = pad(Math.floor(restante/60)) + ':' + pad(restante%60);
          temporizadorEl.classList.toggle('urgente', restante <= 10 && restante > 0);
        }
        if (seg >= TIEMPO_MAX_PRUEBA) pasarASiguienteConCero();
        else if (tiempoRestanteEl) tiempoRestanteEl.textContent = 'Tiempo esta prueba: ' + pad(Math.floor(restante/60)) + ':' + pad(restante%60) + ' / 3:00';
      }, 200);
      if (temporizadorEl) temporizadorEl.textContent = '03:00';
      if (tiempoRestanteEl) tiempoRestanteEl.textContent = 'Tiempo esta prueba: 3:00 / 3:00';
      var r = retos[retoIdx];
      tituloEl.textContent = r.titulo || 'Ordena los elementos';
      listaEl.innerHTML = '';
      var items = (r.items || []).slice();
      var ordenCorrecto = r.orden_correcto || items.map(function(_, i) { return i; });
      var shuffled = items.slice().sort(function() { return Math.random() - 0.5; });
      shuffled.forEach(function(texto) {
        var li = document.createElement('li');
        li.textContent = texto;
        li.draggable = true;
        listaEl.appendChild(li);
      });
      window._rallyOrdenCorrecto = ordenCorrecto.map(function(i) { return items[i]; });
      listaEl.querySelectorAll('li').forEach(function(li) {
        li.addEventListener('dragstart', function(e) { e.dataTransfer.setData('text/plain', ''); li.classList.add('dragging'); });
        li.addEventListener('dragend', function() { li.classList.remove('dragging'); });
      });
      listaEl.addEventListener('dragover', function(e) {
        e.preventDefault();
        var drag = listaEl.querySelector('.dragging');
        if (!drag) return;
        var after = null;
        listaEl.querySelectorAll('li:not(.dragging)').forEach(function(el) {
          var box = el.getBoundingClientRect();
          if (e.clientY < box.top + box.height/2) { after = el; }
        });
        if (after) listaEl.insertBefore(drag, after); else listaEl.appendChild(drag);
      });
    }
    btnReto.addEventListener('click', function() {
      var correctOrder = window._rallyOrdenCorrecto || [];
      var lis = listaEl.querySelectorAll('li');
      var current = [].map.call(lis, function(li) { return li.textContent.trim(); });
      var ok = correctOrder.length === current.length && correctOrder.every(function(v, i) { return v === current[i]; });
      if (ok) {
        if (intervaloReto) { clearInterval(intervaloReto); intervaloReto = null; }
        var segundosReto = tiempoInicioReto ? (Date.now() - tiempoInicioReto) / 1000 : 0;
        tiempoTotalRetos += segundosReto;
        var puntaje = puntajePorTiempo(segundosReto);
        puntajesRetos.push(puntaje);
        agregarPuntajeALista(puntajesRetos.length, puntaje, false);
        lis.forEach(function(li) { li.classList.add('correcto'); });
        retoIdx++;
        setTimeout(mostrarReto, 800);
      }
    });
    mostrarReto();
  }
})();
