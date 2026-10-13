// Contenido del archivo: artistas, álbumes e historia.
// Cada dato está tomado de la fuente que figura al lado (consultadas el 13/10/2026).
// La biografía larga y las imágenes se traen en vivo desde Wikipedia (ver services/wiki.js).

const W = (t) => `https://en.wikipedia.org/wiki/${t}`;

export const ARTISTAS = [
  // ───────── West Coast
  {
    id: 'tupac', nombre: '2Pac', wiki: 'Tupac_Shakur', costa: 'west', grupo: false,
    nacimiento: '16 de junio de 1971, East Harlem, Nueva York', muerte: '13 de septiembre de 1996',
    dato: 'Entró al Salón de la Fama del Rock and Roll en 2017, en su primer año de elegibilidad.',
    logros: ['Hip-Hop Hall of Fame (2002)', 'Salón de la Fama del Rock and Roll (2017)'],
    cita: {
      original: "I'm not saying I'm gonna change the world, but I'll spark the brain that will change the world.",
      es: 'No digo que vaya a cambiar el mundo, pero voy a encender la mente que lo va a cambiar.',
      contexto: 'Entrevista con MTV, 1994',
      fuente: 'https://www.vibe.com/features/lists/vibe-favorite-tupac-moments-355239/',
    },
  },
  {
    id: 'snoop', nombre: 'Snoop Dogg', wiki: 'Snoop_Dogg', costa: 'west',
    nacimiento: '20 de octubre de 1971, Long Beach, California',
    dato: 'Su debut, Doggystyle, vendió 806.858 copias en la primera semana: el récord para un artista debutante.',
    logros: ['Doggystyle debutó en el n.º 1 del Billboard 200 (1993)', '"Drop It Like It\'s Hot", su primer single n.º 1 (2004)'],
  },
  {
    id: 'dre', nombre: 'Dr. Dre', wiki: 'Dr._Dre', costa: 'west',
    nacimiento: '18 de febrero de 1965, Compton, California',
    dato: 'Con The Chronic (1992) popularizó el G-funk, el sonido que definió a la West Coast.',
    logros: [
      'Grammy a Mejor Interpretación de Rap Solista por "Let Me Ride" (1994)',
      'Salón de la Fama del Rock and Roll con N.W.A (2016)',
      'Apple compró su marca Beats por 3.400 millones de dólares (2014)',
    ],
    cita: {
      original: 'Perfectionist is sometimes just a word I use to buy time.',
      es: '"Perfeccionista" a veces es solo una palabra que uso para ganar tiempo.',
      contexto: 'Entrevista con Forbes',
      fuente: 'https://www.complex.com/music/a/markelibert/dr-dre-perfectionist-label-buy-time',
    },
  },
  {
    id: 'icecube', nombre: 'Ice Cube', wiki: 'Ice_Cube', costa: 'west',
    nacimiento: '15 de junio de 1969, Los Ángeles, California',
    dato: 'The Predator (1992) fue el primer álbum en debutar en el n.º 1 de los rankings de R&B/hip hop y de pop a la vez.',
    logros: ['Salón de la Fama del Rock and Roll con N.W.A (2016)'],
    cita: {
      original: 'I do records for black kids, and white kids are basically eavesdropping.',
      es: 'Hago discos para los chicos negros; los chicos blancos, básicamente, escuchan a escondidas.',
      contexto: 'Entrevista con bell hooks para la revista Spin',
      fuente: 'https://www.encyclopedia.com/people/literature-and-arts/music-popular-and-jazz-biographies/ice-cube',
    },
  },
  {
    id: 'eazye', nombre: 'Eazy-E', wiki: 'Eazy-E', costa: 'west',
    nacimiento: '7 de septiembre de 1964, Compton, California', muerte: '26 de marzo de 1995',
    dato: 'En 1987 fundó Ruthless Records, el sello que lanzó a N.W.A y, años después, a Bone Thugs-n-Harmony.',
    logros: ['Fundador de Ruthless Records (1987)', 'Salón de la Fama del Rock and Roll con N.W.A (2016)'],
  },
  {
    id: 'nwa', nombre: 'N.W.A', wiki: 'N.W.A', costa: 'west', grupo: true,
    nacimiento: 'Formado en Compton, California, en 1987',
    integrantes: 'Arabian Prince, Dr. Dre, Eazy-E, Ice Cube, DJ Yella y MC Ren',
    dato: 'Straight Outta Compton fue el primer álbum de gangsta rap en ser disco de platino.',
    logros: ['Salón de la Fama del Rock and Roll (2016)', 'Grammy a la Trayectoria (2024)'],
  },
  {
    id: 'game', nombre: 'The Game', wiki: 'The_Game_(rapper)', costa: 'west',
    nacimiento: '29 de noviembre de 1979, Compton, California',
    dato: 'Su debut, The Documentary (2005), entró directo al n.º 1 del Billboard 200.',
    logros: ['The Documentary, n.º 1 del Billboard 200 (2005)'],
  },
  {
    id: 'kendrick', nombre: 'Kendrick Lamar', wiki: 'Kendrick_Lamar', costa: 'west',
    nacimiento: '17 de junio de 1987, Compton, California',
    dato: 'En 2018 ganó el Premio Pulitzer de Música por DAMN.: el primer músico fuera de la clásica y el jazz en recibirlo.',
    logros: ['Premio Pulitzer de Música (2018)', '27 premios Grammy, la mayor cantidad para un rapero'],
  },
  {
    id: 'icet', nombre: 'Ice-T', wiki: 'Ice-T', costa: 'west',
    nacimiento: '16 de febrero de 1958, Newark, Nueva Jersey',
    dato: '"6 \'n the Mornin\'" es señalada como una de las primeras canciones de gangsta rap.',
    logros: [
      'Grammy por "Back on the Block" (1991)',
      'Premio NAACP Image como actor en La ley y el orden: UVE (2002)',
      'Grammy a Mejor Interpretación de Metal con Body Count (2021)',
    ],
  },
  {
    id: 'coolio', nombre: 'Coolio', wiki: 'Coolio', costa: 'west',
    nacimiento: '1 de agosto de 1963, Monessen, Pensilvania', muerte: '28 de septiembre de 2022',
    dato: '"Gangsta\'s Paradise" estuvo tres semanas en el n.º 1 del Billboard Hot 100.',
    logros: ['Grammy a Mejor Interpretación de Rap Solista por "Gangsta\'s Paradise" (1996)'],
  },
  {
    id: 'souls', nombre: 'Souls of Mischief', wiki: 'Souls_of_Mischief', costa: 'west', grupo: true,
    nacimiento: 'Formado en East Oakland, California, en 1991',
    integrantes: 'A-Plus, Opio, Phesto y Tajai',
    dato: 'Son parte de Hieroglyphics, el colectivo independiente de Oakland.',
    logros: ["93 'til Infinity, su álbum más alto en el Billboard 200 (n.º 85)"],
  },
  // ───────── East Coast
  {
    id: 'nas', nombre: 'Nas', wiki: 'Nas', costa: 'east',
    nacimiento: '14 de septiembre de 1973, Brooklyn, Nueva York',
    dato: 'Illmatic recibió los 5 micrófonos de The Source, la nota máxima, algo poco común para un debut.',
    logros: [
      'It Was Written debutó en el n.º 1 del Billboard 200 (1996)',
      'Grammy a Mejor Álbum de Rap por King\'s Disease (2021), su primer Grammy',
    ],
  },
  {
    id: 'biggie', nombre: 'The Notorious B.I.G.', wiki: 'The_Notorious_B.I.G.', costa: 'east',
    nacimiento: '21 de mayo de 1972, Brooklyn, Nueva York', muerte: '9 de marzo de 1997',
    dato: 'Fue elegido Rapero del Año en los Billboard Music Awards de 1995.',
    logros: ['Rapero del Año, Billboard Music Awards (1995)', 'Salón de la Fama del Rock and Roll (2020)'],
  },
  {
    id: 'wutang', nombre: 'Wu-Tang Clan', wiki: 'Wu-Tang_Clan', costa: 'east', grupo: true,
    nacimiento: 'Formado en Staten Island, Nueva York, en 1992',
    integrantes: "RZA, GZA, Method Man, Raekwon, Ghostface Killah, Inspectah Deck, U-God, Masta Killa, Cappadonna y Ol' Dirty Bastard",
    dato: 'Once Upon a Time in Shaolin, una copia única, se vendió en 2015 por 2 millones de dólares: la obra musical más cara de la historia.',
    logros: ['Enter the Wu-Tang (36 Chambers) en el Registro Nacional de Grabaciones (2022)'],
  },
  {
    id: 'mobbdeep', nombre: 'Mobb Deep', wiki: 'Mobb_Deep', costa: 'east', grupo: true,
    nacimiento: 'Formado en Queens, Nueva York, en 1990',
    integrantes: 'Prodigy (murió en 2017) y Havoc',
    dato: 'The Infamous quedó primero en la lista de los 100 mejores discos de rap de Pitchfork (2025).',
    logros: ['The Infamous entre los 500 mejores álbumes de Rolling Stone (2020)'],
  },
  {
    id: 'fifty', nombre: '50 Cent', wiki: '50_Cent', costa: 'east',
    nacimiento: '6 de julio de 1975, Queens, Nueva York',
    dato: 'Get Rich or Die Tryin\' fue el álbum más vendido de 2003 en Estados Unidos.',
    logros: ['872.000 copias en la primera semana de su debut (2003)'],
  },
  {
    id: 'jayz', nombre: 'Jay-Z', wiki: 'Jay-Z', costa: 'east',
    nacimiento: '4 de diciembre de 1969, Brooklyn, Nueva York',
    dato: 'En 2019 se convirtió en el primer multimillonario del hip hop.',
    logros: ['Salón de la Fama del Rock and Roll (2021)'],
  },
  {
    id: 'bigl', nombre: 'Big L', wiki: 'Big_L', costa: 'east',
    nacimiento: '30 de mayo de 1974, Harlem, Nueva York', muerte: '15 de febrero de 1999',
    dato: '"Flamboyant", publicado después de su muerte, fue su único n.º 1 (Hot Rap Tracks de Billboard).',
    logros: ['Debut: Lifestylez ov da Poor & Dangerous (1995)'],
  },
  {
    id: 'bdp', nombre: 'Boogie Down Productions', wiki: 'Boogie_Down_Productions', costa: 'east', grupo: true,
    nacimiento: 'Formado en el Bronx, Nueva York, en 1986',
    integrantes: 'KRS-One, D-Nice y DJ Scott La Rock (asesinado en 1987)',
    dato: 'Criminal Minded (1987) es considerado por muchos el comienzo del movimiento gangsta rap.',
    logros: ['Criminal Minded entre los 500 mejores álbumes de Rolling Stone (2003 y 2020)'],
  },
  {
    id: 'raekwon', nombre: 'Raekwon', wiki: 'Raekwon', costa: 'east',
    nacimiento: '12 de enero de 1970, Brooklyn, Nueva York',
    dato: 'Only Built 4 Cuban Linx... es considerado uno de los mejores discos de hip hop; RZA lo describió como "una historia de mafia".',
    logros: ['Integrante de Wu-Tang Clan'],
  },
  {
    id: 'schoollyd', nombre: 'Schoolly D', wiki: 'Schoolly_D', costa: 'east',
    nacimiento: '22 de junio de 1962, West Philadelphia, Pensilvania',
    dato: 'Ice-T, en su autobiografía, señala "P.S.K. What Does It Mean?" como el primer disco de gangsta rap.',
    logros: [],
  },
  {
    id: 'atcq', nombre: 'A Tribe Called Quest', wiki: 'A_Tribe_Called_Quest', costa: 'east', grupo: true,
    nacimiento: 'Formado en Queens, Nueva York, en 1985',
    integrantes: 'Q-Tip, Phife Dawg, Ali Shaheed Muhammad y Jarobi White',
    dato: 'The Low End Theory recibió los 5 micrófonos de The Source, su segundo disco seguido con la nota máxima.',
    logros: ['Salón de la Fama del Rock and Roll (2024)', 'The Low End Theory en el Registro Nacional de Grabaciones (2022)'],
  },
  {
    id: 'fugees', nombre: 'Fugees', wiki: 'Fugees', costa: 'east', grupo: true,
    nacimiento: 'Formado en South Orange, Nueva Jersey, en 1990',
    integrantes: 'Lauryn Hill, Wyclef Jean y Pras Michel',
    dato: 'The Score ganó el Grammy a Mejor Álbum de Rap y llegó a 7 discos de platino.',
    logros: ['Grammy a Mejor Álbum de Rap (1997)'],
  },
  // ───────── Sur
  {
    id: 'scarface', nombre: 'Scarface', wiki: 'Scarface_(rapper)', costa: 'south',
    nacimiento: '9 de noviembre de 1970, Houston, Texas',
    dato: 'Integrante de Geto Boys, en Houston, y presidente de Def Jam South entre 2000 y 2005.',
    logros: ['The Diary, disco de platino (1994)', 'Letrista del Año, Source Awards (2001)'],
  },
  {
    id: 'ugk', nombre: 'UGK', wiki: 'UGK', costa: 'south', grupo: true,
    nacimiento: 'Formado en Port Arthur, Texas, en 1987',
    integrantes: 'Bun B y Pimp C (murió en 2007)',
    dato: 'Underground Kingz (2007) debutó en el n.º 1 del Billboard 200.',
    logros: [],
  },
  // ───────── Medio Oeste
  {
    id: 'bone', nombre: 'Bone Thugs-n-Harmony', wiki: 'Bone_Thugs-n-Harmony', costa: 'midwest', grupo: true,
    nacimiento: 'Formado en Cleveland, Ohio, en 1991',
    integrantes: 'Bizzy Bone, Wish Bone, Layzie Bone, Krayzie Bone y Flesh-n-Bone',
    dato: '"Tha Crossroads" estuvo ocho semanas seguidas en el n.º 1 del Billboard Hot 100.',
    logros: ['Grammy por "Tha Crossroads" (1997)', 'Firmados por Eazy-E en Ruthless Records (1993)'],
  },
].map((a) => ({ ...a, fuente: W(a.wiki) }));

