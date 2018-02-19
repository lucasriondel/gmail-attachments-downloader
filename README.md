
# Gmail Attachments Downloader

**Gmail Attachments Downloader** is a node.js script that allows you to define rules in order to scrap your emails and download attachments so they can be uploaded to a specific folder on your Google Drive.


# How to use

## Credentials
Clone the repository, then add a client_secret.json file in the root folder. It should have the following syntax, and can be created using the [Google Developer Console](https://console.developers.google.com/projectcreate) :

     {
      "web": {
        "client_id": "xxxxx.apps.googleusercontent.com",
        "project_id": "xxxxx",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://accounts.google.com/o/oauth2/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_secret": "xxxxx",
        "redirect_uris": [
          "http://localhost:3000/oauth2callback"
        ]
      }
    }

> In the future, this part will be handled by a server of mine, so you don't have to worry about the app authentification.
## Configuration File 
Gmail Attachment Downloader needs to know some rules so it can behave the way you want it to behave. This is done by modifying `src/configuration.ts` .
It contains a variable myConfiguration, which is an array of `Rule`.
You can add new rules by creating new instances of the `Rule` object :
   

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
    new Rule({ ... })
Here's a list of the properties the `Rule` object can handle: 
### Required Properties
| **Property** | **Definition**
|--|--|--|
| `name` | The name of the rule, useful for console displayed messages only
| `sender` | The email of the sender it should look for
| `mimeType` | The [mimeType](https://en.wikipedia.org/wiki/Media_type) of the file it should look for
| `destination` | The folder in which the new file will be placed. It ***has*** to be absolute, and the root is your [My Drive folder](https://drive.google.com/drive/my-drive)


----------


### Optional Properties
| **Property** | **Default Value** | **Definition**
|--|--|--|
| `unreadEmailsOnly` | `true` | If true, it will only look for unread emails
| `markAsRead` | `false` | If true, it will mark as read every email that has been processed by the script
| `renameCallback` | Returns the original file name | A function that takes the original file name (with its extension) and that returns and new file name that will be used in Google Drive

## Launch the script

Once you've done the setup, launch the following commands:

    npm install
    npm install -g typescript
    tsc
    node build/index.js

# What's next

 - auth server
 - npm package
 - save google oauth token locally
 - more rule customization 

:watermelon: