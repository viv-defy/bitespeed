import e, { Request, Response } from "express";
import { Contact, ContactResponse } from "./models";
import { Op } from "sequelize";

export const handleContacts = async (req: Request, res: Response) => {
    if ( req.body.email === null && req.body.phoneNumber === null ) {
        res.sendStatus(422);
        return
    }

    let { primaryId, secondaryId } : { primaryId: number | null, secondaryId: number | null} = await getPrimaryIds(req.body.email, req.body.phoneNumber);
    let contacts: Contact[] = [];

    if ( primaryId && secondaryId ) {
        let id = await connectContacts( primaryId, secondaryId);
        if ( !id ) {
            res.sendStatus(500);
            return
        }
        let updatedContacts = await getContacts( id );
        contacts.push(...updatedContacts);
        
        const response = getResponse(contacts);
        res.json({
            "contact": response
        })
        return
    }

    if ( primaryId ) {
        let existingContacts = await getContacts(primaryId);
        contacts.push(...existingContacts)
    }

    if ( req.body.email === null || req.body.phoneNumber === null ) {
        if ( primaryId ) {
            const response = getResponse(contacts);
            res.json({
                "contact": response
            });
            return
        }
    }

    let result: any = await insertNewContact(req.body.email, req.body.phoneNumber, primaryId)
    if ( result instanceof Error ) {
        console.log(result)
    } else {
        contacts.push(result);
    }

    const response = getResponse(contacts);
    res.json({
        "contact": response
    })
}

const getPrimaryIds = async ( email: string, phoneNumber: string ) => {

    let id1: number | null = null;
    let id2: number | null = null;
    if ( email ) {
        const contact1 = await Contact.findOne({
            where : { email: email }
        });
        
        id1 = getPrimaryIdFromContact( contact1 )
    }

    if ( phoneNumber ) {
        const contact2 = await Contact.findOne({
            where : { phoneNumber: phoneNumber }
        });

        if ( id1 ) { id2 = getPrimaryIdFromContact(contact2) }
        else { id1 = getPrimaryIdFromContact(contact2) }
    }
    
    if ( id1 && id2 ) {
        if ( id1 === id2 ) {
            return { primaryId: id1, secondaryId: null }
        } else {
            return { primaryId: id1, secondaryId: id2 }
        }
    } else {
        return { primaryId: id1, secondaryId: null };
    }  
}

const getPrimaryIdFromContact = ( contact: Contact | null ) => {
    if ( contact ) {
        if ( contact.linkPrecedence === 'primary' ) { return contact.id }
        else if( contact.linkedId ) { return contact.linkedId }
        else { return null }
    } else {
        return null
    }
}

const connectContacts = async ( pid: number, sid: number ) => {
    let contact1 = await Contact.findByPk( pid );
    let contact2 = await Contact.findByPk( sid );

    let primaryContact: Contact;
    let secondaryContact: Contact;

    if ( contact1 && contact2) {
        if ( contact1.createdAt < contact2.createdAt ) {
            primaryContact = contact1;
            secondaryContact = contact2;
        } else {
            primaryContact = contact2;
            secondaryContact = contact1;
        }
    } else {
        const error = new Error("Error: unable to fetch primary contacts with primary keys " + pid + ", " + sid)
        console.log(error);
        return null;
    }

    await Contact.update(
        {
            linkedId: primaryContact.id,
            linkPrecedence: 'secondary',
        },
        {
            where: {
                [Op.or] : [
                    { linkedId: secondaryContact.id },
                    { id: secondaryContact.id },
                ]
            }
        }
    );

    return primaryContact.id;
}

const getContacts = async ( primaryId: number ) => {
    const rows = await Contact.findAll({
        where : {
            [Op.or] : [
                { id: primaryId },
                { linkedId: primaryId },
            ]
        }
    });

    let contacts: Contact[] = [];
    rows.forEach( contact => {
        contacts.push(contact);
    })

    return contacts;
}

const insertNewContact = async ( email: string, phoneNumber: string, linkedId: number | null ) => {
    let precedence: string = 'primary';
    if ( linkedId ) {
        precedence = 'secondary';
    }

    try {
        const result = await Contact.create({
            phoneNumber: phoneNumber,
            email: email,
            linkedId: linkedId,
            linkPrecedence: precedence,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        });
        return result;
    } catch (error) {
        return error;
    }
}

const getResponse = (contacts: Contact[]) => {
    let response: ContactResponse = {
        primaryContatctId: NaN,
        emails: [],
        phoneNumbers: [],
        secondaryContactIds: []
    }

    let emails = new Set<string>([]);
    let phoneNumbers = new Set<string>([]);
    let secondaryContactIds = new Set<number>([]);

    contacts.forEach( contact => {
        if ( contact && contact.linkPrecedence === 'primary' ) {
            response.primaryContatctId = contact.id;
        } else if ( contact ) {
            secondaryContactIds.add(contact.id);
        }

        if ( contact && contact.email ) {
            emails.add(contact.email);
        }

        if ( contact && contact.phoneNumber ) {
            phoneNumbers.add(contact.phoneNumber);
        }
    });

    response.emails = [...emails];
    response.phoneNumbers = [...phoneNumbers];
    response.secondaryContactIds = [...secondaryContactIds];

    return response;
}
