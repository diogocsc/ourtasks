import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';


"use strict";

// Import the dependency.
import clientPromise from '../../../mongodb-client';

export default withApiAuthRequired(async (req, res) => {
  const { user } = getSession(req, res);
  if (user) {

    const client = await clientPromise;
    const collection = await client.db().collection('tasks');
    const task = {
      name: req.body.name,
      description: req.body.description,
      createdBy: user.email,
      createdByName: user.name,
      createdOn: new Date(),
      assignedTo: [user.email],
      isDone: false,

    }
    try {
      const c= await collection.insertOne(task);
      res.json(c);

  } catch(err){
      res.send('Error '+ err);
  }
 }
 else res.send('No permission');
})
