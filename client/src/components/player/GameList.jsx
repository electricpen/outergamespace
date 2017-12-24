import React from 'react';
import PropTypes from 'prop-types';
import GameListItem from './GameListItem';
import SocketClientInterface from '../../../../socket/socketClientInterface';

const propTypes = {
  createGame: PropTypes.func.isRequired,
  joinGame: PropTypes.func.isRequired,
  socketClientInterface: PropTypes.instanceOf(SocketClientInterface).isRequired,
};

class GameList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      games: [],
    };

    this.addGame = this.addGame.bind(this);
    this.removeGame = this.removeGame.bind(this);
  }

  componentDidMount() {
    fetch('/games')
      .then(res => res.json())
      .then((data) => {
        this.setState({
          games: data,
        });
      })
      .catch(console.error);

    this.props.socketClientInterface.registerCallbackPlayerNewGame(this.addGame);
    this.props.socketClientInterface.registerCallbackPlayerStartGame(this.removeGame);
  }

  addGame(roomId) {
    fetch(`/game/${roomId}`)
      .then(res => res.json())
      .then((data) => {
        this.setState({ games: this.state.games.concat(data[0]) });
      })
      .catch(console.error);
  }

  removeGame(roomId) {
    this.setState({
      games: this.state.games.filter(game => game.room_id !== roomId),
    });
  }

  render() {
    const gameListItems = this.state.games.map(game => (
      <GameListItem
        key={game.room_id}
        game={game}
        joinGame={this.props.joinGame}
        socketClientInterface={this.props.socketClientInterface}
      />
    ));

    return (
      <div>
        {gameListItems}
        <div>
          <button
            className="btn btn-outline-light ml-1 mr-3 leaderboardText"
            onClick={this.props.createGame}
          >
            Create Game
          </button>
        </div>
      </div>
    );
  }
}

GameList.propTypes = propTypes;

export default GameList;
