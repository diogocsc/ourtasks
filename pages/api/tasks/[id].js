"use strict";

import clientPromise from '../../../mongodb-client';
import { ObjectId } from "mongodb";
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';


export default withApiAuthRequired( async (req, res) => {
    const { user } = getSession(req, res);
    if (user) {

        const client = await clientPromise;
        const collection = await client.db().collection('tasks');
        try {
            if(req.method == 'DELETE'){
                const r= await collection.deleteOne({_id: ObjectId(req.query.id)});
                res.json(r);
            }
            else if(req.method == 'PATCH'){
                const task = await collection.updateOne({_id: ObjectId(req.query.id)},{ $set: { "name": req.body.name, "description": req.body.description, "assignedTo": req.body.assignedTo, "isDone": req.body.isDone},
                $currentDate: { lastModified: true } });
                res.json(task);
            }
            else {
                const task = await collection.findOne({_id: ObjectId(req.query.id)});
                res.json(task);
            }

        } catch(err){
            res.send('Error '+ err);
        }  
    }
    else res.send('No permission');

})