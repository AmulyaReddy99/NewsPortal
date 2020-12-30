import './App.scss';
import LoginComponent from './components/login/LoginComponent';
import TaskListComponent from './components/tasklist/TaskListComponent';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import ComposeComponent from './components/compose/ComposeComponent';

function App() {
  return (
    <div className="App">
      <header className="App-header">News Articles</header>
      {/* <SidebarComponent/> */}
      <BrowserRouter>
        <Switch>
          <Route path="/tasklist" component={TaskListComponent}/>
          <Route path="/compose" component={ComposeComponent}/>
          <Route path="/" component={LoginComponent}/>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
