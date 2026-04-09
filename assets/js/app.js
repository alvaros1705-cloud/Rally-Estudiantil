/**
 * Rally Estudiantil 2.0 - Lógica frontend: temporizador y juegos
 * Optimizado para pantalla TV.
 */

(function () {
  'use strict';

  var tiempoInicio = null;
  var intervalo = null;
  var segundos = 0;

  function pad(n) {
    return n < 10 ? '0' + n : n;
  }

  function actualizarTemporizador() {
    if (tiempoInicio === null) return;
    segundos = Math.floor((Date.now() - tiempoInicio) / 1000);
    var el = document.getElementById('temporizador');
    if (el) {
      var m = Math.floor(segundos / 60);
      var s = segundos % 60;
      el.textContent = pad(m) + ':' + pad(s);
    }
  }

  function iniciarTemporizador() {
    if (tiempoInicio !== null) return;
    tiempoInicio = Date.now();
    intervalo = setInterval(actualizarTemporizador, 200);
    actualizarTemporizador();
  }

  function detenerTemporizador() {
    if (intervalo) clearInterval(intervalo);
    intervalo = null;
    actualizarTemporizador();
    return segundos;
  }

  function enviarRegistroTiempo(cb) {
    var tipo = window.RALLY_TIPO;
    var categoria = window.RALLY_CATEGORIA || '';
    var equipo = window.RALLY_EQUIPO || '';
    var url = window.RALLY_API_PUNTaje;
    if (!url || !tipo || !equipo) {
      if (cb) cb(null);
      return;
    }
    var tiempo = detenerTemporizador();
    var payload = {
      nombre_equipo: equipo,
      tipo_juego: tipo,
      categoria: categoria,
      tiempo_segundos: tiempo
    };
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (cb) cb(data);
        if (data && data.ok && window.RALLY_RESULTADOS) {
          var u = window.RALLY_RESULTADOS + '?tiempo_ms=' + (tiempo * 1000);
          window.location.href = u;
        }
      })
      .catch(function () {
        if (cb) cb(null);
        if (window.RALLY_RESULTADOS) {
          window.location.href = window.RALLY_RESULTADOS + '?tiempo_ms=' + (segundos * 1000);
        }
      });
  }

  window.RALLY = {
    iniciarTemporizador: iniciarTemporizador,
    detenerTemporizador: detenerTemporizador,
    getSegundos: function () { return segundos; },
    enviarRegistroTiempo: enviarRegistroTiempo,
    enviarPuntaje: enviarRegistroTiempo
  };

  /* --- MEMORAMA --- */
  function initMemorama() {
    var data = window.RALLY_GAME;
    if (!data || !data.cartas) return;
    var grid = document.getElementById('memorama-grid');
    if (!grid) return;

    RALLY.iniciarTemporizador();
    var cartas = data.cartas;
    var totalPares = data.totalPares || cartas.length / 2;
    var volteadas = [];
    var emparejados = 0;

    function normalizar(str) {
      return (str || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function crearCarta(carta, index) {
      var div = document.createElement('div');
      div.className = 'carta-memorama';
      div.dataset.index = index;
      div.dataset.parId = carta.parId;
      div.innerHTML =
        '<span class="cara reves">?</span>' +
        '<span class="cara frente" style="display:none;">' + escapeHtml(carta.texto) + '</span>';
      div.addEventListener('click', function () {
        if (div.classList.contains('volteada') || div.classList.contains('emparejado')) return;
        if (volteadas.length === 2) return;
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
            if (emparejados >= totalPares) {
              setTimeout(function () {
                RALLY.enviarRegistroTiempo();
              }, 400);
            }
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
      return div;
    }

    function escapeHtml(s) {
      var d = document.createElement('div');
      d.textContent = s;
      return d.innerHTML;
    }

    grid.innerHTML = '';
    cartas.forEach(function (c, i) {
      grid.appendChild(crearCarta(c, i));
    });
  }

  /* --- QUIZ --- */
  function initQuiz() {
    var data = window.RALLY_GAME;
    if (!data || !data.preguntas || !data.preguntas.length) return;
    RALLY.iniciarTemporizador();
    var preguntas = data.preguntas;
    var indice = 0;
    var container = document.getElementById('quiz-container');
    var preguntaEl = document.getElementById('quiz-pregunta');
    var opcionesEl = document.getElementById('quiz-opciones');
    var siguienteBtn = document.getElementById('quiz-siguiente');

    function mostrarPregunta() {
      if (indice >= preguntas.length) {
        RALLY.enviarRegistroTiempo();
        return;
      }
      var p = preguntas[indice];
      preguntaEl.textContent = (indice + 1) + '. ' + p.p;
      opcionesEl.innerHTML = '';
      p.opciones.forEach(function (op, i) {
        var label = document.createElement('label');
        var radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'quiz_opcion';
        radio.value = i;
        label.appendChild(radio);
        label.appendChild(document.createElement('span')).textContent = op;
        opcionesEl.appendChild(label);
      });
      siguienteBtn.style.display = 'none';
    }

    function verificarYSiguiente() {
      var sel = document.querySelector('input[name="quiz_opcion"]:checked');
      if (!sel) return;
      siguienteBtn.style.display = 'none';
      indice++;
      if (indice >= preguntas.length) {
        RALLY.enviarRegistroTiempo();
        return;
      }
      mostrarPregunta();
    }

    siguienteBtn.addEventListener('click', verificarYSiguiente);
    opcionesEl.addEventListener('change', function () {
      siguienteBtn.style.display = 'inline-block';
    });
    mostrarPregunta();
  }

  /* --- PISTAS --- */
  function initPistas() {
    var data = window.RALLY_GAME;
    if (!data || !data.pistas || !data.pistas.length) return;
    RALLY.iniciarTemporizador();
    var pistas = data.pistas;
    var indice = 0;
    var textoEl = document.getElementById('pista-texto');
    var inputEl = document.getElementById('pista-respuesta');
    var btnVerificar = document.getElementById('pista-verificar');

    function normalizarRespuesta(s) {
      return (s || '').toLowerCase().replace(/\s+/g, ' ').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function mostrarPista() {
      if (indice >= pistas.length) {
        RALLY.enviarRegistroTiempo();
        return;
      }
      textoEl.textContent = pistas[indice].pista;
      inputEl.value = '';
      inputEl.focus();
    }

    btnVerificar.addEventListener('click', function () {
      var respuestaUsuario = normalizarRespuesta(inputEl.value);
      var respuestaCorrecta = normalizarRespuesta(pistas[indice].respuesta);
      if (respuestaUsuario === respuestaCorrecta) {
        indice++;
        mostrarPista();
      } else {
        inputEl.style.borderColor = '#ff6b6b';
        setTimeout(function () {
          inputEl.style.borderColor = '';
        }, 1000);
      }
    });
    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') btnVerificar.click();
    });
    mostrarPista();
  }

  /* --- RETO (ordenar lista) --- */
  function initReto() {
    var data = window.RALLY_GAME;
    if (!data || !data.retos || !data.retos.length) return;
    RALLY.iniciarTemporizador();
    var retos = data.retos;
    var indice = 0;
    var tituloEl = document.getElementById('reto-titulo');
    var listaEl = document.getElementById('reto-lista');
    var btnVerificar = document.getElementById('reto-verificar');

    function mostrarReto() {
      if (indice >= retos.length) {
        RALLY.enviarRegistroTiempo();
        return;
      }
      var r = retos[indice];
      tituloEl.textContent = r.titulo || 'Ordena los elementos';
      listaEl.innerHTML = '';
      var items = (r.items || []).slice();
      var ordenCorrecto = r.orden_correcto || items.map(function (_, i) { return i; });
      // Mostrar en orden aleatorio
      var shuffled = items.slice().sort(function () { return Math.random() - 0.5; });
      shuffled.forEach(function (texto) {
        var li = document.createElement('li');
        li.className = 'reto-item-row';
        li.draggable = false;

        var handle = document.createElement('span');
        handle.className = 'reto-item-handle';
        handle.draggable = true;
        handle.textContent = '⋮⋮';
        handle.title = 'Arrastrar para ordenar';

        var textSpan = document.createElement('span');
        textSpan.className = 'reto-item-texto';
        textSpan.textContent = texto;

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
          var prev = li.previousElementSibling;
          if (prev) listaEl.insertBefore(li, prev);
        });
        btnDown.addEventListener('click', function (ev) {
          ev.preventDefault();
          var nx = li.nextElementSibling;
          if (nx) listaEl.insertBefore(nx, li);
        });

        handle.addEventListener('dragstart', function (e) {
          e.dataTransfer.setData('text/plain', 'reto-item');
          e.dataTransfer.effectAllowed = 'move';
          li.classList.add('dragging');
        });
        handle.addEventListener('dragend', function () {
          li.classList.remove('dragging');
        });

        controls.appendChild(btnUp);
        controls.appendChild(btnDown);
        li.appendChild(handle);
        li.appendChild(textSpan);
        li.appendChild(controls);
        listaEl.appendChild(li);
      });
      window.RALLY_ORDEN_CORRECTO_VALORES = ordenCorrecto.map(function (i) { return items[i]; });
      habilitarDrag();
    }

    var retoDragInicializado = false;
    function habilitarDrag() {
      if (retoDragInicializado) return;
      retoDragInicializado = true;
      listaEl.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        var drag = listaEl.querySelector('li.dragging');
        if (!drag) return;
        var els = listaEl.querySelectorAll('li:not(.dragging)');
        var insertBefore = null;
        for (var i = 0; i < els.length; i++) {
          var box = els[i].getBoundingClientRect();
          if (e.clientY < box.top + box.height / 2) {
            insertBefore = els[i];
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

    btnVerificar.addEventListener('click', function () {
      var correctOrder = window.RALLY_ORDEN_CORRECTO_VALORES || [];
      var lis = listaEl.querySelectorAll('li');
      var currentOrder = [].map.call(lis, function (li) {
        var t = li.querySelector('.reto-item-texto');
        return (t ? t.textContent : li.textContent).trim();
      });
      var correcto = correctOrder.length === currentOrder.length && correctOrder.every(function (v, i) {
        return v === currentOrder[i];
      });
      if (correcto) {
        lis.forEach(function (li) { li.classList.add('correcto'); });
        indice++;
        setTimeout(mostrarReto, 800);
      }
    });

    mostrarReto();
  }

  window.initMemorama = initMemorama;
  window.initQuiz = initQuiz;
  window.initPistas = initPistas;
  window.initReto = initReto;
})();
