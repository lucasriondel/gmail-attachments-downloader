import { OAuth2Client } from 'google-auth-library';
import { base64Decode } from 'base64topdf';
import * as mkdirp from 'mkdirp';

import { getAuthenticatedClient } from "./auth";

async function main() {
    try {
        const auth = (await getAuthenticatedClient()) as OAuth2Client;
    } catch (e) {
        console.error(e);
    }
}

main();