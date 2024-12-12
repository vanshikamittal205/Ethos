import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const apiKey = process.env.REACT_APP_API_KEY
const chainName = 'eth-mainnet'
const walletAddress = '0x6564466f510c8311FDF935C5B2566201AAdFceA3'
const historicPortfolioValueEndpoint = `https://api.covalenthq.com/v1/${chainName}/address/${walletAddress}/portfolio_v2/`

const colors = ["#F44336", "#673AB7", "#03A9F4", "#4CAF50", "#FFEB3B", "#FF5722", "#607D8B", "#E91E63", "#3F51B5", "#00BCD4", "#8BC34A", "#FFC107", "#795548", "#9C27B0", "#2196F3", "#009688", "#CDDC39", "#FF9800", "#9E9E9E", "#EF9A9A", "#B39DDB", "#81D4FA", "#A5D6A7", "#FFF59D", "#FFAB91", "#B0BEC5", "#F48FB1", "#9FA8DA", "#80DEEA", "#C5E1A5", "#FFE082", "#BCAAA4", "#CE93D8", "#90CAF9", "#80CBC4", "#E6EE9C", "#FFCC80", "#EEEEEE", "#B71C1C", "#311B92", "#01579B", "#1B5E20", "#F57F17", "#BF360C", "#263238", "#880E4F", "#1A237E", "#006064", "#33691E", "#FF6F00", "#3E2723", "#4A148C", "#0D47A1", "#004D40", "#827717", "#E65100", "#212121"]

function App() {

  const [data, setData] = useState(null);
  const [keys, setKeys] = useState(null);

  useEffect(() => {
    fetch(historicPortfolioValueEndpoint, {method: 'GET', headers: {
      "Authorization": `Basic ${btoa(apiKey + ':')}`
    }})
      .then(res => res.json())
      .then(res => {
        const rawData = res.data.items
        const transformedData = transformForRecharts(rawData)
        const dataKeys = rawData.map(item => item.contract_ticker_symbol)
        setKeys(dataKeys)
        setData(transformedData)
      })
  }, [])

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
      <LineChart
        width={800}
        height={500}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
        <Legend />
        {keys.map((item, i) => {
          return (
            <Line dataKey={item} type="monotone" stroke={colors[i]}/>
          )
        })}
      </LineChart>
  )
};

export default App;

const transformForRecharts = (rawData) => {

  const transformedData = rawData.reduce((acc, curr) => {
    const singleTokenTimeSeries =  curr.holdings.map(holdingsItem => {

    // Formatting the date string just a little...
    const dateStr = holdingsItem.timestamp.slice(0,10)
    const date = new Date(dateStr)
    const options = {
      day: "numeric",
      month: "short"
    };
    const formattedDate = date.toLocaleDateString("en-US", options);
      return {
        timestamp: formattedDate,
        [curr.contract_ticker_symbol]: holdingsItem.close.quote
      }
    }) 
    const newArr = singleTokenTimeSeries.map((item, i) => Object.assign(item, acc[i]))
    return newArr
  }, [])

  return transformedData
}