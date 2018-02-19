interface RuleConfiguration {
    name: string;
    sender: string;
    mimeType: string;
    destination: string;

    unreadEmailsOnly?: boolean;
    markAsRead?: boolean;
    renameCallback?: (originalFilename: string) => string;
}

class Rule implements RuleConfiguration {
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

const myConfiguration: Rule[] = [
    new Rule({
        //Required
        name: 'The Lil Uzi Vert Rule',
        sender: 'liluzivert@notagain.com',
        mimeType: 'application/pdf',
        destination: '/rappers/uzi',

        //Optional
        unreadEmailsOnly: false,
        markAsRead: true,
        renameCallback: (originalFilename: string) => {
            return `Uzi_${originalFilename}`;
        },
    }),
];

export default myConfiguration;