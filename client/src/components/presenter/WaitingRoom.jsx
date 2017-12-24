import React from 'react';
import PropTypes from 'prop-types';
import SocketClientInterface from '../../../../socket/socketClientInterface';

const propTypes = {
  roomId: PropTypes.string.isRequired,
  players: PropTypes.arrayOf(PropTypes.object).isRequired,
  socketClientInterface: PropTypes.instanceOf(SocketClientInterface).isRequired
};

class WaitingRoom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errMsg: null
    };

    /* METHOD BINDING */
    this.startGame = this.startGame.bind(this);
  }

  startGame() {
    this.props.socketClientInterface.connection.emit('startGame', (errMsg) => {
      this.setState({ errMsg });
    });
  }

  render() {
    const { roomId, players } = this.props;
    return (
      <div className="container-fluid gameBackground">
        <div className="row align-items-center justify-content-center">
          <div className="card col-sm-5 presenterQuestionCard animated slideInLeft">
            <div className="card-body">
              <div className="list-group list-group-flush">
                {players.length === 0 ? (
                  <div className="list-entry presenterText">'Waiting for players to join...'</div>
                ) : (
                  players.map(player => (
                    <div className="presenterText list-entry" key={player.username}>
                      {player.username}
                    </div>
                  ))
                )}
              </div>

              <button
                className="presenterText btn btn-outline-light mt-3"
                disabled={players.length === 0}
                onClick={this.startGame}
              >
                Start Game
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

WaitingRoom.propTypes = propTypes;

export default WaitingRoom;
