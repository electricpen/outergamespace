import React from 'react';
import Join from './Join';
import TriviaCard from './TriviaCard';
import TextScreen from './TextScreen';
import FrontPage from './FrontPage';
import Lobby from './Lobby';
import Information from './Information';
import Host from '../presenter/Host';
import Question from '../presenter/Question';
import Scoreboard from '../presenter/Scoreboard';
import axios from 'axios';
import SocketClientInterface from '../../../../socket/socketClientInterface';

class App extends React.Component {
  constructor({ login, username }) {
    let firstScreen = login ? 'lobby' : 'front';
    let name = username || '';
    super();
    this.state = {
      screen: firstScreen,
      timePerQuestion: 0,
      question: '',
      answers: [],
      username: '',
      players: [],
      // visibilility states for animation renders
      triviaCardRender: 'invisible',
      informationRender: 'invisible',
      informationType: '',
      informationText: ''
    };

    const waitText = 'Please wait for the game to begin';
    const answeredText = 'You have submitted your answer';
    const scoreText = 'Check out the main screen!';
    const hostDisconnectText = 'The game ended unexpectedly because we lost connection with the host :-(';

    /* SOCKET CLIENT INTERFACE */
    this.socketClientInterface = new SocketClientInterface();

    /* METHOD BINDING */
    this.handleLogin = this.handleLogin.bind(this);
    this.setScreen = this.setScreen.bind(this);
    this.createGame = this.createGame.bind(this);
    this.joinGame = this.joinGame.bind(this);
    this.nextQuestion = this.nextQuestion.bind(this);
    this.leaveGame = this.leaveGame.bind(this);
    this.showRoundScores = this.showRoundScores.bind(this);
    this.showFinalScores = this.showFinalScores.bind(this);
    this.returnToLobby = this.returnToLobby.bind(this);
    this.hostDisconnectHandler = this.hostDisconnectHandler.bind(this);
  }

  componentDidMount() {
    /* SOCKET EVENT LISTENERS */
    this.socketClientInterface.listenForPlayerEvents();
    // register the callback handlers
    this.socketClientInterface.registerCallbackPlayerNextQuestion(this.nextQuestion);
    this.socketClientInterface.registerCallbackPlayerShowRoundScores(this.showRoundScores);
    this.socketClientInterface.registerCallbackPlayerShowFinalScores(this.showFinalScores);
    this.socketClientInterface.registerCallbackPlayerHostDisconnect(this.hostDisconnectHandler);
  }

  componentWillUnmount() {
    /* SOCKET EVENT LISTENERS */
    this.socketClientInterface.removeListenersForPlayerEvents();
  }

  setScreen(screen) {
    const waitText = 'Please wait for the game to begin';
    const answeredText = 'You have submitted your answer';
    const scoreText = 'Check out the main screen!';
    const hostDisconnectText = 'The game ended unexpectedly because we lost connection with the host :-(';

    this.setState((state, props) => {
      if (state.screen === 'question' && screen !== 'information') {
        return {
          triviaCardRender: 'animated slideOutRight',
          informationRender: 'animated slideInLeft',
          screen: screen
        }
      } else if (state.screen === 'information' && screen === 'question') {
        return {
          informationRender: 'animated slideOutRight',
          triviaCardRender: 'animated slideInLeft',
          screen: screen
        }
      } else if (screen === 'wait') {
        return {
          informationRender: 'animated slideInLeft',
          informationText: waitText,
          screen: screen
        }
      } else if (screen === 'answered') {
        return {
          triviaCardRender: 'animated slideOutRight',
          informationRender: 'animated slideInLeft',
          informationText: answeredText,
          informationType: 'answered',
          screen: screen
        }
      } else if (screen === 'roundScores') {
        return {
          triviaCardRender: 'animated slideOutRight',
          informationRender: 'animated slideInLeft',
          informationType: 'roundScores',
          informationText: scoreText,
          screen: screen
        }
      } else if (screen === 'finalScores') {
        return {
          // TODO change this return object
          triviaCardRender: 'animated slideOutRight',
          informationRender: 'animated slideInLeft',
          informationType: 'finalScores',
          informationText: scoreText,
          screen: screen
        }
      } else if (screen === 'hostDisconnect') {
        return {
          triviaCardRender: 'animated slideOutRight',
          informationRender: 'animated slideInLeft',
          informationType: 'hostDisconnect',
          informationText: hostDisconnectText,
          screen: screen
        }
      } else {
        return {
          screen: screen
        }
      }
    });
  }

