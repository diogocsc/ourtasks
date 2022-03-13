import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useState, useEffect } from 'react'
import Layout from '../components/layout'
import { useUser, withPageAuthRequired, getSession } from '@auth0/nextjs-auth0';
import AccessDenied from '../components/access-denied'
import React from "react";
import { useRouter } from 'next/router'

"use strict";

// Import the dependency.
import clientPromise from '../mongodb-client';




async function fetchOpenTasksFromDB(session) {

  const client = await clientPromise;
  const collection = await client.db().collection('tasks');
  let mySort= {createdOn:-1, lastModified: -1, name: 1};
  const tasks= await collection.find({assignedTo: session.user.email, isDone: false}).sort(mySort).toArray();
  const taskList = JSON.parse(JSON.stringify(tasks));
  return taskList;
}

async function fetchArchivedTasksFromDB(session) {

  const client = await clientPromise;
  const collection = await client.db().collection('tasks');
  let mySort= {createdOn:-1, lastModified: -1, name: 1};
  const tasks= await collection.find({assignedTo: session.user.email, isDone: true}).sort(mySort).toArray();
  const taskList = JSON.parse(JSON.stringify(tasks));
  return taskList;
}


export const getServerSideProps=withPageAuthRequired({
  async getServerSideProps(context) {
    const session = getSession(context.req, context.res);
    const openTaskList = session ? await fetchOpenTasksFromDB(session): '';
    const archivedTaskList = session ? await fetchArchivedTasksFromDB(session): '';

    return {
        props: {
          openTaskList,
          archivedTaskList,
        }
      };
    }
})

export function Tasks({tasks, user, router}) {
  const isAdmin = user ? user.email === process.env.NEXT_PUBLIC_EMAIL_ADMIN : null;

  const removeTask = async (taskId, email, assignedTo, name, description, isDone) => {
    const index = assignedTo.indexOf(email);
    assignedTo.splice(index,1);
    await fetch(
      '/api/tasks/'+taskId,
      {
        body: JSON.stringify({
          name: name,
          description: description,
          assignedTo: assignedTo,
          isDone: isDone,
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'PATCH'
      }
    )
    isDone ? fetchTasks('/api/tasks/my') : fetchArchivedTasks('/api/tasks/myArchived')
  }

  const markTask = async (taskId, assignedTo, name, description, isDone) => {
    await fetch(
      '/api/tasks/'+taskId,
      {
        body: JSON.stringify({
          name: name,
          description: description,
          assignedTo: assignedTo,
          isDone: isDone,
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'PATCH'
      }
    )
    router.reload(window.location.pathname)  
  }

  const markTaskDone = async (taskId, assignedTo, name, description) => {
    markTask(taskId, assignedTo, name, description, true)
  }
  const markTaskUnDone = async (taskId, assignedTo, name, description) => {
    markTask(taskId, assignedTo, name, description, false)
  }

  const deleteTask = async (taskId, isDone) => {
    if (confirm("This will permanently delete the task for all users. Do you really want to delete this task? ")) {
    await fetch('/api/tasks/'+taskId, {
      method: 'DELETE'
    })
    isDone ? fetchTasks('/api/tasks/my') : fetchArchivedTasks('/api/tasks/myArchived')
  }
  }

return (
<div className={styles.grid}>
        
        {tasks.map(({ _id, name, description, createdBy, assignedTo, isDone }) => (
          <div className={styles.card} key={_id}>
            { createdBy===user.email || isAdmin ?
            <a href={"/tasks/taskEdit?id="+_id} >
              {name}
              <br />
              {description}
            </a>
            :
              <div>
              {name}
              <br />
              {description}
              </div>
            }
             <br /> 
             { isDone ? 
                <button onClick={() => markTaskUnDone(_id, assignedTo,name,description)}> Mark Undone</button>
                :
                <button onClick={() => markTaskDone(_id, assignedTo,name,description)}> Mark Done</button>

              }
             <br />
             <button onClick={() => removeTask(_id,user.email, assignedTo,name,description, isDone)}> Unassign Task</button>
             <br />
             { isAdmin && 
              <button onClick={() => deleteTask(_id)}> Delete Task</button>}
           </div>
          ))}
      </div>

)
  
}


export default function Home({user, openTaskList, archivedTaskList,categoryList}) {
  const { error, isLoading } = useUser();
  const [categories, setCategories] = useState(categoryList);

  const [tasks, setTasks] = useState(openTaskList);
  const [archivedTasks, setArchivedTasks] = useState(archivedTaskList);
  const router = useRouter()

  
  const fetchTasks = async (uri) => {
    const res = await fetch(uri)
    console.log(res);
    const data = await res.json()
    if (!data) {
      return {
        notFound: true,
      }
    }
    setTasks(data)
  }

  const fetchArchivedTasks = async (uri) => {
    const res = await fetch(uri)
    console.log(res);
    const data = await res.json()
    if (!data) {
      return {
        notFound: true,
      }
    }
    setArchivedTasks(data)
  }


  
if (isLoading) return <div>Loading...</div>;
if (error) return <div>{error.message}</div>;
// If no user exists, display access denied message
if (!user) { return  <Layout><AccessDenied/></Layout> }

  return (
    <Layout>

      <Head>
        <title>ourTasks - My Tasks</title>
        <meta name="description" content="A Task Repository" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1>
          My Tasks
        </h1>

        <Tasks tasks={tasks} user={user} router={router}></Tasks>

        <h1>
          My Archived Tasks
        </h1>
        <Tasks tasks={archivedTasks} user={user} router={router}></Tasks>

        
      </Layout>
    
  )
}
