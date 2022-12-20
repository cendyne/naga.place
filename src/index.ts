export interface Env {
}

function webFingerMastodon(host: string, username: string) : any {
  return {
    "subject": `acct:${username}@${host}`,
    "aliases": [
      `https://${host}/@${username}`,
      `https://${host}/users/${username}`
    ],
    "links": [
      {
        "rel": "http://webfinger.net/rel/profile-page",
        "type": "text/html",
        "href": `https://${host}/@${username}`
      },
      {
        "rel": "self",
        "type": "application/activity+json",
        "href": `https://${host}/users/${username}`
      },
      {
        "rel": "http://ostatus.org/schema/1.0/subscribe",
        "template": `https://${host}/authorize_interaction?uri={uri}`
      }
    ]
  };
}

function webFingerAkkomaOrPleroma(host: string, username: string) : any {
  return {
    "subject": `acct:${username}@${host}`,
    "aliases": [
      `https://${host}/users/${username}`
    ],
    "links": [
      {
        "rel": "http://webfinger.net/rel/profile-page",
        "type": "text/html",
        "href": `https://${host}/users/${username}`
      },
      {
        "rel": "self",
        "type": "application/activity+json",
        "href": `https://${host}/users/${username}`
      },
      {
        "rel": "http://ostatus.org/schema/1.0/subscribe",
        "template": `https://${host}/ostatus_subscribe?acct={uri}`
      }
    ]
  };
}

function webFingerMisskey(host: string, username: string) : any {
	return {
    "subject": `acct:${username}@${host}`,
    "aliases": [
      `https://${host}/users/${username}`
    ],
    "links": [
      {
        "rel": "http://webfinger.net/rel/profile-page",
        "type": "text/html",
        "href": `https://${host}/@${username}`
      },
      {
        "rel": "self",
        "type": "application/activity+json",
        "href": `https://${host}/@${username}`
      },
      {
        "rel": "http://ostatus.org/schema/1.0/subscribe",
        "template": `https://${host}/authorize-follow?acct={uri}`
      }
    ]
  };
}

interface WebFinger {
	[key: string]: ['mastodon' | 'akkoma' | 'pleroma' | 'misskey', string, string]
}

import untypedData from './data.json'
const webFingerTable : WebFinger = untypedData as any;

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {

		if (request.method == 'GET') {
			let {hostname, pathname, searchParams} = new URL(request.url);
			if (pathname == '/.well-known/webfinger') {
				const resource = searchParams.get('resource');
				if (resource) {
					let match = resource.toLocaleLowerCase().match(/^acct:([^@]+)@(.+)$/);
					let webFinger : any | undefined;
					if (match) {
						let [,fingerUsername,fingerHost] = match;
						if (fingerHost == hostname) {
							const webFingerData = webFingerTable[fingerUsername];
							if (webFingerData) {
								switch (webFingerData[0]) {
									case 'mastodon': {
										webFinger = webFingerMastodon(webFingerData[1], webFingerData[2]);
										break;
									}
									case 'pleroma':
									case 'akkoma': {
										webFinger = webFingerAkkomaOrPleroma(webFingerData[1], webFingerData[2]);
										break;
									}
									case 'misskey': {
										webFinger = webFingerMisskey(webFingerData[1], webFingerData[2]);
										break;
									}
									default: {
										console.log(`Unknown webFinger type ${webFingerData[0]}`)
									}
								}
							} else {
								console.log(`${fingerUsername} not known`);
							}
						} else {
							console.log(`${fingerHost} not matching`);
						}
					} else {
						console.log(`Webfinger resource ${resource} not supported`)
					}
					if (webFinger) {
						return new Response(JSON.stringify(webFinger), {
							headers: {
							'content-type': 'application/jrd+json'
						}})
					}
				}
				return new Response('Not Found', {
					status: 404
				});
			}
		}

		return new Response("Go to Naga Place", {
			headers: new Headers([
				['location', 'https://t.me/cendyneplace']
			]),
			status: 302
		});
	},
};
