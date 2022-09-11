import prisma from '../../prisma/client';
import publicStationsInParis from '../../data/publicStationsParis';
import { PlugType } from '@prisma/client';

(async () => {
  let limit = 30;
  for (const station of publicStationsInParis) {
    if (limit === 0) {
      break;
    }

    let stationPlugTypes: PlugType[] = [];
    if (station.prise_type_ef === 'true') {
      stationPlugTypes.push('EF');
    }
    if (station.prise_type_2 === 'true') {
      stationPlugTypes.push('TYPE2');
    }
    if (station.prise_type_combo_ccs === 'true') {
      stationPlugTypes.push('CCS');
    }
    if (station.prise_type_chademo === 'true') {
      stationPlugTypes.push('CHADEMO');
    }
    await prisma.station.create({
      data: {
        coordinates: {
          create: {
            lat: station.coordonneesXY[1],
            long: station.coordonneesXY[0],
            address: station.adresse_station,
            city: station.consolidated_commune,
            country: 'France',
            countryCode: 'FR'
          }
        },
        properties: {
          create: {
            isPublic: true,
            maxPower: station.puissance_nominale,
            price: 100,
            nbChargingPoints: station.nbre_pdc,
            isGreenEnergy: false,
            plugTypes: stationPlugTypes,
            hours: {
              create: [
                {
                  day: 1,
                  openTime: '00:00',
                  closeTime: '00:00'
                },
                {
                  day: 2,
                  openTime: '00:00',
                  closeTime: '00:00'
                },
                {
                  day: 3,
                  openTime: '00:00',
                  closeTime: '00:00'
                },
                {
                  day: 4,
                  openTime: '00:00',
                  closeTime: '00:00'
                },
                {
                  day: 5,
                  openTime: '00:00',
                  closeTime: '00:00'
                },
                {
                  day: 6,
                  openTime: '00:00',
                  closeTime: '00:00'
                },
                {
                  day: 7,
                  openTime: '00:00',
                  closeTime: '00:00'
                }
              ]
            }
          }
        }
      }
    });
    limit -= 1;
  }
})();
