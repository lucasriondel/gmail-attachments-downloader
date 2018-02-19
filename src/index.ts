import { OAuth2Client } from 'google-auth-library';
import { base64Decode } from 'base64topdf';
import * as mkdirp from 'mkdirp';

import { getAuthenticatedClient } from "./auth";
import { extractParts, getAttachmentInfo, getMessageInfo, listMessagesFrom, markAsRead } from "./gmail";
import { folderExists, uploadFile } from './drive';
import configuration from './configuration';

function createFolder(name: string) {
    return new Promise((resolve, reject) => {
        mkdirp(name, (err) => reject(err));
        resolve();
    });
}

async function main() {
    try {
        const auth = (await getAuthenticatedClient()) as OAuth2Client;
        for (const rule of configuration) {
            const messagesList = await listMessagesFrom(auth, rule.sender, rule.unreadEmailsOnly);
            for (const messageItem of messagesList) {
                const message = await getMessageInfo(auth, messageItem.id);
                const parts = extractParts(message);
                for (let part of parts) {
                    if (part.mimeType === rule.mimeType) {
                        const attachment = await getAttachmentInfo(auth, part.attachmentId, message.id);
                        await createFolder('downloads/');
                        const newFileName = rule.renameCallback(part.filename);
                        base64Decode(attachment.data, `downloads/${newFileName}`);
                        const parentFolder = await folderExists(auth, rule.destination);
                        if (!parentFolder) {
                            throw new Error(`[${rule.name}] Something is wrong with path '${rule.destination}'.`);
                        }
                        const uploadedFile = await uploadFile(auth,
                            newFileName, parentFolder.id, `downloads/${newFileName}`, part.mimeType);
                        console.log(`[${rule.name}] File '${newFileName}' has been created at '${rule.destination}' (original: ${part.filename})`);
                        if (rule.markAsRead) {
                            await markAsRead(auth, message.id);
                        }
                    }
                }
            }
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
    }
}

main();