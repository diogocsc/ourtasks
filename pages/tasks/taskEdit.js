
import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import utilStyles from '../../styles/utils.module.css'
import styles from '../../styles/Home.module.css'
import { useUser } from '@auth0/nextjs-auth0';
import Layout from '../../components/layout'
import AccessDenied from '../../components/access-denied'

export default function Form() {

  const { user, error, isLoading } = useUser();

    const router = useRouter()
    const taskId = router.query.id
    async function submitTask(event) {
      console.log("submit isDone: "+event.target.isDone.checked);
    event.preventDefault()
    const res = taskId ? await fetch(
      '/api/tasks/' + taskId,
      {
        body: JSON.stringify({
          name: event.target.name.value,
          description: event.target.description.value,
          isDone: event.target.isDone.checked,
          assignedTo: event.target.assignedTo.value.split(','),
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'PATCH'
      }
    ) : await fetch(
      '/api/tasks/insertTask',
      {
        body: JSON.stringify({
          name: event.target.name.value,
          description: event.target.description.value,
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
      }
    )
    alert("Task Submitted")

  } 

    const [task, setTask] = useState('');
    const [isDone, setIsDone] = useState(task.isDone);

    const fetchTask = async () => {
      const res = await fetch('/api/tasks/'+taskId)
      const task = await res.json()
      setTask(task);
      setIsDone(task.isDone);
    }

    function onchangeIsDone(event) {
      setIsDone(event.target.checked)

    }

    useEffect( () => {
      taskId ? fetchTask() : ''
    }, [taskId])


    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>{error.message}</div>;
    // If no user exists, display access denied message
    if (!user) { return  <Layout><AccessDenied/></Layout> }

    return (
      <Layout>
      <div className={styles.container}>
        <Head>
          <title>ourTasks - {taskId ? 'Edit' : 'New task'}</title>
          <meta name="description" content="The place to edit or create tasks" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <form onSubmit={(event) => submitTask(event, task.ownedBy)}>
        <label className={utilStyles.input_label} htmlFor="name">Task name</label>
        <div className={utilStyles.input}>
          <input className={utilStyles.input_field} id="name" name="name" type="text" defaultValue={task.name} required />
        </div>
        <label className={utilStyles.input_label} htmlFor="description">What is this task all about?</label>
        <div className={utilStyles.input}>
          <textarea className={utilStyles.input_field} cols="30" rows="3" id="description" name="description" type="text" defaultValue={task.description} />
        </div>
        

        <label className={utilStyles.input_label} htmlFor="assignedTo">Assigned To</label>
        <div className={utilStyles.input}>
          <input className={utilStyles.input_field} id="assignedTo" name="assignedTo" type="text" defaultValue={task.assignedTo && task.assignedTo.join()} />
        </div>
        <label className={utilStyles.input_label} htmlFor="isDone">Is Task Done?</label>
        <div className={utilStyles.input}>
          <input className={utilStyles.input_field} cols="30" rows="3" id="isDone" name="isDone" type="checkbox" checked={isDone} onChange={e => onchangeIsDone(e)} />
        </div>
        <button className={utilStyles.card_button} type="submit">Submit</button>
        <br />
        <Link href="/">
            <a>Back home!</a>
        </Link>
      </form>
    </div>
    </Layout>
    )
  }
  