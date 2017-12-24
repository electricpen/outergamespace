import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import ScoreboardEntry from './ScoreboardEntry';
import _ from 'underscore';

const propTypes = {
  players: PropTypes.arrayOf(PropTypes.object).isRequired,
  final: PropTypes.bool,
  returnToLobby: PropTypes.func
};

const defaultProps = {
  final: false,
  returnToLobby: () => {}
};

const updateUserScore = (username, gameScore) => axios.post('/user', { username, gameScore });

const Scoreboard = ({ players, final, returnToLobby }) => {
  const sortedPlayers = _.sortBy(players, 'score').reverse();
  return (
    <div className="container-fluid gameBackground">
      <div className="row align-items-center justify-content-md-center">
        <div className="card scoreboard col-sm-5 animated-slideInLeft">
          <div className="card-block">
            <div className="card-title presenterText mb-3">Players</div>
            <div className="list-group list-group-flush scoreboardList">
              {sortedPlayers.map((player) => {
                if (final) {
                  updateUserScore(player.username, player.score).then(() => 'done');
                }
                return <ScoreboardEntry player={player} />;
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="screen-bottom">
        {final && <button onClick={returnToLobby}>Return to Lobby</button>}
      </div>
    </div>
  );
};

Scoreboard.propTypes = propTypes;
Scoreboard.defaultProps = defaultProps;

export default Scoreboard;
