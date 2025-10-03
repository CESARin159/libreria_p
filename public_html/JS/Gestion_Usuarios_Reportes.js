//Gestion_Usuarios_Reportes
// Gestión de Usuarios
document.getElementById("formUsuarios").addEventListener("submit", function(e){
    e.preventDefault();
    let usuario = document.getElementById("usuario").value;
    let accion = document.getElementById("accion").value;
    let rol = document.getElementById("rol").value;

    let mensaje = "";
    if(accion === "registrar"){
        mensaje = `Usuario "${usuario}" registrado con rol ${rol}.`;
    } else if(accion === "asignar"){
        mensaje = `Rol "${rol}" asignado a usuario "${usuario}".`;
    } else if(accion === "bloquear"){
        mensaje = `Usuario "${usuario}" bloqueado correctamente.`;
    }
    document.getElementById("resultadoUsuarios").textContent = mensaje;
});

// Configuración de parámetros
document.getElementById("formParametros").addEventListener("submit", function(e){
    e.preventDefault();
    let dias = document.getElementById("dias").value;
    let multa = document.getElementById("multa").value;
    document.getElementById("resultadoParametros").textContent =
        `Configuración guardada: ${dias} días de préstamo, multa de S/ ${multa} por día.`;
});

// Generación de reportes
document.getElementById("formReportes").addEventListener("submit", function(e){
    e.preventDefault();
    let tipo = document.getElementById("tipoReporte").value;
    let formato = document.getElementById("formato").value;
    document.getElementById("resultadoReportes").textContent =
        `Reporte de ${tipo} generado en formato ${formato.toUpperCase()}.`;
});
