import request = require('request');
import async = require('async');

const API_VERSION = '2.0';

type RequestAPI = request.RequestAPI<request.Request, request.CoreOptions, request.RequiredUriUrl>;

export interface Response {
  body: any;
  resp: any;
}
export type RequestCallback = (err: Error, resp: any) => void;

export class LuisTrainingClient {
  private api: RequestAPI;

  constructor(private key: string, private appId = '', private versionId = '', private region = 'westus') {
    const baseUrl = [`https://${region}.api.cognitive.microsoft.com/luis/api/v${API_VERSION}/apps`];
    if (appId) {
      baseUrl.push(appId);
      if (versionId) {
        baseUrl.push('versions');
        baseUrl.push(versionId);
      }
    }
    this.api = request.defaults({
      baseUrl: baseUrl.join('/') + '/',
      headers: {'Ocp-Apim-Subscription-Key': this.key},
      json: true,
    });

    ['get', 'put', 'post', 'delete'].forEach((method) => this[method] = (uri: string, options: any, callback: RequestCallback) => {
      options = Object.assign(options || {}, { method});
      this.request(uri, options, callback);
    });
  }

  request(uri: string, options: any, callback: RequestCallback) {
    options = Object.assign(options || {}, { method: 'get'});
    async.waterfall([
      (next: request.RequestCallback) => this.api(uri, options, next),
      (resp: request.RequestResponse, body: any) => {
        if (resp.statusCode < 200 || resp.statusCode >= 300) {
          callback(new Error(resp.statusCode.toString()), null);
        } else {
          callback(null, {body, resp});
        }
      },
    ], callback);
  }
}
