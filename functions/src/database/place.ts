// import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
// import { Place } from './bean/Place';
import { DBUtil } from './DBUtil';

export const getPlaces = functions.https.onRequest(
  async (request: functions.Request, response: functions.Response) => {
    console.log('----------');
    const places = await DBUtil.getDBItems('/places', 'Id');
    console.log('@@ places.length: [' + places.length + ']');
    places.forEach((place) => {
      console.log('@@ place.Id: [' + place.child('Id').val() + ']');
      console.log('@@ place.Name: [' + place.child('Name').val() + ']');
      console.log(
        '@@ place.SpeakingName: [' + place.child('SpeakingName').val() + ']',
      );
    });
    console.log('----------');
    response
      .status(200)
      .json(places)
      .end();
  },
);

console.log('place loaded');
