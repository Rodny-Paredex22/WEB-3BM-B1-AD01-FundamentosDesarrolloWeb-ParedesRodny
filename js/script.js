// BASE DE DATOS DE USUARIOS (ROLES Y PRUEBAS)
const usuariosIniciales = [
  { id: 1, nombre: 'Rodny Admin', email: 'admin@taller.com', password: 'admin123', rol: 'Administrador', activo: true },
  { id: 2, nombre: 'Juan Pérez', email: 'juan@correo.com', password: 'juan123', rol: 'Cliente', activo: true },
  { id: 3, nombre: 'María López', email: 'maria@correo.com', password: 'maria123', rol: 'Cliente', activo: false }
];

let usuarios = JSON.parse(localStorage.getItem('usuarios_taller')) || usuariosIniciales;

// DICCIONARIO CLAVE-VALOR EN MEMORIA 
const diccionarioSolicitudes = {};

// REGISTROS INICIALES DE EJEMPLO
const solicitudesIniciales = [
  {
    id: 'MANT-101',
    cliente: 'Juan Pérez',
    email: 'juan@correo.com',
    telefono: '0991234567',
    placa: 'ABC-1234',
    marca: 'Toyota',
    modelo: 'Corolla',
    anio: 2020,
    kilometraje: 45000,
    servicio: 'Mantenimiento Preventivo',
    tipoAtencion: 'Estándar en taller',
    adicionales: ['Luces', 'Batería'],
    fecha: '2026-11-20',
    hora: '09:00',
    estado: 'Pendiente'
  },
  {
    id: 'MANT-102',
    cliente: 'Pedro Gomez',
    email: 'pedro@correo.com',
    telefono: '0987654321',
    placa: 'XYZ-7890',
    marca: 'Chevrolet',
    modelo: 'D-Max',
    anio: 2019,
    kilometraje: 80000,
    servicio: 'Sistema de Frenos',
    tipoAtencion: 'Servicio Exprés',
    adicionales: ['Neumáticos'],
    fecha: '2026-11-21',
    hora: '11:00',
    estado: 'En proceso'
  },
  {
    id: 'MANT-103',
    cliente: 'María López',
    email: 'maria@correo.com',
    telefono: '0995544332',
    placa: 'PCO-9876',
    marca: 'Kia',
    modelo: 'Sportage',
    anio: 2021,
    kilometraje: 52000,
    servicio: 'Diagnóstico Computarizado',
    tipoAtencion: 'Estándar en taller',
    adicionales: ['Batería'],
    fecha: '2026-11-25',
    hora: '14:00',
    estado: 'En revisión'
  }
];

// VARIABLES GLOBALES Y PERSISTENCIA CON LOCALSTORAGE
let solicitudes = JSON.parse(localStorage.getItem('solicitudes_taller')) || solicitudesIniciales;

// Asegurar que la cita de María López esté presente si se inició con datos antiguos
if (!solicitudes.some(s => s.cliente === 'María López' || s.email === 'maria@correo.com')) {
  solicitudes.push(solicitudesIniciales[2]);
  localStorage.setItem('solicitudes_taller', JSON.stringify(solicitudes));
}

// Sincronizar automáticamente la lista de usuarios con los clientes registrados en solicitudes (ej. Rodny, Pedro, etc.)
for (const s of solicitudes) {
  if (s.email && !usuarios.some(u => u.email.toLowerCase() === s.email.toLowerCase())) {
    usuarios.push({
      id: usuarios.length + 1,
      nombre: s.cliente,
      email: s.email,
      password: '123',
      rol: 'Cliente',
      activo: true
    });
  }
}
localStorage.setItem('usuarios_taller', JSON.stringify(usuarios));

let usuarioActual = JSON.parse(localStorage.getItem('sesion_activa')) || null;
let idCitaEditando = null;

// FUNCIÓN PARA GUARDAR EN LOCALSTORAGE Y SINCRONIZAR EL DICCIONARIO
function guardarDatos() {
  localStorage.setItem('solicitudes_taller', JSON.stringify(solicitudes));
  sincronizarDiccionario();
}

