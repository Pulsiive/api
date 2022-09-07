import prisma from '../prisma/client';

describe('Testing public station data', () => {
  test('shoud retrieve the public stations', async () => {
    const stations = await prisma.station.findMany({
      include: {
        properties: true,
        coordinates: true
      }
    });
    expect(stations).toBeDefined();
  }, 7000);

  test('should find an existing station from its address', async () => {
    const stations = await prisma.station.findMany({
      include: {
        properties: true,
        coordinates: true
      }
    });
    const existingStationAddress = '35 RUE DE ROUBAIX';
    expect(
      stations.find((station) => station.coordinates?.address === existingStationAddress)
    ).toBeDefined();
  }, 7000);
});
