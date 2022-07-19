export const createFakeRate = (stationId: string, userId: string, rate?: number) => {
  return {
    stationId,
    userId,
    rate: rate ?? 1,
    creationDate: '2022-07-19T20:21:50.299Z',
    comment: 'this is a fake comment'
  };
};

export const user = {
  email: 'publicstationservice@test.com',
  password: '123',
  firstName: 'PublicService',
  lastName: 'Test',
  dateOfBirth: '2022-03-02T18:11:29.003Z'
};