// BUCLE FOR...OF PARA POBLAR EL DICCIONARIO POR SU CLAVE ID
function sincronizarDiccionario() {
  for (const s of solicitudes) {
    diccionarioSolicitudes[s.id] = s;
  }
}

// NAVEGACIÓN ENTRE SECCIONES CON LA CLASE OCULTO
function mostrarSeccion(idSeccion) {
  const secciones = document.querySelectorAll('.seccion-app');
  secciones.forEach(sec => sec.classList.add('oculto'));

  const seccionVer = document.getElementById(idSeccion);
  if (seccionVer) {
    seccionVer.classList.remove('oculto');
  }

  const enlaces = document.querySelectorAll('.menu-enlaces a');
  enlaces.forEach(link => link.classList.remove('activo'));

  const idNav = idSeccion.replace('seccion-', 'nav-');
  const navLink = document.getElementById(idNav);
  if (navLink) {
    navLink.classList.add('activo');
  }

  if (idSeccion === 'seccion-cliente') {
    renderizarCliente();
  } else if (idSeccion === 'seccion-admin') {
    if (!usuarioActual || usuarioActual.rol !== 'Administrador') {
      Swal.fire('Acceso Denegado', 'Su cuenta no tiene permisos administrativos.', 'error');
      return;
    }
    renderizarAdmin(solicitudes);
    renderizarUsuariosAdmin();
  } else if (idSeccion === 'seccion-perfil') {
    renderizarPerfil();
  }
}

// CONTROL DE ACCESO PARA ADMINISTRACIÓN
function intentarAccesoAdmin() {
  mostrarSeccion('seccion-admin');
}

// ACTUALIZAR INTERFAZ SEGÚN LA SESIÓN
function actualizarSesionUI() {
  const btnLogin = document.getElementById('btn-login-nav');
  const infoSesion = document.getElementById('usuario-sesion-info');
  const badge = document.getElementById('nombre-usuario-badge');
  const navCliente = document.getElementById('nav-cliente');
  const navAdmin = document.getElementById('nav-admin');

  if (usuarioActual) {
    btnLogin.classList.add('oculto');
    infoSesion.classList.remove('oculto');
    badge.innerHTML = `<i class="fa-solid fa-circle-user"></i> ${usuarioActual.nombre} (${usuarioActual.rol})`;

    if (usuarioActual.rol === 'Cliente') {
      navCliente.classList.remove('oculto');
      navAdmin.classList.add('oculto');
      document.getElementById('cliente-nombre').value = usuarioActual.nombre;
      document.getElementById('cliente-email').value = usuarioActual.email;
    } else if (usuarioActual.rol === 'Administrador') {
      navAdmin.classList.remove('oculto');
      navCliente.classList.add('oculto');
    }
  } else {
    btnLogin.classList.remove('oculto');
    infoSesion.classList.add('oculto');
    navCliente.classList.add('oculto');
    navAdmin.classList.add('oculto');
  }
}

