<p align="center"><img src="/images/output.gif" height="50%" width="50%" ></p>

# OuterGameSpace [![Build Status](https://travis-ci.org/outergamespace/outergamespace.svg?branch=develop)](https://travis-ci.org/outergamespace/outergamespace)

OuterGameSpace is a trivia game platform catered towards creating in-person game sessions played with Player clients and a central Host presenter. Games are meant to be played in-person with a group to deliver social real-time interaction and feedback.

## Team

* [Austin Sloane](https://github.com/Blaradox)
* [Jonathan Ling](https://github.com/electicpen)
* [Christine Wong](https://github.com/christine-w)
* [David Friedman](https://github.com/dfried514)
* [Leo Leung](https://github.com/leungleoqin)
* [Lynne Daniels](https://github.com/Lynne-Daniels)
* [Lam Bui](https://github.com/lamdbui)

## Table of Contents

1. [Usage](#Usage)
1. [Requirements](#requirements)
1. [Development](#development)
   1. [Installing Dependencies](#installing-dependencies)
   1. [Tasks](#tasks)
1. [Roadmap](#roadmap)
1. [Contributing](#contributing)

## Usage

OuterGameSpace allows trivia lovers to host games for other players to compete in.

Hosts and players connects to the game via a desktop or mobile device. Each player uses this as their own game screen. The host has a view of all players who have joined their game and their progress as they answer each question on their own time, e.g., who has answered the current question so far.

This iteration of OuterGameSpace brings the presenter and host clients together into a single client that can be access at:
http://<YOUR_OUTERGAMESPACE_SERVER>

The steps to set-up a game is as follows:

1. All players sign in and reach the lobby of a game.
1. Someone initiates a game by selecting 'Create Game' from the main lobby.
1. Other players in the lobby can see when a new game is available and choose to join it if max players has not been reached for that game.
1. Accepted players will now be shown on the presenter screen.
1. The Host can now start the game.
1. The Host and Players will now display questions on the screen with a countdown timer.
1. Each Player can now submit and answer to the question.
1. After all players have submitted an answer or the timer expires, they will be shown the correct answer and current score results
1. After a full round of questions have occurred, everyone will see the final results and can return to the main lobby to start a new game or join another game.

## Requirements

* Node 6.11.x
* MySQL 5.7.x
* See package.json for additional application dependencies

## Development

### Installing Dependencies

From within the root directory:

```sh
npm install
```

### Roadmap

View the project roadmap [here](https://docs.google.com/spreadsheets/d/1spVYH4ff5ihcrDYiS6ixOritzBoLicNzOykovLnOkRQ/edit?usp=sharing)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
