import React, { Component } from "react";
import Aux from "../../hoc/_aux";
import Box from "../Box/Box";
import { Context } from "../../container/App";
import "./Strip.css";

let stateContext = null;

export class Strip extends Component {
  constructor(props) {
    super(props);
    this.state = {
      minLength: 0,
      maxLength: props.max,
      leftPosition: 0,
      rightPosition: props.max,
      leftPlayer: props.leftPlayer,
      rightPlayer: props.rightPlayer
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { leftPlayer, rightPlayer } = nextProps;

    if (leftPlayer.stepCount !== prevState.leftPlayer.stepCount) {
      return {
        leftPlayer: leftPlayer
      };
    }

    if (rightPlayer.stepCount !== prevState.rightPlayer.stepCount) {
      return {
        rightPlayer: rightPlayer
      };
    }

    return null;
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      nextState.leftPosition === this.state.leftPosition &&
      nextState.rightPosition === this.state.rightPosition &&
      nextProps.currentPlayer === this.props.currentPlayer &&
      nextProps.currentGameId === this.props.currentGameId
    ) {
      return false;
    }
    return true;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { currentPlayer, isLoseMark } = this.props;
    let { leftPosition, rightPosition, maxLength } = this.state;
    if (prevProps.isLoseMark !== isLoseMark && isLoseMark) {
      switch (currentPlayer) {
        case "leftPlayer": {
          if (leftPosition === 0 && rightPosition - leftPosition === 1) {
            stateContext.toggleLose();
          }
          break;
        }
        case "rightPlayer": {
          if (
            rightPosition === maxLength &&
            rightPosition - leftPosition === 1
          ) {
            stateContext.toggleLose();
          }
          break;
        }
        default:
          break;
      }
    }
  }

  // 右邊按鈕
  btnRight = () => {
    let { currentPlayer, id } = this.props; // 當前玩家
    let lo_currentPlayer = this.state[currentPlayer]; // 當前玩家資料
    let {
      maxLength,
      leftPosition,
      rightPosition,
      leftPlayer,
      rightPlayer
    } = this.state; // 左邊玩家位置、右邊玩家位置、最大值

    if (lo_currentPlayer.stepCount === 0) return;

    let ln_position = 0; // 位置
    let ln_stepCount = lo_currentPlayer.stepCount - 1; // 步數
    let ls_nextPlayer = currentPlayer; // 下一位玩家
    let lb_isEnemyLoseMark = false; // 判斷對方輸贏

    const h = {
      leftPlayer: () => {
        ln_position = leftPosition + 1;
        if (ln_position === rightPosition) {
          ln_position = rightPosition - 1;
          ln_stepCount = ln_stepCount + 1;
        }

        if (ln_stepCount === 0) {
          ls_nextPlayer = rightPlayer.name;
          if (
            rightPosition === maxLength &&
            rightPosition - ln_position === 1
          ) {
            lb_isEnemyLoseMark = true;
          }
        }
      },
      rightPlayer: () => {
        ln_position = rightPosition + 1;
        if (ln_position > maxLength) {
          ln_position = maxLength;
          ln_stepCount = ln_stepCount + 1;
        }

        if (ln_stepCount === 0) {
          ls_nextPlayer = leftPlayer.name;
        }
      }
    };
    h[currentPlayer]();

    if (lo_currentPlayer.stepCount === ln_stepCount) return;

    let lo_game = {
      id: id,
      isLoseMark: lb_isEnemyLoseMark
    };

    this.playerHandler(
      currentPlayer,
      ln_position,
      ln_stepCount,
      ls_nextPlayer,
      lo_game
    );
  };

  // 左邊按鈕
  btnLeft = () => {
    let { currentPlayer, id } = this.props; // 當前玩家
    let lo_currentPlayer = this.state[currentPlayer]; // 當前玩家資料
    let {
      leftPlayer,
      rightPlayer,
      leftPosition,
      rightPosition,
      minLength
    } = this.state; // 左邊玩家位置、右邊玩家位置、最小值

    if (lo_currentPlayer.stepCount === 0) return;

    let ln_position = 0;
    let ln_stepCount = lo_currentPlayer.stepCount - 1;
    let ls_nextPlayer = currentPlayer;
    let lb_isEnemyLoseMark = false;

    const h = {
      leftPlayer: () => {
        ln_position = leftPosition - 1;
        if (ln_position < minLength) {
          ln_position = minLength;
          ln_stepCount++;
        }

        if (ln_stepCount === 0) {
          ls_nextPlayer = rightPlayer.name;
        }
      },
      rightPlayer: () => {
        ln_position = rightPosition - 1;

        if (ln_position === leftPosition) {
          ln_position = leftPosition + 1;
          ln_stepCount++;
        }

        if (ln_stepCount === 0) {
          ls_nextPlayer = leftPlayer.name;
          if (leftPosition === 0 && ln_position - leftPosition === 1) {
            lb_isEnemyLoseMark = true; // 對方輸了
          }
        }
      }
    };
    h[currentPlayer]();

    if (lo_currentPlayer.stepCount === ln_stepCount) return;

    let lo_game = {
      id: id,
      isLoseMark: lb_isEnemyLoseMark
    };

    this.playerHandler(
      currentPlayer,
      ln_position,
      ln_stepCount,
      ls_nextPlayer,
      lo_game
    );
  };