  handleLogin(username, password, mode) {
    if (mode === 'register') {
      axios.post('/register', { username, password })
        .then(response => response.status)
        .then(() => {
          console.log('Logging in...', username);
          this.setState({
            username,
            screen: 'lobby'
          });
        })
        .catch((err) => {
          alert('That username already exists');
          console.error(err);
        });
    } else if (mode === 'login') {
      axios.post('/login', { username, password })
        .then(response => response.data.isValidPass)
        .then((isValidPass) => {
          if (isValidPass) {
            console.log('Logging in...', username);
            this.setState({
              username,
              screen: 'lobby'
            });
          } else {
            alert('You entered the wrong password');
            this.setState({
              username: '',
              screen: 'front'
            });
          }
        })
        .catch((err) => {
          alert('That user does not exist');
          console.error(err);
        });
    } else if (mode === 'guest') {
      axios.get('/users')
        .then(response => response.data)
        .then((users) => {
          let result = false;
          users.forEach((user) => {
            if (user.name === username) { result = true; }
          });
          return result;
        })
        .then((exists) => {
          if (exists) {
            alert('That username already exists');
          } else {
            console.log('Logging in...', username);
            this.setState({
              username,
              screen: 'lobby'
            });
          }
        });
    }
  }

  createGame() {
    this.setScreen('host');
  }

  joinGame(timePerQuestion) {
    this.setState({
      timePerQuestion,
      informationType: 'wait'
    });
    this.setScreen('wait');
  }

  showRoundScores(players) {
    this.setState({
      players: players
    });
    this.setScreen('roundScores');
  }

  showFinalScores(players) {
    this.setState({
      players: players
    });
    this.setScreen('finalScores');
  }

  nextQuestion(question) {
    this.setState({
      screen: 'question',
      question: question.prompt,
      answers: question.answers,
    });
  }

  leaveGame() {
    // io.emit('leaveGame', () => {
    //   this.setScreen('join');
    // });
    this.socketClientInterface.connection.emit('leaveGame', () => {
      this.setScreen('front');
    });
  }

  hostDisconnectHandler() {
    this.setScreen('hostDisconnect');
  }

  returnToLobby() {
    this.setScreen('lobby');
  }

  render() {
    const { screen, timePerQuestion, question, answers, players } = this.state;

    if (screen === 'front') {
      return <FrontPage handleLogin={this.handleLogin}/>;
    } else if (screen === 'lobby') {
      return (
        <Lobby
          username={this.state.username}
          createGame={this.createGame}
          joinGame={this.joinGame}
          socketClientInterface={this.socketClientInterface}
        />
      );
    } else if (screen === 'host') {
      return <Host username={this.state.username} />;
    } else if (screen === 'join') {
      return <Join joinGame={this.joinGame} socketClientInterface={this.socketClientInterface} />;
    } else if (screen === 'wait') {
      return <Information text={this.state.informationText} visibility={this.state.informationRender}/>;
    } else if (screen === 'question') {
      return (
        <TriviaCard
          visibility={this.state.triviaCardRender}
          screen={screen}
          question={question}
          answers={answers}
          setScreen={this.setScreen}
          time={timePerQuestion}
          socketClientInterface={this.socketClientInterface}
        />
      );
    } else if (screen === 'answered') {
      return (
        <Question
          question={question}
          answers={answers}
          players={players}
          time={timePerQuestion}
          socketClientInterface={this.socketClientInterface}
        />
      );
    } else if (screen === 'roundScores') {
      return <Scoreboard players={players} />;
    } else if (screen === 'finalScores') {
      return (
        <Scoreboard
          players={players}
          final
          returnToLobby={this.returnToLobby}
        />
      );
    } else if (screen === 'hostDisconnect') {
      return <Information text={this.state.informationText} visibility={this.state.informationRender}/>;
    }
    return <div />;
  }
}

export default App;
