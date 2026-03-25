//Control sidebars

const btnMenu = document.getElementById("btnToggleMenu");
const sidebarLeft = document.getElementById("sidebarLeft");

const btnNotif = document.getElementById("btnToggleCalendar");
const sidebarRight = document.getElementById("sidebarRight");

btnMenu.addEventListener("click", () => {
    sidebarLeft.classList.toggle("active");
});

btnNotif.addEventListener("click", () => {
    sidebarRight.classList.toggle("active");
});

//Validacion estricta

function validarTemperaturas(t1, t2, t3) {

    const temps = [t1, t2, t3];

    if (temps.some(t => t === "" || isNaN(t))) {
        return false;
    }

    if (temps.some(t => t < 0 || t > 80)) {
        return false;
    }

    const max = Math.max(...temps);
    const min = Math.min(...temps);

    if ((max - min) > 15) {
        return false;
    }

    return true;
}

//Promedio

function calcularPromedio(t1, t2, t3) {
    return (t1 + t2 + t3) / 3;
}

//Clasificacion

function clasificarEtapa(historial) {

    if (historial.length < 3) return "mesofilica";

    const ultimos = historial.slice(-3);
    const [t1, t2, t3] = ultimos;

    const subida = t3 > t2 && t2 > t1;
    const bajada = t3 < t2 && t2 < t1;

    const estable =
        Math.abs(t3 - t2) <= 3 &&
        Math.abs(t2 - t1) <= 3;

    const huboTermofilica = historial.some(t => t >= 45);

    // Para <30°C dos registros
    const ultimosDos = historial.slice(-2);
    const dosMenores30 = ultimosDos.every(t => t < 30);

    if (t3 >= 45) return "termofilica";

    if (dosMenores30 && huboTermofilica) return "enfriamiento";

    if (estable && t3 >= 20 && t3 <= 30) return "maduracion";

    if (subida) return "mesofilica";

    return "mesofilica";
}

//Dias habiles

function siguienteDiaHabil(fecha) {
    const nueva = new Date(fecha);

    do {
        nueva.setDate(nueva.getDate() + 1);
    } while (nueva.getDay() === 0 || nueva.getDay() === 6);

    return nueva;
}

//Proxima bitacora

function calcularSiguienteBitacora(etapa) {

    let dias;

    switch (etapa) {
        case "mesofilica":
            dias = 1;
            break;
        case "termofilica":
            dias = 2;
            break;
        case "enfriamiento":
        case "maduracion":
            dias = 7;
            break;
    }

    let fecha = new Date();

    for (let i = 0; i < dias; i++) {
        fecha = siguienteDiaHabil(fecha);
    }

    return fecha;
}

//Automatizacion de tareas

function generarTarea(observacion) {

    const mapa = {
        olor: ["Volteo + material seco", "alta"],
        humedad: ["Agregar material marrón", "media"],
        seco: ["Agregar agua", "media"],
        insectos: ["Cubrir mezcla", "alta"],
        estancado: ["Volteo intensivo", "alta"]
    };

    return mapa[observacion] || null;
}

//Integracion con el formulario

const form = document.getElementById("formBitacora");

let historial = [];

form.addEventListener("submit", function(e) {
    e.preventDefault();

    const t1 = parseFloat(document.getElementById("temp1").value);
    const t2 = parseFloat(document.getElementById("temp2").value);
    const t3 = parseFloat(document.getElementById("temp3").value);
    const ph = parseFloat(document.getElementById("inputPH").value);
    const obs = document.getElementById("selectObservacion").value;

    // BLOQUEO
    if (!validarTemperaturas(t1, t2, t3)) {
        alert("Temperaturas inválidas");
        return;
    }

    if (ph < 4.5 || ph > 9) {
        alert("pH fuera de rango");
        return;
    }

    const promedio = calcularPromedio(t1, t2, t3);
    historial.push(promedio);

    const etapa = clasificarEtapa(historial);

    const siguiente = calcularSiguienteBitacora(etapa);

    const tarea = generarTarea(obs);

    console.log({
        promedio,
        etapa,
        siguiente,
        tarea
    });

});