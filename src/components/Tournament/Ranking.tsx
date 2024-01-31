import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { truncateSuiTx } from "../../services/address";
import React from "react";
import { Standings } from "./TournamentModel";
interface MyComponentProps {
  standings: Standings[];
}
const Ranking: React.FC<MyComponentProps> = ({ standings }) => {
  return(
    <>
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
            {standings.map((rank) => (
              <TableRow key={rank.rank} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
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
    </>
  )
}
export default Ranking;