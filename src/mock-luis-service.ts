import nock = require('nock');
import { API_VERSION } from './luis-client';

export class MockLuisService {
  scope: nock.Scope;

  constructor(private appId: string, private region = 'westus') {
    this.scope = nock(`https://${region}.api.cognitive.microsoft.com`);
  }

  recognize(statusCode: number, query: string, body?: any, headers?: any): MockLuisService {
    this.scope = this.scope
      .get(`/luis/v${API_VERSION}/apps/${this.appId}`)
      .query((params: any) => params.q === query)
      .reply(statusCode, body, headers);
    return this;
  }
}
