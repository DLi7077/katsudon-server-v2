import _ from "lodash";

//Presents a single user
function present(user: any): any {
  return _.pick(user, ["username", "email", "created_at"]);
}

//Presents many users
function presentAll(users: any[]): any[] {
  return _.map(users, (user) => present(user));
}

export default {
  present,
  presentAll,
};
