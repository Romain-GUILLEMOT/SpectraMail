import Imap from 'imap';
import { simpleParser } from 'mailparser';

export const dynamic = 'force-dynamic' // defaults to auto
function parseHeader(header: { [x: string]: string[]; subject?: any; from?: any; date?: any; }) {
    return {
        subject: header.subject[0],
        from: header.from[0],
        date: header.date[0]
    };
}
async function fetchEmails(imap: Imap, id: number): Promise<any> {
    // Utilisation d'une promesse pour gérer de manière asynchrone
    return new Promise<any>((resolve, reject) => {
        // Attendez que le client IMAP soit prêt
        imap.once('ready', () => {
            imap.openBox('INBOX', true, (err) => {
                if (err) {
                    reject(err); // En cas d'erreur, rejet de la promesse
                    return;
                }

                const f = imap.fetch(id, {
                    bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', '1'],
                    struct: true
                });

                let email: { subject: any; from: any; date: any; body: any; } = {subject: null, from: null, date: null, body: null};
                f.on('message', (msg) => {
                    let header: any = '';
                    let body = '';
                    msg.on('body', (stream, info) => {
                        let buffer = '';
                        stream.on('data', (chunk) => {
                            buffer += chunk.toString('utf8');
                        });
                        stream.on('end', () => {
                            if (info.which === '1')
                                body = buffer;
                            else
                                header = Imap.parseHeader(buffer);
                        });
                    });
                    msg.on('end', () => {
                        email = {
                            ...parseHeader(header),
                            body
                        };
                    });
                });

                f.once('end', () => {
                    resolve(email);
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
export async function GET(context: { url: string; }) {
    const urlParts = context.url.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    const imap = new Imap({
        user: process.env.IMAP_USER ? process.env.IMAP_USER : '',
        password: process.env.IMAP_PASSWORD ? process.env.IMAP_PASSWORD : '',
        host: process.env.IMAP_HOST ? process.env.IMAP_HOST : '',
        port: process.env.IMAP_PORT ? parseInt(process.env.IMAP_PORT) : 993,
        tls: process.env.IMAP_TLS ? process.env.IMAP_TLS === 'true' : true,
    });
    const data = await fetchEmails(imap, Number(lastPart));
    return Response.json(data)
}