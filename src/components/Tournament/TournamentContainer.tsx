import { Tab, TabPanel, Tabs, TabsBody, TabsHeader } from "@material-tailwind/react";
import React, { useEffect, useState } from "react";
import api, { apiHeader } from "../../utils/api";
import Header from "../Header/Header";
import { Player, Round, Tournament } from "./TournamentModel";
import TournamentBracket from "./TournamentBracket";
import TournamentStandings from "./TournamentStandings";

const mockPlayers = [
  { player: "p0", score: 1 },
  { player: "p1", score: 0 },
  { player: "p2", score: 3 },
  { player: "p3", score: 0 },
  { player: "p4", score: 0 },
  { player: "p5", score: 2 },
  { player: "p6", score: 1 },
  { player: "p7", score: 0 },
];

function convertToBracket(players: Player[]): Tournament[] {
  const totalRound = Math.ceil(Math.log2(players.length));

  let tournamentBracket: Tournament[] = [];
  let rounds: Round[] = [];
  let matchNumber = 1;

  for (let roundIndex = 1; roundIndex <= totalRound; roundIndex++) {
    const round: Round = {
      name: `Round ${roundIndex}`,
      matches: [],
    };

    const playersInRound = Math.pow(2, totalRound - roundIndex + 1);

    for (let i = 0; i < playersInRound; i += 2) {
      const player1 = players[i] || { player: "TBD", score: 0 };
      const player2 = players[i + 1] || { player: "TBD", score: 0 };
      if (player1.score === player2.score) {
        round.matches.push({ matchNumber, player1, player2, winner: 0 });
      } else {
        const winner = player1.score > player2.score ? 1 : player1.score < player2.score ? 2 : 0;
        round.matches.push({ matchNumber, player1, player2, winner });
      }
      matchNumber++;
    }
    // Filter out losers and keep only winners for the next round
    players.length = 0;
    players.push(...round.matches.map(match => {
      if (match.player1.player !== "TBD" && match.player1.score >= roundIndex) {
        return match.player1;
      }
      if (match.player2.player !== "TBD" && match.player2.score >= roundIndex) {
        return match.player2
      }
      return { player: "TBD", score: 0 };
    }))

    rounds.push(round);
  }
  tournamentBracket.push({date: "Feb 02 2024", id: "1", name: "Queen Cup", prize: "$8000",
    standings: [
      {
        rank: "1",
        address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZyfsa2",
        totalWin: 2,
        totalLose: 0,
        pts: 1
      },
      {
        rank: "2",
        address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZymfSA",
        totalWin: 2,
        totalLose: 1,
        pts: 1
      },
      {
        rank: "3",
        address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZRsm2",
        totalWin: 2,
        totalLose: 1,
        pts: 1
      },
      {
        rank: "4",
        address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZyPo9N",
        totalWin: 1,
        totalLose: 2,
        pts: 0
      },
      {
        rank: "5",
        address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZy6L2Sm",
        totalWin: 1,
        totalLose: 2,
        pts: 0
      },
      {
        rank: "6",
        address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZy2mKl",
        totalWin: 0,
        totalLose: 0,
        pts: 0
      },
      {
        rank: "7",
        address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZy47Hs",
        totalWin: 0,
        totalLose: 0,
        pts: 0
      },
      {
        rank: "8",
        address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZykfSa",
        totalWin: 0,
        totalLose: 2,
        pts: 0
      }
    ], totalPlayer: players.length, totalView: "N/A", volume: "N/A", rounds});
  console.log("Tournament Bracket:", tournamentBracket);
  return tournamentBracket;
}
const mockTournament = convertToBracket(mockPlayers);
function TournamentContainer() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    api
      // TODO handle get data from API
      .get(`/tournament`, { headers: apiHeader })
      .then((res) => {
        if (res.data.status === 200) {
          setTournaments(convertToBracket(res.data));
        }
      })
      .catch((error) => {
        if (error.response.status === 403) {
          localStorage.removeItem("token");
        }
        // FIXME: Remove it after handle call API
        setTournaments(mockTournament);
      });
  }, []);

  return (
    <>
      <Header />
      <div className="space-y-8 p-4 md:ml-64 pl-0 pb-0 pt-14 h-screen relative w-auto min-w-fit flex flex-col bg-[#272a33] mx-auto text-white" id="app">
        <Tabs value="1" orientation="vertical">
          <TabsHeader
            className="rounded-none w-32 bg-[#272a33] h-screen py-10"
            indicatorProps={{
              className: "bg-gray-900/50 shadow-none !text-gray-900 border-y-0 border-l-0 border-r-1 border-solid",
            }}
          >
            {tournaments.map((tournament) => (
              <Tab key={tournament.id} value={tournament.id} className="max-h-[50px] mb-1">
                {tournament.name}
              </Tab>
            ))}
          </TabsHeader>
          <TabsBody className="h-full">
            {tournaments.map((tournament) => (
              <TabPanel key={tournament.id} value={tournament.id} className="py-0 h-full">
                <Tabs value="bracket" className="h-full">
                  <TabsHeader
                    className="rounded-none p-0 pt-3"
                    indicatorProps={{
                      className: "bg-transparent border-b-2 border-gray-900 shadow-none rounded-none",
                    }}
                  >
                    <Tab key="bracket" value="bracket">
                      Bracket
                    </Tab>
                    <Tab key="standings" value="standings">
                      Standings
                    </Tab>
                  </TabsHeader>
                  <TabsBody className="h-full">
                    <TabPanel key="bracket" value="bracket" className="h-full">
                      <TournamentBracket tournament={tournament}/>
                    </TabPanel>
                    <TabPanel key="standings" value="standings" className="h-full">
                      <TournamentStandings tournament={tournament}/>
                    </TabPanel>
                  </TabsBody>
                </Tabs>
              </TabPanel>
            ))}
          </TabsBody>
        </Tabs>
      </div>
    </>
  );
}

export default TournamentContainer;
