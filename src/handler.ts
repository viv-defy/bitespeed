import e, { Request, Response } from "express";
import { Contact, ContactResponse } from "./models";
import { Op } from "sequelize";

export const handleContacts = async (req: Request, res: Response) => {
    if ( req.body.email === null && req.body.phoneNumber === null ) {
        res.sendStatus(422);
        return
    }

    let primaryId: number | undefined = await getPrimaryId(req.body.email, req.body.phoneNumber);
    let contacts: Contact[] = [];

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
        } else {
            res.sendStatus(422);
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

const getPrimaryId = async ( email: string, phoneNumber: string ) => {
    const contact = await Contact.findOne({
        where : {
            [Op.or] : [
                { email: email },
                { phoneNumber: phoneNumber },
            ]
        }
    });

    if ( contact ) {
        if ( contact.linkPrecedence === 'primary' ) {
            return contact.id;
        } else {
            return contact.linkedId;
        }
    } else {
        return undefined;
    }
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

const insertNewContact = async ( email: string, phoneNumber: string, linkedId: number | undefined ) => {
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
