import {OAuth2Client} from "google-auth-library";

interface ListMessagesItem {
    id: string;
    threadId: string;
}

interface ListMessagesResponse {
    messages: ListMessagesItem[];
    resultSizeEstimate: number;
}

interface Header {
    name: string;
    value: string;
}

interface Part {
    body: {
        size: number;
        attachmentId?: string;
        data?: string;
    },
    filename: string;
    headers: Header[];
    mimeType: string;
    partId: string;
    parts?: Part[];
}

interface Message extends ListMessagesItem {
    labelIds: string[];
    snippet: string;
    historyId: string;
    internalDate: string;
    payload: {
        partId: string;
        mimeType: string;
        filename: string;
        headers: Header[];
        body: {
            size: number;
        }
        parts?: Part[];
    }
    sizeEstimate: number;
}

interface Attachment {
    data: string;
    size: number;
}

export const listMessagesFrom = async (auth: OAuth2Client, from: string, unread: boolean) => {
    try {
        const response = await auth.request({
            url: 'https://www.googleapis.com/gmail/v1/users/me/messages',
            params: {
                q: `from:${from}` + (unread ? ` is:unread` : '')
            }
        });
        return (response.data as ListMessagesResponse).messages;
    } catch(e) {
        throw e;
    }
};

export const getMessageInfo = async (auth: OAuth2Client, messageId: string) => {
    try {
        const response = await auth.request({
            url: `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`
        });
        return response.data as Message;
    } catch(e) {
        throw e;
    }
};

export const extractParts = (message: Message) => {
    const parts = [];
    if (!message.payload.hasOwnProperty('parts'))
        return [];
    for (let part of message.payload.parts) {
        if (part.mimeType !== "multipart/alternative")
            parts.push({
                attachmentId: part.body.attachmentId,
                size: part.body.size,
                filename: part.filename,
                mimeType: part.mimeType
            })
    }
    return parts;
};

export const getAttachmentInfo = async (auth: OAuth2Client, attachmentId: string, messageId: string) => {
    try {
        const response = await auth.request({
            url: `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`
        });
        return response.data as Attachment;
    } catch(e) {
        throw e;
    }
};

export const markAsRead = async (auth: OAuth2Client, messageId: string) => {
    try {
        const response = await auth.request({
            url: `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`,
            method: 'post',
            data: {
                'removeLabelIds': [ 'UNREAD' ]
            }
        });
        return response.data;
    } catch(e) {
        throw e;
    }
};
