export const user = {
  email: 'userservice@test.com',
  password: '123',
  firstName: 'UserService',
  lastName: 'Test',
  dateOfBirth: '2022-03-02T18:11:29.003Z'
};

export const secondUser = {
  email: 'seconduserservice@test.com',
  password: '123',
  firstName: 'SecondeUserService',
  lastName: 'SecondTest',
  dateOfBirth: '2022-03-02T18:11:29.003Z'
};

export const vehicle = {
  type: 2,
  plugTypes: [2, 3],
  electricalType: 1,
  maxPower: 56.66
};

export const vehicleNumeroDos = {
  ...vehicle,
  type: 1
};

export const vehicleDBFormat = {
  type: 'MOTORBIKE',
  plugTypes: ['TYPE3', 'CCS'],
  electricalType: 'HEV',
  maxPower: '56.66'
};

export const vehicleNumeroDosDBFormat = {
  ...vehicleDBFormat,
  type: 'SCOOTER'
};

export const station = {
  coordinates: {
    lat: 34.56,
    long: 67.87,
    address: '34 rue de la Paix',
    city: 'Paris',
    country: 'France',
    countryCode: '123'
  },
  properties: {
    maxPower: 23,
    price: 2,
    isGreenEnergy: false,
    plugTypes: [1],
    nbChargingPoints: 1,
    hours: [
      {
        day: 1,
        openTime: 8,
        closeTime: 17
      },
      {
        day: 2,
        openTime: 10,
        closeTime: 15
      },
      {
        day: 3,
        openTime: 11,
        closeTime: 19
      }
    ]
  }
};

export const stationComparisonObject = {
  id: expect.any(String),
  ownerId: expect.any(String),
  rate: 0,
  coordinates: {
    ...station.coordinates,
    lat: expect.any(Object),
    long: expect.any(Object),
    id: expect.any(String),
    stationId: expect.any(String)
  },
  properties: {
    ...station.properties,
    maxPower: expect.any(Object),
    id: expect.any(String),
    stationId: expect.any(String),
    isPublic: false,
    plugTypes: ['TYPE2'],
    hours: expect.any(Array)
  },
  comments: []
};

export const stationNumeroDos = {
  ...station,
  coordinates: {
    lat: 34.56,
    long: 67.87,
    address: 'Rue de la patate',
    city: 'Paris',
    country: 'France',
    countryCode: '123'
  }
};
