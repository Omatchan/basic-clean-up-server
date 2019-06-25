/*
 * 下記の環境変数を設定する。
 * GOOGLE_APPLICATION_CREDENTIALS
 * FIREBASE_CONFIG
 * GCLOUD_PROJECT
 * 参照 URL: https://qiita.com/ovrmrw/items/1a45042d06db5d343471
 */

import { join, resolve } from 'path';
import { existsSync } from 'fs';

const ENV_JSON = 'env.json';

export const loadEnvironment = function() {
  if (!process.env.GOOGLE_APPLICATION_CONFIG) {
    const envJsonPath = join(resolve(), ENV_JSON);
    if (existsSync(envJsonPath)) {
      const env = require(envJsonPath);
      if (env.GOOGLE_APPLICATION_CONFIG) {
        process.env.GOOGLE_APPLICATION_CONFIG = env.GOOGLE_APPLICATION_CONFIG;
      }
    }
  }

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const envJsonPath = join(resolve(), ENV_JSON);
    if (existsSync(envJsonPath)) {
      const env = require(envJsonPath);
      if (env.GOOGLE_APPLICATION_CREDENTIALS) {
        process.env.GOOGLE_APPLICATION_CREDENTIALS =
          env.GOOGLE_APPLICATION_CREDENTIALS;
      }
    }
  }

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return;
  }

  if (!process.env.FIREBASE_CONFIG) {
    const serviceAccountKeyPath = join(
      resolve(),
      process.env.GOOGLE_APPLICATION_CREDENTIALS,
    );
    if (existsSync(serviceAccountKeyPath)) {
      const serviceAccount = require(serviceAccountKeyPath);
      const projectId = serviceAccount.project_id;
      if (projectId) {
        const databaseURL = `https://${projectId}.firebaseio.com`;
        const storageBucket = `${projectId}.appspot.com`;

        process.env.FIREBASE_CONFIG = JSON.stringify({
          projectId,
          databaseURL,
          storageBucket,
        });
      }
    }
  }

  if (!process.env.FIREBASE_CONFIG) {
    return;
  }

  if (!process.env.GCLOUD_PROJECT) {
    process.env.GCLOUD_PROJECT = JSON.parse(
      process.env.FIREBASE_CONFIG,
    ).projectId;
  }
};

console.log('loadEnvironment loaded');
