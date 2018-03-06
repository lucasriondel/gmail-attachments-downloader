import * as url from "url";
import * as http from "http";
import * as querystring from "querystring";
import { OAuth2Client } from "google-auth-library";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { Credentials } from "google-auth-library/build/src/auth/credentials";
const opn = require('opn');

// Download your OAuth2 configuration from Google Developer Console
// https://console.developers.google.com/projectcreate
const keys = require('../client_secret.json');
const tokensFilePath = "secret_tokens.json";
/**
 * Create a new OAuth2Client, and go through the OAuth2 content
 * workflow.  Return the full client to the callback.
 */
export async function getAuthenticatedClient() {
    return new Promise((resolve, reject) => {
        // create an oAuth client to authorize the API call.  Secrets are kept in a `keys.json` file,
        // which should be downloaded from the Google Developers Console.
        const oAuth2Client = new OAuth2Client(
            keys.web.client_id,
            keys.web.client_secret,
            keys.web.redirect_uris[0]
        );

        if (existsSync(tokensFilePath)) {
            const tokens = JSON.parse(readFileSync(tokensFilePath, 'utf8')) as Credentials;
            oAuth2Client.setCredentials(tokens);
            console.info(`Tokens retrieved from ${tokensFilePath}.`);
            resolve(oAuth2Client);
        }
        else {
            // Generate the url that will be used for the consent dialog.
            const authorizeUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: [
                    'https://mail.google.com',
                    'https://www.googleapis.com/auth/drive'
                ]
            });
    
            // Open an http server to accept the oauth callback. In this simple example, the
            // only request to our webserver is to /oauth2callback?code=<code>
            const server = http.createServer((req, res) => {
                if (req.url.indexOf('/oauth2callback') > -1) {
                    // acquire the code from the querystring, and close the web server.
                    const qs = querystring.parse(url.parse(req.url).query);
                    res.end('Authentication successful! Please return to the console.');
                    server.close();
    
                    // Now that we have the code, use that to acquire tokens.
    
                    oAuth2Client.getToken(qs.code as string).then(r => {
                        oAuth2Client.setCredentials(r.tokens);
                        writeFileSync(tokensFilePath, JSON.stringify(r.tokens));
                        console.info('Tokens acquired.');
                        resolve(oAuth2Client);
                    });
                    // Make sure to set the credentials on the OAuth2 client.
                }
            }).listen(3000, () => {
                // open the browser to the authorize url to start the workflow
                opn(authorizeUrl);
            });
        }

    });
}