import async = require('async');
import { Request, Response, ResponseCallback } from './request';

const API_VERSION = '2.0';

export interface ListUserApplicationsOptions {
  skip?: number;
  take?: number;
}

export interface ImportAppOptions {
  appName?: string;
}

export interface PublishAppOptions {
  versionId: string;
  isStaging?: boolean;
}

export interface ManagementResponse {
  body: any;
  headers: {[key: string]: string};
  statusCode: number;
}

export type LuisManagementCallback = (err: Error, response: ManagementResponse) => void;

export class LuisTrainingClient {

  private request: Request;

  constructor(private key: string, private region = 'westus') {
    const baseUrl = [`https://${region}.api.cognitive.microsoft.com/luis/api/v${API_VERSION}/apps`];
    this.request = new Request({
      baseUrl: `https://${region}.api.cognitive.microsoft.com/luis/api/v${API_VERSION}/apps`,
      headers: { 'Ocp-Apim-Subscription-Key': this.key },
      json: true,
    });
  }

  listUserApps(options: ListUserApplicationsOptions, callback: LuisManagementCallback): void {
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

  listSubscriptionKeys(callback: LuisManagementCallback): void {
    this.request.get('subscriptions', {
    }, this.onResponse(callback));
  }

  addSubscriptionKey(keyName: string, key: string, callback: LuisManagementCallback): void {
    this.request.post('subscriptions', {
      body: {subscriptionName: keyName, subscriptionKey: key},
    }, this.onResponse(callback));
  }

  assignAppKey(appId: string, versionId: string, key: string, callback: LuisManagementCallback): void {
    this.request.put(`${appId}/versions/${versionId}/assignedkey`, {
      body: key,
    }, this.onResponse(callback));
  }

  publishApp(appId: string, options: PublishAppOptions, callback: LuisManagementCallback): void {
    this.request.post(`${appId}/publish`, {
      body: options,
    }, this.onResponse(callback));
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
