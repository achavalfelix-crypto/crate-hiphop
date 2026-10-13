// Catálogo inicial opcional: se carga con un botón cuando el cajón está vacío.
// Una o dos canciones representativas por disco; el resto lo agrega cada usuario.
const t = (...titulos) => titulos.map((title, i) => ({ id: `c${i}`, title, fav: false }));

export const CATALOGO = [
  { title: 'Saturday Night! The Album', artist: 'Schoolly D', year: 1986, coast: 'east', tracks: t('P.S.K. What Does It Mean?') },
  { title: 'Rhyme Pays', artist: 'Ice-T', year: 1987, coast: 'west', tracks: t("6 'n the Mornin'") },
  { title: 'Criminal Minded', artist: 'Boogie Down Productions', year: 1987, coast: 'east', tracks: t('South Bronx') },
  { title: 'Straight Outta Compton', artist: 'N.W.A', year: 1988, coast: 'west', tracks: t('Straight Outta Compton', 'Gangsta Gangsta') },
  { title: "AmeriKKKa's Most Wanted", artist: 'Ice Cube', year: 1990, coast: 'west', tracks: t("AmeriKKKa's Most Wanted") },
  { title: "We Can't Be Stopped", artist: 'Geto Boys', year: 1991, coast: 'south', tracks: t('Mind Playing Tricks on Me') },
  { title: 'The Chronic', artist: 'Dr. Dre', year: 1992, coast: 'west', tracks: t("Nuthin' but a 'G' Thang") },
  { title: 'Doggystyle', artist: 'Snoop Doggy Dogg', year: 1993, coast: 'west', tracks: t('Gin and Juice') },
  { title: 'Illmatic', artist: 'Nas', year: 1994, coast: 'east', tracks: t('N.Y. State of Mind') },
  { title: 'Ready to Die', artist: 'The Notorious B.I.G.', year: 1994, coast: 'east', tracks: t('Juicy') },
  { title: 'The Diary', artist: 'Scarface', year: 1994, coast: 'south', tracks: t('I Seen a Man Die') },
  { title: 'E. 1999 Eternal', artist: 'Bone Thugs-n-Harmony', year: 1995, coast: 'midwest', tracks: t('Tha Crossroads') },
  { title: 'The Infamous', artist: 'Mobb Deep', year: 1995, coast: 'east', tracks: t('Shook Ones, Pt. II') },
  { title: 'Only Built 4 Cuban Linx...', artist: 'Raekwon', year: 1995, coast: 'east', tracks: t('Ice Cream') },
  { title: 'All Eyez on Me', artist: '2Pac', year: 1996, coast: 'west', tracks: t('California Love') },
  { title: "Ridin' Dirty", artist: 'UGK', year: 1996, coast: 'south', tracks: t('One Day') },
  { title: 'Reasonable Doubt', artist: 'Jay-Z', year: 1996, coast: 'east', tracks: t('Dead Presidents II') },
  { title: "Get Rich or Die Tryin'", artist: '50 Cent', year: 2003, coast: 'east', tracks: t('In da Club') },
  { title: 'King', artist: 'T.I.', year: 2006, coast: 'south', tracks: t('What You Know') },
  { title: 'good kid, m.A.A.d city', artist: 'Kendrick Lamar', year: 2012, coast: 'west', tracks: t('m.A.A.d city') },
  { title: 'Finally Rich', artist: 'Chief Keef', year: 2012, coast: 'midwest', tracks: t('Love Sosa') },
  { title: 'My Krazy Life', artist: 'YG', year: 2014, coast: 'west', tracks: t('Who Do You Love?') },
  { title: "Summertime '06", artist: 'Vince Staples', year: 2015, coast: 'west', tracks: t('Norf Norf') },
].map((a) => ({ ...a, type: 'album', album: '', status: 'pendiente', rating: 0 }));
