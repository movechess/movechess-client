import React, { useEffect, useState } from "react";
import { truncateSuiTx } from "../../services/address";
import { DEFAULT_0X0_ADDRESS } from "../../utils/address";
import Header from "../Header/Header";
import api, { apiHeader } from "../../utils/api";

interface Match {
  matchNumber: number;
  playerOne: { address: string; score: number };
  playerTwo: { address: string; score: number };
  winner: number;
}

interface Round {
  roundName: string;
  matches: Match[];
}

// Mock data - replace this with your actual data
const mockTournament: Round[] = [
  {
    roundName: "Quarterfinals",
    matches: [
      { matchNumber: 1, playerOne: { address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZyfsa2", score: 2 }, playerTwo: { address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZykfSa", score: 0 }, winner: 1 },
      { matchNumber: 2, playerOne: { address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZymfSA", score: 2 }, playerTwo: { address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZyPo9N", score: 1 }, winner: 1 },
      { matchNumber: 3, playerOne: { address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZy6L2Sm", score: 1 }, playerTwo: { address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZRsm2", score: 2 }, winner: 2 },
      { matchNumber: 4, playerOne: { address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZy2mKl", score: 0 }, playerTwo: { address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZy47Hs", score: 0 }, winner: 0 },
    ],
  },
  {
    roundName: "Semifinals",
    matches: [
      { matchNumber: 3, playerOne: { address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZyfsa2", score: 0 }, playerTwo: { address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZymfSA", score: 0 }, winner: 0 },
      { matchNumber: 4, playerOne: { address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZRsm2", score: 0 }, playerTwo: { address: "TBD", score: 0 }, winner: 0 },
    ],
  },
  {
    roundName: "Finals",
    matches: [{ matchNumber: 5, playerOne: { address: "TBD", score: 0 }, playerTwo: { address: "TBD", score: 0 }, winner: 0 }],
  },
];

function Tournament() {
  const [tournament, setTournament] = useState<Round[]>([]);

  useEffect(() => {
    api
      // TODO handle get data from API
      .get(`/tournament`, { headers: apiHeader })
      .then((res) => {
        if (res.data.status === 200) {
          setTournament(res.data);
        }
      })
      .catch((error) => {
        if (error.response.status === 403) {
          localStorage.removeItem("token");
        }
        // FIXME: Remove it after handle call API
        setTournament(mockTournament);
      });
  }, []);

  return (
    <>
      <Header />
      <div className="space-y-8 p-4 md:ml-64 pt-14 h-screen relative w-auto min-w-fit flex flex-col bg-[#27272b] mx-auto text-white" id="app">
        <div className="brackets-canvas p-0 lg:px-20">
          {tournament.map((round) => (
            <div className="column items-end justify-center p-0" key={round.roundName}>
              <p className="w-max font-bold text-l">{round.roundName}</p>
            </div>
          ))}
        </div>
        <div className="brackets-canvas p-0 lg:p-20 lg:pt-0">
          {tournament.map((round) => (
            <div className="column" key={round.roundName}>
              {round.matches.map((item, index) => (
                <React.Fragment key={item.matchNumber + "-item"}>
                  <div className="number" key={item.matchNumber}>
                    {item.matchNumber}
                  </div>
                  <div className={`item ${index % 2 === 0 && round.matches.length > 1 ? "show-brackets" : ""}`} key={item.matchNumber + "-item"}>
                    <div className="box">
                      {/*<div*/}
                      {/*  className={`${index !== 0 ? "hidden" : ""} bg-[#27272b] text-center`}>*/}
                      {/*  <div className="value">{round.roundName}</div>*/}
                      {/*</div>*/}
                      <div className={`part partOne  ${item.winner === 1 ? "winner" : item.winner === 0 ? "" : "looser"} `}>
                        <div className="value">{truncateSuiTx(item.playerOne.address, true)}</div>
                        <div className="score">{item.playerOne.score}</div>
                      </div>
                      <div className={`part partOne  ${item.winner === 2 ? "winner" : item.winner === 0 ? "" : "looser"} `}>
                        <div className="value">{truncateSuiTx(item.playerTwo.address, true)}</div>
                        <div className="score">{item.playerTwo.score}</div>
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
      </div>
    </>
  );
}

export default Tournament;
