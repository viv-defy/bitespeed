import e, { Request, Response } from "express";
import { Contact, ContactResponse } from "./models";
import { Op } from "sequelize";

export const handleContacts = async (req: Request, res: Response) => {
    let contacts: Contact[] = await getContacts(req.body.email, req.body.phoneNumber)
    let count = contacts.length;

    let linkedId: number | undefined = NaN;
    if ( count !== 0 ) {
        if( contacts[0].linkPrecedence === 'primary' ) {
            linkedId = contacts[0].id;
        } else {
            linkedId = contacts[0].linkedId;
        }   
    }

    let result: any = await insertNewContact(req.body.email, req.body.phoneNumber, linkedId)
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

const getContacts = async ( email: string, phoneNumber: string ) => {
    const rows = await Contact.findAll({
        where : {
            [Op.or] : [
                { email: email },
                { phoneNumber: phoneNumber },
            ]
        }
    });

    let contacts: Contact[] = [];
    rows.forEach( contact => {
        contacts.push(contact);
    })

    return contacts;
}

const insertNewContact = async ( email: string, phoneNumber: string, linkedId: number = NaN ) => {
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
