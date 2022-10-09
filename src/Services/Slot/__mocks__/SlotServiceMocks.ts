export const user = {
    email: 'slotservice@test.com',
    password: '123',
    firstName: 'UserService',
    lastName: 'Test',
    dateOfBirth: '2022-03-02T18:11:29.003Z'
};

export const slot = {
    day: 3,
    opensAt: "1970-03-02T08:00:00.003Z",
    closesAt: "1970-03-02T10:00:00.003Z"
};

export const slotComparisonObject = {
  id: expect.any(String),
  stationPropertiesId: expect.any(String),
  day: expect.any(Number),
  opensAt: expect.any(Date),
  closesAt: expect.any(Date)
};

export const slotShowComparisonObject = {
    id: expect.any(String),
    stationPropertiesId: expect.any(String),
    day: expect.any(Number),
    opensAt: expect.any(Date),
    closesAt: expect.any(Date),
    stationProperties: {
        maxPower: expect.any(Object),
        id: expect.any(String),
        stationId: expect.any(String),
        isPublic: false,
        plugTypes: ['TYPE2'],
        price: 2,
        isGreenEnergy: false,
        nbChargingPoints: 1,
    }
};

export const slotDeletedComparisonObject = {
    id: expect.any(String),
    stationPropertiesId: expect.any(String),
    day: expect.any(Number),
    opensAt: expect.any(Date),
    closesAt: expect.any(Date)
};