import request = require('request');

const API_VERSION = '2.0';

type RequestAPI = request.RequestAPI<request.Request, request.CoreOptions, request.RequiredUriUrl>;

export class LuisTrainingClient {
  private api: RequestAPI;
  // tslint:disable-next-line:member-ordering
  request: any = this.api;

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
  }
}
