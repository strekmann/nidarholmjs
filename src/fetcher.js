import fetch from "isomorphic-fetch";

// TODO: Update this when someone releases a real, production-quality solution
// for handling universal rendering with Relay Modern. For now, this is just
// enough to get things working.

class FetcherBase {
  constructor(url, jwt) {
    this.url = url;
    this.jwt = jwt;
  }

  async fetch(operation, variables) {
    const headers = {
      "Content-Type": "application/json",
    };
    if (this.jwt) {
      headers.Authorization = `bearer ${this.jwt}`;
    }
    const response = await fetch(this.url, {
      method: "POST",
      credentials: "same-origin",
      headers,
      body: JSON.stringify({ query: operation.text, variables }),
    });
    return response.json();
  }
}

export class ServerFetcher extends FetcherBase {
  constructor(url, jwt) {
    super(url, jwt);

    this.payloads = [];
  }

  async fetch(...args) {
    const i = this.payloads.length;
    this.payloads.push(null);
    const payload = await super.fetch(...args);
    this.payloads[i] = payload;
    return payload;
  }

  toJSON() {
    return this.payloads;
  }
}

export class ClientFetcher extends FetcherBase {
  constructor(url, payloads) {
    super(url);

    this.payloads = payloads;
  }

  async fetch(...args) {
    if (this.payloads.length) {
      return this.payloads.shift();
    }

    return super.fetch(...args);
  }
}
