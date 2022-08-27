import _ from 'lodash';

// Presents a single user
function present(user: any): any {
  console.log(user);
  return _.omit(user.toJSON(), 'password');
}

// Presents many users
function presentAll(users: any[]): any[] {
  return _.map(users, (user) => present(user));
}

function presentLogin(user: any): any {
  return user;
}

export default {
  present,
  presentAll,
  presentLogin
};
