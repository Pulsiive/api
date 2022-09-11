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
