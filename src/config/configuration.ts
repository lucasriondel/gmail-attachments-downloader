interface RuleConfiguration {
    name: string;
    sender: string;
    mimeType: string;
    destination: string;

    unreadEmailsOnly?: boolean;
    markAsRead?: boolean;
    renameCallback?: (originalFilename: string) => string;
}

export default class Rule implements RuleConfiguration {
        name: string;
        sender: string;
        mimeType: string;
        destination: string;

        unreadEmailsOnly?: boolean;
        markAsRead?: boolean;
        renameCallback?: (originalFilename: string) => string;

    constructor(configuration: RuleConfiguration) {
        this.name = configuration.name;
        this.sender = configuration.sender;
        this.mimeType = configuration.mimeType;
        this.destination = configuration.destination;

        this.unreadEmailsOnly = configuration.hasOwnProperty('unreadEmailsOnly') ?
            configuration.unreadEmailsOnly : true;
        this.markAsRead = configuration.hasOwnProperty('markAsRead') ?
            configuration.markAsRead : false;
        this.renameCallback = configuration.hasOwnProperty('renameCallback') ?
            configuration.renameCallback : ofn => ofn;
    }
}