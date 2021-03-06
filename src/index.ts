import { readFileSync } from 'fs';
import { OAuth2Client } from 'google-auth-library';
import { base64Decode } from 'base64topdf';
import * as mkdirp from 'mkdirp';
import * as cron from 'node-cron';
import chalk from 'chalk';
import { ArgumentParser } from 'argparse';

import { getAuthenticatedClient } from "./google/auth";
import { extractParts, getAttachmentInfo, getMessageInfo, listMessagesFrom, markAsRead, ListMessagesItem } from "./google/gmail";
import { folderExists, uploadFile } from './google/drive';
import configuration from './config/userConfiguration';
import Rule from './config/configuration';

function createFolder(name: string) {
    return new Promise((resolve, reject) => {
        mkdirp(name, (err) => reject(err));
        resolve();
    });
}

function log(rule: string, message: string) {
    const d = new Date();
    const time = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
    console.log(`[${time}] ${chalk.white.bgCyan(rule)} ${chalk.white(message)}`);
}

async function scanEmails() {
    try {
        const auth = (await getAuthenticatedClient()) as OAuth2Client;
        for (const rule of configuration) {
            log(rule.name, 'rule start');
            const messagesList = await listMessagesFrom(auth, rule.sender, rule.unreadEmailsOnly) as ListMessagesItem[];
            log(rule.name, `${String(messagesList.length)} messages found`);
            for (const messageItem of messagesList) {
                const message = await getMessageInfo(auth, messageItem.id);
                const parts = extractParts(message);
                for (const part of parts) {
                    if (part.mimeType === rule.mimeType) {
                        log(rule.name, `attachment '${part.filename}' found `);
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
                        log(rule.name, `file '${newFileName}' has been created at '${rule.destination}' (original: ${part.filename})`);
                        if (rule.markAsRead) {
                            await markAsRead(auth, message.id);
                        }
                    }
                }
            }
            console.log('');
        }
    } catch (e) {
        console.error(e);
    }
}

const parser = new ArgumentParser({
    version: JSON.parse(readFileSync('package.json', 'utf8')).version,
});

parser.addArgument(
    ['-c', '--cron'],
    {
        help: "CRON scheduler, same syntax as the one used by https://www.npmjs.com/package/node-cron. Default is every 20 minutes."
    }
)

var args = parser.parseArgs();
if (args.cron === null) {
    args.cron = '*/20 * * * *'; 
}

scanEmails();
cron.schedule(args.cron, function(){
    scanEmails();    
});
