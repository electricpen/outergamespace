import React from 'react';
import PropTypes from 'prop-types';
import AnswerList from './AnswerList';
import AnsweredPlayerList from './AnsweredPlayerList';
import Timer from './Timer';
import SocketClientInterface from '../../../../socket/socketClientInterface';

const propTypes = {
  question: PropTypes.string.isRequired,
  answers: PropTypes.arrayOf(PropTypes.string).isRequired,
  players: PropTypes.arrayOf(PropTypes.object).isRequired,
  time: PropTypes.number.isRequired,
  socketClientInterface: PropTypes.instanceOf(SocketClientInterface).isRequired
};

class Question extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      correctAns: ''
    };

    /* METHOD BINDING */
    this.setCorrectAns = this.setCorrectAns.bind(this);
  }

  componentDidMount() {
    // register callbacks
    this.props.socketClientInterface.registerCallbackHostShowAnswer(this.setCorrectAns);
    this.props.socketClientInterface.registerCallbackPlayerShowAnswer(this.setCorrectAns);
  }

  componentWillUnmount() {
    /* SOCKET EVENT LISTENERS */
    // TODO: Need to remove listener for showAnswer (add more granularity
    // here later in the interface)
    // io.removeAllListeners('showAnswer');
  }

  setCorrectAns(correctAns) {
    this.setState({ correctAns });
  }

  render() {
    const { question, answers, players, time } = this.props;
    const { correctAns } = this.state;
    return (
      <div className="container-fluid gameBackground">
        <div className="row align-items-center justify-content-center">
          <Timer seconds={time} counting={correctAns === ''} />
        </div>

        <div className="row align-items-center justify-content-center">
          <div className="card-deck animated slideInLeft">
            <div className="card col-sm-10 presenterQuestionCard align-items-center justify-content-center">
              <div className="card-body">
                <div className="card-title presenterText">{question}</div>

                <div className="list-group list-group-flush">
                  <AnswerList answers={answers} correctAns={correctAns} />
                </div>
              </div>
            </div>

            <div className="card col-sm-10 presenterQuestionCard">
              <div className="card-body">
                <div className="list-group list-group-flush">
                  <AnsweredPlayerList players={players} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Question.propTypes = propTypes;

export default Question;
