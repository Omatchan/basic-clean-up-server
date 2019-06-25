import * as admin from 'firebase-admin';

// tslint:disable-next-line:interface-over-type-literal
type Update = { [key: string]: string | number | JSON };

export class DBUtil {
  public static async getDBItems(url: string, order: string): Promise<any[]> {
    console.log('getDBItems()  url: ' + url + '  order: ' + order);
    return await this.asyncGetDBItems(url, order);
  }

  private static asyncGetDBItems(url: string, order: string): Promise<any[]> {
    console.log('asyncGetDBItems()  url: ' + url + '  order: ' + order);
    return new Promise((resolve, reject) => {
      const result: any[] = new Array();

      const ref = admin.database().ref(url);
      ref
        .orderByChild(order)
        .once('value', (snapshot) => {
          snapshot!.forEach((datas) => {
            result.push(datas);
          });
          console.log(
            'Leave asyncGetDBItems()  url: ' + url + '  order: ' + order,
          );
          resolve(result);
        })
        .then((response) => {
          resolve(result);
        })
        .catch((error) => {
          reject(100);
        });
    });
  }

  public static async getDBItem(
    url: string,
    child: string,
    val: string,
  ): Promise<any[]> {
    console.log(
      'getDBItem()  url: ' + url + '  child: ' + child + '  val: ' + val,
    );
    return await this.asyncGetDBItem(url, child, val);
  }

  private static asyncGetDBItem(
    url: string,
    child: string,
    val: string,
  ): Promise<any[]> {
    console.log(
      'asyncGetDBItem()  url: ' + url + '  child: ' + child + '  val: ' + val,
    );
    return new Promise((resolve, reject) => {
      const result: any[] = new Array();

      const ref = admin.database().ref(url);
      ref
        .orderByChild(child)
        .equalTo(val)
        .once('value', (snapshot) => {
          snapshot!.forEach((datas) => {
            result.push(datas);
          });
          console.log('asyncGetDBItem() result: ' + JSON.stringify(result));
          console.log(
            'Leave asyncGetDBItem()  url: ' +
              url +
              '  child: ' +
              child +
              '  val: ' +
              val,
          );
          resolve(result);
        })
        .then((response) => {
          resolve(result);
        })
        .catch((error) => {
          reject(100);
        });
    });
  }

  public static async setDBItem(
    url: string,
    id: string,
    data: JSON,
  ): Promise<any> {
    console.log(
      'setDBItem()  url: ' +
        url +
        '  id: ' +
        id +
        '  data: ' +
        JSON.stringify(data),
    );
    return await this.asyncSetDBItem(url, id, data);
  }

  private static asyncSetDBItem(
    url: string,
    id: string,
    data: JSON,
  ): Promise<any> {
    console.log(
      'asyncSetDBItem()  url: ' +
        url +
        '  id: ' +
        id +
        '  data: ' +
        JSON.stringify(data),
    );
    return new Promise((resolve, reject) => {
      const updates: Update = {};
      updates[url + '/' + id] = data;
      admin
        .database()
        .ref()
        .update(updates)
        .then((response) => {
          resolve(id);
        })
        .catch((error) => {
          reject(100);
        });
    });
  }

  public static async removeDBItem(
    url: string,
    child: string,
    val: string,
  ): Promise<any> {
    console.log(
      'removeDBItem()  url: ' + url + '  child: ' + child + '  val: ' + val,
    );
    return await this.asyncRemoveDBItem(url, child, val);
  }

  private static asyncRemoveDBItem(
    url: string,
    child: string,
    val: string,
  ): Promise<any> {
    console.log(
      'asyncRemoveDBItem()  url: ' +
        url +
        '  child: ' +
        child +
        '  val: ' +
        val,
    );
    return new Promise((resolve, reject) => {
      const ref = admin.database().ref(url);
      ref
        .orderByChild(child)
        .equalTo(val)
        .once('value', (snapshot) => {
          console.log(
            'asyncRemoveDBItem() snapshot: ' + JSON.stringify(snapshot!),
          );
          for (const key in snapshot!.val()) {
            console.log('asyncRemoveDBItem() key: ' + key);
            admin
              .database()
              .ref(url + '/' + key)
              .remove()
              .then(() => {
                console.log(
                  'asyncRemoveDBItem() dataJson.Id: ' + key + '  REMOVED',
                );
              })
              .catch((err) => {
                console.log(
                  'asyncRemoveDBItem() dataJson.Id: ' + key + '  ERROR: ' + err,
                );
              });
          }
          console.log('asyncRemoveDBItem() result: ' + val);
          console.log(
            'Leave asyncRemoveDBItem()  url: ' +
              url +
              '  child: ' +
              child +
              '  val: ' +
              val,
          );
          resolve(val);
        })
        .then((response) => {
          resolve(val);
        })
        .catch((error) => {
          reject(100);
        });
    });
  }
}

console.log('DBUtil.ts loaded');