export const ALBUMES = [
  { id: 'criminal-minded', titulo: 'Criminal Minded', artista: 'bdp', wiki: 'Criminal_Minded', anio: 1987, costa: 'east',
    fecha: 'Mayo de 1987', sello: 'B-Boy Records',
    dato: 'Fue el primer lanzamiento importante del hip hop con sus integrantes mostrando armas en la portada.' },
  { id: 'straight-outta-compton', titulo: 'Straight Outta Compton', artista: 'nwa', wiki: 'Straight_Outta_Compton', anio: 1989, costa: 'west',
    fecha: '25 de enero de 1989', sello: 'Priority / Ruthless', productores: 'Dr. Dre, DJ Yella y Arabian Prince',
    dato: 'El primer álbum de gangsta rap en ser disco de platino. Una de sus canciones motivó una carta de advertencia del FBI.' },
  { id: 'amerikkkas-most-wanted', titulo: "AmeriKKKa's Most Wanted", artista: 'icecube', wiki: "AmeriKKKa's_Most_Wanted", anio: 1990, costa: 'west',
    fecha: '16 de mayo de 1990', sello: 'Priority', productores: 'The Bomb Squad',
    dato: 'Producido por The Bomb Squad, el equipo de Public Enemy: un cruce entre las dos costas. Fue platino el mismo año.' },
  { id: 'the-low-end-theory', titulo: 'The Low End Theory', artista: 'atcq', wiki: 'The_Low_End_Theory', anio: 1991, costa: 'east',
    fecha: '24 de septiembre de 1991', sello: 'Jive',
    dato: 'La Biblioteca del Congreso lo sumó al Registro Nacional de Grabaciones en 2022.' },
  { id: 'the-chronic', titulo: 'The Chronic', artista: 'dre', wiki: 'The_Chronic', anio: 1992, costa: 'west',
    fecha: '15 de diciembre de 1992', sello: 'Death Row / Interscope', productores: 'Dr. Dre',
    dato: 'Popularizó el G-funk. En 2019 entró al Registro Nacional de Grabaciones.' },
  { id: '93-til-infinity', titulo: "93 'til Infinity", artista: 'souls', wiki: "93_'til_Infinity", anio: 1993, costa: 'west',
    dato: 'Es el álbum del grupo que más alto llegó en el Billboard 200 (n.º 85).' },
  { id: 'enter-the-wu-tang', titulo: 'Enter the Wu-Tang (36 Chambers)', artista: 'wutang', wiki: 'Enter_the_Wu-Tang_(36_Chambers)', anio: 1993, costa: 'east',
    fecha: '9 de noviembre de 1993', sello: 'Loud / RCA', productores: 'RZA',
    dato: 'Cuatro discos de platino y, desde 2022, parte del Registro Nacional de Grabaciones.' },
  { id: 'doggystyle', titulo: 'Doggystyle', artista: 'snoop', wiki: 'Doggystyle', anio: 1993, costa: 'west',
    fecha: '23 de noviembre de 1993', sello: 'Death Row / Interscope', productores: 'Dr. Dre',
    dato: 'Vendió 806.858 copias en su primera semana, récord para un artista debutante.' },
  { id: 'illmatic', titulo: 'Illmatic', artista: 'nas', wiki: 'Illmatic', anio: 1994, costa: 'east',
    fecha: '19 de abril de 1994', sello: 'Columbia', productores: 'DJ Premier, Large Professor, Pete Rock, Q-Tip, L.E.S. y Nas',
    dato: 'Recibió los 5 micrófonos de The Source y en 2021 entró al Registro Nacional de Grabaciones.' },
  { id: 'ready-to-die', titulo: 'Ready to Die', artista: 'biggie', wiki: 'Ready_to_Die', anio: 1994, costa: 'east',
    fecha: '13 de septiembre de 1994', sello: 'Bad Boy / Arista', productores: 'Sean "Puffy" Combs (producción ejecutiva)',
    dato: 'Seis veces platino. En 2024 entró al Registro Nacional de Grabaciones.' },
  { id: 'the-diary', titulo: 'The Diary', artista: 'scarface', wiki: 'The_Diary_(Scarface_album)', anio: 1994, costa: 'south',
    fecha: '18 de octubre de 1994', sello: 'Rap-A-Lot / Noo Trybe',
    dato: 'Fue disco de platino menos de dos meses después de salir.' },
  { id: 'the-infamous', titulo: 'The Infamous', artista: 'mobbdeep', wiki: 'The_Infamous', anio: 1995, costa: 'east',
    fecha: '25 de abril de 1995', sello: 'Loud',
    dato: 'Primero en la lista de los 100 mejores discos de rap de Pitchfork (2025).' },
  { id: 'e-1999-eternal', titulo: 'E. 1999 Eternal', artista: 'bone', wiki: 'E._1999_Eternal', anio: 1995, costa: 'midwest',
    fecha: '25 de julio de 1995', sello: 'Ruthless / Relativity', productores: 'Eazy-E (producción ejecutiva)',
    dato: 'Debutó en el n.º 1 del Billboard 200 y llegó a cuatro discos de platino.' },
  { id: 'only-built-4-cuban-linx', titulo: 'Only Built 4 Cuban Linx...', artista: 'raekwon', wiki: 'Only_Built_4_Cuban_Linx...', anio: 1995, costa: 'east',
    fecha: '1 de agosto de 1995', sello: 'Loud', productores: 'RZA',
    dato: 'Debutó en el n.º 4 del Billboard 200 y fue disco de oro ese mismo año.' },
  { id: 'liquid-swords', titulo: 'Liquid Swords', artista: 'wutang', wiki: 'Liquid_Swords', anio: 1995, costa: 'east',
    fecha: '7 de noviembre de 1995', sello: 'Geffen', productores: 'RZA', autor: 'GZA',
    dato: 'Llegó a disco de platino casi 20 años después de su lanzamiento.' },
  { id: 'all-eyez-on-me', titulo: 'All Eyez on Me', artista: 'tupac', wiki: 'All_Eyez_on_Me', anio: 1996, costa: 'west',
    fecha: '13 de febrero de 1996', sello: 'Death Row / Interscope',
    dato: 'Vendió 566.000 copias en la primera semana y en 2014 fue certificado disco de diamante.' },
  { id: 'the-score', titulo: 'The Score', artista: 'fugees', wiki: 'The_Score_(Fugees_album)', anio: 1996, costa: 'east',
    dato: 'Ganó el Grammy a Mejor Álbum de Rap y llegó a siete discos de platino.' },
  { id: 'reasonable-doubt', titulo: 'Reasonable Doubt', artista: 'jayz', wiki: 'Reasonable_Doubt_(album)', anio: 1996, costa: 'east',
    fecha: '25 de junio de 1996', sello: 'Roc-A-Fella',
    dato: 'Recibió elogios generalizados de la crítica y fue disco de platino.' },
  { id: 'ridin-dirty', titulo: "Ridin' Dirty", artista: 'ugk', wiki: "Ridin'_Dirty", anio: 1996, costa: 'south',
    dato: 'Llegó al puesto 15 del Billboard 200.' },
  { id: 'life-after-death', titulo: 'Life After Death', artista: 'biggie', wiki: 'Life_After_Death', anio: 1997, costa: 'east',
    fecha: '25 de marzo de 1997', sello: 'Bad Boy / Arista',
    dato: 'Salió dieciséis días después de su asesinato y vendió 690.000 copias en la primera semana.' },
  { id: '2001', titulo: '2001', artista: 'dre', wiki: '2001_(Dr._Dre_album)', anio: 1999, costa: 'west',
    fecha: '16 de noviembre de 1999', sello: 'Aftermath / Interscope',
    dato: 'Seis veces disco de platino un año después de salir.' },
  { id: 'get-rich-or-die-tryin', titulo: "Get Rich or Die Tryin'", artista: 'fifty', wiki: "Get_Rich_or_Die_Tryin'", anio: 2003, costa: 'east',
    fecha: '6 de febrero de 2003', sello: 'Shady / Aftermath / Interscope', productores: 'Dr. Dre y Eminem (producción ejecutiva)',
    dato: 'Vendió más de 872.000 copias en su primera semana y fue el álbum más vendido de 2003 en Estados Unidos.' },
  { id: 'the-documentary', titulo: 'The Documentary', artista: 'game', wiki: 'The_Documentary', anio: 2005, costa: 'west',
    dato: 'Debutó en el n.º 1 del Billboard 200.' },
  { id: 'good-kid-maad-city', titulo: 'good kid, m.A.A.d city', artista: 'kendrick', wiki: 'Good_Kid,_M.A.A.D_City', anio: 2012, costa: 'west',
    fecha: '22 de octubre de 2012', sello: 'TDE / Aftermath / Interscope',
    dato: 'El primer álbum de estudio de hip hop en pasar 520 semanas en el Billboard 200.' },
].map((a) => ({ ...a, fuente: W(a.wiki) }));

