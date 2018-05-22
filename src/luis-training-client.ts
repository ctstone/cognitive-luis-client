import async = require('async');
import { Request, Response, ResponseCallback } from './request';

const API_VERSION = '2.0';

const RE_APP_EXISTS = /^.+ already exists\.$/;

export enum LuisTrainingStatus {
  success = 'Success',
  upToDate = 'UpToDate',
  inProgress = 'InProgress',
  fail = 'Fail',
}

export interface ListOptions {
  skip?: number;
  take?: number;
}

export interface ImportAppOptions {
  appName?: string;
}

export interface PublishAppOptions {
  versionId: string;
  isStaging?: boolean;
  region?: string;
}

export interface ManagementResponse {
  body: any;
  headers: {[key: string]: string | string[]};
  statusCode: number;
}

export interface CreateAppOptions {
  name: string;
  description?: string;
  culture: string;
  usageScenario?: string;
  domain?: string;
  initialVersionId?: string;
}

export interface AppSettings {
  public: boolean;
}

export type LuisManagementCallback = (err: Error, response: ManagementResponse) => void;

export class LuisTrainingClient {

  private request: Request;

  constructor(private key: string, private region = 'westus') {
    this.request = new Request({
      baseUrl: `https://${region}.api.cognitive.microsoft.com/luis/api/v${API_VERSION}/apps`,
      headers: { 'Ocp-Apim-Subscription-Key': this.key },
      json: true,
    });
  }

  listUserApps(options: ListOptions, callback: LuisManagementCallback): void {
    options = options || {};
    this.request.get('', {
      qs: { skip: options.skip, take: options.take },
    }, this.onResponse(callback));
  }

  importApp(application: any, options: ImportAppOptions, callback: LuisManagementCallback): void {
    options = options || {};
    this.request.post('import', {
      body: application,
      qs: { appName: options.appName },
    }, this.onResponse(callback));
  }

  publishApp(appId: string, options: PublishAppOptions, callback: LuisManagementCallback): void {
    options.region = options.region || this.region;
    this.request.post(`${appId}/publish`, {
      body: options,
    }, this.onResponse(callback));
  }

  trainApp(appId: string, versionId: string, callback: LuisManagementCallback): void {
    this.request.post(`${appId}/versions/${versionId}/train`, {
    }, this.onResponse(callback));
  }

  trainingStatus(appId: string, versionId: string, callback: LuisManagementCallback): void {
    this.request.get(`${appId}/versions/${versionId}/train`, {
    }, this.onResponse(callback));
  }

  addApp(options: CreateAppOptions, callback: LuisManagementCallback): void {
    this.request.post('', {
      body: options,
    }, this.onResponse(callback));
  }

  importVersion(appId: string, app: any, callback: LuisManagementCallback): void {
    this.request.post(`${appId}/versions/import`, {
      body: app,
    }, this.onResponse(callback));
  }

  listVersions(appId: string, options: ListOptions, callback: LuisManagementCallback): void {
    options = options || {};
    this.request.get(`${appId}/versions`, {
      qs: { skip: options.skip, take: options.take },
    }, this.onResponse(callback));
  }

  listAppEndpoints(appId: string, callback: LuisManagementCallback): void {
    this.request.get(`${appId}/endpoints`, null, this.onResponse(callback));
  }

  listIntents(appId: string, versionId: string, options: ListOptions, callback: LuisManagementCallback): void {
    options = options || {};
    this.request.get(`${appId}/versions/${versionId}/intents`, {
      qs: { skip: options.skip, take: options.take },
    }, this.onResponse(callback));
  }

  listEntities(appId: string, versionId: string, options: ListOptions, callback: LuisManagementCallback): void {
    options = options || {};
    this.request.get(`${appId}/versions/${versionId}/entities`, {
      qs: { skip: options.skip, take: options.take },
    }, this.onResponse(callback));
  }

  listClosedLists(appId: string, versionId: string, options: ListOptions, callback: LuisManagementCallback): void {
    options = options || {};
    this.request.get(`${appId}/versions/${versionId}/closedlists`, {
      qs: { skip: options.skip, take: options.take },
    }, this.onResponse(callback));
  }

  listCompositeEntities(appId: string, versionId: string, options: ListOptions, callback: LuisManagementCallback): void {
    options = options || {};
    this.request.get(`${appId}/versions/${versionId}/compositeentities`, {
      qs: { skip: options.skip, take: options.take },
    }, this.onResponse(callback));
  }

  listHierarchicalEntities(appId: string, versionId: string, options: ListOptions, callback: LuisManagementCallback): void {
    options = options || {};
    this.request.get(`${appId}/versions/${versionId}/hierarchicalentities`, {
      qs: { skip: options.skip, take: options.take },
    }, this.onResponse(callback));
  }

  listPrebuiltEntities(appId: string, versionId: string, options: ListOptions, callback: LuisManagementCallback): void {
    options = options || {};
    this.request.get(`${appId}/versions/${versionId}/prebuilts`, {
      qs: { skip: options.skip, take: options.take },
    }, this.onResponse(callback));
  }

  listModels(appId: string, versionId: string, options: ListOptions, callback: LuisManagementCallback): void {
    options = options || {};
    this.request.get(`${appId}/versions/${versionId}/models`, {
      qs: { skip: options.skip, take: options.take },
    }, this.onResponse(callback));
  }

  updateSettings(appId: string, settings: AppSettings, callback: LuisManagementCallback): void {
    this.request.put(`${appId}/settings`, {
      body: settings,
    }, this.onResponse(callback));
  }

  /**
   * Periodically poll for training completion
   * @param appId appId
   * @param appVersion appVersion
   * @param callback callback
   */
  waitForTraining(appId: string, appVersion: string, callback: async.AsyncBooleanResultCallback<Error>): void {
    async.doDuring(
      (next: LuisManagementCallback) => this.trainingStatus(appId, appVersion, next),
      (...args: any[]) => { // typedef for async is not correct
        const resp: ManagementResponse = args[0];
        const next: async.AsyncBooleanResultCallback<Error> = args[1];
        const failed = resp.body.some((x: any) => x.details.status === LuisTrainingStatus.fail);
        const pending = resp.body.some((x: any) => x.details.status === LuisTrainingStatus.inProgress);
        if (failed) {
          setImmediate(next, new Error(resp.body));
        } else if (pending) {
          setTimeout(() => next(null, true), 2500);
        } else {
          setImmediate(next, null, false);
        }
      },
      callback);
  }

  /**
   * Try to import the app. If it already exists, return the existing appId
   * @param app app content
   * @param callback callback when done
   */
  tryImportApp(app: any, callback: LuisManagementCallback): void {
    this.importApp(app, null, (err, resp) => {
      console.log(`ERROR <${err.message}>`);
      if (!err || !RE_APP_EXISTS.test(err.message)) {
        return callback(err, resp);
      }

      // TODO check version match on imported and existing apps

      async.waterfall([
        (next: LuisManagementCallback) => this.listUserApps(null, next),
        (resp: ManagementResponse, next: (err: Error, app: any) => void) => next(null, resp.body.find((x: any) => x.name === app.name)),
        (app: any, next: LuisManagementCallback) => app.id ? next(null, { body: app.id, headers: null, statusCode: 200 }) : next(new Error('Cannot find LUIS app'), null),
      ], callback);
    });
  }

  private onResponse(callback: LuisManagementCallback): ResponseCallback {
    return (err: Error, response: Response) => {
      callback(err, response ? {
        body: response.body,
        headers: response.headers,
        statusCode: response.statusCode,
       } : null);
    };
  }
}
