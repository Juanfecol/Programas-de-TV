const fs = require('fs');
const path = require('path');

// Títulos de los episodios 61 a 335 exactamente de la playlist original
const rawEpisodes = [
  { ep: 61, title: "Armando planea usar Terramoda para ayudar a ECOMODA" },
  { ep: 62, title: "Aura María le hace la vida imposible a Patricia" },
  { ep: 63, title: "Gutiérrez busca aprovecharse de Aura María" },
  { ep: 64, title: "Armando encierra a Betty en la oficina toda la noche" },
  { ep: 65, title: "Fredy lograr acercarse a Aura María" },
  { ep: 66, title: "Gutiérrez llega golpeado a ECOMODA" },
  { ep: 67, title: "Betty le da su respaldo a don Armando" },
  { ep: 68, title: "Jenny la amante del exesposo de Sofía llega a ECOMODA" },
  { ep: 69, title: "Armando no puede ayudar a Sofía" },
  { ep: 70, title: "Sofía intenta sacar a Jenny de ECOMODA" },
  { ep: 71, title: "Betty le pone la cara a los gerentes de los bancos" },
  { ep: 72, title: "Bertha pone incómoda a 'La peliteñida' con su vestido" },
  { ep: 73, title: "El cuartel planea ponerle una trampa a 'La pupuchurra'" },
  { ep: 74, title: "Armando está preocupado por el dinero para las telas" },
  { ep: 75, title: "Betty desconfía del negocio con el proveedor de Mario" },
  { ep: 76, title: "El plan del cuartel no sale como esperan" },
  { ep: 77, title: "Sofía le retiene el cheque del sueldo a Jenny" },
  { ep: 78, title: "Armando debe cumplirle la apuesta a Hugo" },
  { ep: 79, title: "Armando se mete en problemas al salir de la fiesta" },
  { ep: 80, title: "Betty va a rescatar a don Armando" },
  { ep: 81, title: "Armando logra llegar a su apartamento" },
  { ep: 82, title: "Fredy tiene un accidente en el carro de Armando" },
  { ep: 83, title: "Betty descubre a Patricia en su oficina" },
  { ep: 84, title: "Marcela descubre que Patricia le mintió a Betty" },
  { ep: 85, title: "Patricia debe enfrentar a Armando por los proveedores" },
  { ep: 86, title: "ECOMODA de nuevo en problemas por las telas" },
  { ep: 87, title: "Armando y Mario discuten por la pérdida de las telas" },
  { ep: 88, title: "Armando sostiene una conversación con don Hermes" },
  { ep: 89, title: "En ECOMODA se rumora que Patricia está embarazada" },
  { ep: 90, title: "Mario está muy angustiado por el embarazo de Patricia" },
  { ep: 91, title: "Armando ya no puede conciliar el sueño" },
  { ep: 92, title: "Daniel y Mario se imaginan siendo padres del bebé" },
  { ep: 93, title: "Bertha debe decidir qué hacer con el dinero" },
  { ep: 94, title: "Armando y Mario buscan la ayuda de Catalina Ángel" },
  { ep: 95, title: "Armando no pudo contener las deudas de ECOMODA" },
  { ep: 96, title: "Betty busca al abogado para embargar ECOMODA" },
  { ep: 97, title: "Betty acuerda el embargo de ECOMODA con el abogado" },
  { ep: 98, title: "El cuartel sospecha del embarazo de Patricia" },
  { ep: 99, title: "Bertha consigue un examen de sangre para Patricia" },
  { ep: 100, title: "Mario le recomienda a Armando tratar bien a Betty" },
  { ep: 101, title: "Armando y Betty se presentan en los bancos" },
  { ep: 102, title: "Bertha afronta a su esposo por no comprar el carro" },
  { ep: 103, title: "Inicia el embargo en ECOMODA" },
  { ep: 104, title: "Socios de ECOMODA reciben un informe de cifras" },
  { ep: 105, title: "Armando es acosado por una de las modelos de Hugo" },
  { ep: 106, title: "Betty salva a Armando de ser atrapado por Marcela" },
  { ep: 107, title: "Armando descubre que Betty tiene novio" },
  { ep: 108, title: "Betty desmiente su noviazgo con Nicolás" },
  { ep: 109, title: "Bertha le cuenta la predicción de Betty a Armando" },
  { ep: 110, title: "Mario le aconseja a Armando competir con Nicolás" },
  { ep: 111, title: "El cuartel por fin recibe los análisis de Patricia" },
  { ep: 112, title: "Mario y Daniel le hacen propuestas a Patricia" },
  { ep: 113, title: "Inicia el desfile de lanzamiento de ECOMODA" },
  { ep: 114, title: "Patricia amenaza a Bertha para que no diga nada" },
  { ep: 115, title: "El desfile fue un éxito para ECOMODA" },
  { ep: 116, title: "Armando empieza a tener sueños con Betty" },
  { ep: 117, title: "Mario le demuestra a Armando que Betty lo ama" },
  { ep: 118, title: "Patricia decide no irse de ECOMODA" },
  { ep: 119, title: "Armando inicia el plan para conquistar a Betty" },
  { ep: 120, title: "Mario y Armando llevan a Betty a un bar" },
  { ep: 121, title: "Armando y Betty se quedan solos" },
  { ep: 122, title: "Betty escribe en su diario lo sucedido con Armando" },
  { ep: 123, title: "Betty se siente culpable por lo sucedido con Armando" },
  { ep: 124, title: "El cuartel se solidariza con Sofía" },
  { ep: 125, title: "Armando le confiesa a Betty que le gusta" },
  { ep: 126, title: "Betty acepta tener una relación con Don Armando" },
  { ep: 127, title: "Armando le cuenta a Mario lo sucedido con Betty" },
  { ep: 128, title: "En ECOMODA se enteran que Betty tiene novio" },
  { ep: 129, title: "Mario le ofrece a Armando útiles de seducción" },
  { ep: 130, title: "Betty recibe la primera tarjeta de amor de Armando" },
  { ep: 131, title: "Betty y Armando tendrán una nueva cita" },
  { ep: 132, title: "Marcela llega al cóctel donde está Armando" },
  { ep: 133, title: "Armando le cumple la cita a Betty" },
  { ep: 134, title: "Fredy descubre a Aura María con otro hombre" },
  { ep: 135, title: "Armando debe enfrentarse a Marcela en ECOMODA" },
  { ep: 136, title: "Betty decide terminar su relación con Armando" },
  { ep: 137, title: "Armando planea una reconciliación con Betty" },
  { ep: 138, title: "Armando llega a la casa de Betty" },
  { ep: 139, title: "Armando se enfrenta a Román y sus amigos" },
  { ep: 140, title: "Betty decide hacerse un cambio de look" },
  { ep: 141, title: "Aura María es despedida de ECOMODA" },
  { ep: 142, title: "Betty llega a ECOMODA con su nueva imagen" },
  { ep: 143, title: "Aura María habla con Betty sobre encuentros íntimos" },
  { ep: 144, title: "El cuartel no se sincera con Betty por nueva imagen" },
  { ep: 145, title: "Armando tiene un altercado con Daniel Valencia" },
  { ep: 146, title: "Nicolás y Betty se burlan de su belleza" },
  { ep: 147, title: "Armando olvida el cumpleaños de Betty" },
  { ep: 148, title: "Hugo se entera que Inés le prestó un traje a Sofía" },
  { ep: 149, title: "Marcela planea seguir a Armando" },
  { ep: 150, title: "A Betty y Armando se les complica el plan" },
  { ep: 151, title: "Betty celebra su cumpleaños con el cuartel de las feas" },
  { ep: 152, title: "Marcela y Patricia persiguen a Armando" },
  { ep: 153, title: "Don Hermes sorprende a Armando fuera de su casa" },
  { ep: 154, title: "La policía detiene a Patricia" },
  { ep: 155, title: "Armando y Betty van a un hotel" },
  { ep: 156, title: "Armando y Betty pasan una noche" },
  { ep: 157, title: "Armando se disculpa con Betty" },
  { ep: 158, title: "Betty narra su noche romántica con Armando" },
  { ep: 159, title: "Betty se entera de las sospechas de Marcela" },
  { ep: 160, title: "Bertha es descubierta por el cuartel de las feas" },
  { ep: 161, title: "El cuartel de las feas advierte a Betty" },
  { ep: 162, title: "Armando sospecha de un romance entre Betty y Nicolás" },
  { ep: 163, title: "Armando se encuentra entre la espada y la pared" },
  { ep: 164, title: "Marcela descubre la supuesta amante de Armando" },
  { ep: 165, title: "Adriana Arboleda llega a Ecomoda" },
  { ep: 166, title: "Marcela hace una escena de celos" },
  { ep: 167, title: "Marcela descubre que Adriana no es la amante" },
  { ep: 168, title: "Armando planea contentar a Betty" },
  { ep: 169, title: "Armando se escapa con Betty" },
  { ep: 170, title: "Betty le reprocha a Armando la relación que tienen" },
  { ep: 171, title: "Betty relata cómo fue su primera vez" },
  { ep: 172, title: "Marcela le reclama a Armando por su amante" },
  { ep: 173, title: "Aura María y Fredy se salvan de ser despedidos" },
  { ep: 174, title: "Marcela invita a Betty a almorzar" },
  { ep: 175, title: "Betty se entera del plan de conquista de Calderón" },
  { ep: 176, title: "Betty se siente traicionada por Armando" },
  { ep: 177, title: "Catalina Ángel ayuda a Betty durante su crisis" },
  { ep: 178, title: "El cuartel de las feas consuela a Betty" },
  { ep: 179, title: "Betty se desahoga con Nicolás" },
  { ep: 180, title: "Betty narra cómo Armando la conquistó" },
  { ep: 181, title: "Betty lee a Nicolás la carta de instrucciones" },
  { ep: 182, title: "Armando no sospecha que Betty lo descubrió" },
  { ep: 183, title: "Betty comienza a poner a prueba a Armando" },
  { ep: 184, title: "Betty planea darle celos a Armando" },
  { ep: 185, title: "Betty da inicio a su plan para darle celos a Armando" },
  { ep: 186, title: "Betty le hace el primer desplante a Armando" },
  { ep: 187, title: "Armando no entiende la actitud de Betty" },
  { ep: 188, title: "Betty comprar un carro con dinero de Ecomoda" },
  { ep: 189, title: "Betty compra el carro y continúa con su plan" },
  { ep: 190, title: "El plan de Betty comienza a dar resultados" },
  { ep: 191, title: "Armando sigue a Betty hasta su casa" },
  { ep: 192, title: "Armando se siente confundido por la actitud de Betty" },
  { ep: 193, title: "Betty presume los detalles de Nicolás" },
  { ep: 194, title: "Armando le pide a Betty que hablen sobre su relación" },
  { ep: 195, title: "Armando presiona a Betty para que maquille el informe" },
  { ep: 196, title: "Betty lleva al cuartel de las feas a Le Noir" },
  { ep: 197, title: "Armando sospecha de la actitud de Betty" },
  { ep: 198, title: "Sandra le miente a Mario Calderón" },
  { ep: 199, title: "Armando invita a Betty a cenar" },
  { ep: 200, title: "Nicolás tiene una cita con Patricia" },
  { ep: 201, title: "Betty le pide un beso en público a Armando" },
  { ep: 202, title: "Armando le reclama a Betty por Nicolás" },
  { ep: 203, title: "Armando pasa la noche solo" },
  { ep: 204, title: "Marcela se entera que Armando estuvo con Betty" },
  { ep: 205, title: "Patricia presume su salida con Nicolás" },
  { ep: 206, title: "Marcela enfrenta a Armando por su salida con Betty" },
  { ep: 207, title: "Betty se entera que Nicolás salió con Patricia" },
  { ep: 208, title: "Jenny protagoniza un escándalo en Ecomoda" },
  { ep: 209, title: "Betty le exige a Nicolás que la recoja en Ecomoda" },
  { ep: 210, title: "Armando espía a Betty y a Nicolás" },
  { ep: 211, title: "Armando protagoniza una escena de celos" },
  { ep: 212, title: "Armando confiesa que no se quiere casar" },
  { ep: 213, title: "Calderón cree que Armando se enamoró de Betty" },
  { ep: 214, title: "Margarita Sáenz de Mendoza llega a Ecomoda" },
  { ep: 215, title: "Inés sufre una recaída por sobrecarga laboral" },
  { ep: 216, title: "Catalina Ángel descubre a Armando y a Betty besándose" },
  { ep: 217, title: "Hugo Lombardi y el cuartel de las feas cuida a Inés" },
  { ep: 218, title: "Armando y Nicolás se pelean frente a la casa de Inés" },
  { ep: 219, title: "Patricia continúa su plan para conquistar a Nicolás" },
  { ep: 220, title: "Marcela se entera que Armando se peleó con Nicolás" },
  { ep: 221, title: "Marcela enfrenta a Betty por pegarle a Armando" },
  { ep: 222, title: "Daniel Valencia intenta desenmascarar a Betty" },
  { ep: 223, title: "Armando presiona a Betty para que maquille el balance" },
  { ep: 224, title: "Betty duda en no maquillar el balance" },
  { ep: 225, title: "Ecomoda presenta su nueva colección" },
  { ep: 226, title: "La presentación de la colección finaliza con éxito" },
  { ep: 227, title: "Daniel se entera que Ecomoda está mal económicamente" },
  { ep: 228, title: "Nicolás y Patricia pasan la noche juntos" },
  { ep: 229, title: "Betty le cuenta a sus padres que renunciará a Ecomoda" },
  { ep: 230, title: "Daniel Valencia se entera que Betty embargó Ecomoda" },
  { ep: 231, title: "Armando confiesa que está enamorado de Betty" },
  { ep: 232, title: "Marcela presiona a Betty para que entregue el balance" },
  { ep: 233, title: "Armando se entera que Betty sabe toda la verdad" },
  { ep: 234, title: "Betty presenta el balance real de Ecomoda" },
  { ep: 235, title: "Betty renuncia a Ecomoda" },
  { ep: 236, title: "Marcela se entera de la relación entre Armando y Betty" },
  { ep: 237, title: "Betty se alista para viajar a Cartagena" },
  { ep: 238, title: "Marcela enfrenta a Armando y cancela el matrimonio" },
  { ep: 239, title: "Betty llega a Cartagena" },
  { ep: 240, title: "Betty le explica a Catalina el motivo de su renuncia" },
  { ep: 241, title: "Betty conoce a Michel Douanel" },
  { ep: 242, title: "Betty renuncia a ser la asistente de Catalina Ángel" },
  { ep: 243, title: "Betty decide seguir trabajando con Catalina Ángel" },
  { ep: 244, title: "Betty le cuenta a Catalina su historia con Armando" },
  { ep: 245, title: "Armando intenta averiguar en dónde está Betty" },
  { ep: 246, title: "Betty le ordena a Nicolás que asista a Ecomoda" },
  { ep: 247, title: "Armando le confiesa a Marcela que se enamoró de Betty" },
  { ep: 248, title: "Nicolás mora asiste a Ecomoda en nombre de Betty" },
  { ep: 249, title: "Catalina Ángel lleva a Betty a un salón de belleza" },
  { ep: 250, title: "Betty se hace un cambio de look y se quita el capul" },
  { ep: 251, title: "Betty disfruta de Cartagena mientras Armando sufre" },
  { ep: 252, title: "Armando se sumerge en el alcohol" },
  { ep: 253, title: "Catalina le habla a Michel Douanel sobre Betty" },
  { ep: 254, title: "Michel invita a Betty al coctel de Santa Teresa" },
  { ep: 255, title: "Betty se arregla para ir al coctel con Michel Douanel" },
  { ep: 256, title: "Doña Julia encuentra el diario de Betty" },
  { ep: 257, title: "Armando tiene una fuerte pelea" },
  { ep: 258, title: "Michel Douanel le da un beso a Betty" },
  { ep: 259, title: "Roberto Mendoza propone demandar a Betty" },
  { ep: 260, title: "Doña Julia confronta a Armando" },
  { ep: 261, title: "Michel Duanel le expresa sus sentimientos a Betty" },
  { ep: 262, title: "El cuartel de las feas se reúne para ver el reinado" },
  { ep: 263, title: "Armando acusa a Betty de robarle Ecomoda" },
  { ep: 264, title: "Betty se libera de los rencores hacia Armando" },
  { ep: 265, title: "Don Hermes habla con Roberto Mendoza" },
  { ep: 266, title: "Betty llega a Bogotá" },
  { ep: 267, title: "Betty llega a Bogotá y sorprende con su nueva imagen" },
  { ep: 268, title: "Ecomoda deberá seguir perteneciendo a Terramoda" },
  { ep: 269, title: "Betty le cuenta a su madre su relación con Armando" },
  { ep: 270, title: "Catalina prepara a Betty para su regreso a Ecomoda" },
  { ep: 271, title: "Betty regresa a Ecomoda" },
  { ep: 272, title: "Betty continúa sorprendiendo con su cambio de imagen" },
  { ep: 273, title: "Betty es postulada a la presidencia de Ecomoda" },
  { ep: 274, title: "Betty es la nueva presidenta de Ecomoda" },
  { ep: 275, title: "Gutiérrez hace oficial el nombramiento de Betty" },
  { ep: 276, title: "El cuartel celebra el nombramiento de Betty" },
  { ep: 277, title: "Betty sale a festejar con el cuartel de las feas" },
  { ep: 278, title: "Betty le cuenta al cuartel por qué salió de Ecomoda" },
  { ep: 279, title: "Armando le da una explicación a Betty" },
  { ep: 280, title: "Betty le cuenta a su mamá que Armando todavía la ama" },
  { ep: 281, title: "Armando y Betty llegan a una conciliación legal" },
  { ep: 282, title: "Nicolás es nombrado nuevo vicepresidente de Ecomoda" },
  { ep: 283, title: "Mario aconseja a Armando para que recupere a Betty" },
  { ep: 284, title: "El cuartel se salva de ser despedidas de Ecomoda" },
  { ep: 285, title: "Betty pide que diseñen ropa para mujeres comunes" },
  { ep: 286, title: "Betty propone utilizar al cuartel como modelos" },
  { ep: 287, title: "Betty saca las pertenencias de Armando de su oficina" },
  { ep: 288, title: "El cuartel encuentra la carta de instrucciones" },
  { ep: 289, title: "El cuartel se entera del romance de Betty y Armando" },
  { ep: 290, title: "El cuartel continúa indagando sobre la carta" },
  { ep: 291, title: "Armando busca en la basura los obsequios de Betty" },
  { ep: 292, title: "Daniel Valencia invita a comer a Betty" },
  { ep: 293, title: "El cuartel le confiesa a Betty que leyeron la carta" },
  { ep: 294, title: "Betty le cuenta a las del cuartel toda la verdad" },
  { ep: 295, title: "Betty no logra olvidar a Armando" },
  { ep: 296, title: "Catalina Ángel deja claro a Marcela su apoyo a Betty" },
  { ep: 297, title: "Mariana le lee nuevamente las cartas a Betty" },
  { ep: 298, title: "Betty cena con Daniel Valencia" },
  { ep: 299, title: "Hugo comienza a trabajar en la imagen del cuartel" },
  { ep: 300, title: "Betty se prepara para el lanzamiento de la colección" },
  { ep: 301, title: "Armando vuelve a Ecomoda" },
  { ep: 302, title: "Alejandra Sing llega a Ecomoda" },
  { ep: 303, title: "Armando le hace un tour por Ecomoda a Alejandra" },
  { ep: 304, title: "Hugo Lombardi arregla al cuartel de las feas" },
  { ep: 305, title: "Betty cambia su imagen para el lanzamiento" },
  { ep: 306, title: "Hugo Lombardi renunciará luego del lanzamiento" },
  { ep: 307, title: "Betty presenta la nueva colección de Ecomoda" },
  { ep: 308, title: "El cuartel desfila en el lanzamiento de la colección" },
  { ep: 309, title: "Betty le pide a Hugo Lombardi que no renuncie" },
  { ep: 310, title: "Betty sigue recibiendo elogios por la nueva colección" },
  { ep: 311, title: "Armando termina su relación con Marcela" },
  { ep: 312, title: "Betty está confundida con la actitud de Armando" },
  { ep: 313, title: "Betty se entera que Armando terminó con Marcela" },
  { ep: 314, title: "Alejandra Sing adquiere una franquicia de Ecomoda" },
  { ep: 315, title: "El cuartel anima a Betty para que olvide a Armando" },
  { ep: 316, title: "Patricia y Nicolás protagonizan un escándalo" },
  { ep: 317, title: "Michel Douanel llega a Ecomoda" },
  { ep: 318, title: "Armando conoce a Michel Douanel" },
  { ep: 319, title: "Armando descubre el diario de Betty" },
  { ep: 320, title: "Armando lee el diario de Betty" },
  { ep: 321, title: "Catalina persuade a Betty de trabajar con Michel" },
  { ep: 322, title: "Betty le cuenta al cuartel que trabajará con Michel" },
  { ep: 323, title: "Betty lleva a Michel a su casa" },
  { ep: 324, title: "Inés anima a Armando para que recupere a Betty" },
  { ep: 325, title: "Armando habla con doña Julia sobre Betty" },
  { ep: 326, title: "Armando llega al lugar en el que está Betty y Michel" },
  { ep: 327, title: "Armando le pide a Montaner que le cante a Betty" },
  { ep: 328, title: "Betty renuncia a la presidencia de Ecomoda" },
  { ep: 329, title: "Armando renuncia a Ecomoda" },
  { ep: 330, title: "Daniel Valencia asume la presidencia de Ecomoda" },
  { ep: 331, title: "Marcela le confiesa a Betty que Armando la ama" },
  { ep: 332, title: "Betty decide salvar Ecomoda" },
  { ep: 333, title: "Armando y Betty se reconcilian" },
  { ep: 334, title: "Armando le pide matrimonio a Betty" },
  { ep: 335, title: "Betty y Armando se casan" }
];

