import React from 'react';
import '../styles/main.css'


class TasksManager extends React.Component {

    constructor(props) {
        super(props);
        this.api = 'http://localhost:3005/tasks';
        this.state = {
            tasks: [],
            task: "",
        }
    }

    componentDidMount() {
        this.fetchApi();
    }

    fetchApi() {
        fetch(this.api)
        .then((response) => {
            if(response.ok) {
                return response.json();
            } else {
                throw new Error ("something went wrong ;/")
            }
        })
        .then((json) => {
            if(json) {
                this.setState({
                    tasks: json
                })
            }
        })
    }


    handleSubmit = e => {
        e.preventDefault()
        const { task } = this.state;
        if (task) {
            this.addTaskAPI()
            this.setState({
                task: ''
            })
        }
    }


    inputChange = e => {
        e.preventDefault()
        this.setState({
            task: e.target.value,
          
        })
    }


    addTask = (tasks) => {
        this.setState(state => {
            return {
                tasks: [...this.state.tasks, tasks]
            }
        });
       this.handleReset()
    }

    handleReset = () => {
        Array.from(document.querySelectorAll("input")).forEach(
          input => (input.value = "")
        );
        this.setState({
          itemvalues: [{}]
        });
      };

      
   

    createNewTask() {
        const newTask = {
            name: this.state.task,
            mm: 0,
            ss: 0,
            isRunning: false,
            isDone: false,
            isRemoved: false,
        }
        return newTask;
    }

   
    addTaskAPI = () => {

        const newTask = this.createNewTask()

        const options = {
            method: 'POST',
            body: JSON.stringify(newTask),
            headers: { 'Content-Type': 'application/json' }
        };

        fetch(this.api, options)
            .then(resp => resp.json())
            .then(data => {
                console.log(data)
                newTask.id = data.id;
                this.addTask(newTask);
            })
            .catch(err => console.error(err));
    }

    updateTaskApi(task) {
                const options = {
                method: 'PUT',
                body: JSON.stringify( task ),
                headers: {'Content-Type': 'application/json'}
            };
    
            fetch(`${this.api}/${task.id}`,options)
            
    }
     deleteTaskApi(task) {
                const options = {
                method: 'DELETE',
                body: JSON.stringify( task ),
                headers: {'Content-Type': 'application/json'}
            };
    
            fetch(`${this.api}/${task.id}`,options)
            
    }

    finishedTask = (id) =>  {
        this.setState({
            isDone: (id, true)
            
        })

        console.log('finish')
        clearInterval(this.timerID);
        this.isDone(id, true)
        this.setRunning(id, false)

    }

    deletedTask = (id) => {
      
        this.isRemoved(id, true)
        this.isDone(id, true)
        this.setRunning(id, false)
        this.incrementTime(id, 0, 0);
        this.deleteTaskApi(id)
     
    }


    removeButton = e => {
        const parentBtn = e.target.parentElement.parentElement;
        const taskLi = parentBtn.remove()
        console.log(parentBtn)
        this.deletedTask(taskLi)
    }
     





    render() {
        const { state } = this.state;


        return (
            <section >
                <h1 className="text"> Tasks Manager</h1>
                <div className="box" >
                    <form onSubmit={this.handleSubmit} className="box__value">
                        <input name="task" value={this.state.newTask} placeholder="enter your task" className="input" onChange={this.inputChange} />
                        <button className="btn" type="submit">add</button>
                    </form>
                    <h2 className="text__second">Your Tasks:</h2>
                    <ul> {this.renderTask()} </ul>
                </div>
            </section>

        )

    }


    renderTask = () => {


        const tasks = this.state.tasks.map(t => {

            return (
                <li className="box__task " key={t.id}> {/* li */}
                    <h3  className={t.isDone ? 'finished' : 'name__task' }> {t.name } </h3>

                    <div className="box__timer">

                        <span className="timer__span">{this.format(t.mm)}</span>:
                        <span className="timer__span">{this.format(t.ss)}</span>
            

                        <button className="timer__item" onClick={() => this.timer(t.id)}>   {t.isRunning ? 'STOP' : 'START'} </button>
                        <button className="timer__item" onClick={() => this.finishedTask(t.id)}>FINISH</button>
                        <button className="timer__item" onClick={this.removeButton} >DELETE</button>
                    </div>
                </li>
            );
        })

        return tasks;


    }

    timerID = 0;

    incrementTime(id, mm, ss) {
        this.setState(state => {
            const newTasks = state.tasks.map(task => {
                if(task.id === id) {
                    return {...task, ss: ss, mm: mm}
                }
    
                return task;
            });
    
            return {
                tasks: newTasks,
            }
        });
    }


    setRunning(id, isRun) {
        this.setState(state => {
            const newTasks = state.tasks.map(task => {
                if(task.id === id) {
                    return {...task, isRunning: isRun}
                }
    
                return task;
            });
    
            return {
                tasks: newTasks,
            }
        });
    }


    isDone(id, isDone) {
        this.setState(state => {
            const newTasks = state.tasks.map(task => {
                if(task.id === id) {
                    return {...task, isDone: isDone}
                }
    
                return task;
            });
    
            return {
                tasks: newTasks,
            }
        });
    }
    isRemoved(id, isRemo) {
        this.setState(state => {
            const newTasks = state.tasks.map(task => {
                if(task.id === id) {
                    return {...task, isRemoved: isRemo}
                }
    
                return task;
            });
    
            return {
                tasks: newTasks,
            }
        });
    }

    timer = (id) => {
        console.log(id)
        const [task] = this.state.tasks.filter(t => t.id === id);
        console.log(task)

        let { isRunning } = task;
        if (isRunning) {
            // Running => Stop
            clearInterval(this.timerID);
            // isRunning = false
            this.setRunning(id, false);
       
            
        } else {
            // Stop => Running
            let { mm, ss } = task;

            //isRunning = true
            this.setRunning(id, true);

            this.timerID = setInterval(() => {
  
                if (ss < 9) {
                    ss++
                } else if (ss >= 9 && ss <= 59) {
                    ss++
                } else {
                    mm++
                    ss = 0
                }

                this.incrementTime(id, mm, ss);
            }, 1000)
        }
        this.updateTaskApi(task)
    }
    format(num) {
        return (num + '').length === 1 ? '0' + num : num + '';
    }
}

export default TasksManager;
