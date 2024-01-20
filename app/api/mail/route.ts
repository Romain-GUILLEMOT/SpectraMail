import Imap from 'imap';
export const dynamic = 'force-dynamic' // defaults to auto
function parseHeader(header: { [x: string]: string[]; subject?: any; from?: any; date?: any; }) {
    return {
        subject: header.subject[0],
        from: header.from[0],
        date: header.date[0]
    };
}
async function fetchEmails(imap: Imap): Promise<any> {
    // Utilisation d'une promesse pour gérer de manière asynchrone
    return new Promise<any>((resolve, reject) => {
        // Attendez que le client IMAP soit prêt
        imap.once('ready', () => {
            imap.openBox('INBOX', true, (err) => {
                if (err) {
                    reject(err); // En cas d'erreur, rejet de la promesse
                    return;
                }

                // Recherchez les 10 premiers emails
                imap.search(['1:10'], async (searchError, searchResults) => {
                    if (searchError) {
                        reject(searchError); // En cas d'erreur, rejet de la promesse
                        return;
                    }

                    const f = imap.fetch(searchResults, {
                        bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
                        struct: true
                    });

                    const emails: { subject: any; from: any; date: any; }[] = [];
                    f.on('message', (msg) => {
                        msg.on('body', (stream) => {
                            let buffer = '';
                            stream.on('data', (chunk) => {
                                buffer += chunk.toString('utf8');
                            });
                            stream.on('end', () => {
                                emails.push(parseHeader(Imap.parseHeader(buffer)));
                            });
                        });
                    });

                    f.once('end', () => {
                        resolve(emails);
                    });
                });
            });
        });

        // Gérez les erreurs de connexion IMAP
        imap.once('error', (error: any) => {
            reject(error); // En cas d'erreur, rejet de la promesse
        });

        // Établissez la connexion au serveur IMAP
        imap.connect();
    });
}
export async function GET() {
    const imap = new Imap({
        user: process.env.IMAP_USER ? process.env.IMAP_USER : '',
        password: process.env.IMAP_PASSWORD ? process.env.IMAP_PASSWORD : '',
        host: process.env.IMAP_HOST ? process.env.IMAP_HOST : '',
        port: process.env.IMAP_PORT ? parseInt(process.env.IMAP_PORT) : 993,
        tls: process.env.IMAP_TLS ? process.env.IMAP_TLS === 'true' : true,
    });
    const data = await fetchEmails(imap);
    return Response.json(data)
}