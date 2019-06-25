import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { Place } from './bean/Place';
import { User } from './bean/User';
import { DBUtil } from './DBUtil';
import { Schedule } from './bean/Schedule';

// tslint:disable-next-line:interface-over-type-literal
type Update = { [key: string]: string | number };

const getPlaceData = async function() {
  const items = await DBUtil.getDBItems('/places', 'Id');
  const result = new Array<Place>();
  items.forEach((item) => {
    const place = new Place();
    place.Id = item.child('Id').val();
    place.Name = item.child('Name').val();
    place.SpeakingName = item.child('SpeakingName').val();
    result.push(place);
  });
  return result;
};

const getUsersData = async function() {
  const items = await DBUtil.getDBItems('/users', 'Id');
  const result = new Array<User>();
  items.forEach((item) => {
    const user = new User();
    user.Id = item.child('Id').val();
    user.Name = item.child('Name').val();
    user.SpeakingName = item.child('SpeakingName').val();
    result.push(user);
  });
  return result;
};

const getScheduleData = async function() {
  const schedules = await DBUtil.getDBItems('/schedules', 'Id');
  const result = new Array<Schedule>();
  schedules.forEach((item) => {
    const schedule = new Schedule();
    schedule.place.Id = item
      .child('place')
      .child('Id')
      .val();
    schedule.place.Name = item
      .child('place')
      .child('Name')
      .val();
    schedule.place.SpeakingName = item
      .child('place')
      .child('SpeakingName')
      .val();
    (<any[]>item.child('users')).forEach((item_user) => {
      const user = new User();
      user.Id = item_user.child('Id').val();
      user.Name = item_user.child('Name').val();
      user.SpeakingName = item_user.child('SpeakingName').val();
      schedule.users.push(user);
    });
    result.push(schedule);
  });

  return result;
};

const makeSchedules = async function() {
  console.log('----------');
  const places = await getPlaceData();
  console.log('places: [' + places.length + ']');
  // places.forEach((place) => {
  //     console.log('@@ place.Id: [' + place.Id + ']');
  //     console.log('@@ place.Name: [' + place.Name + ']');
  //     console.log('@@ place.SpeakingName: [' + place.SpeakingName + ']');
  //     });
  // console.log('----------');
  const users = await getUsersData();
  console.log('users: [' + users.length + ']');
  // users.forEach((user) => {
  //     console.log('@@ user.Id: [' + user.Id + ']');
  //     console.log('@@ user.Name: [' + user.Name + ']');
  //     console.log('@@ user.SpeakingName: [' + user.SpeakingName + ']');
  //     });
  console.log('----------');

  // 掃除場所に人を割り付ける。
  // 人が偏りすぎないように考慮している
  //   （例： 10人 3か所  4：4：2 ではなく、3：4：3 とする）
  // maxUser：  一か所の最大人数
  // maxCount：  最大人数となってもよい場所の数
  let maxUser: number = Math.ceil(users.length / places.length);
  let maxCount: number =
    places.length - (places.length * maxUser - users.length);
  console.log('maxUser: [' + maxUser + ']  maxCount: [' + maxCount + ']');
  console.log('----------');
  const schedules = new Array<Schedule>();
  places.forEach((place, index) => {
    const schedule = new Schedule();
    schedule.place = place;
    schedules.push(schedule);
  });
  users.forEach((user, index) => {
    let isLoop = true;
    while (isLoop) {
      const pos = Math.floor(Math.random() * places.length);
      if (schedules[pos].users.length < maxUser) {
        schedules[pos].users.push(user);
        isLoop = false;
        // 設定箇所が最大人数となった場合は maxCount を減らし、maxCount が 0 となった場合は、
        // maxUser を減らすことで、振分けのバランスをとっている
        if (schedules[pos].users.length === maxUser && maxCount > 0) {
          maxCount--;
          if (maxCount <= 0) {
            maxUser--;
          }
        }
      }
    }
  });

  console.log('----------');
  console.log('schedules: [' + schedules.length + ']');
  schedules.forEach((schedule, idx_schedule) => {
    console.log(
      '  place: [' +
        schedule.place.Id +
        ']  [' +
        schedule.place.Name +
        ']  [' +
        schedule.place.SpeakingName +
        ']',
    );
    schedule.users.forEach((user, idx_user) => {
      console.log(
        '    ' +
          idx_user +
          '  user: [' +
          user.Id +
          ']  [' +
          user.Name +
          ']  [' +
          user.SpeakingName +
          ']',
      );
    });
  });

  return schedules;
};

const setScheduleData = async function(schedules: Schedule[]) {
  const schedulesRef = admin.database().ref('schedules');
  await schedulesRef.set(schedules);
};

export const getTeams = functions.https.onRequest(
  async (request: functions.Request, response: functions.Response) => {
    console.log('----------');
    const now = Date.now();
    console.log('now: [' + now + ']');
    const nowDate = new Date(now);
    console.log('nowDate: [' + nowDate + ']');
    const day = nowDate.getDay();
    console.log('day: [' + day + ']');
    const readNext = await admin
      .database()
      .ref('/next/date')
      .once('value');
    console.log('readNext: [' + readNext.val() + ']');

    let schedules = await getScheduleData();
    console.log('readNext.val() < now: ' + (readNext.val() < now));
    console.log('schedules.length: ' + schedules.length);
    if (readNext.val() < now || schedules.length <= 0) {
      console.log('当番を作成する');
      // 当番を作成し、DBに登録する
      schedules = await makeSchedules();
      await setScheduleData(schedules);

      // 日付を更新する
      const addDay = day < 3 ? 3 - day : 7 - (day - 3);
      const nextDate = new Date(
        nowDate.getFullYear(),
        nowDate.getMonth(),
        nowDate.getDate() + addDay,
      );
      console.log('nextDate: [' + nextDate + ']');
      const next = nextDate.getTime();
      console.log('next: [' + next + ']');

      const updates: Update = {};
      updates['/next/date/'] = next;
      await admin
        .database()
        .ref()
        .update(updates);

      // 登録・更新の確認（デバッグ）
      const schedules_check = await getScheduleData();
      console.log('---------- 登録・更新の確認（デバッグ）');
      console.log('schedules: [' + schedules_check.length + ']');
      schedules_check.forEach((schedule, idx_schedule) => {
        console.log(
          '  place: [' +
            schedule.place.Id +
            ']  [' +
            schedule.place.Name +
            ']  [' +
            schedule.place.SpeakingName +
            ']',
        );
        schedule.users.forEach((user, idx_user) => {
          console.log(
            '    ' +
              idx_user +
              '  user: [' +
              user.Id +
              ']  [' +
              user.Name +
              ']  [' +
              user.SpeakingName +
              ']',
          );
        });
      });

      const nextCheck = await admin
        .database()
        .ref('/next/date')
        .once('value');
      console.log('nextDate: [' + nextCheck.val() + ']');
      console.log('----------');
    } else {
      console.log('更新前なので、以前の値を使用する');
    }

    console.log('----------');
    console.log('schedules: [' + schedules.length + ']');
    schedules.forEach((schedule, idx_schedule) => {
      console.log(
        '  place: [' +
          schedule.place.Id +
          ']  [' +
          schedule.place.Name +
          ']  [' +
          schedule.place.SpeakingName +
          ']',
      );
      schedule.users.forEach((user, idx_user) => {
        console.log(
          '    ' +
            idx_user +
            '  user: [' +
            user.Id +
            ']  [' +
            user.Name +
            ']  [' +
            user.SpeakingName +
            ']',
        );
      });
    });
    console.log('---------- leave ');

    response
      .status(200)
      .json(schedules)
      .end();
  },
);

console.log('team loaded');
