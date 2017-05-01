import request = require('request');
import async = require('async');

export const API_VERSION = '2.0';

type RequestAPI = request.RequestAPI<request.Request, request.CoreOptions, request.RequiredUriUrl>;

export interface Entity {
  entity: string;
  type: string;
  startIndex: number;
  endIndex: number;
  score: number;
  resolution: any;
}

export interface Intent {
  intent: string;
  score: number;
}

export interface LuisResult {
  query: string;
  topScoringIntent: Intent;
  intents: Intent[];
  entities: Entity[];
}

export type LuisCallback = (err: Error, result: LuisResult) => void;

export class LuisClient {
  private request: RequestAPI;

  constructor(private appId: string, private key: string, private region = 'westus') {
    this.setDefaults(region, appId, key);
  }

  setAppId(appId: string): void {
    this.setDefaults(this.region, appId, this.key);
  }

  setKey(key: string): void {
    this.setDefaults(this.region, this.appId, key);
  }

  setRegion(region: string): void {
    this.setDefaults(region, this.appId, this.key);
  }

  recognize(text: string, callback: LuisCallback): void {
    async.waterfall([
      (next: request.RequestCallback) => this.request.get('', {qs: {q: text}}, next),
      (resp: any, body: any, next: LuisCallback) => {
        if (resp.statusCode === 200) {
          setImmediate(callback, null, body);
        } else {
          setImmediate(callback, new Error(`LUIS returned HTTP ${resp.statusCode}: ${resp.statusMessage}`));
        }
      },
    ], callback);
  }

  private setDefaults(region: string, appId: string, key: string): void {
    this.request = request.defaults({
      baseUrl: `https://${region}.api.cognitive.microsoft.com/luis/v${API_VERSION}/apps/${appId}`,
      json: true,
      qs: { 'subscription-key': key },
    });
  }
}
