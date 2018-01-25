import async = require('async');
import request = require('request');

export type Response = request.RequestResponse;
export type ResponseCallback = (err: Error, response: request.RequestResponse) => void;

export class Request {
  private api: request.RequestAPI<request.Request, request.CoreOptions, request.UriOptions>;

  constructor(defaults: request.CoreOptions) {
    this.api = request.defaults(defaults);
  }

  get(uri: string, options: request.CoreOptions, callback: ResponseCallback): void {
    this.request('GET', uri, options, callback);
  }

  post(uri: string, options: request.CoreOptions, callback: ResponseCallback): void {
    this.request('POST', uri, options, callback);
  }

  delete(uri: string, options: request.CoreOptions, callback: ResponseCallback): void {
    this.request('DELETE', uri, options, callback);
  }

  put(uri: string, options: request.CoreOptions, callback: ResponseCallback): void {
    this.request('PUT', uri, options, callback);
  }

  private request(method: string, uri: string, options: request.CoreOptions, callback: ResponseCallback): void {
    async.waterfall([
      (next: request.RequestCallback) => {
        this.api[method.toLowerCase()](uri, options, next);
      },
      (resp: request.RequestResponse, body: any, next: request.RequestCallback) => {
        if (resp.statusCode < 200 || resp.statusCode >= 300) {
          const message = resp.headers['content-type'].startsWith('application/json')
            ? this.formatJsonErrorMessage(body)
            : `Request returned HTTP ${resp.statusCode}`;
          setImmediate(next, new Error(message), resp); // TODO retry with backoff
        } else {
          setImmediate(next, null, resp);
        }
      },
    ], callback);
  }

  private formatJsonErrorMessage(body: any): string {
    if (body.message) {
      return body.message;
    } else if (body.error && body.error.message) {
      return body.error.message;
    } else {
      return JSON.stringify(body);
    }
  }
}
