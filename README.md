# Installation
```
npm install --save cognitive-luis-client
```

# Usage

## TypeScript
```TypeScript
import { LuisClient } from 'cognitive-luis-client';

// Use with default region (westus)
const client = new LuisClient('appId', 'key');

client.recognize('utterance', (err: Error, result: LuisResult) => {
  if (err) throw err;
  console.log(result.intents, result.entities);
});
```

```TypeScript
// Use with custom region
const client = new LuisClient('appId', 'key', 'region');
```

## JavaScript
```JavaScript
const clc = require('cognitive-luis-client');
 
const client = new clc.LuisClient('appId', 'key');
client.recognize('utterance', (err, result) => {
  if (err) throw err;
  console.log(result.intents, result.entities);
});
```

# Test Suite
Use `MockLuisService` to mock a response for any code that relies on `LuisClient` without making an actual API call.

```TypeScript
import { MockLuisService, LuisClient } from 'cognitive-luis-client';
 
// Use with default region
new MockLuisService('fake-app-id')
  .recognize(200, 'my test utterance', {intents:[{intent:'foo', score:1}], entities:[]});

const client = new LuisClient('fake-app-id', 'any fake key');
client.recognize('my test utterance', (err: Error, result: LuisResult) => {
  if (err) throw err;
  expect(result.intents[0].intent).toBe('foo');
  expect(result.intents[0].score).toBe(1);
});
```

```TypeScript
// Use with custom region
new MockLuisService('fake-app-id', 'region')
  .recognize(200, 'my test utterance', {/* result */});

const client = new LuisClient('fake-app-id', 'any fake key', 'region');
```