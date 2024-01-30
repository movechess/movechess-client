import { Tab, TabPanel, Tabs, TabsBody, TabsHeader } from "@material-tailwind/react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import React, { useEffect, useState } from "react";
import { truncateSuiTx } from "../../services/address";
import api, { apiHeader } from "../../utils/api";
import Header from "../Header/Header";
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

interface Standings {
  rank: string;
  address: string;
  totalWin: number;
  totalLoose: number;
  score: number;
}

interface Tournament {
  id: string;
  name: string;
  totalPlayer: string;
  prize: string;
  totalView: string;
  date: string;
  volume: string;
  rounds: Round[];
  standings: Standings[];
}

// Mock data - replace this with your actual data
const mockTournament: Tournament[] = [
  {
    id: "1",
    name: "Queen Cup",
    totalPlayer: "8",
    prize: "$1000",
    totalView: "1042",
    date: "Feb 01 2024",
    volume: "$1,050.32",
    rounds: [
      {
        roundName: "Quarterfinals",
        matches: [
          {
            matchNumber: 1,
            playerOne: { address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZyfsa2", score: 2 },
            playerTwo: { address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZykfSa", score: 0 },
            winner: 1,
          },
          {
            matchNumber: 2,
            playerOne: { address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZymfSA", score: 2 },
            playerTwo: { address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZyPo9N", score: 1 },
            winner: 1,
          },
          {
            matchNumber: 3,
            playerOne: { address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZy6L2Sm", score: 1 },
            playerTwo: { address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZRsm2", score: 2 },
            winner: 2,
          },
          {
            matchNumber: 4,
            playerOne: { address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZy2mKl", score: 0 },
            playerTwo: { address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZy47Hs", score: 0 },
            winner: 0,
          },
        ],
      },
      {
        roundName: "Semifinals",
        matches: [
          {
            matchNumber: 5,
            playerOne: { address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZyfsa2", score: 0 },
            playerTwo: { address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZymfSA", score: 0 },
            winner: 0,
          },
          { matchNumber: 6, playerOne: { address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZRsm2", score: 0 }, playerTwo: { address: "TBD", score: 0 }, winner: 0 },
        ],
      },
      {
        roundName: "Finals",
        matches: [{ matchNumber: 7, playerOne: { address: "TBD", score: 0 }, playerTwo: { address: "TBD", score: 0 }, winner: 0 }],
      },
    ],
    standings: [
      {
        rank: "1",
        address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZyLsa2",
        totalWin: 2,
        totalLoose: 0,
        score: 2
      },
      {
        rank: "2",
        address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZyeMt5",
        totalWin: 2,
        totalLoose: 0,
        score: 2
      },
      {
        rank: "3",
        address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZycFiX",
        totalWin: 1,
        totalLoose: 1,
        score: 1
      },
      {
        rank: "4",
        address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZ9eMt5",
        totalWin: 1,
        totalLoose: 1,
        score: 1
      },
      {
        rank: "5",
        address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZyP7Sp",
        totalWin: 1,
        totalLoose: 1,
        score: 1
      },
      {
        rank: "6",
        address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZyy5P7",
        totalWin: 1,
        totalLoose: 1,
        score: 1
      },
      {
        rank: "7",
        address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZN7fHLX",
        totalWin: 0,
        totalLoose: 2,
        score: 0
      },
      {
        rank: "8",
        address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZLXWcF",
        totalWin: 0,
        totalLoose: 2,
        score: 0
      }
    ],
  },
  {
    id: "2",
    name: "King Cup",
    totalPlayer: "4",
    prize: "$500",
    totalView: "42",
    date: "Feb 01 2024",
    volume: "$50.52",
    rounds: [
      {
        roundName: "Semifinals",
        matches: [
          {
            matchNumber: 1,
            playerOne: { address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZyfsa2", score: 0 },
            playerTwo: { address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZymfSA", score: 0 },
            winner: 0,
          },
          {
            matchNumber: 2,
            playerOne: { address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZRsm2", score: 0 },
            playerTwo: { address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZRf12", score: 0 },
            winner: 0,
          },
        ],
      },
      {
        roundName: "Finals",
        matches: [{ matchNumber: 3, playerOne: { address: "TBD", score: 0 }, playerTwo: { address: "TBD", score: 0 }, winner: 0 }],
      },
    ],
    standings: [
      {
        rank: "1",
        address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZns9eM",
        totalWin: 0,
        totalLoose: 0,
        score: 0
      },
      {
        rank: "2",
        address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZMt5P7S",
        totalWin: 0,
        totalLoose: 0,
        score: 0
      },
      {
        rank: "3",
        address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZ2EkS",
        totalWin: 0,
        totalLoose: 0,
        score: 0
      },
      {
        rank: "4",
        address: "5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumt5P7Spe",
        totalWin: 0,
        totalLoose: 0,
        score: 0
      },
    ],
  },
];

function Tournament() {
  const [tournaments, setTournament] = useState<Tournament[]>([]);

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
                      <div className="brackets-canvas p-0 lg:pt-0 lg:p-20 h-full">
                        {tournament.rounds.map((round) => (
                          <div className="column" key={round.roundName}>
                            {round.matches.map((item, index) => (
                              <React.Fragment key={item.matchNumber + "-item"}>
                                <div className="number" key={item.matchNumber}>
                                  {item.matchNumber}
                                </div>
                                <div className={`item ${index % 2 === 0 && round.matches.length > 1 ? "show-brackets" : ""}`} key={item.matchNumber + "-item"}>
                                  <div className="box">
                                    <div className={`part partOne  ${item.winner === 1 ? "winner" : item.winner === 2 ? "looser" : ""} `}>
                                      <div className="value">{truncateSuiTx(item.playerOne.address, true)}</div>
                                      <div className="score">{item.playerOne.score}</div>
                                    </div>
                                    <div className={`part partOne  ${item.winner === 2 ? "winner" : item.winner === 1 ? "looser" : ""} `}>
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
                    </TabPanel>
                    <TabPanel key="standings" value="standings" className="h-full">
                      <div className="brackets-canvas p-0 lg:pt-0 lg:p-12 h-full">
                        <div className="w-full bg-[#272a33]">
                          <div className="bg-[#22222a] p-5 rounded-[25px] mt-5 text-sm leading-7 text-[#8B8D91] flex gap-x-52">
                            <div>
                              <p>Total player: {tournament.totalPlayer}</p>
                              <p>Date: {tournament.date}</p>
                              <p>Volume: {tournament.volume}</p>
                            </div>
                            <div>
                              <p>Prize: {tournament.prize}</p>
                              <p>Views: {tournament.totalView}</p>
                            </div>
                          </div>
                          <div className="bg-[#22222a] p-5 rounded-[25px] mt-5 h-2/3 flex justify-center">
                            <TableContainer sx={{ display: "flex" }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell align="center" sx={{ color: "white" }}>
                                      Rank
                                    </TableCell>
                                    <TableCell align="center" sx={{ color: "white" }}>
                                      Player
                                    </TableCell>
                                    <TableCell align="center" sx={{ color: "white" }}>
                                      Win
                                    </TableCell>
                                    <TableCell align="center" sx={{ color: "white" }}>
                                      Loose
                                    </TableCell>
                                    <TableCell align="center" sx={{ color: "white" }}>
                                      Score
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {tournament.standings.map((rank) => (
                                    <TableRow key={tournament.name} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                      <TableCell align="center" component="th" scope="row" sx={{ color: "white" }}>
                                        {rank.rank}
                                      </TableCell>
                                      <TableCell align="center" sx={{ color: "white" }}>
                                        {truncateSuiTx(rank.address)}
                                      </TableCell>
                                      <TableCell align="center" sx={{ color: "white" }}>
                                        {rank.totalWin}
                                      </TableCell>
                                      <TableCell align="center" sx={{ color: "white" }}>
                                        {rank.totalLoose}
                                      </TableCell>
                                      <TableCell align="center" sx={{ color: "white" }}>
                                        {rank.score}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </div>
                        </div>
                      </div>
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

export default Tournament;
