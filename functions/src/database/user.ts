import * as functions from 'firebase-functions';
import { DBUtil } from './DBUtil';

// before
// export const getUsers = functions
//     .https.onRequest((request: functions.Request, response: functions.Response) => {
// after
// module.exports = functions.https.onRequest((request: functions.Request, response: functions.Response) => {
export const getUsers = functions.https.onRequest(
  async (request: functions.Request, response: functions.Response) => {
    console.log('----------');
    const users = await DBUtil.getDBItems('/users', 'Id');
    console.log('@@ users.length: [' + users.length + ']');
    // users.forEach((user) => {
    //     console.log('@@ user.Id: [' + user.child('Id').val() + ']');
    //     console.log('@@ user.Name: [' + user.child('Name').val() + ']');
    //     console.log('@@ user.SpeakingName: [' + user.child('SpeakingName').val() + ']');
    // });
    console.log('----------');

    response.setHeader('Access-Control-Allow-Origin', '*');
    console.log('@@ setHeader @@');
    console.log(
      '@@ response.header: [' + JSON.stringify(response.getHeaders()) + ']',
    );

    response
      .status(200)
      .json(users)
      .end();
  },
);

export const getUser = functions.https.onRequest(
  async (request: functions.Request, response: functions.Response) => {
    console.log('getUser');
    console.log('getUser  request.url: ' + JSON.stringify(request.url));
    console.log('getUser  request.method: ' + JSON.stringify(request.method));
    console.log('getUser  request.body: ' + JSON.stringify(request.body));
    const child = request.body.Child;
    const val = request.body.Val;
    console.log('getUser  data  child: [' + child + ']');
    console.log('getUser  data  val: [' + val + ']');
    console.log('----------');
    const users = await DBUtil.getDBItem('/users', child, val);
    console.log('@@ users.length: [' + users.length + ']');
    if (users.length < 1) {
      console.log('@@ users.length < 1: 500');
      response
        .status(500)
        .json('NG')
        .end();
      return;
    }
    console.log('@@ users.length OK: [' + users.length + ']');
    users.forEach((user) => {
      console.log('@@ user.Id: [' + user.child('Id').val() + ']');
      console.log('@@ user.Name: [' + user.child('Name').val() + ']');
      console.log(
        '@@ user.SpeakingName: [' + user.child('SpeakingName').val() + ']',
      );
    });
    console.log('----------');

    response.setHeader('Access-Control-Allow-Origin', '*');
    // response.setHeader('Access-Control-Request-Headers', 'application/json, content-type');
    console.log('@@ setHeader @@');
    console.log(
      '@@ response.header: [' + JSON.stringify(response.getHeaders()) + ']',
    );

    response
      .status(200)
      .json(users[0])
      .end();
  },
);

export const setUser = functions.https.onRequest(
  async (request: functions.Request, response: functions.Response) => {
    console.log('setUser');
    console.log('setUser  request.url: ' + JSON.stringify(request.url));
    console.log('setUser  request.method: ' + JSON.stringify(request.method));
    console.log('setUser  request.body: ' + JSON.stringify(request.body));
    const data = JSON.parse(request.body.userInfo);
    console.log(
      'setUser  data  Id: [' +
        data.Id +
        ']  Name: [' +
        data.Name +
        ']  SpeakingName: [' +
        data.SpeakingName +
        ']',
    );

    console.log('----------');
    if (Number(data.Id) < 0) {
      console.log('@@ data.Id calculate.');
      const users = await DBUtil.getDBItems('/users', 'Id');
      let maxId = -1;
      users.forEach((user) => {
        if (Number(user.child('Id').val()) >= maxId) {
          maxId = Number(user.child('Id').val()) + 1;
        }
      });
      data.Id = String(maxId);
    }
    console.log('@@ Id: [' + data.Id + ']');
    console.log('----------');

    await DBUtil.setDBItem('/users', data.Id, data);
    console.log('----------');

    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader(
      'Access-Control-Request-Headers',
      'application/json, content-type',
    );
    console.log('@@ setHeader @@');
    console.log(
      '@@ response.header: [' + JSON.stringify(response.getHeaders()) + ']',
    );

    response
      .status(200)
      .json(data.Id)
      .end();
  },
);

export const removeUser = functions.https.onRequest(
  async (request: functions.Request, response: functions.Response) => {
    console.log('removeUser');
    console.log('removeUser  request.url: ' + JSON.stringify(request.url));
    console.log(
      'removeUser  request.method: ' + JSON.stringify(request.method),
    );
    console.log('removeUser  request.body: ' + JSON.stringify(request.body));
    const child = request.body.Child;
    const val = request.body.Val;
    console.log('removeUser  data  child: [' + child + ']');
    console.log('removeUser  data  val: [' + val + ']');
    console.log('----------');
    const user = await DBUtil.removeDBItem('/users', child, val);
    console.log('@@ user: [' + user + ']');

    response.setHeader('Access-Control-Allow-Origin', '*');
    // response.setHeader('Access-Control-Request-Headers', 'application/json, content-type');
    console.log('@@ setHeader @@');
    console.log(
      '@@ response.header: [' + JSON.stringify(response.getHeaders()) + ']',
    );

    response
      .status(200)
      .json(user)
      .end();
  },
);

console.log('user loaded');