// AUTENTICACIÓN (LOGIN) CON EL MÉTODO FIND() Y BLOQUEO TRAS 3 INTENTOS
document.getElementById('formulario-login').addEventListener('submit', function (e) {
  e.preventDefault();

  // 1. Verificación de bloqueo temporal (1 minuto)
  const tiempoBloqueo = parseInt(localStorage.getItem('taller_bloqueo_hasta') || '0', 10);
  const ahora = Date.now();

  if (ahora < tiempoBloqueo) {
    const segundosRestantes = Math.ceil((tiempoBloqueo - ahora) / 1000);
    Swal.fire({
      icon: 'warning',
      title: 'Acceso Bloqueado Temporalmente',
      text: `Ha superado el límite de intentos. Por favor espere ${segundosRestantes} segundo(s) antes de volver a intentar.`
    });
    return;
  }

  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-password').value.trim();

  // Búsqueda del usuario en el array
  const user = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());

  // Validación de credenciales
  if (!user || user.password !== pass) {
    let intentos = parseInt(localStorage.getItem('taller_intentos_fallidos') || '0', 10) + 1;

    if (intentos >= 3) {
      const bloqueoHasta = Date.now() + 60000; // 60 segundos (1 minuto)
      localStorage.setItem('taller_bloqueo_hasta', bloqueoHasta);
      localStorage.removeItem('taller_intentos_fallidos');
      Swal.fire({
        icon: 'error',
        title: 'Sistema Bloqueado',
        text: 'Ha fallado 3 veces consecutivas. El acceso se ha bloqueado durante 1 minuto por seguridad.'
      });
    } else {
      localStorage.setItem('taller_intentos_fallidos', intentos);
      const restantes = 3 - intentos;
      Swal.fire({
        icon: 'error',
        title: 'Credenciales Incorrectas',
        text: `Correo o contraseña incorrectos. Le queda(n) ${restantes} intento(s) antes del bloqueo temporal.`
      });
    }
    return;
  }

  // Validación de cuenta activa o deshabilitada
  if (!user.activo) {
    Swal.fire({
      icon: 'warning',
      title: 'Cuenta Deshabilitada',
      text: 'Esta cuenta ha sido desactivada por el administrador.'
    });
    return;
  }

  // Si el ingreso es exitoso, reiniciar contadores de bloqueo
  localStorage.removeItem('taller_intentos_fallidos');
  localStorage.removeItem('taller_bloqueo_hasta');

  usuarioActual = user;
  localStorage.setItem('sesion_activa', JSON.stringify(usuarioActual));
  actualizarSesionUI();

  Swal.fire('Bienvenido', `Hola ${user.nombre}`, 'success');
  mostrarSeccion(user.rol === 'Administrador' ? 'seccion-admin' : 'seccion-cliente');
});

// CERRAR SESIÓN
function cerrarSesion() {
  usuarioActual = null;
  localStorage.removeItem('sesion_activa');
  actualizarSesionUI();
  Swal.fire('Sesión Cerrada', 'Hasta pronto.', 'info');
  mostrarSeccion('seccion-inicio');
}

// VER PERFIL
function renderizarPerfil() {
  if (!usuarioActual) return;
  document.getElementById('perfil-nombre').textContent = usuarioActual.nombre;
  document.getElementById('perfil-correo').textContent = usuarioActual.email;
  document.getElementById('perfil-rol').textContent = usuarioActual.rol;
}

// SELECCIÓN DIRECTA DE SERVICIO DESDE EL CATÁLOGO
function seleccionarServicio(nombreServicio) {
  mostrarSeccion('seccion-solicitud');
  document.getElementById('servicio-tipo').value = nombreServicio;
}

