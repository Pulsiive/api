import prisma from '../../prisma/client';
import publicStations from '../../data/publicStations';

(async () => {
  let limit = 30;
  for (const station of publicStations) {
    if (limit === 0) {
      break;
    }
    await prisma.station.create({
      data: {
        coordinates: {
          create: {
            lat: station.lat,
            long: station.lng,
            address: station.adresse_station,
            city: station.code_insee_commune,
            country: 'France',
            countryCode: 'FR'
          }
        },
        properties: {
          create: {
            isPublic: true,
            maxPower: station.puissance_nominale,
            price: 0,
            nbChargingPoints: 2,
            isGreenEnergy: false
          }
        }
      }
    });
    limit -= 1;
  }
})();
