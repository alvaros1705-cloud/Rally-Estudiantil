/**
 * Rally Estudiantil 2.0 - Lógica HTML estática
 * Temporizador global por juego: máximo 3:00 (180000 ms), contador mm:ss en vivo
 */
(function () {
  'use strict';

  var RT = window.RALLY_TIEMPO;
  if (!RT) {
    console.error('rally-tiempo.js debe cargarse antes de rally-html.js');
    return;
  }

  var TIEMPO_LIMITE_MS = 180000;

  function mezclar(array) {
    return array.sort(function () { return Math.random() - 0.5; });
  }

  /** Partida con al menos minTematicas categorías distintas (si hay datos). */
  function seleccionarPartidaPorTematicas(originales, cantidad, minTematicas, categoriaDe) {
    var norm = [];
    for (var i = 0; i < originales.length; i++) {
      var o = originales[i];
      if (!o) continue;
      var copia = {};
      for (var k in o) {
        if (Object.prototype.hasOwnProperty.call(o, k)) copia[k] = o[k];
      }
      copia._rallyIdx = i;
      copia.categoria = categoriaDe(o);
      norm.push(copia);
    }
    if (norm.length === 0) return [];
    var cupo = Math.min(cantidad, norm.length);
    var porCat = {};
    for (var j = 0; j < norm.length; j++) {
      var c = norm[j].categoria;
      if (!porCat[c]) porCat[c] = [];
      porCat[c].push(norm[j]);
    }
    var numCats = Object.keys(porCat).length;
    minTematicas = Math.max(1, Math.min(minTematicas || 3, numCats));
    var cats = Object.keys(porCat);
    mezclar(cats);
    var usadosIdx = {};
    var elegidas = [];
    function marcar(q) {
      if (usadosIdx[q._rallyIdx]) return false;
      usadosIdx[q._rallyIdx] = true;
      elegidas.push(q);
      return true;
    }
    var ci = 0;
    while (elegidas.length < minTematicas && ci < cats.length) {
      var bucket = porCat[cats[ci]];
      mezclar(bucket);
      if (bucket.length) marcar(bucket[0]);
      ci++;
    }
    var resto = [];
    for (var r = 0; r < norm.length; r++) {
      if (!usadosIdx[norm[r]._rallyIdx]) resto.push(norm[r]);
    }
    mezclar(resto);
    while (elegidas.length < cupo && resto.length) {
      marcar(resto.shift());
    }
    if (elegidas.length < cupo) {
      mezclar(norm);
      for (var u = 0; u < norm.length && elegidas.length < cupo; u++) {
        marcar(norm[u]);
      }
    }
    mezclar(elegidas);
    for (var e = 0; e < elegidas.length; e++) {
      delete elegidas[e]._rallyIdx;
    }
    return elegidas;
  }

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

  function actualizarLeyendaLimite(ms) {
    var ley = document.getElementById('timer-leyenda');
    if (ley) {
      ley.textContent = 'Límite: 3:00 — Restante: ' + RT.formatearTiempo(Math.max(0, TIEMPO_LIMITE_MS - ms));
    }
  }

  function fijarLeyendaTemporal(texto) {
    var ley = document.getElementById('timer-leyenda');
    if (ley) ley.textContent = texto || '';
  }

  /** Partida superada: cronómetro ya detenido; tiempo mostrado en verde. */
  function aplicarTemporizadorExito(msTranscurrido) {
    var el = document.getElementById('temporizador');
    if (el) {
      el.classList.remove('urgente');
      el.classList.remove('temporizador-limite');
      el.classList.add('temporizador-exito');
      el.textContent = RT.formatearTiempo(msTranscurrido);
    }
    fijarLeyendaTemporal('Completado — ' + RT.formatearTiempo(msTranscurrido));
  }

  /** Límite 3:00 alcanzado sin completar: 03:00 en rojo. */
  function aplicarTemporizadorLimiteAlcanzado() {
    var el = document.getElementById('temporizador');
    if (el) {
      el.classList.remove('urgente');
      el.classList.remove('temporizador-exito');
      el.classList.add('temporizador-limite');
      el.textContent = RT.formatearTiempo(TIEMPO_LIMITE_MS);
    }
    fijarLeyendaTemporal('Tiempo agotado (3:00)');
  }

  function irAResultados(ms, perdido, maximo) {
    var q = 'tiempo_ms=' + Math.round(ms);
    if (perdido) q += '&perdido=1';
    if (maximo) q += '&maximo=1';
    window.location.href = 'resultados.html?' + q;
  }

  /**
   * Aviso global al terminar (éxito o tiempo): bloquea interacción unos segundos;
   * el temporizador permanece visible encima del overlay (zona superior sin cubrir).
   */
  function mostrarAvisoEstacionFinal() {
    if (document.querySelector('.rally-estacion-final-overlay')) return;
    var delayMs = 5000 + Math.floor(Math.random() * 3001);
    var overlay = document.createElement('div');
    overlay.className = 'rally-estacion-final-overlay';
    overlay.setAttribute('role', 'alert');
    overlay.setAttribute('aria-live', 'assertive');
    overlay.innerHTML = '<div class="rally-estacion-final-inner"><p class="rally-estacion-final-texto">Juego finalizado. Dirígete a la siguiente estación.</p></div>';
    document.body.appendChild(overlay);
    setTimeout(function () {
      overlay.classList.add('rally-estacion-final-salida');
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 480);
    }, delayMs);
  }

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
    var cartas = [];
    var parId = 0;
    cat.pares.forEach(function (p) {
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
    var limiteDisparado = false;

    function escapeHtml(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

    var cronometro = RT.crearCronometroDisplay('temporizador', function (ms) {
      if (juegoTerminado || limiteDisparado) return;
      actualizarLeyendaLimite(ms);
      if (ms >= TIEMPO_LIMITE_MS) {
        limiteDisparado = true;
        onMemoramaTiempoMaximo();
      }
    });

    function onMemoramaTiempoMaximo() {
      if (juegoTerminado) return;
      juegoTerminado = true;
      cronometro.stop();
      aplicarTemporizadorLimiteAlcanzado();
      var ms = TIEMPO_LIMITE_MS;
      RT.guardarTiempoReto('memorama', ms);
      var msg = document.createElement('div');
      msg.className = 'memorama-mensaje-final';
      msg.innerHTML = '<p style="color:#ff6b6b;font-weight:700;font-size:1.2rem;">Tiempo finalizado, reto no cumplido!</p><p><button type="button" class="btn-rally" id="btn-ver-resultado-limite">Ver resultado</button></p>';
      cont.appendChild(msg);
      document.getElementById('btn-ver-resultado-limite').addEventListener('click', function () {
        irAResultados(ms, true, true);
      });
    }

    function onMemoramaCompletado() {
      if (juegoTerminado) return;
      juegoTerminado = true;
      var ms = cronometro.stop();
      aplicarTemporizadorExito(ms);
      RT.guardarTiempoReto('memorama', ms);
      var msg = document.createElement('div');
      msg.className = 'memorama-mensaje-final memorama-completado';
      msg.innerHTML = '<p class="memorama-completado-texto">¡Reto completado exitosamente!</p><p class="memorama-completado-btn"><button type="button" class="btn-rally" id="btn-terminado">Terminado — Ver resultado</button></p>';
      cont.insertBefore(msg, grid);
      document.getElementById('btn-terminado').addEventListener('click', function () {
        irAResultados(ms, false, false);
      });
    }

    cartas.forEach(function (carta, idx) {
      var div = document.createElement('div');
      div.className = 'carta-memorama';
      div.dataset.parId = carta.parId;
      div.dataset.numero = (idx + 1);
      div.innerHTML = '<span class="cara reves">' + (idx + 1) + '</span><span class="cara frente" style="display:none;">' + escapeHtml(carta.texto) + '</span>';
      div.addEventListener('click', function () {
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
            setTimeout(function () {
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
    actualizarLeyendaLimite(0);
    cronometro.start();
  }

  if (tipo === 'quiz') {
    catNombre.textContent = 'Quiz';
    var pool = seleccionarPartidaPorTematicas(datos.quiz || [], 10, 3, function (item) {
      return (item && item.categoria) ? item.categoria : 'General';
    }).filter(function (q) { return q && q.p && q.opciones && q.opciones.length; });
    function envolverRonda(arrQ) {
      return arrQ.map(function (q) { return { q: q, acierto: null }; });
    }
    var ronda = envolverRonda(pool);
    var totalOriginales = pool.length;
    var numeroRonda = 1;
    var indice = 0;
    var tiempoInicioPreg = null;
    var juegoTerminado = false;
    var limiteDisparado = false;
    var juegoQuizIniciado = false;
    var esperandoAvance = false;

    var cronometroJuego = RT.crearCronometroDisplay('temporizador', function (ms) {
      if (juegoTerminado || limiteDisparado) return;
      actualizarLeyendaLimite(ms);
      var el = document.getElementById('temporizador');
      if (el) el.classList.toggle('urgente', TIEMPO_LIMITE_MS - ms <= 10000 && TIEMPO_LIMITE_MS - ms > 0);
      if (ms >= TIEMPO_LIMITE_MS) {
        limiteDisparado = true;
        terminarQuizPorLimite();
      }
    });

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
    panelDer.innerHTML = '<div class="reto-tiempos-panel"><h3>Progreso del quiz</h3><ul class="reto-tiempos-lista" id="quiz-tiempos-lista"></ul><p class="reto-tiempo-restante" id="quiz-tiempo-restante"></p></div>';
    wrapper.appendChild(panelIzq);
    wrapper.appendChild(panelDer);
    cont.appendChild(wrapper);
    var preguntaEl = document.getElementById('quiz-pregunta');
    var opcionesEl = document.getElementById('quiz-opciones');
    var tiemposListaEl = document.getElementById('quiz-tiempos-lista');
    var tiempoRestanteEl = document.getElementById('quiz-tiempo-restante');
    var temporizadorEl = document.getElementById('temporizador');

    function bloquearPanelQuiz() {
      panel.style.pointerEvents = 'none';
      panel.style.opacity = '0.65';
      panelDer.style.pointerEvents = 'none';
    }

    function logRondaResumen(correctas, total) {
      var li = document.createElement('li');
      li.innerHTML = '<span class="numero">Ronda ' + numeroRonda + ':</span> <span class="valor-tiempo">' + correctas + ' / ' + total + ' bien</span>';
      tiemposListaEl.appendChild(li);
    }

    function finalizarJuegoExitoso() {
      if (juegoTerminado) return;
      juegoTerminado = true;
      var msTotal = cronometroJuego.stop();
      aplicarTemporizadorExito(msTotal);
      RT.guardarTiempoReto('quiz', msTotal);
      bloquearPanelQuiz();
      var msg = document.createElement('div');
      msg.className = 'memorama-mensaje-final memorama-completado';
      msg.style.marginTop = '16px';
      msg.innerHTML = '<p class="memorama-completado-texto">¡Reto completado exitosamente!</p><p class="quiz-tiempo-final-exito" style="font-size:1.35rem;color:var(--secondary);margin:12px 0;">Tiempo invertido: ' + RT.formatearTiempo(msTotal) + '</p><p><a href="seleccion-juego.html" class="btn-rally">Elegir otro juego</a></p>';
      cont.appendChild(msg);
      mostrarAvisoEstacionFinal();
    }

    function terminarQuizPorLimite() {
      if (juegoTerminado) return;
      juegoTerminado = true;
      cronometroJuego.stop();
      aplicarTemporizadorLimiteAlcanzado();
      var ms = TIEMPO_LIMITE_MS;
      RT.guardarTiempoReto('quiz', ms);
      bloquearPanelQuiz();
      var msg = document.createElement('div');
      msg.className = 'memorama-mensaje-final';
      msg.style.marginTop = '16px';
      msg.innerHTML = '<p style="color:#ff6b6b;font-weight:700;font-size:1.25rem;">Tiempo finalizado, reto no cumplido!</p><p class="mt-2"><a href="seleccion-juego.html" class="btn-rally outline">Volver a juegos</a></p>';
      cont.appendChild(msg);
      mostrarAvisoEstacionFinal();
    }

    function cerrarRondaYContinuar() {
      if (juegoTerminado) return;
      var total = ronda.length;
      var correctas = ronda.filter(function (x) { return x.acierto === true; }).length;
      logRondaResumen(correctas, total);
      var fallos = ronda.filter(function (x) { return x.acierto !== true; });
      if (fallos.length === 0) {
        finalizarJuegoExitoso();
        return;
      }
      numeroRonda++;
      ronda = fallos.map(function (x) { return { q: x.q, acierto: null }; });
      indice = 0;
      mostrarPregunta();
    }

    function evaluarRespuesta(valorSeleccionado) {
      if (juegoTerminado || esperandoAvance) return;
      if (valorSeleccionado === undefined || valorSeleccionado === '') return;
      var item = ronda[indice];
      if (!item || !item.q) return;
      var q = item.q;
      var sel = parseInt(valorSeleccionado, 10);
      if (isNaN(sel)) return;
      var esCorrecta = (q.correcta !== undefined && sel === q.correcta);
      item.acierto = esCorrecta;
      esperandoAvance = true;
      opcionesEl.classList.add('quiz-opciones-bloqueadas');
      var labels = opcionesEl.querySelectorAll('label');
      labels.forEach(function (lab, i) {
        var inp = lab.querySelector('input');
        if (inp) inp.disabled = true;
        if (i !== sel) return;
        lab.classList.add(esCorrecta ? 'quiz-feedback-correcto' : 'quiz-feedback-incorrecto');
      });
      setTimeout(function () {
        esperandoAvance = false;
        if (juegoTerminado) return;
        indice++;
        if (indice >= ronda.length) cerrarRondaYContinuar();
        else mostrarPregunta();
      }, 1300);
    }

    function mostrarPregunta() {
      if (juegoTerminado) return;
      opcionesEl.classList.remove('quiz-opciones-bloqueadas');
      if (temporizadorEl) temporizadorEl.classList.remove('urgente');
      if (tiempoRestanteEl) {
        tiempoRestanteEl.textContent = 'Ronda ' + numeroRonda + ' · ' + (indice + 1) + '/' + ronda.length + ' en esta ronda · Meta: ' + totalOriginales + ' preguntas bien · Mismo límite 3:00.';
      }
      if (indice >= ronda.length) return;
      if (!juegoQuizIniciado) {
        actualizarLeyendaLimite(0);
        cronometroJuego.start();
        juegoQuizIniciado = true;
      }
      tiempoInicioPreg = Date.now();
      var item = ronda[indice];
      var q = item.q;
      preguntaEl.textContent = 'Ronda ' + numeroRonda + ' — ' + (indice + 1) + '/' + ronda.length + ': ' + q.p;
      opcionesEl.innerHTML = '';
      q.opciones.forEach(function (op, i) {
        var label = document.createElement('label');
        var radio = document.createElement('input');
        radio.type = 'radio'; radio.name = 'quiz_opcion'; radio.value = i;
        label.appendChild(radio);
        label.appendChild(document.createElement('span')).textContent = op;
        opcionesEl.appendChild(label);
      });
    }

    opcionesEl.addEventListener('change', function (ev) {
      if (juegoTerminado || esperandoAvance) return;
      if (ev.target.type === 'radio' && ev.target.value !== undefined && ev.target.value !== '') evaluarRespuesta(ev.target.value);
    });
    if (ronda.length === 0) {
      juegoTerminado = true;
    } else {
      mostrarPregunta();
    }
  }

  if (tipo === 'pistas') {
    catNombre.textContent = 'Pistas';
    var pistas = seleccionarPartidaPorTematicas(datos.pistas || [], 10, 3, function (item) {
      return (item && item.categoria) ? item.categoria : 'General';
    }).filter(function (p) { return p && p.pista && p.respuesta; });
    var idx = 0;
    var usadoPista = false;
    var tiempoInicioPista = null;
    var juegoPistasTerminado = false;
    var limiteDisparado = false;
    var juegoPistasIniciado = false;

    var cronometroJuego = RT.crearCronometroDisplay('temporizador', function (ms) {
      if (juegoPistasTerminado || limiteDisparado) return;
      actualizarLeyendaLimite(ms);
      var el = document.getElementById('temporizador');
      if (el) el.classList.toggle('urgente', TIEMPO_LIMITE_MS - ms <= 10000 && TIEMPO_LIMITE_MS - ms > 0);
      if (ms >= TIEMPO_LIMITE_MS) {
        limiteDisparado = true;
        terminarPistasPorLimite();
      }
    });

    var wrapper = document.createElement('div');
    wrapper.className = 'pistas-contenedor-flex';
    var panelIzq = document.createElement('div');
    panelIzq.className = 'reto-panel-izq';
    var panel = document.createElement('div');
    panel.className = 'panel-rally';
    panel.innerHTML = '<p class="pista-texto" id="pista-texto"></p><p class="pista-indicio" id="pista-indicio" style="display:none;margin-top:12px;padding:12px;background:rgba(0,80,120,0.4);border-left:4px solid var(--secondary);border-radius:0 8px 8px 0;font-size:1rem;color:var(--secondary);"></p><div class="text-center"><input type="text" class="pista-input" id="pista-respuesta" placeholder="Escribe tu respuesta..." autocomplete="off"><p class="mt-2"><button type="button" class="btn-rally" id="pista-verificar">Verificar</button> <button type="button" class="btn-rally outline" id="pista-pedir-pista" style="margin-left:8px;">Pedir pista</button> <button type="button" class="btn-rally outline" id="pista-saltar">Saltar</button></p></div>';
    panelIzq.appendChild(panel);
    var panelDer = document.createElement('div');
    panelDer.className = 'reto-panel-der';
    panelDer.innerHTML = '<div class="reto-tiempos-panel"><h3>Tiempos por acertijo</h3><ul class="reto-tiempos-lista" id="pistas-tiempos-lista"></ul><p class="reto-tiempo-restante" id="pistas-tiempo-restante"></p></div>';
    wrapper.appendChild(panelIzq);
    wrapper.appendChild(panelDer);
    cont.appendChild(wrapper);
    var textoEl = document.getElementById('pista-texto');
    var indicioEl = document.getElementById('pista-indicio');
    var inputEl = document.getElementById('pista-respuesta');
    var btn = document.getElementById('pista-verificar');
    var btnPista = document.getElementById('pista-pedir-pista');
    var btnSaltar = document.getElementById('pista-saltar');
    var tiemposListaEl = document.getElementById('pistas-tiempos-lista');
    var tiempoRestanteEl = document.getElementById('pistas-tiempo-restante');
    var temporizadorEl = document.getElementById('temporizador');

    function normalizarTexto(texto) {
      return (texto || '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    }

    function agregarTiempoALista(n, ms) {
      var li = document.createElement('li');
      li.innerHTML = '<span class="numero">Acertijo ' + n + ':</span> <span class="valor-tiempo">' + RT.formatearTiempo(ms) + '</span>';
      tiemposListaEl.appendChild(li);
    }

    function bloquearPanelPistas() {
      wrapper.style.pointerEvents = 'none';
      wrapper.style.opacity = '0.65';
    }

    function terminarPistasPorLimite() {
      if (juegoPistasTerminado) return;
      juegoPistasTerminado = true;
      cronometroJuego.stop();
      aplicarTemporizadorLimiteAlcanzado();
      var ms = TIEMPO_LIMITE_MS;
      RT.guardarTiempoReto('pistas', ms);
      bloquearPanelPistas();
      var msg = document.createElement('div');
      msg.className = 'memorama-mensaje-final';
      msg.style.marginTop = '16px';
      msg.innerHTML = '<p style="color:#ff6b6b;font-weight:700;font-size:1.2rem;">Tiempo finalizado, reto no cumplido!</p><p><button type="button" class="btn-rally" id="btn-pistas-limite">Ver resultado</button></p>';
      cont.appendChild(msg);
      document.getElementById('btn-pistas-limite').addEventListener('click', function () {
        irAResultados(ms, true, true);
      });
      mostrarAvisoEstacionFinal();
    }

    function finalizarPistasExitoso() {
      if (juegoPistasTerminado) return;
      juegoPistasTerminado = true;
      var msTotal = cronometroJuego.stop();
      aplicarTemporizadorExito(msTotal);
      RT.guardarTiempoReto('pistas', msTotal);
      bloquearPanelPistas();
      var msg = document.createElement('div');
      msg.className = 'memorama-mensaje-final memorama-completado';
      msg.style.marginTop = '16px';
      msg.innerHTML = '<p class="memorama-completado-texto">¡Reto completado exitosamente!</p><p><button type="button" class="btn-rally" id="btn-pistas-exito">Ver resultado</button></p>';
      cont.appendChild(msg);
      document.getElementById('btn-pistas-exito').addEventListener('click', function () {
        irAResultados(msTotal, false, false);
      });
      mostrarAvisoEstacionFinal();
    }

    function mostrarPista() {
      if (juegoPistasTerminado) return;
      if (btnPista) btnPista.disabled = false;
      if (tiempoRestanteEl) tiempoRestanteEl.textContent = 'Límite total de sesión: 3:00.';
      if (idx >= pistas.length) {
        finalizarPistasExitoso();
        return;
      }
      if (!juegoPistasIniciado) {
        actualizarLeyendaLimite(0);
        cronometroJuego.start();
        juegoPistasIniciado = true;
      }
      tiempoInicioPista = Date.now();
      usadoPista = false;
      indicioEl.style.display = 'none';
      indicioEl.textContent = '';
      textoEl.textContent = pistas[idx].pista;
      inputEl.value = '';
      inputEl.focus();
    }

    function saltarPregunta() {
      if (juegoPistasTerminado) return;
      var ms = tiempoInicioPista ? (Date.now() - tiempoInicioPista) : 0;
      agregarTiempoALista(idx + 1, ms);
      idx++;
      setTimeout(mostrarPista, 400);
    }

    btnSaltar.addEventListener('click', saltarPregunta);
    btnPista.addEventListener('click', function () {
      if (usadoPista) return;
      usadoPista = true;
      indicioEl.textContent = '💡 Indicio: ' + (pistas[idx].indicio || 'No hay indicio disponible.');
      indicioEl.style.display = 'block';
      btnPista.disabled = true;
    });
    btn.addEventListener('click', function () {
      if (juegoPistasTerminado) return;
      var usuarioNorm = normalizarTexto(inputEl.value);
      if (!usuarioNorm) {
        inputEl.style.borderColor = '#ff6b6b';
        setTimeout(function () { inputEl.style.borderColor = ''; }, 800);
        return;
      }
      if (usuarioNorm === normalizarTexto(pistas[idx].respuesta)) {
        var ms = tiempoInicioPista ? (Date.now() - tiempoInicioPista) : 0;
        agregarTiempoALista(idx + 1, ms);
        idx++;
        setTimeout(mostrarPista, 400);
      } else { inputEl.style.borderColor = '#ff6b6b'; setTimeout(function () { inputEl.style.borderColor = ''; }, 1000); }
    });
    inputEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') btn.click(); });
    if (!pistas.length) {
      var sinP = document.createElement('p');
      sinP.className = 'text-center';
      sinP.style.color = 'var(--primary)';
      sinP.textContent = 'No hay pistas disponibles.';
      cont.appendChild(sinP);
    } else {
      mostrarPista();
    }
  }

  if (tipo === 'reto') {
    catNombre.textContent = 'Reto';

    function claveOrdenRetoItem(item, indice) {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        if (item.clave != null && !isNaN(Number(item.clave))) return Number(item.clave);
        if (item.anio != null && !isNaN(Number(item.anio))) {
          var a = Number(item.anio);
          var o = Number(item.orden);
          if (!isNaN(o) && o !== 0) return a * 10000 + o;
          return a;
        }
        if (item.orden != null && !isNaN(Number(item.orden))) return Number(item.orden);
      }
      return indice;
    }

    function normalizarRetoCR(r) {
      if (!r) return null;
      var titulo = r.pregunta || r.titulo;
      var pasos = [];
      if (r.respuestaCorrecta && Array.isArray(r.respuestaCorrecta) && r.respuestaCorrecta.length) {
        var arr = r.respuestaCorrecta;
        for (var i = 0; i < arr.length; i++) {
          var raw = arr[i];
          if (raw !== null && typeof raw === 'object' && !Array.isArray(raw)) {
            var vis = raw.texto != null ? String(raw.texto).trim() : (raw.t != null ? String(raw.t).trim() : '');
            if (!vis) return null;
            pasos.push({ visible: vis, clave: claveOrdenRetoItem(raw, i) });
          } else {
            var s = String(raw).trim();
            if (!s) return null;
            pasos.push({ visible: s, clave: i });
          }
        }
      } else if (r.items && r.orden_correcto && r.orden_correcto.length) {
        for (var oi = 0; oi < r.orden_correcto.length; oi++) {
          pasos.push({ visible: String(r.items[r.orden_correcto[oi]]).trim(), clave: oi });
        }
      }
      if (!titulo || !pasos.length) return null;
      return {
        titulo: titulo,
        pasos: pasos,
        clavesCorrectas: pasos.map(function (p) { return p.clave; }),
        categoria: r.categoria || 'General'
      };
    }

    var RETOS_POR_PARTIDA = 6;

    var retosNorm = [];
    var rawRetos = datos.reto || [];
    for (var ri = 0; ri < rawRetos.length; ri++) {
      var nrm = normalizarRetoCR(rawRetos[ri]);
      if (nrm) retosNorm.push(nrm);
    }
    var loteRetos = mezclar(retosNorm.slice()).slice(0, Math.min(RETOS_POR_PARTIDA, retosNorm.length));
    var completadosLote = 0;
    var tiempoInicioReto = null;
    var juegoRetoTerminado = false;
    var limiteDisparado = false;
    var juegoRetoIniciado = false;
    var dragoverRetoRegistrado = false;

    var cronometroJuego = RT.crearCronometroDisplay('temporizador', function (ms) {
      if (juegoRetoTerminado || limiteDisparado) return;
      actualizarLeyendaLimite(ms);
      var el = document.getElementById('temporizador');
      if (el) el.classList.toggle('urgente', TIEMPO_LIMITE_MS - ms <= 10000 && TIEMPO_LIMITE_MS - ms > 0);
      if (ms >= TIEMPO_LIMITE_MS) {
        limiteDisparado = true;
        terminarRetoPorLimite();
      }
    });

    var wrapper = document.createElement('div');
    wrapper.className = 'reto-contenedor-flex';
    var panelIzq = document.createElement('div');
    panelIzq.className = 'reto-panel-izq';
    var panel = document.createElement('div');
    panel.className = 'panel-rally';
    panel.innerHTML = '<h2 id="reto-titulo"></h2><p class="reto-progreso-lote" id="reto-progreso-lote" aria-live="polite">Retos completados: 0 / 6</p><p id="reto-feedback" class="reto-feedback" aria-live="polite"></p><ul class="reto-lista" id="reto-lista"></ul><p class="text-center mt-2"><button type="button" class="btn-rally" id="reto-verificar">Verificar orden</button></p>';
    panelIzq.appendChild(panel);
    var panelDer = document.createElement('div');
    panelDer.className = 'reto-panel-der';
    panelDer.innerHTML = '<div class="reto-tiempos-panel"><h3>Retos resueltos</h3><ul class="reto-tiempos-lista" id="reto-tiempos-lista"></ul><p class="reto-tiempo-restante" id="reto-tiempo-restante"></p></div>';
    wrapper.appendChild(panelIzq);
    wrapper.appendChild(panelDer);
    cont.appendChild(wrapper);
    var tituloEl = document.getElementById('reto-titulo');
    var progresoRetoEl = document.getElementById('reto-progreso-lote');
    var feedbackRetoEl = document.getElementById('reto-feedback');
    var listaEl = document.getElementById('reto-lista');
    var btnReto = document.getElementById('reto-verificar');
    var tiemposListaEl = document.getElementById('reto-tiempos-lista');
    var tiempoRestanteEl = document.getElementById('reto-tiempo-restante');
    var temporizadorEl = document.getElementById('temporizador');

    function agregarTiempoALista(numeroPrueba, ms) {
      var li = document.createElement('li');
      li.innerHTML = '<span class="numero">Reto ' + numeroPrueba + ':</span> <span class="valor-tiempo">' + RT.formatearTiempo(ms) + '</span>';
      tiemposListaEl.appendChild(li);
    }

    function bloquearRetoUI() {
      wrapper.style.pointerEvents = 'none';
      wrapper.style.opacity = '0.72';
    }

    function finalizarRetoExitoso() {
      if (juegoRetoTerminado) return;
      juegoRetoTerminado = true;
      var msTotal = cronometroJuego.stop();
      aplicarTemporizadorExito(msTotal);
      RT.guardarTiempoReto('reto', msTotal);
      bloquearRetoUI();
      var msg = document.createElement('div');
      msg.className = 'memorama-mensaje-final memorama-completado';
      msg.style.marginTop = '16px';
      msg.innerHTML = '<p class="memorama-completado-texto">¡Reto completado exitosamente!</p><p><button type="button" class="btn-rally" id="btn-reto-exito">Ver resultado</button></p>';
      cont.appendChild(msg);
      document.getElementById('btn-reto-exito').addEventListener('click', function () {
        irAResultados(msTotal, false, false);
      });
      mostrarAvisoEstacionFinal();
    }

    function terminarRetoPorLimite() {
      if (juegoRetoTerminado) return;
      juegoRetoTerminado = true;
      cronometroJuego.stop();
      aplicarTemporizadorLimiteAlcanzado();
      var ms = TIEMPO_LIMITE_MS;
      RT.guardarTiempoReto('reto', ms);
      bloquearRetoUI();
      var msg = document.createElement('div');
      msg.className = 'memorama-mensaje-final';
      msg.style.marginTop = '16px';
      msg.innerHTML = '<p style="color:#ff6b6b;font-weight:700;font-size:1.2rem;">Tiempo finalizado, reto no cumplido!</p><p><button type="button" class="btn-rally" id="btn-reto-limite">Ver resultado</button></p>';
      cont.appendChild(msg);
      document.getElementById('btn-reto-limite').addEventListener('click', function () {
        irAResultados(ms, true, true);
      });
      mostrarAvisoEstacionFinal();
    }

    function mostrarReto() {
      if (juegoRetoTerminado) return;
      if (temporizadorEl) temporizadorEl.classList.remove('urgente');
      if (!loteRetos.length) {
        juegoRetoTerminado = true;
        if (feedbackRetoEl) feedbackRetoEl.textContent = 'No hay retos configurados.';
        return;
      }
      if (progresoRetoEl) {
        progresoRetoEl.textContent = 'Retos completados: ' + completadosLote + ' / ' + loteRetos.length;
      }
      if (tiempoRestanteEl) {
        tiempoRestanteEl.textContent = 'Partida: ' + loteRetos.length + ' retos · Límite: 3:00.';
      }
      var prueba = loteRetos[completadosLote];
      if (!prueba) {
        juegoRetoTerminado = true;
        if (feedbackRetoEl) feedbackRetoEl.textContent = 'No hay retos configurados.';
        return;
      }
      if (!juegoRetoIniciado) {
        actualizarLeyendaLimite(0);
        cronometroJuego.start();
        juegoRetoIniciado = true;
      }
      tiempoInicioReto = Date.now();
      if (feedbackRetoEl) {
        feedbackRetoEl.textContent = '';
        feedbackRetoEl.className = 'reto-feedback';
      }
      panel.classList.remove('reto-cambio-prueba');
      if (completadosLote > 0) {
        void panel.offsetWidth;
        panel.classList.add('reto-cambio-prueba');
        setTimeout(function () { panel.classList.remove('reto-cambio-prueba'); }, 400);
      }
      tituloEl.textContent = prueba.titulo;
      listaEl.innerHTML = '';
      var pasosPrueba = prueba.pasos.slice();
      var shuffled = mezclar(pasosPrueba.slice());
      shuffled.forEach(function (paso) {
        var li = document.createElement('li');
        li.className = 'reto-item-row';
        li.draggable = false;
        li.setAttribute('data-reto-clave', String(paso.clave));

        var handle = document.createElement('span');
        handle.className = 'reto-item-handle';
        handle.draggable = true;
        handle.textContent = '⋮⋮';
        handle.title = 'Arrastrar para ordenar';
        handle.setAttribute('aria-grabbed', 'false');

        var textSpan = document.createElement('span');
        textSpan.className = 'reto-item-texto';
        textSpan.textContent = paso.visible;

        var controls = document.createElement('span');
        controls.className = 'reto-item-controles';
        var btnUp = document.createElement('button');
        btnUp.type = 'button';
        btnUp.className = 'btn-reto-mover';
        btnUp.setAttribute('aria-label', 'Subir');
        btnUp.textContent = '▲';
        var btnDown = document.createElement('button');
        btnDown.type = 'button';
        btnDown.className = 'btn-reto-mover';
        btnDown.setAttribute('aria-label', 'Bajar');
        btnDown.textContent = '▼';

        btnUp.addEventListener('click', function (ev) {
          ev.preventDefault();
          if (juegoRetoTerminado) return;
          var prev = li.previousElementSibling;
          if (prev) listaEl.insertBefore(li, prev);
        });
        btnDown.addEventListener('click', function (ev) {
          ev.preventDefault();
          if (juegoRetoTerminado) return;
          var nx = li.nextElementSibling;
          if (nx) listaEl.insertBefore(nx, li);
        });

        handle.addEventListener('dragstart', function (e) {
          if (juegoRetoTerminado) { e.preventDefault(); return; }
          e.dataTransfer.setData('text/plain', 'reto-item');
          e.dataTransfer.effectAllowed = 'move';
          li.classList.add('dragging');
          handle.setAttribute('aria-grabbed', 'true');
        });
        handle.addEventListener('dragend', function () {
          li.classList.remove('dragging');
          handle.setAttribute('aria-grabbed', 'false');
        });

        controls.appendChild(btnUp);
        controls.appendChild(btnDown);
        li.appendChild(handle);
        li.appendChild(textSpan);
        li.appendChild(controls);
        listaEl.appendChild(li);
      });
      window._rallyClavesCorrectas = prueba.clavesCorrectas.slice();
      if (!dragoverRetoRegistrado) {
        dragoverRetoRegistrado = true;
        listaEl.addEventListener('dragover', function (e) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          var drag = listaEl.querySelector('li.dragging');
          if (!drag) return;
          var siblings = listaEl.querySelectorAll('li:not(.dragging)');
          var insertBefore = null;
          for (var si = 0; si < siblings.length; si++) {
            var box = siblings[si].getBoundingClientRect();
            if (e.clientY < box.top + box.height / 2) {
              insertBefore = siblings[si];
              break;
            }
          }
          if (insertBefore) listaEl.insertBefore(drag, insertBefore);
          else listaEl.appendChild(drag);
        });
        listaEl.addEventListener('drop', function (e) {
          e.preventDefault();
        });
      }
    }

    btnReto.addEventListener('click', function () {
      if (juegoRetoTerminado) return;
      var correctClaves = window._rallyClavesCorrectas || [];
      var lis = listaEl.querySelectorAll('li');
      var current = [].map.call(lis, function (li) {
        return Number(li.getAttribute('data-reto-clave'));
      });
      var ok = correctClaves.length === current.length && correctClaves.every(function (c, i) { return c === current[i]; });
      if (ok) {
        var msPrueba = tiempoInicioReto ? (Date.now() - tiempoInicioReto) : 0;
        var nEnLote = loteRetos.length;
        completadosLote++;
        agregarTiempoALista(completadosLote, msPrueba);
        lis.forEach(function (li) { li.classList.add('correcto'); });
        if (completadosLote >= nEnLote) {
          finalizarRetoExitoso();
          return;
        }
        if (feedbackRetoEl) {
          feedbackRetoEl.textContent = '¡Correcto! Siguiente reto…';
          feedbackRetoEl.className = 'reto-feedback reto-feedback-exito';
        }
        setTimeout(function () {
          if (juegoRetoTerminado) return;
          mostrarReto();
        }, 550);
      } else {
        lis.forEach(function (li) { li.classList.remove('correcto'); });
        if (feedbackRetoEl) {
          feedbackRetoEl.textContent = 'Orden incorrecto. Ajusta la lista e inténtalo de nuevo.';
          feedbackRetoEl.className = 'reto-feedback reto-feedback-error';
        }
      }
    });
    mostrarReto();
  }
})();
