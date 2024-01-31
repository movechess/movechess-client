import React from "react";
import { truncateSuiTx } from "../../services/address";
import { Tournament } from "./TournamentModel";
interface MyComponentProps {
  tournament: Tournament;
}
const TournamentBracket: React.FC<MyComponentProps> = ({ tournament }) => {
  return (
    <>
      <div className="brackets-canvas p-0 lg:pt-0 lg:p-20 h-full">
        {tournament.rounds.map((round) => (
          <div className="column" key={round.name}>
            {round.matches.map((item, index) => (
              <React.Fragment key={item.matchNumber + "-item"}>
                <div className="number" key={item.matchNumber}>
                  {item.matchNumber}
                </div>
                <div className={`item ${index % 2 === 0 && round.matches.length > 1 ? "show-brackets" : ""}`} key={item.matchNumber + "-item"}>
                  <div className="box">
                    <div className={`part partOne  ${item.winner === 1 ? "winner" : item.winner === 2 ? "looser" : ""} `}>
                      <div className="value">{truncateSuiTx(item.player1.player, true)}</div>
                      <div className="score">{item.winner === 1 ? 1 : 0}</div>
                    </div>
                    <div className={`part partOne  ${item.winner === 2 ? "winner" : item.winner === 1 ? "looser" : ""} `}>
                      <div className="value">{truncateSuiTx(item.player2.player, true)}</div>
                      <div className="score">{item.winner === 2 ? 1 : 0}</div>
                    </div>
                  </div>
                  <div className="bracket">
                    <span></span>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};
export default TournamentBracket;