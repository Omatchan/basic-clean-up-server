import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// tslint:disable-next-line:no-implicit-dependencies
// import {loadEnvironment} from './loadEnvironment';
// loadEnvironment();

// console.log('----------');
// console.log('serviceAccount: ' + process.env.GOOGLE_APPLICATION_CREDENTIALS);
// console.log('firebaseConfig: ' + process.env.GOOGLE_APPLICATION_CONFIG);
// console.log('gcloudProject: ' + process.env.GCLOUD_PROJECT);
// console.log('firebaseConfig: ' + process.env.FIREBASE_CONFIG);
// console.log('----------');

console.log('----------');
const serviceAccount = require('../secrets/serviceAccountKey.json');
// const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS!);
// console.log('serviceAccount: ' + JSON.stringify(serviceAccount));
const firebaseConfig = require('../secrets/firebaseConfig.json');
// const firebaseConfig = require(process.env.GOOGLE_APPLICATION_CONFIG!);
// console.log('firebaseConfig: ' + JSON.stringify(firebaseConfig));

firebaseConfig.credential = admin.credential.cert(serviceAccount);
admin.initializeApp(firebaseConfig);

const firestore = admin.firestore();
const settings = {timestampsInSnapshots: true};
firestore.settings(settings);

import * as db_place from './database/place';
import * as db_team from './database/team';
import * as db_user from './database/user';

export const helloWorld = functions.https.onRequest(
  (_request: functions.Request, response: functions.Response) => {
    response.send('Hello from Firebase!');
  },
);

export const getPlaces = db_place.getPlaces;
export const getTeams = db_team.getTeams;
export const getUsers = db_user.getUsers;
export const getUser = db_user.getUser;
export const setUser = db_user.setUser;
export const removeUser = db_user.removeUser;

console.log('index loaded');