// REGISTRO DE SOLICITUD CON VALIDACIONES Y MAP()
document.getElementById('formulario-solicitud').addEventListener('submit', function (e) {
  e.preventDefault();

  const nombre = document.getElementById('cliente-nombre').value.trim();
  const email = document.getElementById('cliente-email').value.trim();
  const telefono = document.getElementById('cliente-telefono').value.trim();
  const placa = document.getElementById('auto-placa').value.trim().toUpperCase();
  const marca = document.getElementById('auto-marca').value.trim();
  const modelo = document.getElementById('auto-modelo').value.trim();
  const anio = parseInt(document.getElementById('auto-anio').value, 10);
  const kilometraje = parseInt(document.getElementById('auto-kilometraje').value, 10);
  const servicio = document.getElementById('servicio-tipo').value;
  const fecha = document.getElementById('fecha-turno').value;
  const hora = document.getElementById('hora-turno').value;

  // Validación de placa ecuatoriana / estándar: 3 letras, guión y 3 o 4 números
  const regexPlaca = /^[A-Z]{3}-\d{3,4}$/;
  if (!regexPlaca.test(placa)) {
    Swal.fire('Placa Inválida', 'Use el formato ABC-1234 o ABC-123.', 'error');
    return;
  }

  // Validación de kilometraje
  if (kilometraje <= 0 || isNaN(kilometraje)) {
    Swal.fire('Kilometraje Inválido', 'Debe ser un número mayor a 0.', 'error');
    return;
  }

  // Validación de fecha no pasada
  const hoy = new Date().toISOString().split('T')[0];
  if (fecha < hoy) {
    Swal.fire('Fecha Inválida', 'La fecha no puede ser en el pasado.', 'error');
    return;
  }

  // Validación de horario de atención (08:00 a 17:00)
  if (hora < '08:00' || hora > '17:00') {
    Swal.fire('Horario Fuera de Rango', 'El horario de atención es de 08:00 a 17:00.', 'warning');
    return;
  }

  // Uso de map() para leer los checkboxes seleccionados
  const checks = document.querySelectorAll('.check-adicional:checked');
  const adicionales = Array.from(checks).map(c => c.value);

  // Si estamos en modo edición, actualizar cita existente (CRUD: Update)
  if (idCitaEditando) {
    const cita = solicitudes.find(item => item.id === idCitaEditando);
    if (cita) {
      cita.cliente = nombre;
      cita.email = email;
      cita.telefono = telefono;
      cita.placa = placa;
      cita.marca = marca;
      cita.modelo = modelo;
      cita.anio = anio;
      cita.kilometraje = kilometraje;
      cita.servicio = servicio;
      cita.tipoAtencion = document.querySelector('input[name="tipoAtencion"]:checked').value;
      cita.adicionales = adicionales;
      cita.fecha = fecha;
      cita.hora = hora;
      cita.observaciones = document.getElementById('observaciones').value.trim();

      guardarDatos();
      Swal.fire('Actualizado', `La cita ${idCitaEditando} fue actualizada con éxito.`, 'success');
      document.getElementById('formulario-solicitud').reset();
      cancelarEdicion();
      mostrarSeccion('seccion-admin');
      return;
    }
  }

  // Creación del nuevo objeto solicitud (CRUD: Create)
  const nuevaSolicitud = {
    id: 'MANT-' + Math.floor(100 + Math.random() * 900),
    cliente: nombre,
    email: email,
    telefono: telefono,
    placa: placa,
    marca: marca,
    modelo: modelo,
    anio: anio,
    kilometraje: kilometraje,
    servicio: servicio,
    tipoAtencion: document.querySelector('input[name="tipoAtencion"]:checked').value,
    adicionales: adicionales,
    fecha: fecha,
    hora: hora,
    observaciones: document.getElementById('observaciones').value.trim(),
    estado: 'Pendiente'
  };

  // Guardar en el array y sincronizar
  solicitudes.push(nuevaSolicitud);
  guardarDatos();

  // Si el cliente que registra la cita no existía en usuarios, registrarlo automáticamente
  if (!usuarios.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    usuarios.push({
      id: usuarios.length + 1,
      nombre: nombre,
      email: email,
      password: '123',
      rol: 'Cliente',
      activo: true
    });
    localStorage.setItem('usuarios_taller', JSON.stringify(usuarios));
  }

  Swal.fire('Guardado', `Cita registrada con código ${nuevaSolicitud.id}`, 'success');
  document.getElementById('formulario-solicitud').reset();

  if (usuarioActual && usuarioActual.rol === 'Cliente') {
    mostrarSeccion('seccion-cliente');
  } else if (usuarioActual && usuarioActual.rol === 'Administrador') {
    mostrarSeccion('seccion-admin');
  } else {
    mostrarSeccion('seccion-inicio');
  }
});

// GENERAR CLASE DE COLOR PARA CADA ESTADO
function claseBadge(estado) {
  if (estado === 'Pendiente') return 'badge-pendiente';
  if (estado === 'En revisión') return 'badge-revision';
  if (estado === 'En proceso') return 'badge-proceso';
  if (estado === 'Finalizado') return 'badge-finalizado';
  return 'badge-cancelado';
}

