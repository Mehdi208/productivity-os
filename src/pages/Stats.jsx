import React from 'react';
import StatsView from '../components/Stats/StatsView';

const Stats = ({ hydrationMl = 0 }) => <div className="flex-1"><StatsView hydrationMl={hydrationMl} /></div>;
export default Stats;