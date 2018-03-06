import { auth, OAuth2Client } from 'google-auth-library';
import * as stream from 'stream';
import * as fs from 'fs';

function isReadableStream(obj: any) {
    return obj instanceof stream.Readable && typeof obj._read === 'function';
}

export const uploadFile = async (auth: OAuth2Client, filename: string, parentFolderId: string, pathOnDisk: string, mimeType: string) => {
    try {
        const resource = {
            name: filename,
            parents: [parentFolderId]
        };
        const media = {
            mimeType,
            body: fs.createReadStream(pathOnDisk)
        };
        const defaultMime = typeof media.body === 'string' ?
            'text/plain' :
            'application/octet-stream';
        const multipart = [
            {'Content-Type': 'application/json', body: JSON.stringify(resource)}, {
                'Content-Type':
                media.mimeType || (resource && resource.hasOwnProperty('mimeType')) || defaultMime,
                body: media.body  // can be a readable stream or raw string!
            }
        ];
        const boundary = "uuid.v4";
        const finale = `--${boundary}--`;
        const rStream = new stream.PassThrough();
        const isStream = isReadableStream(multipart[1].body);
        const headers = { 'Content-Type' : `multipart/related; boundary=${boundary}` };
        for (const part of multipart) {
            const preamble =
                `--${boundary}\r\nContent-Type: ${part['Content-Type']}\r\n\r\n`;
            rStream.push(preamble);
            if (typeof part.body === 'string') {
                rStream.push(part.body);
                rStream.push('\r\n');
            } else {
                part.body.pipe(rStream, {end: false});
                part.body.on('end', () => {
                    rStream.push('\r\n');
                    rStream.push(finale);
                    rStream.push(null);
                });
            }
        }
        if (!isStream) {
            rStream.push(finale);
            rStream.push(null);
        }
        const response =  await auth.request({
            url: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
            method: 'post',
            headers,
            data: rStream
        });
        return response.data;
    } catch (e) {
        throw e;
    }
};

interface File {
    kind: string;
    id: string;
    name: string;
    mimeType: string;
}

interface FilesList {
    files: File[];
    incompleteSearcH: false;
    kind: string;
}

interface ParentsList {
    parents: string[];
}

export const searchFolders = async (auth: OAuth2Client, folderName: string) => {
    try {
        const response =  await auth.request({
            url: 'https://www.googleapis.com/drive/v3/files',
            method: 'get',
            params: {
                q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`
            }
        });
        const filesResponse = response.data as FilesList;
        if (filesResponse.files.length === 0)
            throw new Error(`Folder '${folderName}' not found`);
        return (response.data as FilesList).files;
    } catch (e) {
        throw e;
    }
};

export const searchFiles = async (auth: OAuth2Client, filename: string) => {
    try {
        const response =  await auth.request({
            url: 'https://www.googleapis.com/drive/v3/files',
            method: 'get',
            params: {
                q: `name='${filename}'`
            }
        });
        const filesResponse = response.data as FilesList;
        if (filesResponse.files.length === 0)
            throw new Error(`File '${filename}' not found`);
        return (response.data as FilesList).files;
    } catch (e) {
        throw e;
    }
};

export const getFile = async (auth: OAuth2Client, fileId: string) => {
    try {
        const response =  await auth.request({
            url: `https://www.googleapis.com/drive/v3/files/${fileId}`,
            method: 'get',
        });
        return response.data as File;
    } catch (e) {
        throw e;
    }
};

export const getParentFolderId = async (auth: OAuth2Client, fileId: string) => {
    try {
        const response =  await auth.request({
            url: `https://www.googleapis.com/drive/v3/files/${fileId}?fields=parents`,
            method: 'get',
        });
        if (Object.keys(response.data).length === 0)
            return 'root';
        return (response.data as ParentsList).parents[0];
    } catch (e) {
        throw e;
    }
};

export const getTree = async (auth: OAuth2Client, file: File, omitMyDrive = true) => {
    let parentFolderId = await getParentFolderId(auth, file.id);
    let path = `${file.name}`;
    while (parentFolderId != 'root') {
        const parentFolder = await getFile(auth, parentFolderId);
        path = `${parentFolder.name}/${path}`;
        parentFolderId = await getParentFolderId(auth, parentFolder.id);
    }
    path = `/${path}`;
    if (omitMyDrive) {
        return path.substr(path.indexOf('/', 2));
    }
    return path;
}

export const folderExists = async (auth: OAuth2Client, folderPath: string) => {
    const splittedPath = folderPath.split('/');
    const folderName = splittedPath.length > 0 ? splittedPath[splittedPath.length - 1] : folderPath;
    const folders = await searchFolders(auth, folderName);
    for (let folder of folders) {
        if (await getTree(auth, folder) === folderPath)
            return folder;
    }
    return false;
};