  // 用點的更換位置
  clickBox = event => {
    const { currentPlayer, id } = this.props;
    const {
      minLength,
      maxLength,
      leftPosition,
      rightPosition,
      leftPlayer,
      rightPlayer
    } = this.state;

    let la_player = [{ ...leftPlayer, position: leftPosition }].concat([
      { ...rightPlayer, position: rightPosition }
    ]);
    let lo_currentPlayer = la_player.find(
      player => player.name === currentPlayer
    );
    let lo_otherSidePlayer = la_player.find(
      player => player.name !== currentPlayer
    );

    if (lo_currentPlayer.stepCount === 0) return;

    let ln_move = Math.abs(event - lo_currentPlayer.position);
    if (lo_currentPlayer.stepCount - ln_move < 0) return;

    if (currentPlayer === "leftPlayer") {
      if (event >= lo_otherSidePlayer.position) return;
    } else {
      if (event <= lo_otherSidePlayer.position) return;
    }

    let ln_stepCount = lo_currentPlayer.stepCount - ln_move;
    let ln_position = event;
    let ls_nextPlayer =
      ln_stepCount > 0 ? lo_currentPlayer.name : lo_otherSidePlayer.name;
    let lb_isEnemyLoseMark = false;

    if (
      (lo_otherSidePlayer.position === minLength ||
        lo_otherSidePlayer.position === maxLength) &&
      Math.abs(event - lo_otherSidePlayer.position) === 1
    ) {
      lb_isEnemyLoseMark = true;
    }

    let lo_game = {
      id: id,
      isLoseMark: lb_isEnemyLoseMark
    };

    this.playerHandler(
      currentPlayer,
      ln_position,
      ln_stepCount,
      ls_nextPlayer,
      lo_game
    );
  };

  // 設定 玩家位置
  playerHandler = (currentPlayer, position, stepCount, nextPlayer, game) => {
    const h = {
      leftPlayer: () => ({ leftPosition: position }),
      rightPlayer: () => ({ rightPosition: position })
    };
    let lo_data = h[currentPlayer]();

    this.setState((state, props) => {
      return lo_data;
    });

    this.props.playerHandler(stepCount, nextPlayer, game);
  };

  render() {
    let {
      maxLength,
      leftPlayer,
      rightPlayer,
      leftPosition,
      rightPosition
    } = this.state;

    let locked = false;
    if (this.props.currentGameId === this.props.id) {
      locked = true;
    }

    let stripLength = Array(maxLength + 1)
      .fill()
      .map((_, index) => {
        let who = {};
        if (leftPosition !== rightPosition) {
          if (leftPosition === index) {
            who = leftPlayer;
          }
          if (rightPosition === index) {
            who = rightPlayer;
          }
        }

        return (
          <Box
            key={index}
            index={index}
            who={who}
            currentPlayer={this.props.currentPlayer}
            currentGameId={this.props.currentGameId}
            locked={locked}
            clickBox={this.clickBox}
          />
        );
      });

    let _render = obj =>
      leftPosition !== rightPosition ? (
        <div className="game">
          <div className="game_container">{stripLength}</div>
          <div className="control">
            <button className="leftBtn" onClick={this.btnLeft}>
              <span className="left">Light</span>
            </button>
            <button className="rightBtn" onClick={this.btnRight}>
              <span className="right">Right</span>
            </button>
          </div>
        </div>
      ) : null;

    // return <Aux>{_render}</Aux>;
    return (
      <Context.Consumer>
        {obj => {
          stateContext = obj;
          return <Aux>{_render(obj)}</Aux>;
        }}
      </Context.Consumer>
    );
  }
}

export default Strip;
