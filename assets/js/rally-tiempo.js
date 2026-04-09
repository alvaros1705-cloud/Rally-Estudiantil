/**
 * Rally — tiempos por intento (arrays en localStorage)
 */
(function (global) {
  'use strict';

  var KEYS = {
    memorama: 'tiempo_memorama',
    quiz: 'tiempo_quiz',
    pistas: 'tiempo_pistas',
    reto: 'tiempo_reto'
  };

  var LABELS = {
    memorama: 'Memorama',
    quiz: 'Quiz / Trivias',
    pistas: 'Pistas / acertijos',
    reto: 'Reto contra el tiempo'
  };

  function formatearTiempo(ms) {
    if (ms === undefined || ms === null || isNaN(ms)) ms = 0;
    ms = Math.max(0, ms);
    var totalSegundos = Math.floor(ms / 1000);
    var minutos = Math.floor(totalSegundos / 60);
    var segundos = totalSegundos % 60;
    return String(minutos).padStart(2, '0') + ':' + String(segundos).padStart(2, '0');
  }

  /** Lee array de ms; migra valor antiguo (un solo número en string) a [n]. */
  function leerIntentosMs(tipo) {
    try {
      if (!KEYS[tipo]) return [];
      var raw = localStorage.getItem(KEYS[tipo]);
      if (raw === null || raw === '') return [];
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(function (x) { return typeof x === 'number' && !isNaN(x) && x >= 0; });
      }
    } catch (e1) {}
    try {
      if (!KEYS[tipo]) return [];
      var v = localStorage.getItem(KEYS[tipo]);
      if (v === null || v === '') return [];
      var n = parseInt(v, 10);
      return isNaN(n) ? [] : [n];
    } catch (e2) {
      return [];
    }
  }

  /** Añade un intento sin sobrescribir los anteriores. */
  function guardarTiempoReto(tipo, ms) {
    try {
      if (!KEYS[tipo]) return;
      var arr = leerIntentosMs(tipo);
      arr.push(Math.round(ms));
      localStorage.setItem(KEYS[tipo], JSON.stringify(arr));
    } catch (e) {}
  }

  /** Último intento (compatibilidad con código que leía un solo valor). */
  function leerTiempoReto(tipo) {
    var arr = leerIntentosMs(tipo);
    return arr.length ? arr[arr.length - 1] : null;
  }

  function sumaTiemposGuardadosMs() {
    var sum = 0;
    Object.keys(KEYS).forEach(function (k) {
      leerIntentosMs(k).forEach(function (ms) {
        if (ms > 0) sum += ms;
      });
    });
    return sum;
  }

  function limpiarTiempos() {
    try {
      Object.keys(KEYS).forEach(function (k) {
        localStorage.removeItem(KEYS[k]);
      });
    } catch (e) {}
  }

  function mostrarModalTiempos() {
    var bloques = [];
    var hayAlguno = false;
    Object.keys(KEYS).forEach(function (k) {
      var intentos = leerIntentosMs(k);
      if (intentos.length === 0) return;
      hayAlguno = true;
      var lineas = [LABELS[k] + ':'];
      intentos.forEach(function (ms, i) {
        lineas.push('  Intento ' + (i + 1) + ': ' + formatearTiempo(ms));
      });
      bloques.push(lineas.join('\n'));
    });
    var msg;
    if (!hayAlguno) {
      msg = 'No hay tiempos registrados aún';
    } else {
      msg = bloques.join('\n\n');
      msg += '\n\nTiempo total acumulado: ' + formatearTiempo(sumaTiemposGuardadosMs());
    }
    alert(msg);
  }

  function crearCronometroDisplay(idElemento, onTickMs) {
    var inicio = null;
    var iv = null;
    function tick() {
      if (inicio === null) return;
      var ms = Date.now() - inicio;
      var el = document.getElementById(idElemento);
      if (el) el.textContent = formatearTiempo(ms);
      if (typeof onTickMs === 'function') onTickMs(ms);
    }
    return {
      start: function () {
        inicio = Date.now();
        if (iv) clearInterval(iv);
        tick();
        iv = setInterval(tick, 1000);
      },
      stop: function () {
        if (iv) clearInterval(iv);
        iv = null;
        var ms = inicio ? Date.now() - inicio : 0;
        inicio = null;
        return ms;
      },
      getElapsedMs: function () {
        return inicio ? Date.now() - inicio : 0;
      }
    };
  }

  global.RALLY_TIEMPO = {
    KEYS: KEYS,
    formatearTiempo: formatearTiempo,
    guardarTiempoReto: guardarTiempoReto,
    leerIntentosMs: leerIntentosMs,
    leerTiempoReto: leerTiempoReto,
    sumaTiemposGuardadosMs: sumaTiemposGuardadosMs,
    limpiarTiempos: limpiarTiempos,
    mostrarModalTiempos: mostrarModalTiempos,
    crearCronometroDisplay: crearCronometroDisplay
  };

  function bindBotonesTiempos() {
    var t = document.getElementById('btn-ver-tiempos');
    var r = document.getElementById('btn-reiniciar-tiempos');
    if (t) {
      t.addEventListener('click', function () {
        mostrarModalTiempos();
      });
    }
    if (r) {
      r.addEventListener('click', function () {
        if (confirm('¿Borrar todos los tiempos guardados en este dispositivo?')) {
          limpiarTiempos();
          alert('Tiempos reiniciados.');
        }
      });
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindBotonesTiempos);
  } else {
    bindBotonesTiempos();
  }
})(typeof window !== 'undefined' ? window : this);