// Generar el archivo final
const generatePlaylist = () => {
  let content = `import { Episode } from './types';\n\nexport const bettyPlaylist: Episode[] = [\n`;

  // Episodios 1-60
  for (let i = 1; i <= 60; i++) {
    const pad = String(i).padStart(2, '0');
    content += `  { episodio: ${i}, titulo: "Episodio ${i}", url: "https://pixelia.b-cdn.net/Yo%20soy%20Betty%20la%20fea%20S01E${pad}.mp4.mp4" },\n`;
  }

  // Episodios 61-335
  for (const ep of rawEpisodes) {
    let connector = 'completo%20';
    let suffix = '';
    let prefix = 'Yo%20soy%20Betty%2C%20la%20fea%20-%20Capi%CC%81tulo%20';

    if (ep.ep === 71) {
      prefix = 'Yo%20soy%20Betty%2C%20la%20fea%20-%20Capi%CC%81tulo%2071%20completo%20_%20';
    } else if (ep.ep === 100) {
      connector = 'completo_';
    } else if (ep.ep === 138 || ep.ep === 188 || ep.ep === 247 || ep.ep === 288) {
      connector = 'completo_%20';
    }

    // Codificación de título con reemplazo inteligente de caracteres problemáticos
    let encTitle = ep.title.normalize('NFD');
    // Para el ep 222, el URL tiene "Daniel Daniel"
    if (ep.ep === 222) {
      encTitle = "Daniel Daniel Valencia intenta desenmascarar a Betty".normalize('NFD');
    }
    // Para el ep 261, Michel Duanel en el URL
    if (ep.ep === 261) {
      encTitle = "Michel Duanel le expresa sus sentimientos a Betty".normalize('NFD');
    }
    // Para el ep 280, el URL tiene "su docente o mamá"
    if (ep.ep === 280) {
      encTitle = "Betty le cuenta a su docente o mamá que Armando todavía la ama".normalize('NFD');
    }

    let encoded = encodeURIComponent(encTitle);
    
    // El bcdn espera comas codificadas de cierta manera, etc.
    // Reemplazar comillas simples con smart quotes si corresponde
    encoded = encoded.replace(/'/g, '%E2%80%99'); // smart quotes right
    // O reemplazar '%' si se rompe algo, pero encodeURIComponent lo maneja perfecto.

    let url = '';
    if (ep.ep === 71) {
      url = `https://pixelia.b-cdn.net/${prefix}${encoded}.mp4`;
    } else {
      url = `https://pixelia.b-cdn.net/${prefix}${ep.ep}%20${connector}${encoded}.mp4`;
    }

    // Escapar comillas dobles en títulos para TS
    const safeTitle = ep.title.replace(/"/g, '\\"');
    content += `  { episodio: ${ep.ep}, titulo: "${safeTitle}", url: "${url}" },\n`;
  }

  content += `];\n`;

  fs.writeFileSync(path.join(__dirname, 'src', 'bettyPlaylist.ts'), content, 'utf8');
  console.log('Successfully wrote src/bettyPlaylist.ts!');
};

generatePlaylist();
