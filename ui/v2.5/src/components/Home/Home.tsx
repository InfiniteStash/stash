import React from 'react';
import { useStats } from "src/core/StashService";

import { Stats } from './Stats';
import { Welcome } from './Welcome';

const Home: React.FC = () => {
  const { data } = useStats();

  return data?.stats?.scene_count ? <Stats /> : <Welcome />;
};

export default Home;
