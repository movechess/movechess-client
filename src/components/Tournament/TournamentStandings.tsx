import React from "react";
import Ranking from "./Ranking";
import { Tournament } from "./TournamentModel";
interface MyComponentProps {
  tournament: Tournament;
}
const TournamentStandings: React.FC<MyComponentProps> = ({ tournament }) => {
  return (
    <>
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
            <Ranking standings={tournament.standings} />
          </div>
        </div>
      </div>
    </>
  );
};

export default TournamentStandings;