// Hitos de la cultura, en orden. Cada uno se apoya en la fuente indicada.
export const HISTORIA = [
  { anio: 1985, titulo: 'El primer disco', texto: 'Schoolly D, en Filadelfia, graba "P.S.K. What Does It Mean?". Ice-T lo señala en su autobiografía como el primer disco de gangsta rap.', artista: 'schoollyd', fuente: W('Schoolly_D') },
  { anio: 1986, titulo: 'Los Ángeles responde', texto: 'Ice-T publica "6 \'n the Mornin\'", una de las primeras canciones de gangsta rap de la costa oeste.', artista: 'icet', fuente: W('Ice-T') },
  { anio: 1987, titulo: 'Armas en la portada', texto: 'Boogie Down Productions lanza Criminal Minded en el Bronx. Ese mismo año, Eazy-E funda Ruthless Records y nace N.W.A en Compton.', album: 'criminal-minded', fuente: W('Criminal_Minded') },
  { anio: 1989, titulo: 'Compton en el mapa', texto: 'Straight Outta Compton se convierte en el primer álbum de gangsta rap en ser disco de platino.', album: 'straight-outta-compton', fuente: W('Straight_Outta_Compton') },
  { anio: 1992, titulo: 'Nace el G-funk', texto: 'Dr. Dre publica The Chronic y populariza el G-funk: sintetizadores, bajos graves y samples de funk.', album: 'the-chronic', fuente: W('The_Chronic') },
  { anio: 1993, titulo: 'Récord y respuesta', texto: 'Doggystyle bate el récord de ventas de un debut. Desde Staten Island, Wu-Tang Clan lanza Enter the Wu-Tang (36 Chambers).', album: 'doggystyle', fuente: W('Doggystyle') },
  { anio: 1994, titulo: 'Nueva York contesta', texto: 'Nas publica Illmatic y The Notorious B.I.G. lanza Ready to Die. Hoy ambos están en el Registro Nacional de Grabaciones de EE.UU.', album: 'illmatic', fuente: W('Illmatic') },
  { anio: 1995, titulo: 'El rap de la mafia', texto: 'Raekwon lanza Only Built 4 Cuban Linx... y Mobb Deep, The Infamous. En marzo muere Eazy-E; en julio, Bone Thugs-n-Harmony llega al n.º 1 con E. 1999 Eternal.', album: 'only-built-4-cuban-linx', fuente: W('Only_Built_4_Cuban_Linx...') },
  { anio: 1996, titulo: 'La pérdida', texto: 'All Eyez on Me vende 566.000 copias en una semana. El 13 de septiembre muere 2Pac, con 25 años.', album: 'all-eyez-on-me', fuente: W('Tupac_Shakur') },
  { anio: 1997, titulo: 'Vida después de la muerte', texto: 'The Notorious B.I.G. es asesinado el 9 de marzo. Dieciséis días después sale Life After Death.', album: 'life-after-death', fuente: W('Life_After_Death') },
  { anio: 2003, titulo: 'El negocio', texto: 'Get Rich or Die Tryin\' de 50 Cent, con producción ejecutiva de Dr. Dre y Eminem, es el álbum más vendido del año en EE.UU.', album: 'get-rich-or-die-tryin', fuente: W("Get_Rich_or_Die_Tryin'") },
  { anio: 2012, titulo: 'Compton, otra vez', texto: 'Kendrick Lamar publica good kid, m.A.A.d city. En 2018 ganaría el Premio Pulitzer de Música.', album: 'good-kid-maad-city', fuente: W('Kendrick_Lamar') },
  { anio: 2016, titulo: 'El reconocimiento', texto: 'N.W.A entra al Salón de la Fama del Rock and Roll; 2Pac lo haría al año siguiente.', artista: 'nwa', fuente: W('N.W.A') },
].map((h) => ({ ...h }));

export const artistaPorId = (id) => ARTISTAS.find((a) => a.id === id);
export const albumPorId = (id) => ALBUMES.find((a) => a.id === id);
export const albumesDe = (artistaId) => ALBUMES.filter((a) => a.artista === artistaId);
export const autorDe = (d) => d.autor ?? artistaPorId(d.artista)?.nombre ?? '';

// Busca un disco del archivo por título (sin importar mayúsculas, tildes ni signos).
const normalTitulo = (t) => (t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
export const albumPorTitulo = (titulo) => {
  const t = normalTitulo(titulo);
  return t ? ALBUMES.find((a) => normalTitulo(a.titulo) === t) : undefined;
};

// Busca un artista del archivo por nombre (sin importar mayúsculas, tildes ni signos).
export const artistaPorNombre = (nombre) => {
  const n = normalTitulo(nombre);
  return n ? ARTISTAS.find((a) => normalTitulo(a.nombre) === n) : undefined;
};