// RENDERIZAR TABLA CLIENTE USANDO FILTER() Y FOREACH()
function renderizarCliente() {
  const tbody = document.getElementById('tabla-cliente-cuerpo');
  tbody.innerHTML = '';
  if (!usuarioActual) return;

  // Filtrar solo las solicitudes del usuario logueado
  const misDatos = solicitudes.filter(s => s.email.toLowerCase() === usuarioActual.email.toLowerCase());

  if (misDatos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No tiene citas registradas.</td></tr>';
    return;
  }

  misDatos.forEach(s => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td><strong>${s.id}</strong></td>
      <td><i class="fa-solid fa-car" style="color: var(--color-acero);"></i> ${s.placa} <small>(${s.marca} ${s.modelo})</small></td>
      <td><i class="fa-solid fa-wrench" style="color: var(--color-acero);"></i> ${s.servicio}</td>
      <td><i class="fa-solid fa-calendar-day" style="color: var(--color-acero);"></i> ${s.fecha} <small>(${s.hora})</small></td>
      <td><span class="badge ${claseBadge(s.estado)}">${s.estado}</span></td>
    `;
    tbody.appendChild(fila);
  });
}

// RENDERIZAR TABLA DE ADMINISTRACIÓN CON FOREACH()
function renderizarAdmin(lista) {
  const tbody = document.getElementById('tabla-admin-cuerpo');
  tbody.innerHTML = '';

  if (lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No hay registros encontrados.</td></tr>';
    return;
  }

  lista.forEach(s => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td><strong>${s.id}</strong></td>
      <td><i class="fa-solid fa-user" style="color: var(--color-acero);"></i> ${s.cliente}</td>
      <td><i class="fa-solid fa-car" style="color: var(--color-acero);"></i> ${s.placa}</td>
      <td>${s.servicio}</td>
      <td>${s.fecha} <small>${s.hora}</small></td>
      <td>
        <select onchange="cambiarEstado('${s.id}', this.value)">
          <option value="Pendiente" ${s.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
          <option value="En revisión" ${s.estado === 'En revisión' ? 'selected' : ''}>En revisión</option>
          <option value="En proceso" ${s.estado === 'En proceso' ? 'selected' : ''}>En proceso</option>
          <option value="Finalizado" ${s.estado === 'Finalizado' ? 'selected' : ''}>Finalizado</option>
          <option value="Cancelado" ${s.estado === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
        </select>
      </td>
      <td>
        <button class="btn-limpiar btn-pequeno" onclick="editarSolicitud('${s.id}')">
          <i class="fa-solid fa-pen-to-square"></i> Editar
        </button>
        <button class="btn-limpiar btn-pequeno" onclick="eliminarSolicitud('${s.id}')">
          <i class="fa-solid fa-trash-can"></i> Eliminar
        </button>
      </td>
    `;
    tbody.appendChild(fila);
  });
}

// RENDERIZAR TABLA DE USUARIOS DEL SISTEMA (FOREACH)
function renderizarUsuariosAdmin() {
  const tbody = document.getElementById('tabla-usuarios-cuerpo');
  if (!tbody) return;
  tbody.innerHTML = '';

  usuarios.forEach(u => {
    const fila = document.createElement('tr');
    const esAdminLogueado = usuarioActual && usuarioActual.email === u.email;
    fila.innerHTML = `
      <td><i class="fa-solid fa-user" style="color: var(--color-acero);"></i> <strong>${u.nombre}</strong></td>
      <td>${u.email}</td>
      <td><span class="badge ${u.rol === 'Administrador' ? 'badge-revision' : 'badge-pendiente'}">${u.rol}</span></td>
      <td>
        <span class="badge ${u.activo ? 'badge-habilitado' : 'badge-deshabilitado'}">
          ${u.activo ? '<i class="fa-solid fa-check"></i> Habilitado' : '<i class="fa-solid fa-ban"></i> Deshabilitado'}
        </span>
      </td>
      <td>
        ${esAdminLogueado 
          ? '<small style="color: var(--color-gris-texto);">Sesión activa</small>' 
          : `<button class="btn-limpiar btn-pequeno" onclick="toggleEstadoUsuario('${u.email}')">
              <i class="fa-solid ${u.activo ? 'fa-user-slash' : 'fa-user-check'}"></i> ${u.activo ? 'Deshabilitar' : 'Habilitar'}
             </button>`
        }
      </td>
    `;
    tbody.appendChild(fila);
  });
}

