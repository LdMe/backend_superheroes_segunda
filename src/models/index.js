import User from "./user.model.js";
import Hero from "./hero.model.js";

// const users = [
//   { id: 1, username: 'admin', email: 'admin@agencia.test', password: '$2b$10$Q0tpp8.5ahRcn9dT6JmEje7F85fk0AdkaRQRF2wj4KmMoeI5M73Za', role: 'admin' },
//   { id: 2, username: 'paco',  email: 'paco@agencia.test',  password: '$2b$10$AVSXrv7/YhFi8sVBuhUWOeB7Bl.ZxnX2/1UqWKnzwthzNmgZsqcNO', role: 'user' },
//   { id: 3, username: 'marta', email: 'marta@agencia.test', password: '$2b$10$AVSXrv7/YhFi8sVBuhUWOeB7Bl.ZxnX2/1UqWKnzwthzNmgZsqcNO', role: 'user' },
//   { id: 4, username: 'lucia', email: 'lucia@agencia.test', password: '$2b$10$AVSXrv7/YhFi8sVBuhUWOeB7Bl.ZxnX2/1UqWKnzwthzNmgZsqcNO', role: 'user' },
//   { id: 5, username: 'pepe',  email: 'pepe@agencia.test',  password: '$2b$10$AVSXrv7/YhFi8sVBuhUWOeB7Bl.ZxnX2/1UqWKnzwthzNmgZsqcNO', role: 'user' }
// ];

const powers = [
  { id: 1,  name: 'Detección de wifi',          description: 'Encuentra la red y la contraseña de cualquier bar en menos de un minuto.' },
  { id: 2,  name: 'Visión de huecos libres',    description: 'Ve una plaza de aparcamiento libre a tres manzanas de distancia.' },
  { id: 3,  name: 'Puntualidad sobrehumana',    description: 'Llega exactamente a la hora acordada. Siempre. Incluso a las cenas de empresa.' },
  { id: 4,  name: 'Memoria de tápers',          description: 'Recuerda de quién es cada táper de la nevera de la oficina.' },
  { id: 5,  name: 'Invisibilidad en reuniones', description: 'Nadie le pregunta nada en una reunión aunque esté en primera fila.' },
  { id: 6,  name: 'Cargador infinito',          description: 'Siempre lleva encima el cargador del modelo de móvil que necesitas.' },
  { id: 7,  name: 'Silencio absoluto',          description: 'Silencia el grupo de WhatsApp de la familia sin que nadie lo note.' },
  { id: 8,  name: 'Teletransporte a la cola',   description: 'Aparece siempre en la cola más corta del supermercado.' },
  { id: 9,  name: 'Explicar lo evidente',       description: 'Describe con todo detalle lo que todo el mundo ya sabía.' },
  { id: 10, name: 'Localizar objetos perdidos', description: 'Encuentra llaves, mandos a distancia y el otro calcetín de la lavadora.' },
  { id: 11, name: 'Radar vecinal',              description: 'Sabe quién se muda, quién se separa y quién tiene obras antes que nadie en el bloque.' },
  { id: 12, name: 'Abrir botes imposibles',     description: 'Abre cualquier bote de conserva a la primera.' }
];

// const heroes = [
//   { id: 1,  name: 'Capitán Wifi',                          description: 'Patrulla las cafeterías del barrio para que nadie se quede sin conexión.',          utility_level: 9,  user_id: 2 },
//   { id: 2,  name: 'El Fantasma del Trastero',              description: 'Recorre los trasteros los sábados y nadie sabe qué hace allí.',                     utility_level: 2,  user_id: 2 },
//   { id: 3,  name: 'El Hombre que Llega Puntual',           description: 'Su mera presencia hace que las reuniones empiecen a su hora.',                      utility_level: 6,  user_id: 2 },
//   { id: 4,  name: 'La Mujer que Siempre Encuentra Aparcamiento', description: 'Temida por los conductores del centro un viernes por la tarde.',              utility_level: 10, user_id: 3 },
//   { id: 5,  name: 'Doctor Cargador',                       description: 'Salvó tres móviles al 1 % el mes pasado.',                                          utility_level: 8,  user_id: 3 },
//   { id: 6,  name: 'El Calcetín Desparejado',               description: 'Devuelve cada calcetín a su pareja. Nadie conoce su método.',                       utility_level: 4,  user_id: 3 },
//   { id: 7,  name: 'Señora Táper',                          description: 'Ningún táper vuelve a casa equivocada mientras ella esté de guardia.',              utility_level: 7,  user_id: 4 },
//   { id: 8,  name: 'Mister Mute',                           description: 'Protector de la salud mental en los grupos de mensajería.',                         utility_level: 5,  user_id: 4 },
//   { id: 9,  name: 'Abuela Radar',                          description: 'Fuente de información más fiable del barrio desde 1974.',                           utility_level: 8,  user_id: 4 },
//   { id: 10, name: 'Capitán Obvio',                         description: 'Siempre dispuesto a recordar que el agua moja.',                                    utility_level: 1,  user_id: 1 }
// ];

const heroPowers = [
  { hero_id: 1,  power_id: 1 },  { hero_id: 1,  power_id: 6 },
  { hero_id: 2,  power_id: 5 },
  { hero_id: 3,  power_id: 3 },  { hero_id: 3,  power_id: 8 },
  { hero_id: 4,  power_id: 2 },  { hero_id: 4,  power_id: 3 },
  { hero_id: 5,  power_id: 6 },  { hero_id: 5,  power_id: 1 },
  { hero_id: 6,  power_id: 10 },
  { hero_id: 7,  power_id: 4 },  { hero_id: 7,  power_id: 10 },
  { hero_id: 8,  power_id: 7 },  { hero_id: 8,  power_id: 5 },
  { hero_id: 9,  power_id: 11 }, { hero_id: 9,  power_id: 3 }, { hero_id: 9, power_id: 8 },
  { hero_id: 10, power_id: 9 }
];

User.hasMany(Hero,{ foreignKey: 'userId', as: 'heroes' });
Hero.belongsTo(User,{foreignKey: 'userId',as: 'owner'});

export {
    User,
    Hero,
    powers,
    heroPowers
}