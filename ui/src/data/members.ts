export interface Member {
  id: string
  name: string
  role: string
  photo: string
}

const photo = (file: string) => `/images/members/${file}`

export const MEMBERS: Member[] = [
  { id: 'kwtar-el-bejjaj', name: 'KWTAR EL BEJJAJ', role: 'Président', photo: photo('kwtar-el-bejjaj.jpg') },
  { id: 'rihab-elmariikh', name: 'RIHAB ELMARIKH', role: 'Vice-Présidente', photo: photo('rihab-elmariikh.jpg') },
  { id: 'oumaima-talib', name: 'OUMAIMA TALIB', role: 'Vice-Présidente', photo: photo('oumaima-talib.jpg') },
  { id: 'yassine-idnasser', name: 'YASSINE IDNASSER', role: 'Secrétaire général', photo: photo('yassine-idnasser.jpg') },
  { id: 'meryem-berrima', name: 'MERYEM BERRIMA', role: 'Secrétaire générale', photo: photo('meryem-berrima.jpg') },
  { id: 'azaroual-zineb', name: 'AZAROUAL ZINEB', role: 'Trésorière', photo: photo('azaroual-zineb.jpg') },
  { id: 'oussama-zamnazi', name: 'OUSSAMA ZAMNAZI', role: 'Trésorier', photo: photo('oussama-zamnazi.jpg') },
  { id: 'ayoub-hmida', name: 'AYOUB HMIDA', role: 'Coordinateur général', photo: photo('ayoub-hmida.jpg') },
  { id: 'ayoub-el-mehdi', name: 'AYOUB EL MEHDI', role: 'Responsable technique', photo: photo('ayoub-el-mehdi.jpg') },
  { id: 'kaysouny-asmae', name: 'KAYSOUNY ASMAE', role: 'Responsable de la Communication', photo: photo('kaysouny-asmae.jpg') },
  { id: 'fatima-zahra-naji', name: 'FATIMA ZAHRA NAJI', role: 'Responsable des événements', photo: photo('fatima-zahra-naji.jpg') },
  { id: 'hamza-mansouri', name: 'HAMZA MANSOURI', role: 'Responsable des ressources humaines', photo: photo('hamza-mansouri.jpg') },
  { id: 'hamza-elattar', name: 'HAMZA ELATTAR', role: 'Vice-responsable stratégie', photo: photo('hamza-elattar.jpg') },
  { id: 'mohammed-elmasmari', name: 'MOHAMMED ELMASMARI', role: 'Conseiller', photo: photo('mohammed-elmasmari.jpg') },
]
