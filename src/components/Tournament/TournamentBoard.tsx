import { Tab, TabPanel, Tabs, TabsBody, TabsHeader } from "@material-tailwind/react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useInkathon } from "@scio-labs/use-inkathon";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { createTournament, getTournaments, selectTournament } from "../../redux/tournament/tournament.reducer";
import { truncateSuiTx } from "../../services/address";
import Header from "../Header/Header";
import { mockTournament, Tournament } from "./data";

const TournamentBoard: React.FC<{}> = ({}) => {
  const { connect, error, isConnected, activeChain, activeAccount, disconnect, activeSigner } = useInkathon();

  const [tournaments, setTournament] = useState<Tournament[]>([]);
  const dispatch = useAppDispatch();
  const tournamentRx = useAppSelector(selectTournament);

  useEffect(() => {
    setTournament(mockTournament);

    dispatch(getTournaments({}));
  }, []);
  console.log("8s2:", tournamentRx);

  const onHandleCreateTournamnet = () => {
    dispatch(
      createTournament({
        activeSigner,
        activeAccount,
        totalPlayer: 2,
        reward: 1_000_000_000,
      }),
    );
  };

  const onShowBoard = () => {
    let result = null;
    result = tournaments.map((tournament, i) => {
      return (
        <TabPanel key={i} value={tournament.id} className="py-0 h-full">
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
                  {tournament.rounds.map((round, ri) => (
                    <div className="column" key={ri}>
                      {round.matches.map((item, index) => (
                        <React.Fragment key={item.matchNumber + "-item"}>
                          <div className="number">{item.matchNumber}</div>
                          <div className={`item ${index % 2 === 0 && round.matches.length > 1 ? "show-brackets" : ""}`}>
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
                        <p>
                          Total Player: <span className="text-white">{tournament.totalPlayer}</span>
                        </p>
                        <p>
                          Date: <span className="text-white">{tournament.date}</span>
                        </p>
                        <p>
                          Volume: <span className="text-white">{tournament.volume}</span>
                        </p>
                      </div>
                      <div>
                        <p>
                          Total Prize: <span className="text-white">{tournament.prize}</span>
                        </p>
                        <p>
                          Total Views: <span className="text-white">{tournament.totalView}</span>
                        </p>
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
                                Address
                              </TableCell>
                              <TableCell align="center" sx={{ color: "white" }}>
                                Win
                              </TableCell>
                              <TableCell align="center" sx={{ color: "white" }}>
                                Lose
                              </TableCell>
                              <TableCell align="center" sx={{ color: "white" }}>
                                Points
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {tournament.standings.map((rank, irr) => (
                              <TableRow key={irr} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
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
                                  {rank.totalLose}
                                </TableCell>
                                <TableCell align="center" sx={{ color: "white" }}>
                                  {rank.pts}
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
      );
    });
    return result;
  };

  const onShowTournament = () => {
    let result = null;
    result = tournaments.map((tournament, i) => {
      return (
        <Tab key={i} value={tournament.id} className="max-h-[50px] mb-1 !z-50">
          {tournament.name}
        </Tab>
      );
    });
    return result;
  };

  return (
    <>
      <Header />
      <div className="text-white px-4 py-12 md:ml-64 mt-14 bg-gray-100 h-screen">
        <div className="lottery-body px-4 py-4 border border-none rounded-xl flex flex-col justify-between items-center space-x-4">
          <Tabs value="1" orientation="vertical">
            <TabsHeader
              className="rounded-none w-32 bg-[#272a33] h-screen py-10"
              indicatorProps={{
                className: "bg-gray-900/50 shadow-none !text-gray-900 border-y-0 border-l-0 border-r-1 border-solid",
              }}
            >
              {onShowTournament()}
            </TabsHeader>
            <TabsBody className="h-full">{onShowBoard()}</TabsBody>
          </Tabs>
        </div>
      </div>
      {/* <div className="space-y-8 p-4 md:ml-64 pl-0 pb-0 pt-14 h-screen relative w-auto min-w-fit flex flex-col bg-[#272a33] mx-auto text-white" id="app">
        
      </div> */}
    </>
  );
};
export default TournamentBoard;