// CAMBIAR ESTADO DE CUENTA DE USUARIO (HABILITAR / DESHABILITAR)
function toggleEstadoUsuario(email) {
  const u = usuarios.find(user => user.email === email);
  if (!u) return;

  u.activo = !u.activo;
  localStorage.setItem('usuarios_taller', JSON.stringify(usuarios));
  renderizarUsuariosAdmin();

  const estadoTexto = u.activo ? 'Habilitada' : 'Deshabilitada';
  const icono = u.activo ? 'success' : 'warning';
  Swal.fire(`Cuenta ${estadoTexto}`, `La cuenta de ${u.nombre} ahora está ${estadoTexto.toLowerCase()}.`, icono);
}

// EDITAR SOLICITUD (PRECARGA LOS DATOS EN EL FORMULARIO)
function editarSolicitud(id) {
  const s = solicitudes.find(item => item.id === id);
  if (!s) return;

  idCitaEditando = s.id;

  document.getElementById('cliente-nombre').value = s.cliente;
  document.getElementById('cliente-email').value = s.email;
  document.getElementById('cliente-telefono').value = s.telefono;
  document.getElementById('auto-placa').value = s.placa;
  document.getElementById('auto-marca').value = s.marca;
  document.getElementById('auto-modelo').value = s.modelo;
  document.getElementById('auto-anio').value = s.anio;
  document.getElementById('auto-kilometraje').value = s.kilometraje;
  document.getElementById('servicio-tipo').value = s.servicio;
  document.getElementById('fecha-turno').value = s.fecha;
  document.getElementById('hora-turno').value = s.hora;
  document.getElementById('observaciones').value = s.observaciones || '';

  const radio = document.querySelector(`input[name="tipoAtencion"][value="${s.tipoAtencion}"]`);
  if (radio) radio.checked = true;

  document.querySelectorAll('.check-adicional').forEach(chk => {
    chk.checked = s.adicionales && s.adicionales.includes(chk.value);
  });

  document.getElementById('titulo-formulario').innerHTML = `<i class="fa-solid fa-pen-to-square" style="color: var(--color-acento);"></i> Editar Cita (${s.id})`;
  document.getElementById('btn-submit-solicitud').innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Guardar Cambios`;

  mostrarSeccion('seccion-solicitud');
}

// CANCELAR MODO EDICIÓN
function cancelarEdicion() {
  idCitaEditando = null;
  const titulo = document.getElementById('titulo-formulario');
  const btn = document.getElementById('btn-submit-solicitud');
  if (titulo) titulo.innerHTML = `<i class="fa-solid fa-file-pen" style="color: var(--color-acento);"></i> Solicitud de Mantenimiento`;
  if (btn) btn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Registrar Cita`;
}

// CAMBIAR ESTADO DESDE EL ADMIN USANDO FIND()
function cambiarEstado(id, nuevoEstado) {
  const s = solicitudes.find(item => item.id === id);
  if (s) {
    s.estado = nuevoEstado;
    guardarDatos();
    Swal.fire('Actualizado', `La cita ${id} ahora está en: ${nuevoEstado}`, 'success');
  }
}

// ELIMINAR SOLICITUD CON CONFIRMACIÓN Y FILTER()
function eliminarSolicitud(id) {
  Swal.fire({
    title: '¿Eliminar cita?',
    text: `Se borrará el registro ${id}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, borrar',
    cancelButtonText: 'Cancelar'
  }).then(res => {
    if (res.isConfirmed) {
      solicitudes = solicitudes.filter(s => s.id !== id);
      guardarDatos();
      renderizarAdmin(solicitudes);
      Swal.fire('Eliminado', 'Registro borrado con éxito.', 'success');
    }
  });
}

// BUSCADOR EN TIEMPO REAL CON FILTER()
function filtrarAdmin() {
  const texto = document.getElementById('busqueda-admin').value.toLowerCase().trim();
  const filtrados = solicitudes.filter(s => {
    return s.placa.toLowerCase().includes(texto) || s.cliente.toLowerCase().includes(texto);
  });
  renderizarAdmin(filtrados);
}

// INICIALIZACIÓN AL CARGAR LA PÁGINA
document.addEventListener('DOMContentLoaded', function () {
  const inputFecha = document.getElementById('fecha-turno');
  if (inputFecha) {
    inputFecha.min = new Date().toISOString().split('T')[0];
  }

  sincronizarDiccionario();
  actualizarSesionUI();
  mostrarSeccion('seccion-inicio');
});
